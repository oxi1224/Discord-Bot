import { SlashCommandBuilder } from '@discordjs/builders';
import { logToDb, dmUser, logAction } from '../../lib/util/util.js';
import { mutedRole } from '../../lib/config/config.js';
import { handle } from '../../lib/commandHandler.js';
import * as embed from '../../lib/util/embeds.js';

export async function main(client) {
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
  async function mute({ action, userId, reason, duration, guild, moderator }) {
    if (userId === null || !(userId.match(/^[0-9]{15,18}/))) return action.reply(await embed.punishmentFail('Invalid User.'));
    const member = await guild.members.fetch(userId);
    const user = member.user;
    reason = reason === null ? 'None' : reason;

    if (!(member)) return action.reply(await embed.notInServer(user));
    if (member.roles.cache.some(role => role.id === mutedRole)) return action.reply(await embed.punishmentFail(`${user} is already muted.`));
    try {
      await dmUser(user, await embed.dmDuration('muted', guild, reason, duration));
      await action.reply(await embed.punishmentReply('muted', user));
    } catch {
      await action.reply(await embed.dmFail(user));
    }

    logToDb(userId, reason, moderator, 'mutes', duration);
    logAction('Member Muted', [
      { name: 'User', value: `${user}` },
      { name: 'Reason', value: `\`\`${reason}\`\`` },
      { name: 'Duration', value: duration === null ? 'Permanent' : duration }
    ], { mod: moderator });
    await member.roles.add(mutedRole);
  }

  handle(client, {
    aliases: ['mute'],
    requiredPerms: 'MUTE_MEMBERS',
    slashData: muteData,
    callback: mute
  });
}