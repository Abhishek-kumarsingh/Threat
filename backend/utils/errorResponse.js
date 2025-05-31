/**
 * Custom error response class
 * @extends Error
 */
class ErrorResponse extends Error {
    /**
     * Create an error response
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code
     */
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = ErrorResponse;
