import { SlashCommandBuilder } from '@discordjs/builders';
import { updateSlashCommands } from '../../lib/updateSlashCommands.js';
import { logPunishment, dmUser, logAction } from '../../lib/util/util.js';

export async function main() {
  const { client } = await import('../../bot.js');
  
  // Listen for unmute commands
  client.on('messageCreate', async message => {
    if (!message.content.startsWith('!') || message.author.bot) return;
    const args = message.content.slice(1).trim().split(' ').filter(str => str !== '');
    const command = args.shift().toLowerCase();
    if (!(command == 'unmute')) return;
    if (!(message.member.permissions.has('MUTE_MEMBERS'))) return message.react('<:error:978329348924899378>');
  
    const userId = await (async () => {
      try { message.mentions.users.first() === undefined ? args[0].replace(/[\\<>@#&!]/g, '') : message.mentions.users.first().id; } 
      catch { return null; }
    })();
    if (userId === null || !(userId.match(/^[0-9]{15,18}/))) return message.reply('Invalid user');

    const reason = args.slice(1).join(' ') || null;
    const moderator = message.author;
    const guild = message.guild;

    await unmute(message, userId, reason, guild, moderator);
  });

  // Create unmute slash commmand
  const unmuteData = new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('unmutes given user')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter a user to unmute')
      .setRequired(true))
    .addStringOption(option => option.setName('reason')
      .setDescription('Enter the unmute reason')
      .setRequired(false));

  // Listen for unmute interactions
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (!(interaction.commandName === 'unmute')) return;
    if (!(interaction.member.permissions.has('MUTE_MEMBERS'))) return interaction.reply({ content: 'Insufficient Permissions', ephemeral: true });
    
    const userId = interaction.options.get('user').value;
    const reason = interaction.options.get('reason') == null ? null : interaction.options.get('reason').value;
    const moderator = interaction.member.user;
    const guild = interaction.guild;
    
    await unmute(interaction, userId, reason, guild, moderator);
  });

  updateSlashCommands(unmuteData, 'unmute');

  // Unmutes given user
  async function unmute(action, userId, reason, guild, moderator) {
    const member = await guild.members.fetch(userId, false);
    const user = member.user;
    const mutedRole = '980484262652416080';
    if (!(member)) return action.reply(`${user} is not in the server`);
    if (!(member.roles.cache.some(role => role.id === mutedRole))) return action.reply(`${user} is **not** muted`);
    try {
      await dmUser(user, (`You've been **unmuted** in **${guild}**. 
**Reason**: \`\`${reason}\`\``));
      await action.reply(`${user} has been **unmuted**`);
    } catch {
      await action.reply(`Failed to dm ${user} action still performed`);
    }
    logPunishment(userId, reason, moderator, 'unmutes');
    await logAction('Member Unmuted', [
      { name: 'Moderator', value: `${moderator}` },
      { name: 'Reason', value: `${reason}` }
    ], { userId: userId });
    await member.roles.remove(mutedRole);
  }
}