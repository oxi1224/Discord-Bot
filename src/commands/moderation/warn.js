import { SlashCommandBuilder } from '@discordjs/builders';
import { logToDb, dmUser, logAction, appendToCommandArray, embed } from '#lib';

export default async function main(client) {
  // Create warn slash commmand
  const warnData = new SlashCommandBuilder()
    .setName('warn')
    .setDescription('warns given user')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter a user to warn')
      .setRequired(true))
    .addStringOption(option => option.setName('reason')
      .setDescription('Enter the warn reason')
      .setRequired(true));

  // Warns given user
  async function warn({ action, userId, reason, moderator, guild }) {
    // if (!userId || !(userId.match(/^[0-9]{15,18}/))) return action.reply(await embed.commandFail('Invalid User.'));
    if (!reason) return action.reply(await embed.commandFail('Reason cannot be empty.'));
    const user = await client.users.fetch(userId, false);
    reason = !reason ? 'None' : reason;

    if (!(await guild.members.fetch(userId))) return action.reply(await embed.notInServer(user));
    try {
      await dmUser(user, await embed.dm('warned', guild, reason));
      await action.reply(await embed.punishmentReply('warned', user));
    } catch {
      await action.reply(await embed.dmFail(user));
    }

    logToDb(userId, reason, moderator, 'warns');
    logAction('Member Warned', [
      { name: 'User', value: `${user}` },
      { name: 'Reason', value: `\`\`${reason}\`\`` }
    ], { mod: moderator });
  }

  appendToCommandArray({
    aliases: ['warn'],
    requiredPerms: 'MANAGE_NICKNAMES',
    slashData: warnData,
    callback: warn,
    callbackParamInfo: ['userId', 'reason'],
    helpInfo: {
      title: 'Warn Command',
      category: 'Moderation',
      description: 'Warns a member of the server.',
      usage: ['warn <member> <reason>'],
      examples: ['warn @oxi#6219 almost crashing the bot'],
      aliases: ['warn'],
      arguments: [
        {
          argument: '<member>',
          description: 'The member to warn.',
          type: 'user or snowflake'
        },
        {
          argument: '<reason>',
          description: 'The reason of the warn.',
          type: 'string'
        }
      ]
    }
  });
}