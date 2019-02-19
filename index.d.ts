import { NextFunction, Request, RequestHandler, Response } from 'express';
interface _Middlewares {
    [key: number]: _Middlewares | RequestHandler;
}
declare const _default: (middleware: RequestHandler) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * wrap async function to connect-like middleware
 * @param middleware can return Promise or throw error
 * @returns {Function} connect-like middleware
 */
export default _default;
/**
 * combine list of middlewares into 1 middlewares
 * @param first
 * @param middlewares
 * @returns {Function}
 */
export declare const combineMiddlewares: (first?: RequestHandler | _Middlewares | undefined, ...middlewares: (RequestHandler | _Middlewares)[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const middlewareToPromise: (middleware: RequestHandler) => (req: Request, res: Response) => Promise<{}>;
export declare const combineToAsync: (...args: (RequestHandler | _Middlewares)[]) => (req: Request, res: Response) => Promise<{}>;
