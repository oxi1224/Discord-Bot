import * as lib from '#lib';

// eslint-disable-next-line no-unused-vars
export default async function main(client) {

  async function evalCode({ action, reason }) {
    if (!lib.config.owners.includes(action.author.id)) return action.react(lib.config.emotes.error);
    if (!reason) return action.reply(lib.embed.commandFail('Code to evaluate cannot be empty.'));
    const input = reason.replace(/(```j?s?)/g, '');
    const evalEmbedConf = {
      fields: [
        { name: 'Input', value: `\`\`\`\n${input}\`\`\`` }
      ],
      timestamp: true
    };

    try {
      const output = await eval(input);
      evalEmbedConf.color = lib.config.embedColors.success;
      evalEmbedConf.fields.push({ name: 'Success', value: `\`\`\`${output}\`\`\`` });
    } catch (e) {
      evalEmbedConf.color = lib.config.embedColors.error;
      evalEmbedConf.fields.push({ name: 'Error', value: `\`\`\`js\n${e}\`\`\`\n\`\`\`js\n${e.stack}\`\`\`` });
    }
    await action.reply(lib.embed.createReplyEmbed(evalEmbedConf));
  }

  lib.appendToCommandArray({
    aliases: ['ev', 'eval'], 
    slash: false,
    callback: evalCode,
    callbackParamInfo: ['reason'],
  });
}