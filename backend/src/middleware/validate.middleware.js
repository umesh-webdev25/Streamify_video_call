import AppError from "../utils/AppError.js";

/**
 * Zod Validation Middleware
 * Validates request body, query, and params against a schema
 */
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    const message = error.errors.map((i) => i.message).join(", ");
    next(new AppError(message, 400));
  }
};

export default validate;
