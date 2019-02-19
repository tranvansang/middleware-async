"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * wrap async function to connect-like middleware
 * @param middleware can return Promise or throw error
 * @returns {Function} connect-like middleware
 */
exports.default = (middleware) => async (req, res, next) => {
    try {
        await middleware(req, res, next);
    }
    catch (err) {
        next(err);
    }
};
/**
 * combine list of middlewares into 1 middlewares
 * @param first
 * @param middlewares
 * @returns {Function}
 */
exports.combineMiddlewares = (first, ...middlewares) => {
    while (Array.isArray(first))
        [first, ...middlewares] = [...first, ...middlewares];
    return async (req, res, next) => {
        if (!first)
            return next();
        first(req, res, (err) => {
            if (err)
                return next(err);
            exports.combineMiddlewares(middlewares)(req, res, next).catch(next);
        });
    };
};
exports.middlewareToPromise = (middleware) => (req, res) => new Promise((resolve, reject) => Promise.resolve(middleware(req, res, err => {
    if (err)
        reject(err);
    resolve();
})).catch(reject));
exports.combineToAsync = (...args) => exports.middlewareToPromise(exports.combineMiddlewares(...args));
