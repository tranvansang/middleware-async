declare type Request = any;
declare type Response = any;
declare type Next = (error?: Error) => any;
declare type Middleware = (req: Request, res: Response, next: Next) => any;
interface _Middlewares {
    [key: number]: _Middlewares | Middleware;
}
declare const _default: (middleware: Middleware) => (req: any, res: any, next: Next) => Promise<void>;
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
export declare const combineMiddlewares: (first?: _Middlewares | Middleware | undefined, ...middlewares: (_Middlewares | Middleware)[]) => (req: any, res: any, next: Next) => Promise<any>;
export declare const middlewareToPromise: (middleware: Middleware) => (req: any, res?: any) => Promise<{}>;
export declare const combineToAsync: (...args: (_Middlewares | Middleware)[]) => (req: any, res?: any) => Promise<{}>;
