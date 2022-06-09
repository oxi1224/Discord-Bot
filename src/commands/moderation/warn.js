import { SlashCommandBuilder } from '@discordjs/builders';
import { logToDb, dmUser, logAction } from '../../lib/util/util.js';
import { handle } from '../../lib/commandHandler.js';
import * as embed from '../../lib/util/embeds.js';

export async function main(client) {
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
    if (userId === null || !(userId.match(/^[0-9]{15,18}/))) return action.reply(await embed.punishmentFail('Invalid User.'));
    if (reason === null) return action.reply(await embed.punishmentFail('Reason cannot be empty.'));
    const user = await client.users.fetch(userId, false);
    reason = reason === null ? 'None' : reason;

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

  handle(client, {
    aliases: ['warn'],
    requiredPerms: 'MANAGE_NICKNAMES',
    prefixedData: warnData,
    callback: warn
  });
}