const axios = require('axios');
const { Buffer } = require('buffer');

const JUDGE0_API_URL = process.env.JUDGE0_API_URL;
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST;

const runCode = async (code, language, testCases, timelimit, memorylimit) => {
  try {
    const defaultCpuTimeLimit = 5; // Default CPU time limit in seconds
    const defaultMemoryLimit = 128000; // Default memory limit in KB (128 MB)

    let timeInMilliseconds = 0;
    let memoryUsage = 0;

    for (let testCase of testCases) {
      const input = testCase.input;
      const expectedOutput = testCase.output;
      const testIndex = testCase.test_index;

      const submissionData = {
        source_code: Buffer.from(code).toString('base64'),
        language_id: language.id,
        stdin: Buffer.from(input).toString('base64'),
        expected_output: Buffer.from(expectedOutput).toString('base64'),
        cpu_time_limit: timelimit || defaultCpuTimeLimit,
        memory_limit: memorylimit || defaultMemoryLimit,
      };

      console.log('Sending request to Judge0:', submissionData);

      try {
        const response = await axios.post(JUDGE0_API_URL, submissionData, {
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': JUDGE0_API_KEY,
            'X-RapidAPI-Host': JUDGE0_API_HOST,
          },
          params: {
            base64_encoded: true,
          },
        });

        const submissionToken = response.data.token;

        let submissionResult;
        while (true) {
          const resultResponse = await axios.get(`${JUDGE0_API_URL}/${submissionToken}`, {
            headers: {
              'X-RapidAPI-Key': JUDGE0_API_KEY,
              'X-RapidAPI-Host': JUDGE0_API_HOST,
            },
            params: {
              base64_encoded: true,
            },
          });
          submissionResult = resultResponse.data;
          if (submissionResult.status.id >= 3) break;
        }

        const actualOutput = submissionResult.stdout ? Buffer.from(submissionResult.stdout, 'base64').toString('utf-8').trim() : '';
        const errorMessage = submissionResult.stderr ? Buffer.from(submissionResult.stderr, 'base64').toString('utf-8') : (submissionResult.compile_output ? Buffer.from(submissionResult.compile_output, 'base64').toString('utf-8') : '');

        timeInMilliseconds = submissionResult.time !== null ? Math.round(submissionResult.time * 1000) : 0; // Convert to milliseconds
        memoryUsage = submissionResult.memory !== null ? parseInt(submissionResult.memory) : 0; // Already in KB

        console.log(timeInMilliseconds);
        console.log(memoryUsage);

        console.log(`Test case index: ${testIndex}`);
        console.log(`Expected Output: ${expectedOutput}`);
        console.log(`Actual Output: ${actualOutput}`);
        if (errorMessage) {
          console.log(`Error Message: ${errorMessage}`);
        }

        // Log the entire submissionResult for debugging
        console.log('Submission Result:', submissionResult);

        switch (submissionResult.status.id) {
          case 6: // Compilation Error
            return { result: 'Compilation error', errorMessage: `Compilation Error with message: ${errorMessage}`, time: 0, memory: 0 };
          case 5: // Time Limit Exceeded
            return { result: `Time limit exceeded on test ${testIndex}`, errorMessage: '', time: timeInMilliseconds, memory: memoryUsage };
          case 4: // Wrong Answer
            return { 
              result: `Wrong answer on test ${testIndex}`, 
              errorMessage: `Expected: ${expectedOutput}, but got: ${actualOutput}`, 
              time: timeInMilliseconds, 
              memory: memoryUsage 
            };
          case 7: // Runtime Error (SIGSEGV)
            return { result: `Runtime error (SIGSEGV) on test ${testIndex}`, errorMessage: `Segmentation fault. This typically occurs when the program tries to access an invalid memory location.`, time: timeInMilliseconds, memory: memoryUsage };
          case 8: // Runtime Error (SIGXFSZ)
            return { result: `Runtime error (SIGXFSZ) on test ${testIndex}`, errorMessage: `File size limit exceeded. This error occurs when the program tries to extend a file so that its size exceeds the maximum allowed.`, time: timeInMilliseconds, memory: memoryUsage };
          case 9: // Runtime Error (SIGFPE)
            return { result: `Runtime error (SIGFPE) on test ${testIndex}`, errorMessage: `Floating point exception. This usually happens due to an erroneous arithmetic operation, such as division by zero.`, time: timeInMilliseconds, memory: memoryUsage };
          case 10: // Runtime Error (SIGABRT)
            return { result: `Runtime error (SIGABRT) on test ${testIndex}`, errorMessage: `Abort signal. This error occurs when the program calls the abort function, often due to a failed assertion.`, time: timeInMilliseconds, memory: memoryUsage };
          case 11: // Runtime Error (NZEC)
            return { result: `Runtime error (NZEC) on test ${testIndex}`, errorMessage: `Non-zero exit code. This error occurs when the program exits with a status code other than 0.`, time: timeInMilliseconds, memory: memoryUsage };
          case 12: // Runtime Error (Other)
            return { result: `Runtime error (Other) on test ${testIndex}`, errorMessage: `An unspecified runtime error occurred.`, time: timeInMilliseconds, memory: memoryUsage };
          case 13: // Internal Error
            return { result: 'Internal error', errorMessage: `An internal error occurred on the server.`, time: 0, memory: 0 };
          case 14: // Exec Format Error
            return { result: 'Exec format error', errorMessage: `Execution format error. This typically occurs when trying to execute a binary that is not in the correct format.`, time: 0, memory: 0 };
          default:
            if (actualOutput !== expectedOutput.trim()) {
              return { result: `Wrong answer on test ${testIndex}`, errorMessage: `Expected: ${expectedOutput}, but got: ${actualOutput}`, time: 0, memory: 0 };
            }
        }
      } catch (judge0Error) {
        console.error('Judge0 API error:', judge0Error.response ? judge0Error.response.data : judge0Error.message);
        return { result: 'failure', errorMessage: `Judge0 API error: ${judge0Error.response ? judge0Error.response.data : judge0Error.message}`, time: 0, memory: 0 };
      }
    }

    return { result: 'Accepted', errorMessage: '', time: timeInMilliseconds, memory: memoryUsage };
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return { result: 'failure', errorMessage: error.message, time: 0, memory: 0 };
  }
};

module.exports = { runCode };

