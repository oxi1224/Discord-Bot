import * as db from '../common/db.js';
import { MessageEmbed } from 'discord.js';
import { loggingChannel } from '../config/config.js';

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
  if (!(await db.existsRow(userId))) await db.createUserRow(userId);
  // get the previous punishments
  const userPunishmentsList = await db.readFromDb(userId) == undefined ? [] : (await db.readFromDb(userId))[0][column];
  const punishmentType = column.split('').slice(0, -1).join('');
  // update the punishment list
  userPunishmentsList.push({
    user: userId,
    moderator: moderator,
    reason: reason,
    punishmentType: punishmentType,
    punishmentTime: new Date().getTime(),
    punishmentExpires: getExpirationDate(duration, new Date().getTime()),
    punishmentId: generateModLogID()
  });
  // sort the updated ounishment list and update cell in db
  await db.changeColumnValues(userId, column, userPunishmentsList);
  
  if (!(['bans', 'mutes', 'unbans', 'unmutes'].includes(column))) return;
  // write to expiringPunishments db if there is a duration
  let expiringPunishments = await db.fetchExpiringPunishments() || [];
  if (column === 'unbans' || column === 'unmutes') {
    expiringPunishments = expiringPunishments.filter(json => { return !(json.user == userId && json.punishmentType == punishmentType); });
  }
  if (!(duration === null || duration === undefined)) {
    expiringPunishments.push({
      user: userId,
      punishmentType: punishmentType,
      punishmentExpires: await getExpirationDate(duration, new Date().getTime()),
    });
  }
  await db.updateExpiringPunishments(expiringPunishments.sort((a, b) => parseFloat(b.punishmentExpires) - parseFloat(a.punishmentExpires)));
}

// Dm's a user
export async function dmUser(user, content) {
  await user.createDM();
  await user.send(content);
}

// Logs the action to the logging channel
export async function logAction(title, fieldsToAdd, ...args) {
  const { client } = await import('../../bot.js');
  
  // Get values from args
  const userId = args.userId || null;
  const channelId = args.channelId || loggingChannel;

  const fields = fieldsToAdd;
  const embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(title)
    .setTimestamp();

  if (userId !== null) {
    const user = await client.users.fetch(userId, false);
    fields.unshift({ name: 'User', value: `${user}` });
    embed.setAuthor({ name: `${user.username}#${user.discriminator}`, iconURL: `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.webp` });
  }
  // Add fields from fieldsToAdd to the embed
  fields.forEach(obj => embed.addField(obj.name, obj.value));
  await client.channels.cache.get(channelId).send({ embeds: [embed] });
}