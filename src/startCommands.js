import { main as pingCommands } from './commands/ping.js';

export async function startCommands() {
    await pingCommands();
}