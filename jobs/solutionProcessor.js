const Queue = require('bull');
const Redis = require('ioredis');
const { getEntityById, getAllEntities } = require('../utils/commonHelpers');
const { runCode } = require('../services/codeRunner');
const { generateEvaluationNotes } = require('../services/aiEvaluator');
const { Submission, Assessment, Assessment_Problem, Problem, Programming_Language, Testcase } = require('../models');

const REDIS_URL = process.env.REDIS_URL;

const baseRedisOptions = {
  maxRetriesPerRequest: null,
  connectTimeout: 60000,
  retryStrategy(times) {
    return Math.min(times * 500, 2000);
  },
  tls: {
    rejectUnauthorized: false  // Allow self-signed certificates if necessary
  }
};

const createRedisClient = (type) => {
  switch (type) {
    case 'client':
      return new Redis(REDIS_URL, baseRedisOptions);
    case 'subscriber':
      return new Redis(REDIS_URL, { ...baseRedisOptions, enableReadyCheck: false });
    case 'bclient':
      return new Redis(REDIS_URL, { ...baseRedisOptions, enableReadyCheck: false });
    default:
      throw new Error(`Unexpected connection type: ${type}`);
  }
};

const solutionQueue = new Queue('solutionProcessing', {
  createClient: (type) => createRedisClient(type)
});

solutionQueue.on('error', (error) => {
  console.error('Queue Error:', error);
});

solutionQueue.on('waiting', (jobId) => {
  console.log(`Job ${jobId} is waiting`);
});

solutionQueue.on('active', (job, jobPromise) => {
  console.log(`Job ${job.id} is now active`);
});

solutionQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

solutionQueue.on('failed', (job, err) => {
  console.log(`Job ${job.id} failed with error:`, err);
});

solutionQueue.process(async (job, done) => {
  console.log('Processing job:', job.id);  // Log job ID
  const { assessment_id, user_id, solutions } = job.data;

  try {
    const assessment = await getEntityById(Assessment, assessment_id);
    const { candidate_id } = assessment;

    if (candidate_id !== user_id) {
      return done(new Error('Forbidden: You are not the candidate for this assessment.'));
    }

    let totalProblems = solutions.length;
    let passedProblems = 0;
    const evaluationResults = [];

    for (const solution of solutions) {
      const { problem_id, code, programming_language_id } = solution;

      const [problem, language, testCases] = await Promise.all([
        getEntityById(Problem, problem_id, { attributes: ['id', 'timelimit', 'memorylimit'] }),
        getEntityById(Programming_Language, programming_language_id, { attributes: ['id'] }),
        getAllEntities(Testcase, { where: { problem_id } })
      ]);

      const { result, errorMessage, time, memory } = await runCode(code, language, testCases, problem.timelimit, problem.memorylimit);

      const submission = await Submission.create({
        code,
        result,
        errorMessage,
        user_id,
        problem_id,
        programming_language_id,
        time,
        memory,
      });

      if (result === 'Accepted') {
        passedProblems += 1;
        await Assessment_Problem.update({ status: 'completed' }, {
          where: {
            assessment_id,
            problem_id
          }
        });
      } else {
        await Assessment_Problem.update({ status: 'failed' }, {
          where: {
            assessment_id,
            problem_id
          }
        });
      }

      evaluationResults.push({ problem_id, result, errorMessage, code });
    }

    const candidate_score = ((passedProblems / totalProblems) * 100).toFixed(2);
    const evaluation_notes = await generateEvaluationNotes(evaluationResults);

    assessment.candidate_score = candidate_score;
    assessment.evaluation_notes = evaluation_notes;
    await assessment.save();

    console.log('Job completed:', job.id);  // Log job completion
    done(null, { evaluationResults, candidate_score, evaluation_notes });
  } catch (err) {
    console.error('Job error:', job.id, err);  // Log job errors
    done(err);
  }
});

module.exports = solutionQueue;
