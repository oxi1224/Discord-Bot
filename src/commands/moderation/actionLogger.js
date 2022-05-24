import { MessageEmbed } from 'discord.js';

export async function main() {
  const { client } = await import('../../bot.js');

  for (const type of ['channelCreate', 'channelDelete', 'channelPinsUpdate', 'channelUpdate']) {
    client.on(type, async channel => {
      switch (type) {
      case ('channelCreate'):
        return await logAction('Channel created', [{ name: 'Channel', value: `${channel}` }]);
      case ('channelDelete'):
        return await logAction('Channel Deleted', [{ name: 'Channel', value: `${channel}` }]);
      case ('channelPinsUpdate'):
        return await logAction('Pins Updated', [{ name: 'Channel', value: `${channel}` }]);
      case ('channelUpdate'):
        await logAction('Channel Updated', [{ name: 'Channel', value: `${channel}` }]);
      }
    });
  }

  for (const type of ['messageDelete', 'messageReactionRemoveAll']) {
    client.on(type, async message => {
      switch (type) {
      case ('messageDelete'):
        return await logAction('Message Deleted', [
          { name: 'Channel', value: `${message.channel}` },
          { name: 'Author', value: `${message.author}` },
          { name: 'Content', value: `${message.content}` }
        ]);
      case ('messageReactionRemoveAll'):
        return await logAction('Reactions Removed From Message', [
          { name: 'Content', value: `${message.content}` },
          { name: 'Message link', value: `[Jump](${message.url})` }
        ]);
      }
    });
  }
  client.on('messageUpdate', async (oldMessage, newMessage) => {
    await logAction('Message Edited', [
      { name: 'Old message', value: `${oldMessage.content}` },
      { name: 'New message', value: `${newMessage.content}` },
      { name: 'Message link', value: `[Jump](${newMessage.url})` }
    ]);
  });

  for (const type of ['roleCreate', 'roleDelete', 'roleUpdate']) {
    client.on(type, async role => {
      switch (type) {
      case ('roleCreate'):
        return await logAction('Role Created', [{ name: 'Role', value: `${role}` }]);
      case ('roleDelete'):
        return await logAction('Role Deleted', [{ name: 'Role', value: `${role}` }]);
      case ('roleUpdate'):
        return await logAction('Role Updated', [{ name: 'Role', value: `${role}` }]);
      }
    });
  }
  client.on('guildMemberUpdate', async (oldUser, newUser) => {
    if (oldUser.nickname !== newUser.nickname) {
      logAction('Nickname Changed', [
        { name: 'Old nickname', value: `${oldUser.content}` },
        { name: 'New nickname', value: `${newUser.content}` }
      ], newUser.user.id);
    } else {
      oldUser.roles.cache.forEach(role => {
        if (newUser.roles.cache.has(role.id)) return;
        logAction('Role Removed', [{ name: 'Role', value: `${role}` }], newUser.user.id);
      });
      newUser.roles.cache.forEach(role => {
        if (oldUser.roles.cache.has(role.id)) return;
        logAction('Role Removed', [{ name: 'Role', value: `${role}` }], newUser.user.id);
      });
    }
  });
}


export async function logAction(title, fieldsToAdd, userId) {
  const { client } = await import('../../bot.js');
  const fields = fieldsToAdd;
  const embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(title)
    .setTimestamp();
    
  if (!(userId === undefined)) {
    const user = await client.users.fetch(userId, false);
    fields.unshift({ name: 'User', value: `${user}` });
    embed.setAuthor({ name: `${user.username}#${user.discriminator}`, iconURL: `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.webp` });
  }
  fields.forEach(obj => embed.addField(obj.name, obj.value));
  await client.channels.cache.get('977566053062303764').send({ embeds: [embed] });
}
