import { emotes, prefix } from './config/config.js';
import { updateSlashCommands } from './updateSlashCommands.js';

const commands = [];
export async function appendToCommandArray({
  aliases = [],
  requiredPerms = 'SEND_MESSAGES',
  slash = true,
  prefixed = true,
  slashData,
  callback,
  finalize = false
}) {
  if (!finalize) {
    commands.push({
      aliases,
      requiredPerms,
      prefixed,
      slashData,
      callback
    });
    slash === true ? await updateSlashCommands(slashData, aliases[0]) : null;
  }
  return commands;
  // if (prefixed) {
  //   client.on('messageCreate', async message => {
  //     if (!message.content.startsWith(prefix) || message.author.bot) return;
  //     const args = message.content.slice(1).trim().split(' ').filter(str => str !== '');
  //     const command = args.shift().toLowerCase();
  
  //     if (!aliases.includes(command)) return;
  //     if (!message.member.permissions.has(requiredPerms)) return message.react(emotes.error);
  //     
  //     callbackParams.action = message;
  //     callbackParams.userId = await (async () => {
  //       try {
  //         const userId = message.mentions.users.first() === undefined ? args[0].replace(/[\\<>@#&!]/g, '') : message.mentions.users.first().id;
  //         if (!userId.match(/^[0-9]{15,18}/)) return null;
  //         return userId;
  //       } catch { return null; }
  //     })();
  //     callbackParams.duration = (args[1] !== args.at(-1) && /^\d+(min|h|d|w|m)/.test(args[1]) || /^\d+(min|h|d|w|m)/.test(args[1])) ? args[1] : null;
  //     callbackParams.reason = args.slice(callbackParams.duration == null ? 1 : 1 + args.indexOf(callbackParams.duration)).join(' ') || null;
  //     callbackParams.moderator = message.author;
  //     callbackParams.guild = message.guild;
  //     callbackParams.messageCount = callbackParams.userId == null ? args[0] : args[1];

  //     await callback(callbackParams);
  //   });
  // }

  // if (slash) {
  //   updateSlashCommands(slashData, aliases[0]);
  // 
  //   client.on('interactionCreate', async interaction => {
  //     if (!interaction.isCommand()) return;
  //     if (!aliases.includes(interaction.commandName)) return;
  //     if (!interaction.member.permissions.has(requiredPerms)) return interaction.reply({ content: 'Insufficient Permissions', ephemeral: true });
  //     // console.log(interaction.options._hoistedOptions);
  //     
  //     callbackParams.action = interaction;
  //     callbackParams.userId = interaction.options.get('user') == null ? null : interaction.options.get('user').value;
  //     callbackParams.duration = interaction.options.get('duration') == null ? null : interaction.options.get('duration').value;
  //     callbackParams.reason = interaction.options.get('reason') == null ? null : interaction.options.get('reason').value;
  //     callbackParams.moderator = interaction.member.user;
  //     callbackParams.guild = interaction.guild;
  //     callbackParams.messageCount = interaction.options.get('message_count') == null ? null : interaction.options.get('message_count').value; 
  //     await callback(callbackParams);
  //   });
  //  }
  // }
}

export async function initializeCommands(client, commandArray) {
  const callbackParams = {};
  commandArray = await commandArray;

  client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(1).trim().split(' ').filter(str => str !== '');
    const command = args.shift().toLowerCase();

    // if (!aliases.includes(command)) return;
    // if (!message.member.permissions.has(requiredPerms)) return message.react(emotes.error);
    
    callbackParams.action = message;
    callbackParams.userId = await (async () => {
      try {
        const userId = message.mentions.users.first() === undefined ? args[0].replace(/[\\<>@#&!]/g, '') : message.mentions.users.first().id;
        if (!userId.match(/^[0-9]{15,18}/)) return null;
        return userId;
      } catch { return null; }
    })();
    callbackParams.duration = (args[1] !== args.at(-1) && /^\d+(min|h|d|w|m)/.test(args[1]) || /^\d+(min|h|d|w|m)/.test(args[1])) ? args[1] : null;
    callbackParams.reason = args.slice(callbackParams.duration == null ? 1 : 1 + args.indexOf(callbackParams.duration)).join(' ') || null;
    callbackParams.moderator = message.author;
    callbackParams.guild = message.guild;
    callbackParams.messageCount = callbackParams.userId == null ? args[0] : args[1];

    commandArray.forEach(async cmd => {
      if (!cmd.prefixed) return;
      if (!cmd.aliases.includes(command)) return;
      if (!message.member.permissions.has(cmd.requiredPerms)) return message.react(emotes.error);
      await cmd.callback(callbackParams);
    });
  });

  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    // if (!aliases.includes(interaction.commandName)) return;
    // if (!interaction.member.permissions.has(requiredPerms)) return interaction.reply({ content: 'Insufficient Permissions', ephemeral: true });
    // console.log(interaction.options._hoistedOptions);
    callbackParams.action = interaction;
    callbackParams.userId = interaction.options.get('user') == null ? null : interaction.options.get('user').value;
    callbackParams.duration = interaction.options.get('duration') == null ? null : interaction.options.get('duration').value;
    callbackParams.reason = interaction.options.get('reason') == null ? null : interaction.options.get('reason').value;
    callbackParams.moderator = interaction.member.user;
    callbackParams.guild = interaction.guild;
    callbackParams.messageCount = interaction.options.get('message_count') == null ? null : interaction.options.get('message_count').value; 
    
    commandArray.forEach(async cmd => {
      if (!cmd.prefixed) return;
      if (!cmd.aliases.includes(interaction.commandName)) return;
      if (!interaction.member.permissions.has(cmd.requiredPerms)) return interaction.reply({ content: 'Insufficient Permissions', ephemeral: true });
      await cmd.callback(callbackParams);
    });
  });
}