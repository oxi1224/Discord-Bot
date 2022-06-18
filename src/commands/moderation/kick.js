import { SlashCommandBuilder } from '@discordjs/builders';
import { logToDb, dmUser, logAction, appendToCommandArray, embed } from '#lib';

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
    if (!userId || !(userId.match(/^[0-9]{15,18}/))) return action.reply(await embed.commandFail('Invalid User.'));
    const user = await client.users.fetch(userId, false);
    const member = await guild.members.fetch(userId).catch(() => {return null;});
    reason = !reason ? 'None' : reason;

    if (!(await guild.members.fetch(userId))) return action.reply(await embed.notInServer(user));
    if (!member.kickable) return action.reply(await embed.commandFail(`${member} is not kickable.`));

    try {
      await dmUser(user, await embed.dm('kicked', guild, reason));
      await action.reply(await embed.punishmentReply('kicked', user));
    } catch {
      await action.reply(await embed.dmFail(user));
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