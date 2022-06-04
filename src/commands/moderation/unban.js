import { SlashCommandBuilder } from '@discordjs/builders';
import { updateSlashCommands } from '../../lib/updateSlashCommands.js';
import { logPunishment, dmUser, logAction } from '../../lib/util/util.js';
import { emotes, prefix } from '../../lib/config/config.js';
import * as embed from '../../lib/util/embeds.js';

export async function main() {
  const { client } = await import('../../bot.js');
  
  // Listen for unban commands   
  client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(1).trim().split(' ').filter(str => str !== '');
    const command = args.shift().toLowerCase();
    if (!(command == 'unban')) return;
    if (!(message.member.permissions.has('BAN_MEMBERS'))) return message.react(emotes.error);

    const userId = await (async () => {
      try { return message.mentions.users.first() === undefined ? args[0].replace(/[\\<>@#&!]/g, '') : message.mentions.users.first().id; } 
      catch { return null; }
    })();
    if (userId === null || !(userId.match(/^[0-9]{15,18}/))) return message.reply(await embed.punishmentFail('Invalid user.'));

    const reason = args.slice(1).join(' ') || null;
    const moderator = message.author;
    const guild = message.guild;

    await unBan(userId, reason, message, guild, moderator); 
  });

  // create unban slash commmand
  const unBanData = new SlashCommandBuilder()
    .setName('unban')
    .setDescription('unbans given user')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter user to unban')
      .setRequired(true));

  // Listen for unban interaction
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (!(interaction.commandName === 'unban')) return;
    if (!(interaction.member.permissions.has('BAN_MEMBERS'))) return interaction.reply({ content: 'Insufficient Permissions', ephemeral: true });
    
    const userId = interaction.options.get('user').value;
    const reason = interaction.options.get('reason') == null ? null : interaction.options.get('reason').value;
    const moderator = interaction.member.user;
    const guild = interaction.guild;

    await unBan(userId, reason, interaction, guild, moderator); 
  });

  updateSlashCommands(unBanData, 'unban');

  // Unbans given user
  async function unBan(userId, reason, action, guild, moderator) {
    const user = await client.users.fetch(userId, false);
    const banList = await action.guild.bans.fetch();

    if (banList.find(x => x.user.id === userId) === undefined) return action.reply(await embed.punishmentFail(`${user} is not banned.`));
    if (!userId) throw new Error('BAN_RESOLVE_ID');

    await guild.bans.remove(userId);
    try {
      await dmUser(user, await embed.dm('unbanned', guild, reason));
      await action.reply(await embed.punishmentReply('unbanned', user));
    } catch {
      await action.reply(await embed.dmFail(user));
    }
    logPunishment(userId, reason, moderator, 'unbans');
    logAction('Member Unbanned', [
      { name: 'Moderator', value: `${moderator}` },
      { name: 'Reason', value: `${reason}` }
    ], { userId: userId });
    return client.users.resolve(user);
  }
}