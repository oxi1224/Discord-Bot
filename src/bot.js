import { TOKEN, startCommands, createLogsTable } from '#lib';
import { Client } from 'discord.js';


export const client = new Client({ intents: 32767 });

client.login(TOKEN);

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  await createLogsTable();
  startCommands(client);
});