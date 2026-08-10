export interface ICommand {}
export interface IQuery {}

export type CommandConstructor<TCommand extends ICommand = ICommand> = new (
  ...args: any[]
) => TCommand;

export type QueryConstructor<TQuery extends IQuery = IQuery> = new (
  ...args: any[]
) => TQuery;

export interface ICommandHandler<
  TCommand extends ICommand = ICommand,
  TResponse = unknown
> {
  execute(command: TCommand): Promise<TResponse>;
}

export interface IQueryHandler<
  TQuery extends IQuery = IQuery,
  TResponse = unknown
> {
  execute(query: TQuery): Promise<TResponse>;
}

export type NextFunction<TOutput = unknown> = () => Promise<TOutput>;

export interface Middleware<TInput = unknown, TOutput = unknown> {
  execute(input: TInput, next: NextFunction<TOutput>): Promise<TOutput>;
}

export interface ICommandBus {
  register<TCommand extends ICommand, TResponse>(
    commandClass: CommandConstructor<TCommand>,
    handler: ICommandHandler<TCommand, TResponse>
  ): void;
  use(middleware: Middleware): void;
  dispatch<TCommand extends ICommand, TResponse>(
    command: TCommand
  ): Promise<TResponse>;
}

export interface IQueryBus {
  register<TQuery extends IQuery, TResponse>(
    queryClass: QueryConstructor<TQuery>,
    handler: IQueryHandler<TQuery, TResponse>
  ): void;
  use(middleware: Middleware): void;
  dispatch<TQuery extends IQuery, TResponse>(
    query: TQuery
  ): Promise<TResponse>;
}
