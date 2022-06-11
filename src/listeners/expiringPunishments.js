import { dmUser, logToDb, logAction, updateExpiringPunishments, fetchExpiringPunishments, mutedRole, guildId, embed } from '#lib';

export default async function main(client) {
  let expiringPunishments = await fetchExpiringPunishments();
  // Check if the expiration date from the punishment closest to expiring is greater than current date
  if (expiringPunishments === null || !(expiringPunishments.at(-1) <= new Date().getTime())) return;

  const guild = await client.guilds.fetch(guildId);
  const userId = expiringPunishments.at(-1).user;
  const member = await guild.members.fetch(userId, false);
  const user = member.user;

  switch (expiringPunishments.at(-1).punishmentType) {
  case 'ban':
    try {
      // Unban the user
      await guild.bans.remove(userId);
      await logAction('Member Unbanned', [{ name: 'Reason', value: 'Punishment Expired' }], userId);
      try { await dmUser(user, await embed.dm('unbanned', 'guild', 'Punishment expired')); } 
      catch {null;}
      // Filter out all bans in the array that have the same user
      expiringPunishments = expiringPunishments.filter(json => { return !(json.user == userId && json.punishmentType == 'ban'); });
      await logToDb(userId, 'Punishment expired.', client.user, 'unbans');
    } catch {null;}
    break;
    
  case 'mute':
    try {
      await member.roles.remove(mutedRole);
      await logAction('Member Unmuted', [{ name: 'Reason', value: 'Punishment Expired' }], userId);
      try { await dmUser(user, await embed.dm('unmuted', 'guild', 'Punishment expired')); } 
      catch {null;}
      // Filter out all mutes in the array that have the same user
      expiringPunishments = expiringPunishments.filter(json => { return !(json.user == userId && json.punishmentType == 'mute'); });
      await logToDb(userId, 'Punishment expired.', client.user, 'unmutes');
    } catch {null;}
    break;  
  }

  await updateExpiringPunishments(expiringPunishments);
}
