import * as lib from '#lib';

// eslint-disable-next-line no-unused-vars
export default async function main(client) {

  async function evalCode({ action, content, flag }) {
    if (!lib.config.owners.includes(action.author.id)) return action.react(lib.config.emotes.error);
    if (!content) return action.reply(lib.embed.commandFail('Code to evaluate cannot be empty.'));
    if (flag && flag !== '--silent') return action.reply(lib.embed.commandFail('Invalid flag.'));
    const input = content.join(' ').replace(/(```j?s?)/g, '');
    const evalEmbedConf = {
      fields: [
        { name: 'Input', value: `\`\`\`js\n${input}\`\`\`` }
      ],
      timestamp: true
    };

    try {
      const output = await eval(`(async () => {${input}})();`);
      if (flag) action.react(lib.config.emotes.success);
      evalEmbedConf.color = lib.config.colors.success;
      evalEmbedConf.fields.push({ name: 'Success', value: `\`\`\`js\n${output}\`\`\`` });
    } catch (e) {
      if (flag) action.react(lib.config.emotes.error);
      evalEmbedConf.color = lib.config.colors.error;
      evalEmbedConf.fields.push({ name: 'Error', value: `\`\`\`js\n${e}\`\`\`\n\`\`\`js\n${e.stack}\`\`\`` });
    }
    if (flag) return;
    await action.reply(lib.embed.createReplyEmbed(evalEmbedConf));
  }

  lib.appendToCommandArray({
    aliases: ['ev', 'eval'], 
    slash: false,
    callback: evalCode,
    callbackParamInfo: ['content', 'flag'],
  });
}