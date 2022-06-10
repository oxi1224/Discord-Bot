import { SlashCommandBuilder } from '@discordjs/builders';
import { logToDb, dmUser, logAction } from '../../lib/util/util.js';
import { appendToCommandArray } from '../../lib/commandHandler.js';
import * as embed from '../../lib/util/embeds.js';

export async function main(client) {
  // Create ban slash command
  const banData = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans given user')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter user to ban')
      .setRequired(true))
    .addStringOption(option => option.setName('duration')
      .setDescription('Enter the ban duration')
      .setRequired(false))
    .addStringOption(option => option.setName('reason')
      .setDescription('Enter the ban reason')
      .setRequired(false));

  // Bans given user
  async function performBan({ action, userId, reason, duration, guild, moderator }) {
    if (userId === null || !(userId.match(/^[0-9]{15,18}/))) return action.reply(await embed.punishmentFail('Invalid User.'));
    const banList = await guild.bans.fetch();
    const user = await client.users.fetch(userId, false);
    const member = await guild.members.fetch(userId).catch(() => {return null;});
    reason = reason === null ? 'None' : reason;

    // Check if user is staff (has manage nicknames perms)
    if (!member === null && member.permissions.has('MANAGE_NICKNAMES')) return action.reply(await embed.punishmentFail('Cannot kick staff.'));
    if (!(banList.find(x => x.user.id === userId) === undefined)) return action.reply(await embed.punishmentFail('User already banned.'));
    try {
      await dmUser(user, await embed.dmDuration('banned', guild, reason, duration));
      await action.reply(await embed.punishmentReply('banned', user));
    } catch {
      await action.reply(await embed.dmFail(user));
    }

    logToDb(userId, reason, moderator, 'bans', duration);
    logAction('Member Banned', [
      { name: 'User', value: `${user}` },
      { name: 'Reason', value: `\`\`${reason}\`\`` },
      { name: 'Duration', value: duration === null ? 'Permanent' : duration }
    ], { mod: moderator });
    await guild.members.ban(userId, { reason: reason });
  }

  appendToCommandArray({
    aliases: ['ban'],
    requiredPerms: 'BAN_MEMBERS',
    slashData: banData,
    callback: performBan
  });
}