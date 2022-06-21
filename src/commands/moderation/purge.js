import { SlashCommandBuilder } from '@discordjs/builders';
import { logAction, appendToCommandArray, embed } from '#lib';

export default async function main() {
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
    if (messageCount > 100 || messageCount < 1 || messageCount === undefined) return action.reply(embed.commandFail('Message count must be between 1 and 100.'));
    if (userId && !(userId.match(/^[0-9]{15,18}/))) return action.reply(embed.commandFail('Invalid User.'));
    const channel = action.channel;
    const messages = (await channel.messages
      .fetch({ limit: messageCount, before: action.id }))
      .filter(msg => { 
        if (!userId) return msg; 
        return msg.author.id === userId;
      });

    if (messages.size === 0) return action.reply(embed.commandFail(`No messages found from <@${userId}> in specified range.`));
    await channel.bulkDelete(messages);

    action.reply(embed.commandSuccess(`Successfully purged ${messages.size} messages${!userId ? '.' : ` from <@${userId}>.`}`));
    
    logAction('Messages Purged', [
      { name: 'Amount', value: messages.size.toString() },
      { name: 'Channel', value: `${channel}` },
    ], { mod: moderator });
  }

  appendToCommandArray({
    aliases: ['purge'],
    requiredPerms: 'MANAGE_MESSAGES',
    slashData: purgeData,
    callback: purge,
    callbackParamInfo: ['messageCount', 'userId'],
    helpInfo: {
      title: 'Purge Command',
      category: 'Moderation',
      description: 'Purges messages from a user within a specified range or delete messages in a channel.',
      usage: ['purge [user] <messageCount>'],
      examples: [
        'purge @oxi#6219 30',
        'purge 30'
      ],
      aliases: ['purge'],
      arguments: [
        {
          argument: '[user]',
          description: 'The user whose messages to delete.',
          type: 'user or snowflake'
        },
        {
          argument: '<messageCount>',
          description: 'The range of messages to search or delete.',
          type: 'integer'
        }
      ]
    }
  });
}