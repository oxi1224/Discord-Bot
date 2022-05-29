import { dmUser, logPunishment, logAction } from '../../lib/util/util.js';
import { updateExpiringPunishments, fetchExpiringPunishments } from '../../lib/common/db.js';

export async function main() {
  const { client } = await import('../../bot.js');
  let expiringPunishments = await fetchExpiringPunishments();
  // Check if the expiration date from the punishment closest to expiring is greater than current date
  if (expiringPunishments.length === 0 || !(expiringPunishments.at(-1).punishmentExpires <= new Date().getTime())) return;

  const guild = await client.guilds.fetch('613024666079985702');
  const userId = expiringPunishments.at(-1).user;
  const member = await guild.members.fetch(userId, false);
  const user = member.user;
  const mutedRole = '980484262652416080';

  switch (expiringPunishments.at(-1).punishmentType) {
  case 'ban':
    try {
      // Unban the user
      await guild.bans.remove(userId);
      await logAction('Member Unbanned', [{ name: 'Reason', value: 'Punishment Expired' }], userId);
      try { await dmUser(user, `You've been unbanned in **${guild}** \n Reason: \`\`Punishment Expired\`\` `); } 
      catch {null;}
      // Filter out all bans in the array that have the same user
      expiringPunishments = expiringPunishments.filter(json => { return !(json.user == userId && json.punishmentType == 'ban'); });
      await logPunishment(userId, 'Punishment expired.', client.user, 'unbans');
    } catch {null;}
    break;
    
  case 'mute':
    try {
      await member.roles.remove(mutedRole);
      await logAction('Member Unmuted', [{ name: 'Reason', value: 'Punishment Expired' }], userId);
      try { await dmUser(user, `You've been unmuted in **${guild}** \n Reason: \`\`Punishment Expired\`\` `); } 
      catch {null;}
      // Filter out all mutes in the array that have the same user
      expiringPunishments = expiringPunishments.filter(json => { return !(json.user == userId && json.punishmentType == 'mute'); });
      await logPunishment(userId, 'Punishment expired.', client.user, 'unmutes');
    } catch {null;}
    break;  
  }

  await updateExpiringPunishments(expiringPunishments);
}
