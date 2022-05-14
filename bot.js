import { TOKEN } from './src/auth.js';
import { Client } from 'discord.js';
import { startCommands } from './src/startCommands.js';

export const client = new Client({ intents: 32767 });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

(async function start() {
  client.isReady ? console.log('a') : setTimeout(start(), 500);
  await client.login(TOKEN)
    .then(startCommands);
})();
