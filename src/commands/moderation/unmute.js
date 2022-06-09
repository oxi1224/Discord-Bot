import { SlashCommandBuilder } from '@discordjs/builders';
import { logToDb, dmUser, logAction } from '../../lib/util/util.js';
import { mutedRole } from '../../lib/config/config.js';
import { handle } from '../../lib/commandHandler.js';
import * as embed from '../../lib/util/embeds.js';

export async function main(client) {
  // Create unmute slash commmand
  const unmuteData = new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('unmutes given user')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter a user to unmute')
      .setRequired(true))
    .addStringOption(option => option.setName('reason')
      .setDescription('Enter the unmute reason')
      .setRequired(false));

  // Unmutes given user
  async function unmute({ action, userId, reason, guild, moderator }) {
    if (userId === null || !(userId.match(/^[0-9]{15,18}/))) return action.reply(await embed.punishmentFail('Invalid User.'));
    const member = await guild.members.fetch(userId, false);
    const user = member.user;
    reason = reason === null ? 'None' : reason;
    
    if (!(member)) return action.reply(`${user} is not in the server`);
    if (!(member.roles.cache.some(role => role.id === mutedRole))) return action.reply(await embed.punishmentFail(`${user} is not muted.`));
    try {
      await dmUser(user, await embed.dm('unmuted', guild, reason));
      await action.reply(await embed.punishmentReply('unmuted', user));
    } catch {
      await action.reply(await embed.dmFail(user));
    }

    logToDb(userId, reason, moderator, 'unmutes');
    logAction('Member Unmuted', [
      { name: 'User', value: `${user}` },
      { name: 'Reason', value: `\`\`${reason}\`\`` }
    ], { mod: moderator });
    await member.roles.remove(mutedRole);
  }

  handle(client, {
    aliases: ['unmute'],
    requiredPerms: 'MUTE_MEMBERS',
    slashData: unmuteData,
    callback: unmute
  });
}