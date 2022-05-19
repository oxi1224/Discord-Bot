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
  }
}

export async function performBan(action, userId, reason, moderator, duration, guild) {
  const banList = await guild.bans.fetch();
  const userBansList = await readFromDb(userId, 'PunishmentLogs');
  // check if user is already banned
  if (!(banList.find(x => x.user.id === userId) === undefined)) return action.reply(`<@${userId}> is already banned`);
  // ban the user
  guild.members.ban(userId, { reason: reason })
    .then(action.reply(`<@${userId}> has been banned`))
    // .then(async () => {try {client.users.get(userId).send(`You've been banned in `);} catch {}})
    .then(async () => {
      // create user's row if doesn't exist
      if (!(await existsRow(userId))) await createUserRow(userId);
      // get the previous bans
      const bansList = await userBansList[0].bans;
      // update the ban list
      bansList.push({
        user: userId,
        moderator: moderator,
        reason: reason,
        punishmentTime: new Date().getTime(),
        punishmentExpires: getExpirationDate(duration, new Date().getTime()),
        punishmentId: generateModLogID()
      });
      // sort the updated ban list and update cell in db
      await changeColumnValues(userId, { bans: bansList.sort((a, b) => parseFloat(a.punishmentTime) - parseFloat(b.punishmentTime)) });
      
      // write to expiringPunishments db if there is a duration
      if (duration !== null) {
        const expiringPunishmentsList = await dbClient.query('SELECT * FROM expiringPunishments');
        const expiringPunishments = expiringPunishmentsList.rows[0].punishmentinfo;
        expiringPunishments.push({
          user: userId,
          punishmentType: 'ban',
          punishmentExpires: await getExpirationDate(duration, new Date().getTime()),
        });
        await dbClient.query('UPDATE expiringPunishments SET punishmentInfo=$1 WHERE id=1::text', [expiringPunishments.sort((a, b) => parseFloat(a.punishmentExpires) - parseFloat(b.punishmentExpires))])
          .then(res => console.log(res.rows[0]))
          .catch(e => console.error(e.stack));
      }
    });
}