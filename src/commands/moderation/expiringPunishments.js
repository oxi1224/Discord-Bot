import { dmUser, logPunishment } from '../../lib/util/util.js';
import { logAction } from './actionLogger.js';
import { client as dbClient } from '../../lib/common/db.js';

export async function main() {
  const { client } = await import('../../bot.js');
  let expiringPunishments = await (await dbClient.query('SELECT punishmentInfo FROM expiringPunishments WHERE id=0::text')).rows[0].punishmentinfo;
  if (expiringPunishments.length === 0 || !(expiringPunishments.at(-1).punishmentExpires <= new Date().getTime())) return;
  const guild = await client.guilds.fetch('613024666079985702');
  const userId = expiringPunishments.at(-1).user;
  const user = await client.users.fetch(userId, false);

  switch (expiringPunishments.at(-1).punishmentType) {
  case 'ban':
    await guild.bans.remove(userId);
    await logAction('Member Unbanned', [{ name: 'Reason', value: 'Punishment Expired' }], userId);
    try { await dmUser(user, `You've been unbanned in **${guild}** \n Reason: \`\`Punishment Expired\`\` `); } 
    catch {null;}
    expiringPunishments = expiringPunishments.filter(json => { return !(json.user == userId && json.punishmentType == 'ban'); });
    await logPunishment(userId, 'Punishment expired.', client.user, 'unbans');
    break;
    
  case 'mute':
    // Add when mute done
    return null; 
    
  }
  await dbClient.query('UPDATE expiringPunishments SET punishmentInfo=$1 WHERE id=0::text', [expiringPunishments])
    .then(res => console.log(res.rows[0]))
    .catch(e => console.error(e.stack));
}
