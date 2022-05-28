import { SlashCommandBuilder } from '@discordjs/builders';
import { updateSlashCommands } from '../../lib/updateSlashCommands.js';
import { logPunishment, dmUser } from '../../lib/util/util.js';
import { logAction } from './actionLogger.js';

export async function main() {
  const { client } = await import('../../bot.js');
  
  // listen for messages
  client.on('messageCreate', async message => {
    if (!message.content.startsWith('!') || message.author.bot) return;
    const args = message.content.slice(1).trim().split(' ').filter(str => str !== '');
    const command = args.shift().toLowerCase();
    if (!(command == 'kick')) return;
    if (!(message.member.permissions.has('KICK_MEMBERS'))) return message.react('<:error:978329348924899378>');
  
    const userId = message.mentions.users.first() === undefined ? args[0].replace(/[\\<>@#&!]/g, '') : message.mentions.users.first().id; 
    const reason = args.slice(1).join(' ') || null;
    const moderator = message.author;
    const guild = message.guild;

    await performKick(userId, reason, message, guild, moderator);
  });

  // create kick slash commmand
  const kickData = new SlashCommandBuilder()
    .setName('kick')
    .setDescription('kicks given user')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter a user to kick')
      .setRequired(true))
    .addStringOption(option => option.setName('reason')
      .setDescription('Enter the kick reason')
      .setRequired(false));

  // listen for interaction
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (!(interaction.commandName === 'kick')) return;
    if (!(interaction.member.permissions.has('KICK_MEMBERS'))) return interaction.reply({ content: 'Insufficient Permissions', ephemeral: true });
    
    const userId = interaction.options.get('user').value;
    const reason = interaction.options.get('reason') == null ? null : interaction.options.get('reason').value;
    const moderator = interaction.member.user;
    const guild = interaction.guild;

    await performKick(userId, reason, interaction, guild, moderator);
  });

  updateSlashCommands(kickData, 'kick');

  // Custom kick function
  async function performKick(userId, reason, action, guild, moderator) {
    const user = await client.users.fetch(userId, false);
    if (!(await guild.members.fetch(userId))) return action.reply(`${user} is not in the server`);
    try {
      await dmUser(user, (`You've been **kicked** from **${guild}**.
**Reason**: \`\`${reason}\`\``));
      await action.reply(`${user} has been **kicked**`);
    } catch {
      await action.reply(`Failed to dm ${user} action still performed`);
    }
    logPunishment(userId, reason, moderator, 'kicks');
    logAction('Member Kicked', [
      { name: 'Moderator', value: `${moderator}` },
      { name: 'Reason', value: `${reason}` }
    ], userId);
    await (await guild.members.fetch(userId)).kick({ reason: reason });
  }
}