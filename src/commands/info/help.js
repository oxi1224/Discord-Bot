import { SlashCommandBuilder } from '@discordjs/builders';
import { appendToCommandArray, embed } from '#lib';

export default async function main() {
  // create Help slash commmand
  const helpData = new SlashCommandBuilder()
    .setName('help')
    .setDescription('get information about available commands')
    .addStringOption(option => option.setName('command')
      .setDescription('get information about specific command')
      .setRequired(false));

  async function help({ action, command }) {
    const commands = (await appendToCommandArray({ finalize: true })).map(obj => obj.helpInfo);
    if (command && !commands.map(obj => obj ? obj.aliases : null).flat().includes(command)) return action.reply(embed.commandFail('This command doesnt exist.'));
    if (!command) {
      const fields = [];
      // Get all unique fields
      const categories = [...new Set(commands.map(obj => obj ? obj.category : null))];
      
      categories.forEach(category => {
        if (!category) return;
        const categoryField = [];
        commands.forEach(cmd => {
          if (!cmd) return;
          if (cmd.category.includes(category)) categoryField.push(`\`\`${cmd.aliases[0]}\`\``);
        });
        fields.push({ name: category, value: categoryField.join(' ') });
      });

      await action.reply(embed.createReplyEmbed({
        fields: fields,
        footer: { text: 'For more information on a command do help [command].' }
      }));
    }
    if (command) {
      const fields = [];
      const matchingCommand = commands.filter(obj => obj ? obj.aliases.includes(command) : null)[0];
      const commandArgs = [];

      matchingCommand.arguments.forEach(arg => {
        commandArgs.push(`
\`\`${arg.argument}\`\`
» **Desc**: ${arg.description}
» **Type**: ${arg.type}
${arg.timeSuffixes ? `» **Time Suffixes**: ${arg.timeSuffixes.map(str => `\`\`${str}\`\``).join(' ')}` : ''}
          `.trim());
      });

      fields.push(
        { name: 'Usage', value: `\`\`${matchingCommand.usage.join('\n')}\`\`` },
        { name: 'Example', value: matchingCommand.examples.map(str => `\`\`${str}\`\``).join('\n') },
        { name: 'Aliases', value: matchingCommand.aliases.map(str => `\`\`${str}\`\``).join(' ') }
      );
      if (commandArgs.length !== 0) fields.push({ name: 'Arguments', value: commandArgs.join('\n') });
      
      await action.reply(embed.createReplyEmbed({
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
    callbackParamInfo: ['command'],
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