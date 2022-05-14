import { main as pingCommands } from './commands/ping.js';
import { main as banCommands } from './commands/ban.js';

export async function startCommands() {
  await pingCommands();
  await banCommands();
}