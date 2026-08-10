import { describe, expect, it, vi } from 'vitest';
import {
  ICommand,
  ICommandHandler,
  IQuery,
  IQueryHandler,
  InMemoryCommandBus,
  InMemoryQueryBus,
  LoggingMiddleware,
  Mediator,
  Middleware,
  NextFunction,
} from '@sessioflow/bus';

// Dummy Commands & Queries for testing
class TestCommand implements ICommand {
  constructor(readonly payload: string) {}
}

class UnregisteredCommand implements ICommand {}

class TestCommandHandler implements ICommandHandler<TestCommand, string> {
  async execute(command: TestCommand): Promise<string> {
    return `Handled: ${command.payload}`;
  }
}

class TestQuery implements IQuery {
  constructor(readonly id: string) {}
}

class TestQueryHandler implements IQueryHandler<TestQuery, { id: string }> {
  async execute(query: TestQuery): Promise<{ id: string }> {
    return { id: query.id };
  }
}

describe('InMemoryCommandBus', () => {
  it('dispatches command to registered handler', async () => {
    const bus = new InMemoryCommandBus();
    bus.register(TestCommand, new TestCommandHandler());

    const result = await bus.dispatch(new TestCommand('hello'));
    expect(result).toBe('Handled: hello');
  });

  it('throws error when dispatching unregistered command', async () => {
    const bus = new InMemoryCommandBus();
    await expect(bus.dispatch(new UnregisteredCommand())).rejects.toThrow(
      'No command handler registered'
    );
  });

  it('throws error when registering duplicate command handler', () => {
    const bus = new InMemoryCommandBus();
    bus.register(TestCommand, new TestCommandHandler());
    expect(() => bus.register(TestCommand, new TestCommandHandler())).toThrow(
      'already registered'
    );
  });

  it('executes middleware in pipeline order', async () => {
    const bus = new InMemoryCommandBus();
    const order: string[] = [];

    const middlewareA: Middleware = {
      async execute(input: any, next: NextFunction<any>) {
        order.push('A-before');
        const res = await next();
        order.push('A-after');
        return res;
      },
    };

    const middlewareB: Middleware = {
      async execute(input: any, next: NextFunction<any>) {
        order.push('B-before');
        const res = await next();
        order.push('B-after');
        return res;
      },
    };

    bus.use(middlewareA);
    bus.use(middlewareB);
    bus.register(TestCommand, new TestCommandHandler());

    await bus.dispatch(new TestCommand('pipeline'));

    expect(order).toEqual(['A-before', 'B-before', 'B-after', 'A-after']);
  });
});

describe('InMemoryQueryBus', () => {
  it('dispatches query to registered handler', async () => {
    const bus = new InMemoryQueryBus();
    bus.register(TestQuery, new TestQueryHandler());

    const result = await bus.dispatch(new TestQuery('q-123'));
    expect(result).toEqual({ id: 'q-123' });
  });

  it('throws error when registering duplicate query handler', () => {
    const bus = new InMemoryQueryBus();
    bus.register(TestQuery, new TestQueryHandler());
    expect(() => bus.register(TestQuery, new TestQueryHandler())).toThrow(
      'already registered'
    );
  });
});

describe('Mediator', () => {
  it('routes send() to command bus and ask() to query bus', async () => {
    const commandBus = new InMemoryCommandBus();
    const queryBus = new InMemoryQueryBus();
    commandBus.register(TestCommand, new TestCommandHandler());
    queryBus.register(TestQuery, new TestQueryHandler());

    const mediator = new Mediator(commandBus, queryBus);

    const cmdResult = await mediator.send(new TestCommand('via-mediator'));
    const queryResult = await mediator.ask(new TestQuery('q-mediator'));

    expect(cmdResult).toBe('Handled: via-mediator');
    expect(queryResult).toEqual({ id: 'q-mediator' });
  });
});

describe('LoggingMiddleware', () => {
  it('logs dispatch and completion of requests', async () => {
    const bus = new InMemoryCommandBus();
    const loggingMiddleware = new LoggingMiddleware();
    bus.use(loggingMiddleware);
    bus.register(TestCommand, new TestCommandHandler());

    const result = await bus.dispatch(new TestCommand('logged'));
    expect(result).toBe('Handled: logged');
  });
});
