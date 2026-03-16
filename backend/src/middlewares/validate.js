import { validationResult } from "express-validator";
import { sendBadRequest } from "../utils/response.js";

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors
      .array()
      .map(({ path, msg }) => ({ field: path, message: msg }));
    return sendBadRequest(res, "Validation failed", details);
  }
  next();
};

export default validate;
