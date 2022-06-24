/// <reference types="qs" />
import type { NextFunction, Request, RequestHandler, Response } from 'express/ts4.0';
import type * as core from 'express-serve-static-core';
export declare const asyncMiddleware: <P = core.ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = import("qs").ParsedQs, Locals extends Record<string, any> = Record<string, any>>(middleware: (req: Request<P, ResBody, ReqBody, ReqQuery, Locals>, res: Response<ResBody, Locals>, next: NextFunction) => Promise<any> | any) => (req: Request<P, ResBody, ReqBody, ReqQuery, Locals>, res: Response<ResBody, Locals>, next: NextFunction) => void | Promise<void>;
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
export declare const combineMiddlewares: <P = core.ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = import("qs").ParsedQs, Locals extends Record<string, any> = Record<string, any>>(first?: IRequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>, ...middlewares: readonly IRequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>[]) => (req: Request<P, ResBody, ReqBody, ReqQuery, Locals>, res: Response<ResBody, Locals>, next: NextFunction) => void;
export declare const mockExpressMajorVersion: (v: number) => number;
/**
 * mimic the next middleware. For express <= 4.x, synchronous error is caught, and returned rejected promise is ignored.
 * While with express >= 5.x, both are caught.
 * @param middleware a single middleware
 * @return result/error promise
 */
export declare const middlewareToPromise: <P = core.ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = import("qs").ParsedQs, Locals extends Record<string, any> = Record<string, any>>(middleware: RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>) => (req: Request<P, ResBody, ReqBody, ReqQuery, Locals>, res: Response<ResBody, Locals>) => Promise<void>;
/**
 * extended version of middlewareToPromise which allows one or more middleware / array of middlewares
 * @param args
 */
export declare const combineToAsync: <P = core.ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = import("qs").ParsedQs, Locals extends Record<string, any> = Record<string, any>>(...args: IRequestHandlerArray<P, ResBody, ReqBody, ReqQuery, Locals>) => (req: Request<P, ResBody, ReqBody, ReqQuery, Locals>, res: Response<ResBody, Locals>) => Promise<void>;
