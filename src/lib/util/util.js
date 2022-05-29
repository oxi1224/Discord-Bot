import { createUserRow, readFromDb, changeColumnValues, existsRow, client as dbClient } from '../common/db.js';
import { MessageEmbed } from 'discord.js';
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

// Log punishment to punishmentLogs database and to expiringPunishments if it expires
export async function logPunishment(userId, reason, moderator, column, duration) {
  if (!(await existsRow(userId))) await createUserRow(userId);
  // get the previous punishments
  const userPunishmentsList = (await readFromDb(userId, 'PunishmentLogs'))[0][column];
  // update the punishment list
  userPunishmentsList.push({
    user: userId,
    moderator: moderator,
    reason: reason,
    punishmentType: column.split('').slice(0, -1).join(''),
    punishmentTime: new Date().getTime(),
    punishmentExpires: getExpirationDate(duration, new Date().getTime()),
    punishmentId: generateModLogID()
  });
  // sort the updated ounishment list and update cell in db
  await changeColumnValues(userId, column, userPunishmentsList);
  
  // write to expiringPunishments db if there is a duration
  if (!(duration === null || duration === undefined)) {
    const expiringPunishments = (await (await dbClient.query('SELECT punishmentInfo FROM expiringPunishments WHERE id=0::text')).rows[0].punishmentinfo) || [];
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

// Dm's a user
export async function dmUser(user, content) {
  await user.createDM();
  await user.send(content);
}

// Logs the action to the logging channel
export async function logAction(title, fieldsToAdd, { userId = undefined, channelId = '977566053062303764' }) {
  const { client } = await import('../../bot.js');
  const fields = fieldsToAdd;
  const embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(title)
    .setTimestamp();
    
  if (!(userId === undefined)) {
    const user = await client.users.fetch(userId, false);
    fields.unshift({ name: 'User', value: `${user}` });
    embed.setAuthor({ name: `${user.username}#${user.discriminator}`, iconURL: `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.webp` });
  }
  // Add fields from fieldsToAdd to the embed
  fields.forEach(obj => embed.addField(obj.name, obj.value));
  await client.channels.cache.get(channelId).send({ embeds: [embed] });
}