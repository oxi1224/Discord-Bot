import { SlashCommandBuilder } from '@discordjs/builders';
import { logAction } from '../../lib/util/util.js';
import { emotes, embedColors } from '../../lib/config/config.js';
import { appendToCommandArray } from '../../lib/commandHandler.js';
import * as embed from '../../lib/util/embeds.js';

export async function main() {
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
    
  async function purge({ action, messageCount, userId, moderator }) {
    if (messageCount > 100 || messageCount < 1 || messageCount === undefined) return action.reply(await embed.punishmentFail('Message count must be between 1 and 100.'));
    if (userId !== null && !(userId.match(/^[0-9]{15,18}/))) return action.reply(await embed.punishmentFail('Invalid User.'));
    const channel = action.channel;
    const messages = (await channel.messages
      .fetch({ limit: messageCount, before: action.id }))
      .filter(msg => { 
        if (userId === null) return msg; 
        return msg.author.id === userId;
      });

    if (messages.size === 0) return action.reply(await embed.punishmentFail(`No messages found from <@${userId}> in specified range.`));
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

  appendToCommandArray({
    aliases: ['purge'],
    requiredPerms: 'MANAGE_MESSAGES',
    slashData: purgeData,
    callback: purge
  });
}