// Zod's error.flatten() organizes validation errors into { fieldErrors, formErrors } for easy structured reporting in APIs.

const sendValidationError = (result, res) => {
    const { fieldErrors, formErrors } = result.error.flatten();
    const details = { ...fieldErrors };
    if (formErrors.length > 0) {
        details._errors = formErrors;
    }
    return res.status(400).json({
        error: "validation failed",
        details,
    });
}


// Yes, we are using currying here.
// The function 'validateBody' first takes a 'schema' and returns a middleware function (req, res, next) => { ... } 
// which Express will call with the actual request.
export const validateBody = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) return sendValidationError(result, res);
    
    // Assigning `req.body = result.data` is most useful when your Zod schema does any kind of transformation: type coercion (e.g., string to number), value defaulting, sanitization, or restructuring.
    // - For example, if you have `.transform()`, `.default()`, or `.coerce` in the schema, `result.data` will reflect those changes—whereas the original req.body will not.
    // - In your current code, since your schemas do not transform or coerce, `req.body` and `result.data` will likely be identical.
    // - However, it's a best practice to always reassign so downstream code can rely on `req.body` being the fully validated and normalized data as defined by the schema.
    // - This becomes important if schemas evolve to include defaults, coercions, or transforms in the future.
    req.body = result.data;
    next();
}

export const validateParams = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) return sendValidationError(result, res);
    req.params = result.data;
    next();
}