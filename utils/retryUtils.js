// utils/retryUtils.js
const retry = async (fn, maxAttempts = 3, delay = 1000) => {
  let attempt = 1;
  while (attempt <= maxAttempts) {
    try {
      return await fn();
    } catch (err) {
      if (err.code === 'Neo.ClientError.TransientError.Transaction.Terminated' || err.code === 'ServiceUnavailable') {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        attempt++;
      } else {
        throw err;
      }
    }
  }
  throw new Error('Max retries exceeded');
};

module.exports = { retry };