import { SlashCommandBuilder } from '@discordjs/builders';
import { updateSlashCommands } from '../../lib/updateSlashCommands.js';
import { prefix, embedColors } from '../../lib/config/config.js';
import { createReplyEmbed } from '../../lib/util/embeds.js';

export async function main() {
  const { client } = await import('../../bot.js');

  // listen for ping commands
  client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(1).trim().split(' ').filter(str => str !== '');
    const command = args.shift().toLowerCase();
    if (!(command === 'ping')) return;
    
    await message.reply(await createReplyEmbed(
      `Bot latency: \`\`${Date.now() - message.createdTimestamp}ms\`\`
      API latency: \`\`${Math.round(client.ws.ping)}ms\`\``
    ), 
    { color: embedColors.base });
  });
  
  // create ping slash commmand
  const pingData = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('get information about ping');
  
  // listen for ping interactions
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (!(interaction.commandName === 'ping')) return;

    await interaction.reply(await createReplyEmbed(
      `Bot latency: \`\`${Date.now() - interaction.createdTimestamp}ms\`\`
      API latency: \`\`${Math.round(client.ws.ping)}ms\`\``
    ), 
    { color: embedColors.base });
  });

  updateSlashCommands(pingData, 'ping');
}