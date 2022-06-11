import { MessageEmbed } from 'discord.js';
import * as config from '../config/config.js';

export async function createReplyEmbed(description, args) {
  // Get values from args
  const color = args === undefined || args.color === undefined ? config.embedColors.base : args.color;
  const title = args === undefined || args.title === undefined ? null : args.title;
  const emote = args === undefined || args.emote === undefined ? '' : args.emote;

  const embed = new MessageEmbed()
    .setColor(color)
    .setDescription(`${emote} ${description}`);

  title === null ? null : embed.setTitle(title); 
  return { embeds: [embed] };
}

export const dmFail = (user) => createReplyEmbed(
  `Failed to dm ${user} action still performed.`,
  { color: config.embedColors.info, emote: config.infoEmote });

export const dm = (action, guild, reason) => createReplyEmbed(
  `Reason: \`\`${reason}\`\`.`,
  { title: `You've been ${action} in ${guild}.` });

export const dmDuration = (action, guild, reason, duration) => createReplyEmbed(
  `Reason: \`\`${reason}\`\`.`,
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