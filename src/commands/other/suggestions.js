import { SlashCommandBuilder } from '@discordjs/builders';
import { appendToCommandArray, config, embed } from '#lib';


export default async function main() {
  // Create suggest slash commmand
  const suggestData = new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Makes a suggestion.')
    .addStringOption(option => option.setName('suggestion')
      .setDescription('Enter the suggestion.')
      .setRequired(true));


  // send a suggestion to suggestions channel
  async function suggest({ action, content, guild }) {
    if (action.channelId !== config.channels.suggestionCommands) return;
    content = typeof content === 'string' ? content.trim() : content.join(' ').trim();
    const channel = await guild.channels.fetch(config.channels.suggestions);
    
    await channel.send(embed.createReplyEmbed({
      title: `Author: ${action.member.user.username}#${action.member.user.discriminator}`,
      thumbnail: action.member.displayAvatarURL(),
      fields: [{ name: 'Suggestion', value: content }],
      footer: { text: `ID: ${action.member.id}` },
      timestamp: true,
    })).then(msg => { 
      msg.react(config.emotes.success); 
      msg.react(config.emotes.error);
    });
  }

  appendToCommandArray({
    aliases: ['suggest'],
    slashData: suggestData,
    callback: suggest,
    callbackParamInfo: ['content'],
    helpInfo: {
      title: 'Suggest Command',
      category: 'Other',
      description: 'Suggest something.',
      usage: ['suggest <content>'],
      examples: ['suggest add more pets'],
      aliases: ['suggest'],
      arguments: [{
        argument: '<content>',
        description: 'The content of the suggestion.',
        type: 'text'
      }]
    }
  });
}