import { logAction } from '../lib/util/util.js';

export async function main() {
  const { client } = await import('../bot.js');

  // Listens for channel related changes
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

  // Listens for deleted messages and reactions
  for (const type of ['messageDelete', 'messageReactionRemoveAll']) {
    client.on(type, async message => {
      switch (type) {
      case ('messageDelete'):
        if (message.embeds) return;
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

  // Listens for message edits
  client.on('messageUpdate', async (oldMessage, newMessage) => {
    await logAction('Message Edited', [
      { name: 'Old message', value: `${oldMessage.content}` },
      { name: 'New message', value: `${newMessage.content}` },
      { name: 'Message link', value: `[Jump](${newMessage.url})` }
    ]);
  });

  // Listens for role updates
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

  // Listens for added/deleted roles from a user
  client.on('guildMemberUpdate', async (oldUser, newUser) => {
    if (oldUser.nickname !== newUser.nickname) {
      logAction('Nickname Changed', [
        { name: 'Old nickname', value: `${oldUser.content}` },
        { name: 'New nickname', value: `${newUser.content}` }
      ], { userId: newUser.user.id });
    } else {
      oldUser.roles.cache.forEach(role => {
        if (newUser.roles.cache.has(role.id)) return;
        logAction('Role Removed', [{ name: 'Role', value: `${role}` }], { userId: newUser.user.id });
      });
      newUser.roles.cache.forEach(role => {
        if (oldUser.roles.cache.has(role.id)) return;
        logAction('Role Added', [{ name: 'Role', value: `${role}` }], { userId: newUser.user.id });
      });
    }
  });
}
