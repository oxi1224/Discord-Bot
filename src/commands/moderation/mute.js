import { SlashCommandBuilder } from '@discordjs/builders';
import { updateSlashCommands } from '../../lib/updateSlashCommands.js';
import { logPunishment, dmUser, logAction } from '../../lib/util/util.js';
import { mutedRole, emotes, prefix } from '../../lib/config/config.js';
import * as embed from '../../lib/util/embeds.js';

export async function main() {
  const { client } = await import('../../bot.js');
  
  // Listen for mute commands
  client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(1).trim().split(' ').filter(str => str !== '');
    const command = args.shift().toLowerCase();
    if (!(command == 'mute')) return;
    if (!(message.member.permissions.has('MUTE_MEMBERS'))) return message.react(emotes.error);
  
    const userId = await (async () => {
      try { return message.mentions.users.first() === undefined ? args[0].replace(/[\\<>@#&!]/g, '') : message.mentions.users.first().id; } 
      catch { return null; }
    })();
    if (userId === null || !(userId.match(/^[0-9]{15,18}/))) return message.reply(await embed.punishmentFail('Invalid user.'));

    const duration = (args[1] == args.at(-1) || /^\d+(min|h|d|w|m)/.test(args[1])) ? args[1] : null;
    const reason = args.slice(duration == null ? 1 : 1 + args.indexOf(duration)).join(' ') || null;
    const moderator = message.author;
    const guild = message.guild;

    await mute(message, userId, reason, duration, guild, moderator);
  });

  // Create mute slash commmand
  const muteData = new SlashCommandBuilder()
    .setName('mute')
    .setDescription('mutes given user')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter a user to mute')
      .setRequired(true))
    .addStringOption(option => option.setName('duration')
      .setDescription('Enter the mute duration')
      .setRequired(false))
    .addStringOption(option => option.setName('reason')
      .setDescription('Enter the mute reason')
      .setRequired(false));

  // Listen for mute interactions
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (!(interaction.commandName === 'mute')) return;
    if (!(interaction.member.permissions.has('MUTE_MEMBERS'))) return interaction.reply({ content: 'Insufficient Permissions', ephemeral: true });
    
    const userId = interaction.options.get('user').value;
    const reason = interaction.options.get('reason') == null ? null : interaction.options.get('reason').value;
    const duration = interaction.options.get('duration') == null ? null : interaction.options.get('duration').value;
    const moderator = interaction.member.user;
    const guild = interaction.guild;
    
    await mute(interaction, userId, reason, duration, guild, moderator);
  });

  updateSlashCommands(muteData, 'mute');

  // Mutes given user
  async function mute(action, userId, reason, duration, guild, moderator) {
    const member = await guild.members.fetch(userId, false);
    const user = member.user;
    reason = reason === null ? 'None' : reason;

    if (!(member)) return action.reply(await embed.notInServer(user));
    if (member.roles.cache.some(role => role.id === mutedRole)) return action.reply(await embed.punishmentFail(`${user} is already muted.`));
    try {
      await dmUser(user, await embed.dmDuration('muted', guild, reason, duration));
      await action.reply(await embed.punishmentReply('muted', user));
    } catch {
      await action.reply(await embed.dmFail(user));
    }
    logPunishment(userId, reason, moderator, 'mutes');
    await logAction('Member Muted', [
      { name: 'User', value: `${user}` },
      { name: 'Reason', value: `\`\`${reason}\`\`` },
      { name: 'Duration', value: duration === null ? 'Permanent' : duration }
    ], { mod: moderator });
    await member.roles.add(mutedRole);
  }
}