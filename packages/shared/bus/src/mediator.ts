import {ICommand, ICommandBus, IQuery, IQueryBus} from './interfaces.js';

export class Mediator {
  constructor(
    readonly commandBus: ICommandBus,
    readonly queryBus: IQueryBus,
  ) {}

  async send<TCommand extends ICommand, TResponse>(command: TCommand): Promise<TResponse> {
    return this.commandBus.dispatch<TCommand, TResponse>(command);
  }

  async ask<TQuery extends IQuery, TResponse>(query: TQuery): Promise<TResponse> {
    return this.queryBus.dispatch<TQuery, TResponse>(query);
  }
}
