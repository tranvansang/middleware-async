import type { NextFunction, Request, RequestHandler, Response } from 'express';
export declare const asyncMiddleware: <P, ResBody, ReqBody, ReqQuery, Locals>(middleware: (req: Request<P, ResBody, ReqBody, ReqQuery, Locals>, res: Response<ResBody, Locals>, next: NextFunction) => Promise<any> | any) => (req: Request<P, ResBody, ReqBody, ReqQuery, Locals>, res: Response<ResBody, Locals>, next: NextFunction) => void | Promise<void>;
/**
 * wrap async function to connect-like middleware
 * @param middleware can return Promise or throw error
 * @returns {Function} connect-like middleware
 * next function is always called at most once
 */
export default asyncMiddleware;
declare type IRequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> = RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> | IRequestHandlerArray<P, ResBody, ReqBody, ReqQuery, Locals>;
declare type IRequestHandlerArray<P, ResBody, ReqBody, ReqQuery, Locals> = ReadonlyArray<IRequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>>;
/**
 * combine list of middlewares into 1 middlewares
 * the combined chain does not break if any middleware returns a rejected promise
 * to catch these errors, wrap the middlewares with asyncMiddleware
 * @param first
 * @param middlewares
 * @returns {Function}
 */
export declare const combineMiddlewares: <P, ResBody, ReqBody, ReqQuery, Locals>(first?: IRequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>, ...middlewares: readonly IRequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>[]) => (req: Request<P, ResBody, ReqBody, ReqQuery, Locals>, res: Response<ResBody, Locals>, next: NextFunction) => void;
export declare const mockExpressMajorVersion: (v: number) => number;
/**
 * mimic the next middleware. For express <= 4.x, synchronous error is caught, and returned rejected promise is ignored.
 * While with express >= 5.x, both are caught.
 * @param middleware a single middleware
 * @return result/error promise
 */
export declare const middlewareToPromise: <P, ResBody, ReqBody, ReqQuery, Locals>(middleware: RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>) => (req: Request<P, ResBody, ReqBody, ReqQuery, Locals>, res: Response<ResBody, Locals>) => Promise<void>;
/**
 * extended version of middlewareToPromise which allows one or more middleware / array of middlewares
 * @param args
 */
export declare const combineToAsync: <P, ResBody, ReqBody, ReqQuery, Locals>(...args: IRequestHandlerArray<P, ResBody, ReqBody, ReqQuery, Locals>) => (req: Request<P, ResBody, ReqBody, ReqQuery, Locals>, res: Response<ResBody, Locals>) => Promise<void>;
