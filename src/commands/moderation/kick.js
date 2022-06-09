import { SlashCommandBuilder } from '@discordjs/builders';
import { logToDb, dmUser, logAction } from '../../lib/util/util.js';
import { handle } from '../../lib/commandHandler.js';
import * as embed from '../../lib/util/embeds.js';

export async function main(client) {
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
    if (userId === null || !(userId.match(/^[0-9]{15,18}/))) return action.reply(await embed.punishmentFail('Invalid User.'));
    const user = await client.users.fetch(userId, false);
    const member = await guild.members.fetch(userId).catch(() => {return null;});
    reason = reason === null ? 'None' : reason;

    // Check if user is staff (has manage nicknames perms)
    if (!member === null && member.permissions.has('MANAGE_NICKNAMES')) return action.reply(await embed.punishmentFail('Cannot kick staff.'));
    if (!(await guild.members.fetch(userId))) return action.reply(await embed.notInServer(user));
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

  handle(client, {
    aliases: ['kick'],
    requiredPerms: 'KICK_MEMBERS',
    slashData: kickData,
    callback: performKick
  });
}