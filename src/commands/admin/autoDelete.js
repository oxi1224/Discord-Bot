import { SlashCommandBuilder } from '@discordjs/builders';
import { logToDb, dmUser, logAction, appendToCommandArray, embed } from '#lib';

export default async function main(client) {
  // Create ban slash command
  const banData = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans given user')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter user to ban')
      .setRequired(true))
    .addStringOption(option => option.setName('duration')
      .setDescription('Enter the ban duration')
      .setRequired(false))
    .addStringOption(option => option.setName('reason')
      .setDescription('Enter the ban reason')
      .setRequired(false));

  // Bans given user
  async function performBan({ action, userId, duration, reason, guild, moderator }) {
    if (!userId || !(userId.match(/^[0-9]{15,18}/))) return action.reply(embed.commandFail('Invalid User.'));
    const banList = await guild.bans.fetch();
    const user = await client.users.fetch(userId, false);
    const member = await guild.members.fetch(userId).catch(() => {return null;});
    reason = !reason ? 'None' : reason;

    if (!(banList.find(x => x.user.id === userId) === undefined)) return action.reply(embed.commandFail('User already banned.'));
    if (!member.bannable) return action.reply(embed.commandFail(`${member} is not bannable.`));
    
    try {
      dmUser(user, embed.dmDuration('banned', guild, reason, duration));
      await action.reply(embed.punishmentReply('banned', user));
    } catch {
      await action.reply(embed.dmFail(user));
    }

  }

  appendToCommandArray({
    aliases: ['ban'],
    requiredPerms: 'BAN_MEMBERS',
    slashData: banData,
    callback: performBan,
    callbackParamInfo: ['userId', 'duration', 'reason'],
    helpInfo: {
      title: 'Ban Command',
      category: 'Moderation',
      description: 'Bans a user.',
      usage: ['ban <user> [duration] [reason]'],
      examples: ['ban @oxi#6219 1d crashing the bot'],
      aliases: ['ban'],
      arguments: [
        {
          argument: '<user>',
          description: 'The user to ban.',
          type: 'user or snowflake'
        },
        {
          argument: '[duration]',
          description: 'The duration of the ban.',
          type: 'integer followed by time suffix.',
          timeSuffixes: ['min', 'h', 'd', 'w', 'm']
        },
        {
          argument: '[reason]',
          description: 'The reason of the ban.',
          type: 'string'
        }
      ]
    }
  });
}