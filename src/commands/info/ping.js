import { SlashCommandBuilder } from '@discordjs/builders';
import { createReplyEmbed } from '../../lib/util/embeds.js';
import { appendToCommandArray } from '../../lib/commandHandler.js';

export async function main(client) {
  // create ping slash commmand
  const pingData = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('get information about ping');

  async function getPing({ action }) {
    await action.reply(await createReplyEmbed(
      `Bot latency: \`\`${Date.now() - action.createdTimestamp}ms\`\`
      API latency: \`\`${Math.round(client.ws.ping)}ms\`\``
    ));
  }

  appendToCommandArray({
    aliases: ['ping'], 
    slashData: pingData,
    callback: getPing
  });
}