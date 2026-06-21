// src/middlewares/validate.js
//
// WHY A GENERIC VALIDATION MIDDLEWARE (instead of validating inside
// each controller):
// Without this, every controller would repeat the same boilerplate:
// parse schema, check success, format errors, return 400. That's
// duplicated logic that drifts out of sync over time.
//
// Instead: each route declares WHICH schema it needs, and this one
// middleware handles parsing + error formatting consistently for
// every route in the app.

export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: result.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
      });
    }

    // Replace req.body with the PARSED data (not the raw input).
    // This matters because Zod's .trim(), .toLowerCase(), .default()
    // transformations only take effect on the parsed output — using
    // req.body directly downstream would skip all that normalization.
    req.body = result.data;
    next();
  };
}