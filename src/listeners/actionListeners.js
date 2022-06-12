import { logAction } from '../lib/util/util.js';
import { readFromDb } from '../lib/common/db.js';
import { mutedRole } from '../lib/config/config.js';

export default async function main(client) {

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
        if (message.embeds.length > 0) return;
        return await logAction('Message Deleted', [
          { name: 'Author', value: `${message.author}` },
          { name: 'Channel', value: `${message.channel}` },
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
        { name: 'User', value: `${newUser.user}` },
        { name: 'Old nickname', value: `${oldUser.nickname}` },
        { name: 'New nickname', value: `${newUser.nickname}` }
      ]);
    } else {
      oldUser.roles.cache.forEach(role => {
        if (newUser.roles.cache.has(role.id)) return;
        logAction('Role Removed', [
          { name: 'User', value: `${newUser.user}` },
          { name: 'Role', value: `${role}` }
        ]);
      });
      newUser.roles.cache.forEach(role => {
        if (oldUser.roles.cache.has(role.id)) return;
        logAction('Role Added', [
          { name: 'User', value: `${newUser.user}` },
          { name: 'Role', value: `${role}` }
        ]);
      });
    }
  });
  
  // Listens for new members
  client.on('guildMemberAdd', async (member) => {
    const mutes = await readFromDb(member.user.id);
    if (mutes === null) return;
    if (mutes.at(-1).punishmentExpires <= new Date().getTime() || mutes.at(-1).punishmentExpires === null) member.roles.add(mutedRole);
  });
}
