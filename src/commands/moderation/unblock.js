import { SlashCommandBuilder } from '@discordjs/builders';
import { logToDb, dmUser, logAction, appendToCommandArray, embed } from '#lib';

export default async function main() {
  // Create unblock slash command
  const unblockData = new SlashCommandBuilder()
    .setName('unblock')
    .setDescription('Unblocks given user from current channel.')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter user to unblock')
      .setRequired(true))
    .addStringOption(option => option.setName('reason')
      .setDescription('Enter the unblock reason')
      .setRequired(false));

  // Unblocks given user from a channel
  async function unblock({ action, userId, reason, guild, moderator }) {
    if (!userId || !(userId.match(/^[0-9]{15,18}/))) return action.reply(await embed.commandFail('Invalid User.'));

    const member = await guild.members.fetch(userId).catch(() => {return null;});
    const channel = action.channel;
    reason = !reason ? 'None' : reason;

    if (channel.permissionsFor(member).has('VIEW_CHANNEL')) return action.reply(await embed.commandFail(`${member} can already access this channel.`));
    if (!member) return action.reply(await embed.notInServer(member));

    try {
      dmUser(member, await embed.createReplyEmbed({
        title: `You've been unblocked from #${channel.name} in ${guild}.`,
        description: `Reason: \`\`${reason}\`\`.`
      }));
      await action.reply(await embed.punishmentReply('unblocked', member));
    } catch {
      await action.reply(await embed.dmFail(member));
    }

    logToDb(userId, reason, moderator, 'unblocks', null, { channel: channel });
    logAction('Member Unblocked', [
      { name: 'User', value: `${member}` },
      { name: 'Channel', value: `${channel}` },
      { name: 'Reason', value: `\`\`${reason}\`\`` },
    ], { mod: moderator });
 
    await channel.edit({
      permissionOverwrites: [{
        id: userId,
        allow: ['VIEW_CHANNEL']
      }]
    });
  }

  appendToCommandArray({
    aliases: ['unblock'],
    requiredPerms: 'BAN_MEMBERS',
    slashData: unblockData,
    callback: unblock,
    callbackParamInfo: ['userId', 'reason'],
    helpInfo: {
      title: 'Unblock Command',
      category: 'Moderation',
      description: 'Unblocks given user from current channel.',
      usage: ['unblock <user> [duration] [reason]'],
      examples: ['unblock @oxi#6219 #general 1d being dumb'],
      aliases: ['unblock'],
      arguments: [
        {
          argument: '<user>',
          description: 'The user to unblock.',
          type: 'user or snowflake'
        },
        {
          argument: '[reason]',
          description: 'The reason of the unblock.',
          type: 'string'
        }
      ]
    }
  });
}