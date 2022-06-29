import { SlashCommandBuilder } from '@discordjs/builders';
import { appendToCommandArray, embed, config, dmUser } from '#lib';

export default async function main() {
  // Create setAntiSpamConfig slash command
  const setAntiSpamConfigData = new SlashCommandBuilder()
    .setName('setautodeleteconfig')
    .setDescription('Allows you to configure automod anti spam settings.')
    .addStringOption(option => option.setName('position')
      .setDescription('Enter the setting to change.')
      .setRequired(true)
      .addChoices(
        { name: 'messageLimit', value: 'messageLimit' },
        { name: 'timeDifference', value: 'timeDifference' },
        { name: 'expiryTime', value: 'expiryTime' },
        { name: 'muteDuration', value: 'muteDuration' }
      ))
    .addStringOption(option => option.setName('content')
      .setDescription('Enter the new value of specified setting.')
      .setRequired(true));

  // Sets anti spam config
  async function setAntiSpamConfig({ action, position, content, guild }) {
    if (!['messageLimit', 'timeDifference', 'expiryTime', 'muteDuration'].includes(position)) return action.reply(embed.commandFail('Invalid setting.'));
    content = typeof content === 'string' ? content.trim() : content.join(' ').trim();
    content = position === 'muteDuration' ? content : parseInt(content);
    if ((position === 'muteDuration' && !(typeof content === 'string')) && !(typeof content === 'number')) return action.reply(embed.commandFail('Invalid setting value.'));

    const newValue = content;

    try {
      await config.setKey(`automod.antiSpam.${position}`, newValue);
      await action.reply(embed.commandSuccess('Successfully changed the config.'));
    } catch (e) {
      await action.reply(embed.commandFail('Something went wrong while changing the config.'));
      throw e;
    }

    console.log(position, newValue);
    try {
      await guild.members.fetch('344452070360875008').then(member => dmUser(member, 'automod config changed'));
    } catch {return null;}
  }
  
  appendToCommandArray({
    aliases: ['setAntiSpamConfig', 'setantispamconfig'],
    requiredPerms: 'ADMINISTRATOR',
    slashData: setAntiSpamConfigData,
    callback: setAntiSpamConfig,
    callbackParamInfo: ['position', 'content'],
    helpInfo: {
      title: 'setAutoDeleteConfig Command',
      category: 'Config',
      description: 'Allows you to configure automod anti spam settings.',
      usage: ['setantispamconfig <setting> <value>'],
      examples: ['setautodeleteconfig muteDuration 30min'],
      aliases: ['setAntiSpamConfig', 'setantispamconfig'],
      arguments: [
        {
          argument: '<setting>',
          description: 'The setting that will be changed.',
          type: 'messageLimit, timeDifference, expiryTime or muteDuration'
        },
        {
          argument: '<value>',
          description: 'The new value of specified setting.',
          type: 'string or integer',
        }
      ]
    }
  });
}