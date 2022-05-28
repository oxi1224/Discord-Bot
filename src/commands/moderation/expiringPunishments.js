import { dmUser, logPunishment } from '../../lib/util/util.js';
import { logAction } from './actionLogger.js';
import { client as dbClient } from '../../lib/common/db.js';

export async function main() {
  const { client } = await import('../../bot.js');
  let expiringPunishments = await (await dbClient.query('SELECT punishmentInfo FROM expiringPunishments WHERE id=0::text')).rows[0].punishmentinfo;
  // Check if the expiration date from the punishment closest to expiring is greater than current date
  if (expiringPunishments.length === 0 || !(expiringPunishments.at(-1).punishmentExpires <= new Date().getTime())) return;

  const guild = await client.guilds.fetch('613024666079985702');
  const userId = expiringPunishments.at(-1).user;
  const user = await client.users.fetch(userId, false);

  switch (expiringPunishments.at(-1).punishmentType) {
  case 'ban':
    // Unban the user
    await guild.bans.remove(userId);
    await logAction('Member Unbanned', [{ name: 'Reason', value: 'Punishment Expired' }], userId);
    try { await dmUser(user, `You've been unbanned in **${guild}** \n Reason: \`\`Punishment Expired\`\` `); } 
    catch {null;}
    // Filter out all bans in the array that have the same user
    expiringPunishments = expiringPunishments.filter(json => { return !(json.user == userId && json.punishmentType == ' ban'); });
    await logPunishment(userId, 'Punishment expired.', client.user, 'unbans');
    break;
    
  case 'mute':
    // Add when mute done
    return null; 
    
  }
  // Update the database with updated punishment list
  await dbClient.query('UPDATE expiringPunishments SET punishmentInfo=$1 WHERE id=0::text', [expiringPunishments])
    .then(res => console.log(res.rows[0]))
    .catch(e => console.error(e.stack));
}
