import { SlashCommandBuilder } from '@discordjs/builders';
import { updateSlashCommands } from '../../lib/updateSlashCommands.js';
import { logAction } from '../../lib/util/util.js';
import { emotes, embedColors, prefix } from '../../lib/config/config.js';
import * as embed from '../../lib/util/embeds.js';

export async function main() {
  const { client } = await import('../../bot.js');

  // Listen for purge commands
  client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(1).trim().split(' ').filter(str => str !== '');
    const command = args.shift().toLowerCase();
    if (!(command == 'purge')) return;
    if (!(message.member.permissions.has('MANAGE_MESSAGES'))) return message.react(emotes.error);

    const messageCount = args[0];

    await purge(message, messageCount);
  });

  // Create purge slash command
  const purgeData = new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Purges messages')
    .addStringOption(option => option.setName('message_count')
      .setDescription('Enter the amount of messages to purge')
      .setRequired(true));
    // .addUserOption(option => option.setName('user')
    //   .setDescription('Enter a user to purge')
    //   .setRequired(false));
    

  // Listen for purge interactions
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (!(interaction.commandName === 'purge')) return;
    if (!(interaction.member.permissions.has('MANAGE_MESSAGES'))) return interaction.reply({ content: 'Insufficient Permissions', ephemeral: true });
    const messageCount = interaction.options.get('message_count').value;

    // const userId = interaction.options.get('user') === null ? null : interaction.options.get('user').value;
    await purge(interaction, messageCount);

  });

  updateSlashCommands(purgeData, 'purge');

  async function purge(action, messageCount) {
    if (messageCount > 100 || messageCount < 1 || messageCount === undefined) return action.reply(await embed.punishmentFail('Message count must be between 1 and 100'));
  
    const channel = action.channel;
    const messages = await channel.messages.fetch({ limit: messageCount, before: action.id });
    await channel.bulkDelete(messages);

    action.reply(await embed.otherResponses(
      `Successfully purged ${messageCount} messages`, 
      emotes.success,
      embedColors.success));
    
    logAction('Messages Purged', [
      { name: 'Amount', value: messageCount },
      { name: 'Channel', value: `${channel}` }
    ]);
  }
}