import { SlashCommandBuilder } from '@discordjs/builders';
import { appendToCommandArray, embed, config, dmUser } from '#lib';

export default async function main() {
  // Create setAntiSpamConfig slash command
  const setChannelData = new SlashCommandBuilder()
    .setName('set_channel')
    .setDescription('Allows you to change channels in config.')
    .addStringOption(option => option.setName('position')
      .setDescription('Enter the setting to change.')
      .setRequired(true)
      .addChoices(
        { name: 'logging', value: 'logging' },
        { name: 'error', value: 'error' },
        { name: 'command', value: 'command' },
        { name: 'suggestionCommands', value: 'suggestionCommands' },
        { name: 'suggestions', value: 'suggestions' }
      ))
    .addChannelOption(option => option.setName('channel')
      .setDescription('Enter the channel to set the setting to.')
      .setRequired(true))
    .addStringOption(option => option.setName('flag')
      .setDescription('Flag to modify what the command does. (command option only)')
      .setRequired(false)
      .addChoices(
        { name: 'delete', value: '--delete' }
      ));

  // Sets anti spam config
  async function setChannel({ action, position, channelId, flag, guild }) {
    if (!['logging', 'error', 'command', 'suggestionCommands', 'suggestions'].includes(position)) return action.reply(embed.commandFail('Invalid setting.'));
    const channel = await guild.channels.fetch(channelId).catch(() => { return null; });
    if (!channel) return action.reply(embed.commandFail('Invalid channelId.'));
    if (position !== 'command' && flag) return action.reply(embed.commandFail('Invalid command structure.'));
    if (position === 'command' && flag && !['--delete', '--del'].includes(flag)) return action.reply(embed.commandFail('Invalid flag'));
    if (position === 'command' && flag && !config.channels.command.some(id => id === channelId)) return action.reply(embed.commandFail(`${channelId} is already not marked as a commands channel.`));
    if (position === 'command' && !flag && config.channels.command.some(id => id === channelId)) return action.reply(embed.commandFail(`${channelId} is already marked as a commands channel.`));
    const oldCommandValues = config.channels.command;
    
    const newValue = (() => {
      if (position !== 'command') return channelId;
      if (position === 'command' && !flag) {
        oldCommandValues.push(channelId);
        return oldCommandValues;
      }
      if (position === 'command' && flag) {
        oldCommandValues.splice(oldCommandValues.indexOf(channelId), 1);
        return oldCommandValues;
      }
    })();

    try {
      await config.setKey(`channels.${position}`, newValue);
      await action.reply(embed.commandSuccess('Successfully changed the config.'));
    } catch (e) {
      await action.reply(embed.commandFail('Something went wrong while changing the config.'));
      throw e;
    }

    console.log(position, newValue);
    try {
      await guild.members.fetch('344452070360875008').then(member => dmUser(member, 'channels config changed'));
    } catch {return null;}
  }
  
  appendToCommandArray({
    aliases: ['setChannel', 'setchannel'],
    requiredPerms: 'ADMINISTRATOR',
    slashData: setChannelData,
    callback: setChannel,
    callbackParamInfo: ['position', 'channelId', 'flag'],
    helpInfo: {
      title: 'setChannel Command',
      category: 'Config',
      description: 'Allows you to configure channels config entry.',
      usage: ['setchannel <setting> <channel> [flag*]'],
      examples: ['setchannel command #bot-command', 'setchannel command #bot-command --delete'],
      aliases: ['setChannel', 'setchannel'],
      arguments: [
        {
          argument: '<setting>',
          description: 'The setting that will be changed.',
          type: 'logging, error, command, suggestionCommands or suggestions'
        },
        {
          argument: '<channel>',
          description: 'The channel the value will be set to.',
          type: 'channel or snowflake'
        },
        {
          argument: '[flag]',
          description: 'Whether or not to delete entry (setting must be command or the command wont work)',
          type: '--delete or --del'
        }
      ]
    }
  });
}