import { logAction, config } from '#lib';

export default function main() {
  console.log('Error listeners started');
  process.on('unhandledRejection', async (err) => {
    const fields = [{ name: 'Error:', value: `\`\`\`${err}\`\`\`` }];

    if (err.stack.length > 1000) {
      let fieldIndex = 1;
      for (let i = 0; i < err.stack.length; i += 1000) {
        const cont = err.stack.substring(i, Math.min(err.stack.length, i + 1000));
        fields.push({ name: `Call Stack[${fieldIndex}]`, value: `\`\`\`js\n${cont} \`\`\`` });
        fieldIndex++;
      }
    } else {
      fields.push({ name: 'Call Stack', value: `\`\`\`js\n${err.stack} \`\`\`` });
    }
    
    await logAction('Error', fields, { channelId: config.channels.error });
  });

  process.on('uncaughtException', async (err) => {
    const fields = [{ name: 'Error:', value: `\`\`\`${err}\`\`\`` }];

    if (err.stack.length > 1000) {
      let fieldIndex = 1;
      for (let i = 0; i < err.stack.length; i += 1000) {
        const cont = err.stack.substring(i, Math.min(err.stack.length, i + 1000));
        fields.push({ name: `Call Stack[${fieldIndex}]`, value: `\`\`\`js\n${cont} \`\`\`` });
        fieldIndex++;
      }
    } else {
      fields.push({ name: 'Call Stack', value: `\`\`\`js\n${err.stack} \`\`\`` });
    }

    await logAction('Error', fields, { channelId: config.channels.error });
  });
}
