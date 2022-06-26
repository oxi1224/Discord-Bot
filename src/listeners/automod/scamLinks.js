import { default as badLinks } from './badLinks.js';
import { embed, dmUser, logToDb, logAction, config } from '#lib';

export default async function scamLink(message) {
  // eslint-disable-next-line no-useless-escape
  const URLRegex = /((?:(?:http?|ftp)[s]*:\/\/)?[a-z0-9-%\/\&=?\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?)/gi;

  if (!message.content.match(URLRegex)) return;
  if (!badLinks.some(v => message.content.includes(v))) return;

  const user = message.author;
  const userId = user.id;
  const guild = message.guild;
  const reason = 'Sending a scam link.';
  const member = await guild.members.fetch(user);

  await dmUser(user, embed.dmDuration('muted', guild, reason, null)).catch(null);

  logToDb(userId, reason, 'Automod', 'mutes');
  logAction('Member Muted', [
    { name: 'User', value: `${user}` },
    { name: 'Reason', value: `\`\`${reason}\`\`` },
    { name: 'Duration', value: 'Permanent' }
  ], { mod: '**Automod**' });

  await member.roles.add(config.roles.muted);
  message.delete();
}