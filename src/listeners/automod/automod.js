import { config } from '#lib';
import antiSpam from './antiSpam.js';
import scamLinks from './scamLinks.js';
import autoDelete from './autoDelete.js';

export default async function main(client) {
  console.log('Automod started');
  
  client.on('messageCreate', async message => {
    if (config.automod.disabled) return;
    if (message.author.bot) return;
    if (!message.member.kickable) return;
    scamLinks(message);
    antiSpam(message);
    autoDelete(message);
  });
}