import { MessageEmbed } from 'discord.js';

export async function main() {
  const { client } = await import('../../bot.js');

  for (const type of ['channelCreate', 'channelDelete', 'channelPinsUpdate', 'channelUpdate']) {
    client.on(type, async channel => {
      switch (type) {
      case ('channelCreate'):
        return await logAction('Channel created', `${channel}`);
      case ('channelDelete'):
        return await logAction('Channel Deleted', `${channel}`);
      case ('channelPinsUpdate'):
        return await logAction('Pins Updated', `${channel}`);
      case ('channelUpdate'):
        await logAction('Channel Updated', `${channel}`);
      }
    });
  }

  for (const type of ['messageDelete', 'messageReactionRemoveAll']) {
    client.on(type, async message => {
      switch (type) {
      case ('messageDelete'):
        return await logAction('Message Deleted', `
        Message deleted in ${message.channel}
        Author: ${message.author}
        Content: ${message.content}
        `);
      case ('messageReactionRemoveAll'):
        return await logAction('Reactions Removed From Message', `
        Content: ${message.content}
        [Message Link](${message.url})
        `);
      }
    });
  }
  client.on('messageUpdate', async (oldMessage, newMessage) => {
    await logAction('Message Edited', `
    Old message: ${oldMessage.content}
    New message: ${newMessage.content}
    [Message Link](${newMessage.url})
    `);
  });

  for (const type of ['roleCreate', 'roleDelete', 'roleUpdate']) {
    client.on(type, async role => {
      switch (type) {
      case ('roleCreate'):
        return await logAction('Role Created', `${role}`);
      case ('roleDelete'):
        return await logAction('Role Deleted', `${role}`);
      case ('roleUpdate'):
        return await logAction('Role Updated', `${role}`);
      }
    });
  }
  client.on('guildMemberUpdate', async (oldUser, newUser) => {
    if (oldUser.nickname !== newUser.nickname) {
      logAction('Nickname Changed', `
      Old: ${oldUser.nickname}
      New: ${newUser.nickname}
      User: ${newUser.user}
      `);
    } else {
      oldUser.roles.cache.forEach(role => {
        if (newUser.roles.cache.has(role.id)) return;
        logAction('Role Removed', `
        User: ${newUser.user}
        Role: ${role}
        `);
      });
      newUser.roles.cache.forEach(role => {
        if (oldUser.roles.cache.has(role.id)) return;
        logAction('Role Added', `
        User: ${newUser.user}
        Role: ${role}
        `);
      });
    }
  });
}


export async function logAction(title, description) {
  const { client } = await import('../../bot.js');
  const exampleEmbed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
    
  await client.channels.cache.get('977566053062303764').send({ embeds: [exampleEmbed] });
}
