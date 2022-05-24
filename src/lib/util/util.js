import { createUserRow, readFromDb, changeColumnValues, existsRow, client as dbClient } from '../common/db.js';

// generates modlog id
export function generateModLogID() {
  const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890'.slice('');
  const id = [];
  for (let i = 0; i < 25; i++) {
    id.push(chars[Math.floor(Math.random() * ((chars.length - 1) - 0 + 1) + 0)]);
  }
  return id.join('');
}

// get punishment expiration date
export function getExpirationDate(duration, startTime) {
  if (duration == null) return null;
  const numberInDuration = duration.match(/\d+/);
  const sliceIndex = (() => { return numberInDuration.length > 2 ? numberInDuration[0].length - 1 : numberInDuration[0].length; })();
  switch (duration.split('').slice(sliceIndex, duration.length).join('')) {
  case 'min':
    return (parseInt(numberInDuration[0]) * 60000) + startTime;
  case 'h':
    return (parseInt(numberInDuration[0]) * 3600000) + startTime;
  case 'd':
    return (parseInt(numberInDuration[0]) * 86400000) + startTime;
  case 'w':
    return (parseInt(numberInDuration[0]) * 604800000) + startTime;
  case 'm':
    return (parseInt(numberInDuration[0]) * 2678400000) + startTime;
  default:
    return null;
  }
}

export async function logPunishment(userId, reason, moderator, column, duration) {
  if (!(await existsRow(userId))) await createUserRow(userId);
  // get the previous bans
  const userPunishmentsList = (await readFromDb(userId, 'PunishmentLogs'))[0][column];
  // update the ban list
  userPunishmentsList.push({
    user: userId,
    moderator: moderator,
    reason: reason,
    punishmentTime: new Date().getTime(),
    punishmentExpires: getExpirationDate(duration, new Date().getTime()),
    punishmentId: generateModLogID()
  });
  // sort the updated ban list and update cell in db
  await changeColumnValues(userId, changeColumnValues[column] = { [column]: userPunishmentsList.sort((a, b) => parseFloat(a.punishmentTime) - parseFloat(b.punishmentTime)) });
  
  // write to expiringPunishments db if there is a duration
  if (duration !== null) {
    
    const expiringPunishments = await (await dbClient.query('SELECT punishmentInfo FROM expiringPunishments WHERE id=0::text')).rows[0].punishmentinfo;
    expiringPunishments.push({
      user: userId,
      punishmentType: column.split('').slice(0, -1).join(''),
      punishmentExpires: await getExpirationDate(duration, new Date().getTime()),
    });
    await dbClient.query('UPDATE expiringPunishments SET punishmentInfo=$1 WHERE id=0::text', [expiringPunishments.sort((a, b) => parseFloat(b.punishmentExpires) - parseFloat(a.punishmentExpires))])
      .then(res => console.log(res.rows[0]))
      .catch(e => console.error(e.stack));
  }
}

export async function dmUser(user, content) {
  await user.createDM();
  await user.send(content);
}