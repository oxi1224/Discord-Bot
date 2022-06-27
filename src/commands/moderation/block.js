import { SlashCommandBuilder } from '@discordjs/builders';
import { logToDb, dmUser, logAction, appendToCommandArray, embed, config } from '#lib';

export default async function main() {
  // Create block slash command
  const blockData = new SlashCommandBuilder()
    .setName('block')
    .setDescription('Blocks given user from current channel.')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter user to block')
      .setRequired(true))
    .addStringOption(option => option.setName('duration')
      .setDescription('Enter the block duration')
      .setRequired(false))
    .addStringOption(option => option.setName('reason')
      .setDescription('Enter the block reason')
      .setRequired(false));

  // Blocks given user from current channel
  async function block({ action, userId, duration, reason, guild, moderator }) {
    if (!userId || !(userId.match(/^[0-9]{15,18}/))) return action.reply(embed.commandFail('Invalid user.'));

    const member = await guild.members.fetch(userId).catch(() => {return null;});
    const channel = action.channel;
    reason = !reason ? 'None' : reason;

    if (!channel.permissionsFor(member).has('VIEW_CHANNEL')) return action.reply(embed.commandFail(`${member} already can't access this channel.`));
    if (!member) return action.reply(embed.notInServer(member));
    if (member.roles.cache.some(role => role.id.includes(config.roles.staff))) return action.reply(embed.commandFail(`${member} is not blockable.`));

    try {
      dmUser(member, embed.createReplyEmbed({
        title: `You've been ${!duration ? 'permanently blocked' : `blocked for ${duration}`} from #${channel.name} in ${guild}.`,
        description: `Reason: \`\`${reason}\`\`.`
      }));
      await action.reply(embed.punishmentReply('blocked', member));
    } catch {
      await action.reply(embed.dmFail(member));
    }

    logToDb(userId, reason, moderator, 'blocks', duration, { channel: channel });
    logAction('Member Blocked', [
      { name: 'User', value: `${member}` },
      { name: 'Channel', value: `${channel}` },
      { name: 'Reason', value: `\`\`${reason}\`\`` },
      { name: 'Duration', value: !duration ? 'Permanent' : duration }
    ], { mod: moderator });
 
    await channel.edit({
      permissionOverwrites: [{
        id: userId,
        deny: ['VIEW_CHANNEL']
      }]
    });
  }

  appendToCommandArray({
    aliases: ['block'],
    requiredPerms: 'BAN_MEMBERS',
    slashData: blockData,
    callback: block,
    callbackParamInfo: ['userId', 'duration', 'reason'],
    helpInfo: {
      title: 'Block Command',
      category: 'Moderation',
      description: 'Blocks given user from current channel.',
      usage: ['block <user> [duration] [reason]'],
      examples: ['block @oxi#6219 #general 1d being dumb'],
      aliases: ['block'],
      arguments: [
        {
          argument: '<user>',
          description: 'The user to block.',
          type: 'user or snowflake'
        },
        {
          argument: '[duration]',
          description: 'The duration of the block.',
          type: 'integer followed by time suffix.',
          timeSuffixes: ['min', 'h', 'd', 'w', 'm']
        },
        {
          argument: '[reason]',
          description: 'The reason of the block.',
          type: 'string'
        }
      ]
    }
  });
}