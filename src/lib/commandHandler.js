import { emotes, prefix } from './config/config.js';
import { updateSlashCommands } from './updateSlashCommands.js';

const commands = [];
/**
 * Appends data and options of commands to an array.
 * 
 * @param {object} command - Information about how a command behaves.
 * @param {String[]} command.aliases - Aliases for a command.
 * @param {String} [command.requiredPerms = SEND_MESSAGES] - Permissions required for running the command.
 * @param {Boolean} [command.slash=true] - Information if the command includes a slash command.
 * @param {Boolean} [command.prefixed=true] command - Information if the command includes a prefixed command.
 * @param {object} command.slashData - Information about the slash command.
 * @param {commandCallback} command.callback - The callback of the command.
 * @param {[]} command.callbackParamInfo - Required parameters for the callback (Without action, guild and moderator).
 * @param {Boolean} [command.finalize=false] - If true only returns the command array.
 * @param {object} command.helpInfo - Info to get parsed when running the help command.
 * 
 * @returns {object[]} Array of objects which include information on how the command behaves.
 */
export async function appendToCommandArray({
  aliases = [],
  requiredPerms = 'SEND_MESSAGES',
  slash = true,
  prefixed = true,
  slashData,
  callback,
  callbackParamInfo = [],
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
      callbackParamInfo,
      helpInfo
    });
    slash ? await updateSlashCommands(slashData, aliases[0]) : null;
  }
  return commands;
}

/**
 * Uses the command array to run commands when called.
 * @param {object} client - Discord.js client. 
 * @param {object[]} commandArray - Array which contains data of all commands.
 */
export async function initializeCommands(client, commandArray) {
  commandArray = await commandArray;

  client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(1).trim().split(' ').filter(str => str !== '');
    const commandName = args.shift().toLowerCase();
    const command = commandArray.find(cmd => cmd.aliases.includes(commandName));

    if (!command) return;
    if (!command.prefixed) return;
    if (!message.member.permissions.has(command.requiredPerms)) return message.react(emotes.error);
    
    const callbackParams = await getCallbackParams(command.callbackParamInfo, args, commandName);
    callbackParams.action = message;
    callbackParams.moderator = message.author;
    callbackParams.guild = message.guild;

    await command.callback(callbackParams);
  });

  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const commandName = interaction.commandName;
    const command = commandArray.find(cmd => cmd.aliases.includes(commandName));
    const callbackParams = {};

    if (!command) return;
    if (!interaction.member.permissions.has(command.requiredPerms)) return interaction.reply({ content: 'Insufficient Permissions', ephemeral: true });

    callbackParams.action = interaction;
    callbackParams.userId = !interaction.options.get('user') ? null : interaction.options.get('user').value;
    callbackParams.duration = !interaction.options.get('duration') ? null : interaction.options.get('duration').value;
    callbackParams.reason = !interaction.options.get('reason') ? null : interaction.options.get('reason').value;
    callbackParams.moderator = interaction.member.user;
    callbackParams.guild = interaction.guild;
    callbackParams.messageCount = !interaction.options.get('message_count') ? null : interaction.options.get('message_count').value;
    callbackParams.command = !interaction.options.get('command') ? null : interaction.options.get('command').value;
    callbackParams.punishmentId = !interaction.options.get('punishment_id') ? null : interaction.options.get('punishment_id').value;
    callbackParams.roleFunction = !interaction.options.get('function') ? null : interaction.options.get('function').value;
    callbackParams.roleInfo = !interaction.options.get('role') ? null : interaction.options.get('role').role.name;
  
    await command.callback(callbackParams);
  });
}

/**
 * Gets specific callback params from args. 
 * Note: callbackParamInfo includes any parameter that isn't action, guild or moderator
 * 
 * @param {string[]} callbackParamInfo - Array of callback parameters in order to more easily set them.
 * @param {string[]} args - Message content split into an array without the command name.
 * @param {string} commandName - Name of the command the params are for.
 * @returns {object[]} Array of values of specified arguments in callbackParamInfo.
 */
function getCallbackParams(callbackParamInfo, args, commandName) {
  const callbackParams = {};

  callbackParamInfo.forEach((param, index) => {
    switch (param) {
    case 'roleFunction':
      if (commandName === 'role') callbackParams.roleFunction = args[index];
      if (commandName === 'ra' || commandName === 'rm') callbackParams.roleFunction = commandName;
      break;
    case 'userId':
      return callbackParams.userId = args.length === 0 || !args[index] ? null : args[index].replace(/[\\<>@#&!]/g, '');
    case 'duration':
      return callbackParams.duration = args[index] !== args.at(-1) && /^\d+(min|h|d|w|m)/.test(args[index]) || /^\d+(min|h|d|w|m)/.test(args[index]) ? args[index] : null;
    case 'reason':
      return callbackParams.reason = args.slice(index).join(' ') || null;
    case 'messageCount':
      return callbackParams.messageCount = !callbackParams.userId ? args[0] : args[1];
    case 'command':
      return callbackParams.command = args.length === 0 || !args[index] ? null : args[index];
    case 'punishmentId':
      return callbackParams.punishmentId = args.length === 0 || !args[index] ? null : args[index];
    case 'roleInfo':
      return callbackParams.roleInfo = args.length === 0 || !args[index] ? null : args.slice(index);
    }
  });
  return callbackParams;
}