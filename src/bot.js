import { TOKEN } from './lib/common/auth.js';
import { Client } from 'discord.js';
import { startCommands } from './lib/startCommands.js';
import { createLogsTable } from './lib/common/db.js';

export const client = new Client({ intents: 32767 });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

(async function start() {
  client.isReady ? console.log('') : setTimeout(start(), 500);
  await client.login(TOKEN)
    .then(await createLogsTable())
    .then(startCommands());
})();
