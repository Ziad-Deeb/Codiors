const { InternalServerError } = require('../errors');

const handleError = (err, next, defaultMessage) => {
  const message = `${defaultMessage}: ${err.message || "Internal Server Error"}`;
  if (!err.statusCode) {
    err = new InternalServerError(message);
  } else {
    err.message = message;
  }
  next(err);
}

module.exports = handleError;
