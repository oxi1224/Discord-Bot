import { MessageEmbed } from 'discord.js';

export async function createReplyEmbed(description, { color = '#0099ff', title = '' }) {
  const embed = new MessageEmbed()
    .setColor(color)
    .setTitle(title)
    .setDescription(description);
  
  return { embeds: [embed] };
}

export const dmFail = (user) => createReplyEmbed(
  `<:info:980866381283201025> Failed to dm ${user} action still performed.`
  , { color: '#cb8715' });

export const dm = (action, guild, reason) => createReplyEmbed(`Reason: \`\`${reason}\`\``, 
  { color: '#0099ff', title: `You've been ${action} in ${guild}.` });

export const dmDuration = (action, guild, reason, duration) => createReplyEmbed(`Reason: \`\`${reason}\`\``, 
  { color: '#0099ff', title: `You've been ${action} ${duration == null ? 'permanently' : `for ${duration}`} in ${guild}.` });

export const punishmentReply = (action, user) => createReplyEmbed(
  `<:success:980866382323396723> ${user} has been ${action}.`
  , { color: '#3fa45d' });

export const notInServer = (user) => createReplyEmbed(
  `<:error:980866363461599292> ${user} is not in the server.`
  , { color: '#ef4047' });

export const punishmentFail = (text) => createReplyEmbed(
  `<:error:980866363461599292> ${text}`, { color: '#ef4047' });