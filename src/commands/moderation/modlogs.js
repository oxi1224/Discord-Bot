import { SlashCommandBuilder } from '@discordjs/builders';
import { updateSlashCommands } from '../../lib/updateSlashCommands.js';
import { readFromDb } from '../../lib/common/db.js';

export async function main() {
  const { client } = await import('../../bot.js');

  // Listen for ban commands
  client.on('messageCreate', async message => {
    if (!message.content.startsWith('!') || message.author.bot) return;
    const args = message.content.slice(1).trim().split(' ').filter(str => str !== '');
    const command = args.shift().toLowerCase();
    if (!(command == 'modlogs')) return;
    if (!(message.member.permissions.has('BAN_MEMBERS'))) return message.react('<:error:978329348924899378>');

    const userId = message.mentions.users.first() === undefined ? args[0] : message.mentions.users.first().id; 
    await updateSlashCommands(userId);
  });

  // Create ban slash command
  const modlogs = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Shows the modlogs of given user')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter whose modlogs to show')
      .setRequired(true));
  
  // Listen for ban interactions
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (!(interaction.commandName === 'modlogs')) return;
    if (!(interaction.member.permissions.has('BAN_MEMBERS'))) return interaction.reply({ content: 'Insufficient Permissions', ephemeral: true });
    
    const userId = interaction.options.get('user').value;
    await updateSlashCommands(userId);
  });

  updateSlashCommands(modlogs, 'modlogs');

  async function showModlogs(userId) {
    const punishmentsJson = (await readFromDb(userId))[0];
  }
}