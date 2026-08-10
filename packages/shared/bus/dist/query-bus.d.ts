import { IQuery, IQueryBus, IQueryHandler, Middleware, QueryConstructor } from './interfaces.js';
export declare class InMemoryQueryBus implements IQueryBus {
    private readonly handlers;
    private readonly middlewares;
    register<TQuery extends IQuery, TResponse>(queryClass: QueryConstructor<TQuery>, handler: IQueryHandler<TQuery, TResponse>): void;
    use(middleware: Middleware): void;
    dispatch<TQuery extends IQuery, TResponse>(query: TQuery): Promise<TResponse>;
}
