import { Middleware, NextFunction } from '../interfaces.js';
export declare class LoggingMiddleware implements Middleware {
    execute(input: any, next: NextFunction<any>): Promise<any>;
}
