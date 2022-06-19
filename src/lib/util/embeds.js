import { MessageEmbed } from 'discord.js';
import * as config from '../config/config.js';

/**
 * Generates an embed based on given arguments.
 * 
 * @param {object} args - Arguments containing info about the embed.
 * @param {string} [args.color=config.embedColors.base] - Color of the embed.
 * @param {string} [args.title=null] - Title of the embed.
 * @param {string} [args.emote=''] - Emote that will appear before description.
 * @param {object[]} [args.fields=null] - Fields to be added to the embed.
 * @param {string} [args.description=null] - Description of the embed.
 * @param {string} [args.footer=null] - footer of the embed.
 * @param {string} [args.image=null] - URL of the image of the embed.
 * @param {boolean} [args.timestamp=false] - False - no timestamp True - timestamp.
 * @param {author} [args.author=null] - Author of the embed.
 * @param {string} [args.thumbnail=null] - URL of the thumbnail of the embed.
 * 
 * @returns {MessageEmbed} Discord.js embed.
 */
export async function createReplyEmbed(args) {
  // Get values from args
  const color = !args || !args.color ? config.embedColors.base : args.color;
  const title = !args || !args.title ? null : args.title;
  const emote = !args || !args.emote ? '' : args.emote;
  const fields = !args || !args.fields ? null : args.fields;
  const description = !args || !args.description ? null : args.description;
  const footer = !args || !args.footer ? null : args.footer;
  const image = !args || !args.image ? null : args.image;
  const timestamp = !args || !args.timestamp ? false : args.timestamp;
  const author = !args || !args.author ? null : args.author;
  const thumbnail = !args || !args.thumbnail ? null : args.thumbnail;
  
  const embed = new MessageEmbed()
    .setColor(color);

  if (title) embed.setTitle(title);
  if (fields) fields.forEach(obj => embed.addField(obj.name, obj.value, obj.inline ? obj.inline : false));
  if (description) embed.setDescription(`${emote} ${description}`);
  if (footer) embed.setFooter(footer);
  if (image) embed.setImage(image);
  if (timestamp) embed.setTimestamp();
  if (author) embed.setAuthor(author);
  if (thumbnail) embed.setThumbnail(thumbnail);

  return { embeds: [embed] };
}

export const dmFail = (user) => createReplyEmbed({
  color: config.embedColors.info,
  description: `Failed to dm ${user} action still performed.`,
  emote: config.infoEmote
});

export const dm = (action, guild, reason) => createReplyEmbed({
  title: `You've been ${action} in ${guild}.`,
  description: `Reason: \`\`${reason}\`\`.`,
});

export const dmDuration = (action, guild, reason, duration) => createReplyEmbed({
  title: `You've been ${action} ${!duration ? 'permanently' : `for ${duration}`} in ${guild}.`,
  description: `Reason: \`\`${reason}\`\`.`,
});

export const punishmentReply = (action, user) => createReplyEmbed({
  color: config.embedColors.success,
  description: `${user} has been ${action}.`,
  emote: config.emotes.success
});

export const notInServer = (user) => createReplyEmbed({
  color: config.embedColors.error,
  description: `${user} is not in the server.`,
  emote: config.emotes.error
});

export const commandFail = (text) => createReplyEmbed({
  description: text,
  color: config.embedColors.error,
  emote: config.emotes.error
});

export const commandSuccess = (text) => createReplyEmbed({
  description: text,
  color: config.embedColors.success,
  emote: config.emotes.success
});