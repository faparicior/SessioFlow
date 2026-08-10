export class Mediator {
    commandBus;
    queryBus;
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async send(command) {
        return this.commandBus.dispatch(command);
    }
    async ask(query) {
        return this.queryBus.dispatch(query);
    }
}
