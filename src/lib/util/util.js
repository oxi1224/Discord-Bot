import * as db from '../common/db.js';
import { MessageEmbed } from 'discord.js';
import { config } from '#lib';

// Generates modlog id
export function generateModLogID() {
  const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890'.slice('');
  const id = [];
  for (let i = 0; i < 25; i++) {
    id.push(chars[Math.floor(Math.random() * ((chars.length - 1) - 0 + 1) + 0)]);
  }
  return id.join('');
}

/**
 * Get the expiration date of a punishment.
 * @param {string} duration - x amount of minutes (min), hours (h), days (d), weeks (w) or months (m).
 * @param {Timestamp} currentTime - The current time when executing this function.
 * @returns Timestamp duration from now.
 */
export function getExpirationDate(duration, currentTime) {
  if (!duration) return null;
  const numberInDuration = duration.match(/\d+/)[0];

  switch (duration.split('').slice(numberInDuration.length, duration.length).join('')) {
  case 'min':
    return (parseInt(numberInDuration) * 60000) + currentTime;
  case 'h':
    return (parseInt(numberInDuration) * 3600000) + currentTime;
  case 'd':
    return (parseInt(numberInDuration) * 86400000) + currentTime;
  case 'w':
    return (parseInt(numberInDuration) * 604800000) + currentTime;
  case 'm':
    return (parseInt(numberInDuration) * 2678400000) + currentTime;
  default:
    return null;
  }
}

/**
 * Logs a punishment to the punishmentLogs database and crates user's row if they don't have one.
 * @param {string} userId - ID of the user who the punishment was executed on.
 * @param {string} reason - The reason of the punishment.
 * @param {User} moderator - The moderator who executed the punishment. 
 * @param {string} column - The column to which the punishment will be logged.
 * @param {string} [duration] - The duration of the punishment.
 * @param {object} [additionalInfo] - Additional info regarding the punishment (e.g the channel when using block command).
 */
export async function logToDb(userId, reason, moderator, column, duration, additionalInfo) {
  if (!(await db.existsRow(userId))) await db.createUserRow(userId);
  // Gets the previous punishments.
  const userPunishmentsList = !(await db.readFromDb(userId)) ? [] : (await db.readFromDb(userId))[column];
  const punishmentType = column.split('').slice(0, -1).join('');

  // Updates the punishment list.
  userPunishmentsList.push({
    user: userId,
    moderator: moderator,
    reason: reason,
    punishmentType: punishmentType,
    punishmentTime: new Date().getTime(),
    punishmentExpires: getExpirationDate(duration, new Date().getTime()),
    punishmentId: generateModLogID(),
  });
  if (column === 'blocks' || column === 'unblocks') userPunishmentsList.at(-1).additionalInfo = additionalInfo;

  // Replaced old data with new information in specificed columnm of user's row.
  await db.changeColumnValues(userId, column, userPunishmentsList);
  
  if (!['bans', 'mutes', 'unbans', 'unmutes', 'blocks', 'unblocks'].includes(column)) return;
  // Writes to expiringPunishments table if there is a duration.
  let expiringPunishments = await db.fetchExpiringPunishments();

  if (['bans', 'mutes', 'blocks'].includes(column) && duration) {
    expiringPunishments.push({
      user: userId,
      punishmentType: punishmentType,
      punishmentExpires: await getExpirationDate(duration, new Date().getTime()),
    });
  }
  
  if (['unbans', 'unmutes', 'unblocks'].includes(column)) expiringPunishments = expiringPunishments.filter(json => json.user === userId && json.punishmentType === punishmentType);
  if (column === 'blocks' || column === 'unblocks') expiringPunishments.at(-1).additionalInfo = additionalInfo;

  await db.updateExpiringPunishments(expiringPunishments.sort((a, b) => parseInt(b.punishmentExpires) - parseInt(a.punishmentExpires)));
}

/**
 * Sends a DM to specified user
 * @param {UserResolvable} user - The user who will get DM'ed.
 * @param {(string|MessagePayload|MessageOptions)} content - Any valid Discord.js message content.
 */
export async function dmUser(user, content) {
  await user.createDM();
  await user.send(content);
}

/**
 * Generates a log and sends it to the logging channel by default.
 * @param {string} title - The title of the embed.
 * @param {object[]} fieldsToAdd - The fields that will be added to the embed.
 * @param {object} [args] - Optional arguments to add to the embed.
 * @param {string} [args.channelId=config.channels.logging]
 * @param {object} [args.mod=null]
 */
export async function logAction(title, fieldsToAdd, args) {
  const { client } = await import('../../bot.js');
  
  // Get values from args
  const mod = !args || !args.mod ? null : args.mod;
  const channelId = !args || !args.channelId ? config.channels.logging : args.channelId;
  
  const fields = fieldsToAdd;
  const embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(title)
    .setTimestamp();

  if (mod) {
    fields.unshift({ name: 'Moderator', value: `${mod}` });
    if (mod === 'Automod') return;
    embed.setAuthor(mod.avatar ? 
      { name: `${mod.username}#${mod.discriminator}`, 
        iconURL: `https://cdn.discordapp.com/avatars/${mod.id}/${mod.avatar}.webp` } :
      { name: `${mod.username}#${mod.discriminator}` });
  }

  // Add fields from fieldsToAdd to the embed
  fields.forEach(obj => embed.addField(obj.name, obj.value));
  await client.channels.cache.get(channelId).send({ embeds: [embed] });
}