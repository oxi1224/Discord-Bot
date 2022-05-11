import { updateCommandList } from '../updateSlashCommands.js';

export async function main() {
  const { client } = await import('../../bot.js');

  updateCommandList('ping', 'Replies with ping');

  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName === 'ping') {
      await interaction.reply(`${new Date() - interaction.createdTimestamp} ms`);
    }
  });

  client.on('messageCreate', message => {
    if (message.content == '!ping') {
      message.channel.send(`${new Date() - message.createdTimestamp} ms`);
    }
  });
}