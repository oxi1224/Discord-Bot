import { updateSlashCommands } from '../lib/updateSlashCommands.js';

export async function main() {
  const { client } = await import('../bot.js');

  // update interaction list
  updateSlashCommands({ name: 'ping', description: 'replies with ping' }, 'ping');

  // listen for ping interaction
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName === 'ping') {
      // reply with ping
      await interaction.reply(`${new Date() - interaction.createdTimestamp} ms`);
    }
  });

  // listen for sent messages starting with !ping
  client.on('messageCreate', message => {
    if (message.content == '!ping') {
      // reply with ping
      message.channel.send(`${new Date() - message.createdTimestamp} ms`);
    }
  });
}