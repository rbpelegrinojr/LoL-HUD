const AppError = require('../helpers/appError');

function notFound(request, _response, next) {
  next(new AppError(`Route not found: ${request.originalUrl}`, 404));
}

module.exports = notFound;
