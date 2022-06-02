import { updateSlashCommands } from '../lib/updateSlashCommands.js';
import { prefix } from '../lib/config/config.js';

export async function main() {
  const { client } = await import('../bot.js');

  // update interaction list
  updateSlashCommands({ name: 'ping', description: 'replies with ping' }, 'ping');

  // Listen for ping interactions
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (!(interaction.commandName === 'ping')) return;
      // reply with ping
      await interaction.reply(`${new Date() - interaction.createdTimestamp} ms`);
  });

  // Listen for ping commands
  client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    await message.reply(`${new Date() - message.createdTimestamp} ms`);
  });
}