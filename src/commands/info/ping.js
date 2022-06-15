import { SlashCommandBuilder } from '@discordjs/builders';
import { embed, appendToCommandArray } from '#lib';

export default async function main(client) {
  // create ping slash commmand
  const pingData = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('get information about ping');

  async function getPing({ action }) {
    await action.reply(await embed.createReplyEmbed({
      description: `
Bot latency: \`\`${Date.now() - action.createdTimestamp}ms\`\`
API latency: \`\`${Math.round(client.ws.ping)}ms\`\``
    }));
  }

  appendToCommandArray({
    aliases: ['ping'], 
    slashData: pingData,
    callback: getPing,
    helpInfo: {
      title: 'Ping Command',
      category: 'Info',
      description: 'Gets the latency of the bot.',
      usage: ['ping'],
      examples: ['ping'],
      aliases: ['ping'],
      arguments: []
    }
  });
}