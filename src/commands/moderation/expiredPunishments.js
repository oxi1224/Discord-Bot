import { logPunishment, dmUser } from '../../lib/util/util.js';
import { logAction } from './actionLogger.js';
import { client as dbClient } from '../../lib/common/db.js';

export async function main() {
  const { client } = await import('../../bot.js');
  const expiringPunishments = await (await dbClient.query('SELECT punishmentInfo FROM expiringPunishments WHERE id=0::text')).rows[0].punishmentinfo;


  // await dbClient.query('UPDATE expiringPunishments SET punishmentInfo=$1 WHERE id=0::text', [expiringPunishments])
  //   .then(res => console.log(res.rows[0]))
  //   .catch(e => console.error(e.stack));
}