import { TOKEN } from './lib/common/auth.js';
import { Client } from 'discord.js';
import { startCommands } from './lib/startCommands.js';
import { createLogsTable } from './lib/common/db.js';

export const client = new Client({ intents: 32767 });

client.login(TOKEN);

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  await createLogsTable();
  startCommands(client);
});