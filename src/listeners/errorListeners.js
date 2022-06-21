import { logAction } from '../lib/util/util.js';
import { errorsChannel } from '../lib/config/config.js';

export default function main() {
  console.log('Error listeners started');
  process.on('unhandledRejection', 
    async (err) => await logAction(
      'Error',
      [
        { name: 'Error:', value: `\`\`\`${err}\`\`\`` },
        { name: 'Call Stack:', value: `\`\`\`js\n${err.stack} \`\`\`` }
      ],
      { channelId: errorsChannel }
    ));

  process.on('uncaughtException', 
    async (err) => await logAction(
      'Error',
      [
        { name: 'Error:', value: `\`\`\`${err}\`\`\`` },
        { name: 'Call Stack:', value: `\`\`\`js\n${err.stack} \`\`\`` }
      ],
      { channelId: errorsChannel }
    ));
}
