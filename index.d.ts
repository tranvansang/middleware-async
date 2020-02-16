import { NextFunction, Request, RequestHandler, Response } from 'express';
export declare const asyncMiddleware: (middleware: RequestHandler) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * wrap async function to connect-like middleware
 * @param middleware can return Promise or throw error
 * @returns {Function} connect-like middleware
 * next function is always called at most once
 */
export default asyncMiddleware;
declare type IRequestHandler = RequestHandler | IRequestHandlerArray;
interface IRequestHandlerArray extends ReadonlyArray<IRequestHandler> {
}
/**
 * combine list of middlewares into 1 middlewares
 * then combined chain does not break if any middelware throws error
 * to catch these errors, wrap the middlewares with asyncMiddleware
 * @param first
 * @param middlewares
 * @returns {Function}
 */
export declare const combineMiddlewares: (first?: IRequestHandler, ...middlewares: readonly IRequestHandler[]) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * mimic the next middleware
 * @param middleware a single middleware
 * @return result/error promise
 */
export declare const middlewareToPromise: (middleware: RequestHandler) => (req: Request, res: Response) => Promise<undefined>;
/**
 * extended version of middlewareToPromise which allows one or more middleware / array of middlewares
 * @param args
 */
export declare const combineToAsync: (...args: IRequestHandlerArray) => (req: Request, res: Response) => Promise<undefined>;
