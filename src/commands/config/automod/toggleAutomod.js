import { SlashCommandBuilder } from '@discordjs/builders';
import { appendToCommandArray, embed, config } from '#lib';

export default async function main() {
  // Create toggleAutomod slash command
  const toggleAutomodData = new SlashCommandBuilder()
    .setName('toggleautomod')
    .setDescription('Turns automod on/off')
    .addStringOption(option => option.setName('content')
      .setDescription('Enter the state to change the automod to.')
      .setRequired(true)
      .addChoices(
        { name: 'On', value: 'on' },
        { name: 'Off', value: 'off' }
      ));

  // Sets automod.disabled in config
  async function toggleAutomod({ action, content }) {
    if (!['on', 'off'].includes(content.join(''))) return action.reply(embed.commandFail('Invalid state value.'));
    const state = content[0] === 'on' ? false : true;
    const disabled = config.automod.disabled;

    if (state === disabled) return action.reply(embed.commandFail(`Automod already ${disabled ? 'disabled' : 'enabled'}.`));

    try {
      await config.setKey('automod.disabled', state);
      await action.reply(embed.commandSuccess('Successfully changed the config.'));
    } catch (e) {
      await action.reply(embed.commandFail('Something went wrong while changing the config.'));
      throw e;
    }
  }

  appendToCommandArray({
    aliases: ['toggleAutomod', 'toggleautomod'],
    requiredPerms: 'ADMINISTRATOR',
    slashData: toggleAutomodData,
    callback: toggleAutomod,
    callbackParamInfo: ['content'],
    helpInfo: {
      title: 'toggleAutomod Command',
      category: 'Config',
      description: 'Turns the automod on/off.',
      usage: ['toggleAutomod <state>'],
      examples: ['toggleAutomod on', 'toggleAutomod off'],
      aliases: ['toggleAutomod', 'toggleautomod'],
      arguments: [{
        argument: '<state>',
        description: 'The state the automod will be in.',
        type: 'on or off'
      }]
    }
  });
}