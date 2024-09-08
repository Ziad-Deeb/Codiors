const Queue = require('bull');
const Redis = require('ioredis');
const { getEntityById, getAllEntities } = require('../utils/commonHelpers');
const { runCode } = require('../services/codeRunner');
const { Submission, Problem, Programming_Language, Testcase } = require('../models');

const REDIS_URL = process.env.REDIS_URL;

const baseRedisOptions = {
  maxRetriesPerRequest: null,
  connectTimeout: 60000,
  retryStrategy(times) {
    return Math.min(times * 500, 2000);
  },
  tls: {
    rejectUnauthorized: false 
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

const singleSolutionQueue = new Queue('singleSolutionProcessing', {
  createClient: (type) => createRedisClient(type)
});

singleSolutionQueue.on('error', (error) => {
  console.error('Queue Error:', error);
});

singleSolutionQueue.on('waiting', (jobId) => {
  console.log(`Job ${jobId} is waiting`);
});

singleSolutionQueue.on('active', (job, jobPromise) => {
  console.log(`Job ${job.id} is now active`);
});

singleSolutionQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});

singleSolutionQueue.on('failed', (job, err) => {
  console.log(`Job ${job.id} failed with error:`, err);
});

singleSolutionQueue.process(async (job, done) => {
  console.log('Processing job:', job.id);  // Log job ID
  const { submissionId, user_id, problem_id, code, programming_language_id } = job.data;

  try {
    const [problem, language, testCases] = await Promise.all([
      getEntityById(Problem, problem_id, { attributes: ['id', 'timelimit', 'memorylimit'] }),
      getEntityById(Programming_Language, programming_language_id, { attributes: ['id'] }),
      getAllEntities(Testcase, { where: { problem_id } })
    ]);

    const { result, errorMessage, time, memory } = await runCode(code, language, testCases, problem.timelimit, problem.memorylimit);

    // Update the submission with the result
    await Submission.update({ result, errorMessage, time, memory }, { where: { id: submissionId } });

    console.log('Job completed:', job.id);  // Log job completion
    done(null, { result, errorMessage });
  } catch (err) {
    console.error('Job error:', job.id, err);  // Log job errors
    await Submission.update({ result: 'Error', errorMessage: err.message }, { where: { id: submissionId } });
    done(err);
  }
});

module.exports = singleSolutionQueue;
