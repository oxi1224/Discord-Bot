import { SlashCommandBuilder } from '@discordjs/builders';
import { updateSlashCommands } from '../../lib/updateSlashCommands.js';
import { logPunishment, dmUser, logAction } from '../../lib/util/util.js';
import { errorEmote } from '../../lib/config/config.js';
import * as embed from '../../lib/util/embeds.js';

export async function main() {
  const { client } = await import('../../bot.js');
  
  // Listen for unmute commands
  client.on('messageCreate', async message => {
    if (!message.content.startsWith('!') || message.author.bot) return;
    const args = message.content.slice(1).trim().split(' ').filter(str => str !== '');
    const command = args.shift().toLowerCase();
    if (!(command == 'unmute')) return;
    if (!(message.member.permissions.has('MUTE_MEMBERS'))) return message.react(errorEmote);
  
    const userId = await (async () => {
      try { return message.mentions.users.first() === undefined ? args[0].replace(/[\\<>@#&!]/g, '') : message.mentions.users.first().id; } 
      catch { return null; }
    })();
    if (userId === null || !(userId.match(/^[0-9]{15,18}/))) return message.reply(embed.punishmentFail('Invalid user.'));

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
    if (!(member.roles.cache.some(role => role.id === mutedRole))) return action.reply(await embed.punishmentFail(`${user} is **not** muted.`));
    try {
      await dmUser(user, await embed.dm('unmuted', guild, reason));
      await action.reply(await embed.punishmentReply('unmuted', user));
    } catch {
      await action.reply(await embed.dmFail(user));
    }
    logPunishment(userId, reason, moderator, 'unmutes');
    await logAction('Member Unmuted', [
      { name: 'Moderator', value: `${moderator}` },
      { name: 'Reason', value: `${reason}` }
    ], { userId: userId });
    await member.roles.remove(mutedRole);
  }
}