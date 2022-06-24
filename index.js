"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.combineToAsync = exports.middlewareToPromise = exports.mockExpressMajorVersion = exports.combineMiddlewares = exports.asyncMiddleware = void 0;
var isPromise = function (maybePromise) { return !!maybePromise
    && (typeof maybePromise === 'object' || typeof maybePromise === 'function')
    && typeof maybePromise.then === 'function'; };
var asyncMiddleware = function (middleware) { return function (req, res, next) { return (function () {
    var called = false;
    var cb = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (called)
            return;
        called = true;
        return next.apply(void 0, args);
    };
    var maybePromise;
    try {
        maybePromise = middleware(req, res, cb);
    }
    catch (err) {
        return cb(err);
    }
    if (isPromise(maybePromise))
        return (function () { return __awaiter(void 0, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, maybePromise];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        return [2 /*return*/, cb(err_1)];
                    case 3: return [2 /*return*/];
                }
            });
        }); })();
})(); }; };
exports.asyncMiddleware = asyncMiddleware;
/**
 * wrap async function to connect-like middleware
 * @param middleware can return Promise or throw error
 * @returns {Function} connect-like middleware
 * next function is always called at most once
 */
exports.default = exports.asyncMiddleware;
/**
 * combine list of middlewares into 1 middlewares
 * the combined chain does not break if any middleware returns a rejected promise
 * to catch these errors, wrap the middlewares with asyncMiddleware
 * @param first
 * @param middlewares
 * @returns {Function}
 */
var combineMiddlewares = function (first) {
    var _a;
    var middlewares = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        middlewares[_i - 1] = arguments[_i];
    }
    while (Array.isArray(first))
        _a = __spreadArray(__spreadArray([], first, true), middlewares, true), first = _a[0], middlewares = _a.slice(1);
    return function (req, res, next) { return first
        ? first(req, res, function (err) { return err
            ? next(err)
            : exports.combineMiddlewares.apply(void 0, middlewares)(req, res, next); })
        : next(); };
};
exports.combineMiddlewares = combineMiddlewares;
var expressMajorVersion = 4;
var mockExpressMajorVersion = function (v) { return expressMajorVersion = v; };
exports.mockExpressMajorVersion = mockExpressMajorVersion;
/**
 * mimic the next middleware. For express <= 4.x, synchronous error is caught, and returned rejected promise is ignored.
 * While with express >= 5.x, both are caught.
 * @param middleware a single middleware
 * @return result/error promise
 */
var middlewareToPromise = function (middleware) { return function (req, res) { return new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
    var maybePromise, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                try {
                    maybePromise = middleware(req, res, function (err) {
                        if (err)
                            reject(err);
                        else
                            resolve();
                    });
                }
                catch (err) {
                    reject(err);
                    return [2 /*return*/];
                }
                if (!isPromise(maybePromise)) return [3 /*break*/, 4];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, maybePromise];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                err_2 = _a.sent();
                // ignore rejected promise in express <= 4.x
                if (expressMajorVersion >= 5)
                    reject(err_2);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); }); }; };
exports.middlewareToPromise = middlewareToPromise;
/**
 * extended version of middlewareToPromise which allows one or more middleware / array of middlewares
 * @param args
 */
var combineToAsync = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return (0, exports.middlewareToPromise)(exports.combineMiddlewares.apply(void 0, args));
};
exports.combineToAsync = combineToAsync;
