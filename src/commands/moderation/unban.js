import { SlashCommandBuilder } from '@discordjs/builders';
import { logToDb, dmUser, logAction } from '../../lib/util/util.js';
import { handle } from '../../lib/commandHandler.js';
import * as embed from '../../lib/util/embeds.js';

export async function main(client) {
  // create unban slash commmand
  const unBanData = new SlashCommandBuilder()
    .setName('unban')
    .setDescription('unbans given user')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter user to unban')
      .setRequired(true));

  // Unbans given user
  async function unBan({ action, userId, reason, guild, moderator }) {
    if (userId === null || !(userId.match(/^[0-9]{15,18}/))) return action.reply(await embed.punishmentFail('Invalid User.'));
    const user = await client.users.fetch(userId, false);
    const banList = await action.guild.bans.fetch();
    reason = reason === null ? 'None' : reason;

    if (banList.find(x => x.user.id === userId) === undefined) return action.reply(await embed.punishmentFail(`${user} is not banned.`));
    if (!userId) throw new Error('BAN_RESOLVE_ID');
    await guild.bans.remove(userId);
    try {
      await dmUser(user, await embed.dm('unbanned', guild, reason));
      await action.reply(await embed.punishmentReply('unbanned', user));
    } catch {
      await action.reply(await embed.dmFail(user));
    }
    
    logToDb(userId, reason, moderator, 'unbans');
    logAction('Member Unbanned', [
      { name: 'User', value: `${user}` },
      { name: 'Reason', value: `\`\`${reason}\`\`` }
    ], { mod: moderator });
    return client.users.resolve(user);
  }

  handle(client, {
    aliases: ['unban'],
    requiredPerms: 'BAN_MEMBERS',
    slashData: unBanData,
    callback: unBan
  });
}