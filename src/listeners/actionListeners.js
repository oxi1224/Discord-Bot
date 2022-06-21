/* eslint-disable no-case-declarations */
import { logAction } from '../lib/util/util.js';
import { readFromDb } from '../lib/common/db.js';
import { mutedRole } from '../lib/config/config.js';

export default async function main(client) {
  console.log('Action listeners started');
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
        const content = [
          { name: 'Author', value: `${message.author}` },
          { name: 'Channel', value: `${message.channel}` },
        ];
        let fieldIndex = 1;
        // Split the content into multilpe fields if it's over 1024 characters
        for (let i = 0; i < message.content.length; i += 1024) {
          const cont = message.content.substring(i, Math.min(message.content.length, i + 1024));
          content.push({ name: `Content[${fieldIndex}]`, value: cont });
          fieldIndex++;
        }
        return await logAction('Message Deleted', content);
      case ('messageReactionRemoveAll'):
        return await logAction('Reactions Removed From Message', [
          { name: 'Message link', value: `[Jump](${message.url})` }
        ]);
      }
    });
  }

  // Listens for message edits
  client.on('messageUpdate', async (oldMessage, newMessage) => {
    const content = [
      { name: 'Author', value: `${newMessage.author}` },
      { name: 'Channel', value: `${newMessage.channel}` },
    ];
    let fieldIndex = 1;
    // Split the content into multilpe fields if it's over 1024 characters
    for (let i = 0; i < oldMessage.content.length; i += 1024) {
      const cont = oldMessage.content.substring(i, Math.min(oldMessage.content.length, i + 1024));
      content.push({ name: `Old Content[${fieldIndex}]`, value: cont });
      fieldIndex++;
    }
    fieldIndex = 1;
    for (let i = 0; i < newMessage.content.length; i += 1024) {
      const cont = newMessage.content.substring(i, Math.min(newMessage.content.length, i + 1024));
      content.push({ name: `New Content[${fieldIndex}]`, value: cont });
      fieldIndex++;
    }
    await logAction('Message Edited', content);
  });

  // Listens for role updates
  for (const type of ['roleCreate', 'roleDelete']) {
    client.on(type, async role => {
      switch (type) {
      case ('roleCreate'):
        return await logAction('Role Created', [{ name: 'Role', value: `${role}` }]);
      case ('roleDelete'):
        return await logAction('Role Deleted', [{ name: 'Role', value: `${role}` }]);
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
