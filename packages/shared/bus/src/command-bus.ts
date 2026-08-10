import {
  CommandConstructor,
  ICommand,
  ICommandBus,
  ICommandHandler,
  Middleware,
  NextFunction,
} from './interfaces.js';

export class InMemoryCommandBus implements ICommandBus {
  private readonly handlers = new Map<
    CommandConstructor<any>,
    ICommandHandler<any, any>
  >();
  private readonly middlewares: Middleware[] = [];

  register<TCommand extends ICommand, TResponse>(
    commandClass: CommandConstructor<TCommand>,
    handler: ICommandHandler<TCommand, TResponse>
  ): void {
    if (this.handlers.has(commandClass)) {
      throw new Error(
        `Command handler for ${commandClass.name} is already registered.`
      );
    }
    this.handlers.set(commandClass, handler);
  }

  use(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }

  async dispatch<TCommand extends ICommand, TResponse>(
    command: TCommand
  ): Promise<TResponse> {
    const commandClass = command.constructor as CommandConstructor<TCommand>;
    const handler = this.handlers.get(commandClass);

    if (!handler) {
      throw new Error(
        `No command handler registered for command: ${commandClass.name || 'UnknownCommand'}`
      );
    }

    let pipeline: NextFunction<TResponse> = () => handler.execute(command);

    for (let i = this.middlewares.length - 1; i >= 0; i--) {
      const current = pipeline;
      const middleware = this.middlewares[i]!;
      pipeline = () =>
        middleware.execute(command, current) as Promise<TResponse>;
    }

    return pipeline();
  }
}
