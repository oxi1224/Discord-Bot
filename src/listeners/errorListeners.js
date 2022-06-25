import { logAction, config } from '#lib';

export default function main() {
  console.log('Error listeners started');
  process.on('unhandledRejection', 
    async (err) => await logAction(
      'Error',
      [
        { name: 'Error:', value: `\`\`\`${err}\`\`\`` },
        { name: 'Call Stack:', value: `\`\`\`js\n${err.stack} \`\`\`` }
      ],
      { channelId: config.channels.error }
    ));

  process.on('uncaughtException', 
    async (err) => await logAction(
      'Error',
      [
        { name: 'Error:', value: `\`\`\`${err}\`\`\`` },
        { name: 'Call Stack:', value: `\`\`\`js\n${err.stack} \`\`\`` }
      ],
      { channelId: config.channels.error }
    ));
}
