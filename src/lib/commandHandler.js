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
  finalize = false,
  helpInfo = {}
}) {
  if (!finalize) {
    commands.push({
      aliases,
      requiredPerms,
      prefixed,
      slashData,
      callback,
      helpInfo
    });
    slash ? await updateSlashCommands(slashData, aliases[0]) : null;
  }
  return commands;
}

export async function initializeCommands(client, commandArray) {
  const callbackParams = {};
  commandArray = await commandArray;

  client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(1).trim().split(' ').filter(str => str !== '');
    const command = args.shift().toLowerCase();

    callbackParams.action = message;
    callbackParams.userId = await (async () => {
      try {
        const userId = !(message.mentions.users.first()) ? args[0].replace(/[\\<>@#&!]/g, '') : message.mentions.users.first().id;
        if (!userId.match(/^[0-9]{15,18}/)) return null;
        return userId;
      } catch { return null; }
    })();
    callbackParams.duration = (args[1] !== args.at(-1) && /^\d+(min|h|d|w|m)/.test(args[1]) || /^\d+(min|h|d|w|m)/.test(args[1])) ? args[1] : null;
    callbackParams.reason = args.slice(!callbackParams.duration ? 1 : 1 + args.indexOf(callbackParams.duration)).join(' ') || null;
    callbackParams.moderator = message.author;
    callbackParams.guild = message.guild;
    callbackParams.messageCount = !callbackParams.userId ? args[0] : args[1];
    callbackParams.command = args.length === 0 ? null : args[0];

    commandArray.forEach(async cmd => {
      if (!cmd.prefixed) return;
      if (!cmd.aliases.includes(command)) return;
      if (!message.member.permissions.has(cmd.requiredPerms)) return message.react(emotes.error);
      await cmd.callback(callbackParams);
    });
  });

  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    callbackParams.action = interaction;
    callbackParams.userId = !interaction.options.get('user') ? null : interaction.options.get('user').value;
    callbackParams.duration = !interaction.options.get('duration') ? null : interaction.options.get('duration').value;
    callbackParams.reason = !interaction.options.get('reason') ? null : interaction.options.get('reason').value;
    callbackParams.moderator = interaction.member.user;
    callbackParams.guild = interaction.guild;
    callbackParams.messageCount = !interaction.options.get('message_count') ? null : interaction.options.get('message_count').value; 
    callbackParams.command = !interaction.options.get('command') ? null : interaction.options.get('command').value; 

    commandArray.forEach(async cmd => {
      if (!cmd.slash) return;
      if (!cmd.aliases.includes(interaction.commandName)) return;
      if (!interaction.member.permissions.has(cmd.requiredPerms)) return interaction.reply({ content: 'Insufficient Permissions', ephemeral: true });
      await cmd.callback(callbackParams);
    });
  });
}