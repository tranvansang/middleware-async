"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * wrap async function to connect-like middleware
 * @param middleware can return Promise or throw error
 * @returns {Function} connect-like middleware
 */
exports.default = function (middleware) {
  return function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res, next) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return middleware(req, res, next);

            case 3:
              _context.next = 8;
              break;

            case 5:
              _context.prev = 5;
              _context.t0 = _context["catch"](0);

              next(_context.t0);

            case 8:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, undefined, [[0, 5]]);
    }));

    return function (_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }();
};

/**
 * combine list of middlewares into 1 middlewares
 * @param first
 * @param middlewares
 * @returns {Function}
 */


var combineMiddlewares = exports.combineMiddlewares = function combineMiddlewares(first) {
  for (var _len = arguments.length, middlewares = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    middlewares[_key - 1] = arguments[_key];
  }

  while (Array.isArray(first)) {
    var _ref2 = [].concat(_toConsumableArray(first), _toConsumableArray(middlewares));

    first = _ref2[0];
    middlewares = _ref2.slice(1);
  }
  return function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res, next) {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (first) {
                _context2.next = 2;
                break;
              }

              return _context2.abrupt("return", next());

            case 2:
              first(req, res, function (err) {
                if (err) return next(err);
                combineMiddlewares(middlewares)(req, res, next).catch(next);
              });

            case 3:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, undefined);
    }));

    return function (_x4, _x5, _x6) {
      return _ref3.apply(this, arguments);
    };
  }();
};

var middlewareToPromise = exports.middlewareToPromise = function middlewareToPromise(middleware) {
  return function (req, res) {
    return new Promise(function (resolve, reject) {
      return Promise.resolve(middleware(req, res, function (err) {
        if (err) reject(err);
        resolve();
      })).catch(reject);
    });
  };
};
var combineToAsync = exports.combineToAsync = function combineToAsync() {
  return middlewareToPromise(combineMiddlewares.apply(undefined, arguments));
};
