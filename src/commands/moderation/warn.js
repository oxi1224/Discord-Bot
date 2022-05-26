import { SlashCommandBuilder } from '@discordjs/builders';
import { updateSlashCommands } from '../../lib/updateSlashCommands.js';
import { logPunishment, dmUser } from '../../lib/util/util.js';
import { logAction } from './actionLogger.js';

export async function main() {
  const { client } = await import('../../bot.js');
  
  // Listen for warn commands
  client.on('messageCreate', async message => {
    if (!message.content.startsWith('!') || message.author.bot) return;
    const args = message.content.slice(1).trim().split(' ').filter(str => str !== '');
    const command = args.shift().toLowerCase();
    if (!(command == 'warn')) return;
    if (!(message.member.permissions.has('MANAGE_NICKNAMES'))) return message.react('<:error:978329348924899378>');
  
    const userId = message.mentions.users.first() === undefined ? args[0] : message.mentions.users.first().id; 
    const reason = args.slice(1).join(' ') || null;
    const moderator = message.author;
    const guild = message.guild;

    await warn(userId, reason, message, guild)
      .then(logPunishment(userId, reason, moderator, 'warns'));

    await logAction('Member Warned', [
      { name: 'Moderator', value: `${moderator}` },
      { name: 'Reason', value: `${reason}` }
    ], userId);
  });

  // Create warn slash commmand
  const warnData = new SlashCommandBuilder()
    .setName('warn')
    .setDescription('warns given user')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter a user to warn')
      .setRequired(true))
    .addStringOption(option => option.setName('reason')
      .setDescription('Enter the warn reason')
      .setRequired(true));

  // Listen for warn interactions
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (!(interaction.commandName === 'warn')) return;
    if (!(interaction.member.permissions.has('MANAGE_NICKNAMES'))) return interaction.reply({ content: 'Insufficient Permissions', ephemeral: true });
    
    const userId = interaction.options.get('user').value;
    const reason = interaction.options.get('reason') == null ? null : interaction.options.get('reason').value;
    const moderator = interaction.member.user;
    const guild = interaction.guild;

    await warn(userId, reason, interaction, guild)
      .then(logPunishment(userId, reason, moderator, 'warns'));
    
    await logAction('Member Warned', [
      { name: 'Moderator', value: `${moderator}` },
      { name: 'Reason', value: `${reason}` }
    ], userId);
  });

  updateSlashCommands(warnData, 'warn');

  async function warn(userId, reason, action, guild) {
    if (reason === null) return action.reply('**Reason** cannot be **empty**');
    const user = await client.users.fetch(userId, false);
    if (!(await guild.member.fetch(userId))) return action.reply(`${user} is not in the server`);
    try {
      await dmUser(user, (`You've been **warned** in **${guild}**.
**Reason**: \`\`${reason}\`\``));
      await action.reply(`${user} has been **warned**`);
    } catch {
      await action.reply(`Failed to dm ${user} action still performed`);
    }
  }
}