

export const sendSuccess = (res, data, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

export const sendCreated = (res, data, message = 'Created successfully') =>
  sendSuccess(res, data, message, 201);

export const sendError = (res, message = 'Something went wrong', statusCode = 500, details = null) => {
  const body = { success: false, error: message };
  if (details) body.details = details;
  return res.status(statusCode).json(body);
};

export const sendNotFound    = (res, message = 'Resource not found')   => sendError(res, message, 404);
export const sendBadRequest  = (res, message = 'Bad request', details) => sendError(res, message, 400, details);
export const sendConflict    = (res, message = 'Conflict')             => sendError(res, message, 409);
export const sendUnprocessable = (res, message = 'Unprocessable entity', details) => sendError(res, message, 422, details);
