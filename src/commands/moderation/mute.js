import { SlashCommandBuilder } from '@discordjs/builders';
import { logToDb, dmUser, logAction, appendToCommandArray, embed, config } from '#lib';


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
    if (!userId || !(userId.match(/^[0-9]{15,18}/))) return action.reply(embed.commandFail('Invalid User.'));
    const member = await guild.members.fetch(userId);
    reason = !reason ? 'None' : reason;

    if (!member) return action.reply(embed.notInServer(member));
    if (member.roles.cache.some(role => role.id === config.roles.muted)) return action.reply(embed.commandFail(`${member} is already muted.`));
    try {
      await dmUser(member, embed.dmDuration('muted', guild, reason, duration));
      await action.reply(embed.punishmentReply('muted', member));
    } catch {
      await action.reply(embed.dmFail(member));
    }

    await logToDb(userId, reason, moderator, 'mutes', duration);
    await logAction('Member Muted', [
      { name: 'User', value: `${member}` },
      { name: 'Reason', value: `\`\`${reason}\`\`` },
      { name: 'Duration', value: !duration ? 'Permanent' : duration }
    ], { mod: moderator });
    
    await member.roles.add(config.roles.muted);
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