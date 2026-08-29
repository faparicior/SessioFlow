import {
  IQuery,
  IQueryBus,
  IQueryHandler,
  Middleware,
  NextFunction,
  QueryConstructor,
} from './interfaces.js';

export class InMemoryQueryBus implements IQueryBus {
  private readonly handlers = new Map<QueryConstructor<any>, IQueryHandler<any, any>>();
  private readonly middlewares: Middleware[] = [];

  register<TQuery extends IQuery, TResponse>(
    queryClass: QueryConstructor<TQuery>,
    handler: IQueryHandler<TQuery, TResponse>,
  ): void {
    if (this.handlers.has(queryClass)) {
      throw new Error(`Query handler for ${queryClass.name} is already registered.`);
    }
    this.handlers.set(queryClass, handler);
  }

  use(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }

  async dispatch<TQuery extends IQuery, TResponse>(query: TQuery): Promise<TResponse> {
    const queryClass = query.constructor as QueryConstructor<TQuery>;
    const handler = this.handlers.get(queryClass);

    if (!handler) {
      throw new Error(
        `No query handler registered for query: ${queryClass.name || 'UnknownQuery'}`,
      );
    }

    let pipeline: NextFunction<TResponse> = () => handler.execute(query);

    for (let i = this.middlewares.length - 1; i >= 0; i--) {
      const current = pipeline;
      const middleware = this.middlewares[i]!;
      pipeline = () => middleware.execute(query, current) as Promise<TResponse>;
    }

    return pipeline();
  }
}
