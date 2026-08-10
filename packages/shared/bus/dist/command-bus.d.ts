import { CommandConstructor, ICommand, ICommandBus, ICommandHandler, Middleware } from './interfaces.js';
export declare class InMemoryCommandBus implements ICommandBus {
    private readonly handlers;
    private readonly middlewares;
    register<TCommand extends ICommand, TResponse>(commandClass: CommandConstructor<TCommand>, handler: ICommandHandler<TCommand, TResponse>): void;
    use(middleware: Middleware): void;
    dispatch<TCommand extends ICommand, TResponse>(command: TCommand): Promise<TResponse>;
}
