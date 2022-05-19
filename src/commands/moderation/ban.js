import { SlashCommandBuilder } from '@discordjs/builders';
import { updateCommandList } from '../../lib/updateSlashCommands.js';
import { performBan } from '../../lib/util/util.js';

export async function main() {
  const { client } = await import('../../bot.js');

  // client.on('messageCreate', message => {
  //   if (!message.content.startsWith('!') || message.author.bot) return;
  //   const splitMessage = message.content.slice(1).trim().split(' ');
  //   const command = splitMessage.shift().toLowerCase();
  //   if (command == 'ban') {
  //     // if (message.member.permissions.has('BAN_MEMBERS')) {
  //     
  //     // } else message.react('❌');
  //   }
  // });
  // Create ban slash command
  const banData = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans given user')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter user to ban')
      .setRequired(true))
    .addStringOption(option => option.setName('duration')
      .setDescription('Enter the ban duration')
      .setRequired(false))
    .addStringOption(option => option.setName('reason')
      .setDescription('Enter the ban reason')
      .setRequired(false));
  
  // ban the user when interaction is called
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    // check if it's the ban interaction
    if (!(interaction.commandName === 'ban')) return;
    // check for appropriate permissions
    if (!(interaction.member.permissions.has('BAN_MEMBERS'))) return interaction.reply('Insufficient Permissions');
    // define ban data
    const userId = interaction.options.get('user').value;
    const reason = (() => {return interaction.options.get('reason') == null ? null : interaction.options.get('reason').value;})();
    const duration = (() => {return interaction.options.get('duration') == null ? null : interaction.options.get('duration').value;})();
    const moderator = interaction.member.user;
    const guild = interaction.guild;
    // pass the data to a function that bans the user and logs everything
    await performBan(interaction, userId, reason, moderator, duration, guild);
  });
  // update slash command list
  updateCommandList(banData, 'ban');
}