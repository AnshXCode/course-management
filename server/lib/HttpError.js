/**
 * Application error that carries an HTTP status code alongside a message.
 *
 * We extend the built-in Error class so thrown values behave like normal errors:
 * they have a message, a stack trace, and work with `throw` / `catch` and
 * `instanceof Error`. Services and route handlers can throw HttpError when a
 * request fails for a known reason (e.g. 404 not found, 403 forbidden); the
 * error middleware can read `err.statusCode` and `err.message` to send the
 * right JSON response instead of defaulting to 500.
 *
 * Constructor:
 *   - statusCode: HTTP status to return (e.g. 400, 404, 409).
 *   - message: human-readable error text for the client or logs.
 *
 * super(message) calls the parent Error constructor so the message is stored
 * on the instance and stack capture works. We then attach statusCode and set
 * name to "HttpError" so logs and stack traces identify this type clearly.
 */

export class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.status = statusCode;
        this.name = "HttpError";
    }
}
