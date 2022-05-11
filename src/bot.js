import { TOKEN } from './auth.js';
import { Client } from 'discord.js';
import { startCommands } from './startCommands.js';

export const client = new Client({ intents: 32767 });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

startCommands();

client.login(TOKEN);