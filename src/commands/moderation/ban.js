import { SlashCommandBuilder } from '@discordjs/builders';
import { updateSlashCommands } from '../../lib/updateSlashCommands.js';
import { logPunishment, dmUser } from '../../lib/util/util.js';
import { logAction } from './actionLogger.js';

export async function main() {
  const { client } = await import('../../bot.js');

  // listen for ban command
  client.on('messageCreate', async message => {
    if (!message.content.startsWith('!') || message.author.bot) return;
    const args = message.content.slice(1).trim().split(' ');
    const command = args.shift().toLowerCase();
    if (!(command == 'ban')) return;
    if (!(message.member.permissions.has('BAN_MEMBERS'))) return message.reply('Insufficient Permissions');

    const userId = message.mentions.users.first() === undefined ? args[0] : message.mentions.users.first().id; 
    const duration = args[1] === args[-1] ? null : args[1];
    const reason = args.slice(duration == null ? 1 : 1 + args.indexOf(duration)).join(' ') || null;
    const moderator = message.author;
    const guild = message.guild;

    await performBan(message, userId, reason, duration, guild)
      .then(logPunishment(userId, reason, moderator, duration, 'bans'));

  });

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
    if (!(interaction.commandName === 'ban')) return;
    if (!(interaction.member.permissions.has('BAN_MEMBERS'))) return interaction.reply('Insufficient Permissions');
    
    const userId = interaction.options.get('user').value;
    const reason = interaction.options.get('reason') == null ? null : interaction.options.get('reason').value;
    const duration = interaction.options.get('duration') == null ? null : interaction.options.get('duration').value;
    const moderator = interaction.member.user;
    const guild = interaction.guild;

    await performBan(interaction, userId, reason, duration, guild)
      .then(logPunishment(userId, reason, moderator, duration, 'bans'));
  });
  updateSlashCommands(banData, 'ban');


  async function performBan(action, userId, reason, duration, guild) {
    const banList = await guild.bans.fetch();
    const user = await client.users.fetch(userId, false);
    // check if user is already banned
    if (!(banList.find(x => x.user.id === userId) === undefined)) return action.reply(`${user} is already banned`);
    // ban the user
    try {
      await dmUser(user, (`You've been banned ${duration == null ? 'permanently' : `for ${duration}`} in ${guild}. Reason: ${reason}`));
      await action.reply(`${user} has been banned`);
    } catch {
      await action.reply(`Failed to dm <@${userId}>, user still punished`);
    }
    await logAction('Member Banned', `${user}`);
    await guild.members.ban(userId, { reason: reason });
  }
}