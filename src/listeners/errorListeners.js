import { logAction } from '../lib/util/util.js';

export function main() {
  process.on('unhandledRejection', 
    async (err) => await logAction(
      'Error', 
      [{ name: 'Error:', value: `\`\`\`md ${err} \`\`\` ` }], 
      { channelId: '980478015412772884' }
    ));

  process.on('uncaughtException', 
    async (err) => await logAction(
      'Error', 
      [{ name: 'Error:', value: `\`\`\`md ${err} \`\`\` ` }], 
      { channelId: '980478015412772884' }
    ));
}
