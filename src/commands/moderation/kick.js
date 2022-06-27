import { SlashCommandBuilder } from '@discordjs/builders';
import { logToDb, dmUser, logAction, appendToCommandArray, embed, config } from '#lib';

export default async function main(client) {
  // Create kick slash commmand
  const kickData = new SlashCommandBuilder()
    .setName('kick')
    .setDescription('kicks given user')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter a user to kick')
      .setRequired(true))
    .addStringOption(option => option.setName('reason')
      .setDescription('Enter the kick reason')
      .setRequired(false));

  // Kicks given user
  async function performKick({ action, userId, reason, guild, moderator }) {
    if (!userId || !(userId.match(/^[0-9]{15,18}/))) return action.reply(embed.commandFail('Invalid user.'));
    const user = await client.users.fetch(userId, false);
    const member = await guild.members.fetch(userId).catch(() => {return null;});
    reason = !reason ? 'None' : reason;

    if (!(await guild.members.fetch(userId))) return action.reply(embed.notInServer(user));
    if (member.roles.cache.some(role => role.id.includes(config.roles.staff))) return action.reply(embed.commandFail(`${member} is not kickable.`));

    try {
      await dmUser(user, embed.dm('kicked', guild, reason));
      await action.reply(embed.punishmentReply('kicked', user));
    } catch {
      await action.reply(embed.dmFail(user));
    }
    
    logToDb(userId, reason, moderator, 'kicks');
    logAction('Member Kicked', [
      { name: 'User', value: `${user}` },
      { name: 'Reason', value: `\`\`${reason}\`\`` }
    ], { mod: moderator });

    await (await guild.members.fetch(userId)).kick({ reason: reason });
  }

  appendToCommandArray({
    aliases: ['kick'],
    requiredPerms: 'KICK_MEMBERS',
    slashData: kickData,
    callback: performKick,
    callbackParamInfo: ['userId', 'reason'],
    helpInfo: {
      title: 'Kick Command',
      category: 'Moderation',
      description: 'Kicks a member of the server.',
      usage: ['kick <member> [reason]'],
      examples: ['kick @oxi#6219 crashing the bot'],
      aliases: ['kick'],
      arguments: [
        {
          argument: '<member>',
          description: 'The member to kick.',
          type: 'user or snowflake'
        },
        {
          argument: '<reason>',
          description: 'The reason of the kick.',
          type: 'string'
        }
      ]
    }
  });
}