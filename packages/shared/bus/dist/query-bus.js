export class InMemoryQueryBus {
    handlers = new Map();
    middlewares = [];
    register(queryClass, handler) {
        if (this.handlers.has(queryClass)) {
            throw new Error(`Query handler for ${queryClass.name} is already registered.`);
        }
        this.handlers.set(queryClass, handler);
    }
    use(middleware) {
        this.middlewares.push(middleware);
    }
    async dispatch(query) {
        const queryClass = query.constructor;
        const handler = this.handlers.get(queryClass);
        if (!handler) {
            throw new Error(`No query handler registered for query: ${queryClass.name || 'UnknownQuery'}`);
        }
        let pipeline = () => handler.execute(query);
        for (let i = this.middlewares.length - 1; i >= 0; i--) {
            const current = pipeline;
            const middleware = this.middlewares[i];
            pipeline = () => middleware.execute(query, current);
        }
        return pipeline();
    }
}
