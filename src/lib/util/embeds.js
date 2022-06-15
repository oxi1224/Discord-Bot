import { MessageEmbed } from 'discord.js';
import * as config from '../config/config.js';

export async function createReplyEmbed(args) {
  // Get values from args
  const color = !args || !args.color ? config.embedColors.base : args.color;
  const title = !args || !args.title ? null : args.title;
  const emote = !args || !args.emote ? '' : args.emote;
  const fields = !args || !args.fields ? null : args.fields;
  const description = !args || !args.description ? null : args.description;
  const footer = !args || !args.footer ? null : args.footer;
  
  const embed = new MessageEmbed()
    .setColor(color);

  if (title) embed.setTitle(title);
  if (fields) fields.forEach(obj => embed.addField(obj.name, obj.value));
  if (description) embed.setDescription(`${emote} ${description}`);
  if (footer) embed.setFooter({ text: footer });

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
  title: `You've been ${action} ${duration == null ? 'permanently' : `for ${duration}`} in ${guild}.`,
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