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
    
    const userId = await (async () => {
      try { return message.mentions.users.first() === undefined && args[0] !== args.at(-1) ? args[1].replace(/[\\<>@#&!]/g, '') : message.mentions.users.first().id; } 
      catch { return null; }
    })();
    if (userId !== null && !(userId.match(/^[0-9]{15,18}/))) return message.reply(await embed.punishmentFail('Invalid user.'));
    const messageCount = args[0];
    const moderator = message.author;

    await purge(message, messageCount, userId, moderator);
  });

  // Create purge slash command
  const purgeData = new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Purges messages')
    .addStringOption(option => option.setName('message_count')
      .setDescription('Enter the amount of messages to purge')
      .setRequired(true))
    .addUserOption(option => option.setName('user')
      .setDescription('Enter a user to purge')
      .setRequired(false));
    

  // Listen for purge interactions
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (!(interaction.commandName === 'purge')) return;
    if (!(interaction.member.permissions.has('MANAGE_MESSAGES'))) return interaction.reply({ content: 'Insufficient Permissions', ephemeral: true });
    
    const userId = interaction.options.get('user') === null ? null : interaction.options.get('user').value;
    const messageCount = interaction.options.get('message_count').value;
    const moderator = interaction.author;
    
    await purge(interaction, messageCount, userId, moderator);
  });

  updateSlashCommands(purgeData, 'purge');

  async function purge(action, messageCount, userId, moderator) {
    if (messageCount > 100 || messageCount < 1 || messageCount === undefined) return action.reply(await embed.punishmentFail('Message count must be between 1 and 100.'));
    
    const channel = action.channel;
    const messages = (await channel.messages
      .fetch({ limit: messageCount, before: action.id }))
      .filter(msg => { 
        if (userId === null) return msg; 
        return msg.author.id === userId;
      });
    await channel.bulkDelete(messages);

    action.reply(await embed.createReplyEmbed(
      `Successfully purged ${messages.size} messages ${userId === null ? '' : `from <@${userId}>`}.`, 
      { emote: emotes.success,
        color: embedColors.success }));
    
    logAction('Messages Purged', [
      { name: 'Amount', value: messages.size.toString() },
      { name: 'Channel', value: `${channel}` },
    ], { mod: moderator });
  }
}