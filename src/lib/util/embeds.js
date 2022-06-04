import { MessageEmbed } from 'discord.js';
import * as config from '../config/config.js';

export async function createReplyEmbed(description, ...args) {
  // Get values from args
  const color = args.color || config.embedColors.base;
  const title = args.title || '';
  const emote = args.emote || '';

  const embed = new MessageEmbed()
    .setColor(color)
    .setTitle(title)
    .setDescription(emote + description);
  
  return { embeds: [embed] };
}

export const dmFail = (user) => createReplyEmbed(
  `Failed to dm ${user} action still performed.`,
  { color: config.embedColors.info, emote: config.infoEmote });

export const dm = (action, guild, reason) => createReplyEmbed(
  `Reason: \`\`${reason}\`\``,
  { title: `You've been ${action} in ${guild}.` });

export const dmDuration = (action, guild, reason, duration) => createReplyEmbed(
  `Reason: \`\`${reason}\`\``,
  { title: `You've been ${action} ${duration == null ? 'permanently' : `for ${duration}`} in ${guild}.` });

export const punishmentReply = (action, user) => createReplyEmbed(
  `${user} has been ${action}.`,
  { color: config.embedColors.success, emote: config.emotes.success });

export const notInServer = (user) => createReplyEmbed(
  `${user} is not in the server.`,
  { color: config.embedColors.error, emote: config.emotes.error });

export const punishmentFail = (text) => createReplyEmbed(
  text,
  { color: config.embedColors.error, emote: config.emotes.error });

export const otherResponses = (text, emote, color, title = '') => createReplyEmbed(
  text,
  { color: color, title: title, emote: emote });