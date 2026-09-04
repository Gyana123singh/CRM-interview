import { ZodError } from "zod";

export function validateRequest(schemas) {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message
        }));

        return res.status(422).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: issues.length > 0 ? `${issues[0].field}: ${issues[0].message}` : "Validation failed",
            details: issues
          }
        });
      }
      return res.status(400).json({
        success: false,
        error: { code: "BAD_REQUEST", message: "Invalid request payload" }
      });
    }
  };
}
