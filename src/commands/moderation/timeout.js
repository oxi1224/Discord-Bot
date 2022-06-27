import { SlashCommandBuilder } from '@discordjs/builders';
import { logToDb, dmUser, logAction, appendToCommandArray, embed, getExpirationDate, config } from '#lib';

export default async function main() {
  // Create timeout slash commmand
  const timeoutData = new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('timeouts given user')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter a user to timeout')
      .setRequired(true))
    .addStringOption(option => option.setName('duration')
      .setDescription('Enter the timeout duration')
      .setRequired(true))
    .addStringOption(option => option.setName('reason')
      .setDescription('Enter the timeout reason')
      .setRequired(false));

  // Timeouts given user
  async function timeout({ action, userId, duration, reason, guild, moderator }) {
    if (!userId || !(userId.match(/^[0-9]{15,18}/))) return action.reply(embed.commandFail('Invalid user.'));
    const member = await guild.members.fetch(userId);
    const currentDate = new Date().getTime();
    reason = !reason ? 'None' : reason;

    if (!member) return action.reply(embed.notInServer(member));
    if (member.roles.cache.some(role => role.id.includes(config.roles.staff))) return action.reply(embed.commandFail(`Can't timeout ${member}.`));
    if (member.communicationDisabledUntil) return action.reply(embed.commandFail(`${member} already timedout.`));
    if (!duration) return action.reply(embed.commandFail('Invalid duration.'));
    if (getExpirationDate('27d', currentDate) < getExpirationDate(duration, currentDate)) return action.reply(embed.commandFail('Duration must be below 27 days.'));

    try {
      await dmUser(member, embed.dmDuration('timedout', guild, reason, duration));
      await action.reply(embed.punishmentReply('timedout', member));
    } catch {
      await action.reply(embed.dmFail(member));
    }

    await logToDb(userId, reason, moderator, 'timeouts', duration);
    await logAction('Member Timedout', [
      { name: 'User', value: `${member}` },
      { name: 'Reason', value: `\`\`${reason}\`\`` },
      { name: 'Duration', value: !duration ? 'Permanent' : duration }
    ], { mod: moderator });

    await member.disableCommunicationUntil(getExpirationDate(duration, currentDate), reason);
  }

  appendToCommandArray({
    aliases: ['timeout'],
    requiredPerms: 'MUTE_MEMBERS',
    slashData: timeoutData,
    callback: timeout,
    callbackParamInfo: ['userId', 'duration', 'reason'],
    helpInfo: {
      title: 'Timeout Command',
      category: 'Moderation',
      description: 'Timeout a member of the server.',
      usage: ['timeout <member> <duration> [reason]'],
      examples: ['timeout @oxi#6219 1d crashing the bot'],
      aliases: ['timeout'],
      arguments: [
        {
          argument: '<member>',
          description: 'The member to timeout.',
          type: 'user or snowflake'
        },
        {
          argument: '<duration>',
          description: 'The duration of the timeout.',
          type: 'integer followed by time suffix.',
          timeSuffixes: ['min', 'h', 'd', 'w', 'm']
        },
        {
          argument: '[reason]',
          description: 'The reason of the timeout.',
          type: 'string'
        }
      ]
    }
  });
}