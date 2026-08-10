import { ICommand, ICommandBus, IQuery, IQueryBus } from './interfaces.js';
export declare class Mediator {
    readonly commandBus: ICommandBus;
    readonly queryBus: IQueryBus;
    constructor(commandBus: ICommandBus, queryBus: IQueryBus);
    send<TCommand extends ICommand, TResponse>(command: TCommand): Promise<TResponse>;
    ask<TQuery extends IQuery, TResponse>(query: TQuery): Promise<TResponse>;
}
