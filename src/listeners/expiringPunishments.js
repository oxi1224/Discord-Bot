/* eslint-disable no-case-declarations */
import { dmUser, logToDb, logAction, updateExpiringPunishments, fetchExpiringPunishments, config, embed } from '#lib';

export default async function main(client) {
  let expiringPunishments = await fetchExpiringPunishments();

  // Check if the expiration date from the punishment closest to expiring is greater than current date
  if (expiringPunishments.length === 0 || expiringPunishments.at(-1).punishmentExpires >= new Date().getTime()) return;

  const guild = await client.guilds.fetch(config.guildId);
  const userId = expiringPunishments.at(-1).user;
  const member = await guild.members.fetch(userId, false);
  const user = member.user;

  switch (expiringPunishments.at(-1).punishmentType) {
  case 'ban':
    try {
      await guild.bans.remove(userId);
      await logAction('Member Unbanned', [
        { name: 'User', value: `${user}` },
        { name: 'Reason', value: 'Punishment Expired' }
      ], { mod: client.user });
      try { await dmUser(user, embed.dm('unbanned', guild, 'Punishment expired')); } 
      catch {null;}
      // Filter out all bans in the array that have the same user
      expiringPunishments = expiringPunishments.filter(json => { return !(json.user == userId && json.punishmentType == 'ban'); });
      await logToDb(userId, 'Punishment expired.', client.user, 'unbans');
    } catch {return;}
    break;
    
  case 'mute':
    try {
      await member.roles.remove(config.roles.muted);
      await logAction('Member Unmuted', [
        { name: 'User', value: `${user}` },
        { name: 'Reason', value: 'Punishment Expired' }
      ], { mod: client.user });
      try { await dmUser(user, embed.dm('unmuted', guild, 'Punishment expired')); } 
      catch {null;}
      // Filter out all mutes in the array that have the same user
      expiringPunishments = expiringPunishments.filter(json => { return !(json.user == userId && json.punishmentType == 'mute'); });
      await logToDb(userId, 'Punishment expired.', client.user, 'unmutes');
    } catch {return;}
    break;
  
  case 'block':
    try {
      const channel = await guild.channels.fetch(expiringPunishments.at(-1).additionalInfo.channel.id);
      await channel.edit({
        permissionOverwrites: [{
          id: userId,
          allow: ['VIEW_CHANNEL']
        }]
      });
      await logAction('Member Unblocked', [
        { name: 'User', value: `${user}` },
        { name: 'Channel', value: `${channel}` },
        { name: 'Reason', value: 'Punishment Expired' }
      ], { mod: client.user });
      try {
        dmUser(member, embed.createReplyEmbed({
          title: `You've been unblocked from #${channel.name} in ${guild}.`,
          description: 'Reason: ``Punishment expuired``.'
        }));
      } catch {null;}
      // Filter out all blocks in the array that have the same user
      expiringPunishments = expiringPunishments.filter(json => { return !(json.user == userId && json.punishmentType == 'block'); });
      await logToDb(userId, 'Punishment expired.', client.user, 'unblocks');
    } catch {return;}
    break;
  }

  await updateExpiringPunishments(expiringPunishments);
}
