import { SlashCommandBuilder } from '@discordjs/builders';
import { embed, appendToCommandArray } from '#lib';

export default async function main() {
  // create Heko slash commmand
  const helpData = new SlashCommandBuilder()
    .setName('help')
    .setDescription('get information about available commands')
    .addStringOption(option => option.setName('command')
      .setDescription('get information about specific command')
      .setRequired(false));

  async function help({ action, command }) {
    const commands = (await appendToCommandArray({ finalize: true })).map(obj => obj.helpInfo);
    if (command && !commands.map(obj => obj.aliases).flat().includes(command)) return action.reply(await embed.commandFail('This command doesnt exist.'));
    if (!command) {
      const fields = [];
      // Get all unique fields
      const categories = [...new Set(commands.map(obj => obj.category))];
      
      categories.forEach(category => {
        const categoryField = [];
        commands.forEach(cmd => {
          if (cmd.category.includes(category)) categoryField.push(`\`\`${cmd.aliases[0]}\`\``);
        });
        fields.push({ name: category, value: categoryField.join(' ') });
      });

      await action.reply(await embed.createReplyEmbed({
        fields: fields,
        footer: 'For more information on a command do help [command].'
      }));
    }
    if (command) {
      const fields = [];
      const matchingCommand = commands.filter(obj => obj.aliases.includes(command))[0];
      const commandArgs = [];

      matchingCommand.arguments.forEach(arg => {
        commandArgs.push(
          `\`\`${arg.argument}\`\`
          » **Desc**: ${arg.description}
          » **Type**: ${arg.type}
          ${arg.timeSuffixes ? `» **Time Suffixes**: ${arg.timeSuffixes.map(str => `\`\`${str}\`\``).join(' ')}` : ''}`.trim());
      });

      fields.push(
        { name: 'Usage', value: `\`\`${matchingCommand.usage.join('\n')}\`\`` },
        { name: 'Example', value: matchingCommand.examples.map(str => `\`\`${str}\`\``).join('\n') },
        { name: 'Aliases', value: matchingCommand.aliases.map(str => `\`\`${str}\`\``).join(' ') }
      );
      if (commandArgs.length !== 0) fields.push({ name: 'Arguments', value: commandArgs.join('\n') });
      
      await action.reply(await embed.createReplyEmbed({
        title: matchingCommand.title,
        description: matchingCommand.description,
        fields: fields
      }));
    }
  }

  appendToCommandArray({
    aliases: ['help'],
    slashData: helpData,
    callback: help,
    helpInfo: {
      title: 'Help Command',
      category: 'Info',
      description: 'Display the list of commands or information about a specific command.',
      usage: ['help [command]'],
      examples: ['help ban'],
      aliases: ['help'],
      arguments: [
        {
          argument: '[command]',
          description: 'The command to show information about.',
          type: 'string'
        }
      ]
    }
  });
}