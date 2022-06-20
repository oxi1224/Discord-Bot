import { SlashCommandBuilder } from '@discordjs/builders';
import { logToDb, dmUser, logAction, mutedRole, appendToCommandArray, embed } from '#lib';

export default async function main() {
  // Create mute slash commmand
  const muteData = new SlashCommandBuilder()
    .setName('mute')
    .setDescription('mutes given user')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter a user to mute')
      .setRequired(true))
    .addStringOption(option => option.setName('duration')
      .setDescription('Enter the mute duration')
      .setRequired(false))
    .addStringOption(option => option.setName('reason')
      .setDescription('Enter the mute reason')
      .setRequired(false));

  // Mutes given user
  async function mute({ action, userId, duration, reason, guild, moderator }) {
    if (!userId || !(userId.match(/^[0-9]{15,18}/))) return action.reply(await embed.commandFail('Invalid User.'));
    const member = await guild.members.fetch(userId);
    const user = member.user;
    reason = !reason ? 'None' : reason;

    if (!member) return action.reply(await embed.notInServer(user));
    if (member.roles.cache.some(role => role.id === mutedRole)) return action.reply(await embed.commandFail(`${user} is already muted.`));
    try {
      await dmUser(user, await embed.dmDuration('muted', guild, reason, duration));
      await action.reply(await embed.punishmentReply('muted', user));
    } catch {
      await action.reply(await embed.dmFail(user));
    }

    await logToDb(userId, reason, moderator, 'mutes', duration);
    await logAction('Member Muted', [
      { name: 'User', value: `${user}` },
      { name: 'Reason', value: `\`\`${reason}\`\`` },
      { name: 'Duration', value: !duration ? 'Permanent' : duration }
    ], { mod: moderator });
    
    await member.roles.add(mutedRole);
  }

  appendToCommandArray({
    aliases: ['mute'],
    requiredPerms: 'MUTE_MEMBERS',
    slashData: muteData,
    callback: mute,
    callbackParamInfo: ['userId', 'duration', 'reason'],
    helpInfo: {
      title: 'Mute Command',
      category: 'Moderation',
      description: 'Mute a member of the server.',
      usage: ['mute <member> [duration] [reason]'],
      examples: ['mute @oxi#6219 1d crashing the bot'],
      aliases: ['mute'],
      arguments: [
        {
          argument: '<member>',
          description: 'The member to mute.',
          type: 'user or snowflake'
        },
        {
          argument: '[duration]',
          description: 'The duration of the mute.',
          type: 'integer followed by time suffix.',
          timeSuffixes: ['min', 'h', 'd', 'w', 'm']
        },
        {
          argument: '[reason]',
          description: 'The reason of the mute.',
          type: 'string'
        }
      ]
    }
  });
}