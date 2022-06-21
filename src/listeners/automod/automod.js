import { default as badLinks } from './badLinks.js';
import { embed, dmUser, logToDb, logAction, mutedRole, automodConfig } from '#lib';

export default async function main(client) {
  console.log('Automod started');
  const usersMap = new Map();
  const { messageLimit, timeDifference, expiryTime, muteDuration } = automodConfig;

  client.on('messageCreate', async message => {
    if (message.author.bot) return;
    checkForScamLinks(message);
    antiSpam(message);
  });

  async function checkForScamLinks(message) {
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

    await member.roles.add(mutedRole);
    message.delete();
  }

  async function antiSpam(message) {
    const userId = message.author.id;

    if (!usersMap.has(userId)) {
      usersMap.set(userId, {
        messageCount: 1,
        lastMessage : message,
        timer : setTimeout(() => {
          usersMap.delete(userId);
        }, expiryTime)
      });
      return;
    }

    const userData = usersMap.get(userId);
    const { lastMessage, timer } = userData;
    const difference = message.createdTimestamp - lastMessage.createdTimestamp;
    let messageCount = userData.messageCount;

    if (difference > timeDifference) {
      clearTimeout(timer);
      userData.messageCount = 1;
      userData.lastMessage = message;
      userData.timer = setTimeout(() => {
        usersMap.delete(userId);
      }, expiryTime);
      usersMap.set(userId, userData);
    } else {
      ++messageCount;
      parseInt(messageCount) === messageLimit ? await punishSpam(message) : (() => {
        userData.messageCount = messageCount;
        usersMap.set(userId, userData);
      })();
    }
  }

  async function punishSpam(message) {
    usersMap.delete(message.author.id);
    let i = 0;
    const user = message.author;
    const userId = user.id;
    const guild = message.guild;
    const reason = 'Spamming is prohibited.';
    const channel = message.channel;
    const messages = (await channel.messages
      .fetch({ limit: 100 }))
      .filter(msg => {
        if (i >= messageLimit) return;
        i++;
        if (msg.author.id === userId) return msg;
      });
    const member = await guild.members.fetch(user);
    if (!member.kickable) return;
    
    await dmUser(user, embed.dmDuration('muted', guild, reason, muteDuration)).catch(null);

    logToDb(userId, reason, 'Automod', 'mutes', muteDuration);
    logAction('Member Muted', [
      { name: 'User', value: `${user}` },
      { name: 'Reason', value: `\`\`${reason}\`\`` },
      { name: 'Duration', value: muteDuration }
    ], { mod: '**Automod**' });

    await member.roles.add(mutedRole);
    message.channel.bulkDelete(messages);
    message.channel.send('Please do not spam.');
  }  
}