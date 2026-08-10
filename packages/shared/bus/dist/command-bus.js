export class InMemoryCommandBus {
    handlers = new Map();
    middlewares = [];
    register(commandClass, handler) {
        if (this.handlers.has(commandClass)) {
            throw new Error(`Command handler for ${commandClass.name} is already registered.`);
        }
        this.handlers.set(commandClass, handler);
    }
    use(middleware) {
        this.middlewares.push(middleware);
    }
    async dispatch(command) {
        const commandClass = command.constructor;
        const handler = this.handlers.get(commandClass);
        if (!handler) {
            throw new Error(`No command handler registered for command: ${commandClass.name || 'UnknownCommand'}`);
        }
        let pipeline = () => handler.execute(command);
        for (let i = this.middlewares.length - 1; i >= 0; i--) {
            const current = pipeline;
            const middleware = this.middlewares[i];
            pipeline = () => middleware.execute(command, current);
        }
        return pipeline();
    }
}
