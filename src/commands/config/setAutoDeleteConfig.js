import { SlashCommandBuilder } from '@discordjs/builders';
import { appendToCommandArray, embed, config } from '#lib';
import isEqual from 'lodash/isEqual.js';

export default async function main() {
  // Create autoDeleteConfig slash command
  const setAutoDeleteConfigData = new SlashCommandBuilder()
    .setName('setautodeleteconfig')
    .setDescription('Allows you to configure automod auto delete')
    .addChannelOption(option => option.setName('channel')
      .setDescription('Enter the channel to watch')
      .setRequired(true))
    .addStringOption(option => option.setName('position')
      .setDescription('Enter the position of where the string will be.')
      .setRequired(true)
      .addChoices(
        { name: 'Start', value: 'start' },
        { name: 'Any', value: 'any' },
        { name: 'End', value: 'end' },
      ))
    .addStringOption(option => option.setName('content')
      .setDescription('Enter the content which will be searched for.')
      .setRequired(true))
    .addStringOption(option => option.setName('flag')
      .setDescription('Flag to modify what the command does.')
      .setRequired(false)
      .addChoices(
        { name: 'delete', value: '--delete' },
        { name: 'not', value: '--not' }
      ));

  // Sets auto delete config
  async function setAutoDeleteConfig({ action, channelId, position, content, flag, guild }) {
    const channel = await guild.channels.fetch(channelId).catch(() => { return null; });
    if (!channel) return action.reply(embed.commandFail('Invalid channel.'));
    if (!['start', 'any', 'end'].includes(position)) return action.reply(embed.commandFail('Invalid position value.'));

    if (flag && !['--del', '--delete', '--not'].includes(flag)) return action.reply(embed.commandFail('Invalid flag.'));
    const configValues = config.automod.autoDelete;
    content = typeof content === 'string' ? content.trim() : content.join(' ').trim();
    const newValue = {
      channelId: channelId,
      position: position,
      content: content,
      invert: flag === '--not' ? true : false
    };
    
    if (flag !== '--del' || flag !== '--delete') {
      if (configValues.some(val => isEqual(val, newValue))) return action.reply(embed.commandFail('Entry already exists.'));
      configValues.push(newValue);
    } else if (flag === '--del' || flag === '--delete') {
      const configToRemove = configValues.find(val => isEqual(val, newValue));
      if (!configToRemove) return action.reply(embed.commandFail('No such entry found'));
      configValues.splice(configValues.indexOf(configToRemove), 1);
    }

    try {
      await config.setKey('automod.autoDelete', configValues);
      await action.reply(embed.commandSuccess('Successfully changed the config.'));
    } catch (e) {
      await action.reply(embed.commandFail('Something went wrong while changing the config.'));
      throw e;
    }
  }

  appendToCommandArray({
    aliases: ['setAutoDeleteConfig', 'setautodeleteconfig'],
    requiredPerms: 'ADMINISTRATOR',
    slashData: setAutoDeleteConfigData,
    callback: setAutoDeleteConfig,
    callbackParamInfo: ['channelId', 'position', 'content', 'flag'],
    helpInfo: {
      title: 'setAutoDeleteConfig Command',
      category: 'Config',
      description: 'Sets auto delete config.',
      usage: ['setautodeleteconfig <channel> <position> <content> [flag]'],
      examples: ['setautodeleteconfig #suggestions !suggest'],
      aliases: ['setAutoDeleteConfig', 'setautodeleteconfig'],
      arguments: [
        {
          argument: '<channel>',
          description: 'The channel which will be watched.',
          type: 'channel or snowflake'
        },
        {
          argument: '<position>',
          description: 'The position of the content.',
          type: 'start, any or end',
        },
        {
          argument: '<content>',
          description: 'The content which will be searched for.',
          type: 'string'
        },
        {
          argument: '[flag]',
          description: 'Flag to modify what the command does. \n--delete - removes entry with given values. \n--not - inverts the logic (do not add when deleting).',
          type: '--delete (--del) or --not.'
        }
      ]
    }
  });
}