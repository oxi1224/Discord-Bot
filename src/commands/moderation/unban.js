import { SlashCommandBuilder } from '@discordjs/builders';
import { updateSlashCommands } from '../../lib/updateSlashCommands.js';
import { logPunishment, dmUser } from '../../lib/util/util.js';

export async function main() {
  const { client } = await import('../../bot.js');
  
  client.on('messageCreate', async message => {
    if (!message.content.startsWith('!') || message.author.bot) return;
    const args = message.content.slice(1).trim().split(' ').filter(str => str !== '');
    const command = args.shift().toLowerCase();
    if (!(command == 'unban')) return;
    if (!(message.member.permissions.has('BAN_MEMBERS'))) return message.react('<:error:978329348924899378>');
  
    const userId = message.mentions.users.first() === undefined ? args[0] : message.mentions.users.first().id; 
    const reason = args.slice(1).join(' ') || null;
    const moderator = message.author;
    const guild = message.guild;

    await unBan(userId, reason, message, guild)
      .then(logPunishment(userId, reason, moderator, 'unbans'));
  });

  // create unban slash commmand
  const unBanData = new SlashCommandBuilder()
    .setName('unban')
    .setDescription('unbans given user')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter user to unban')
      .setRequired(true));

  // unban the user when interaction is called
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (!(interaction.commandName === 'unban')) return;
    if (!(interaction.member.permissions.has('BAN_MEMBERS'))) return interaction.reply({ content: 'Insufficient Permissions', ephemeral: true });
    
    const userId = interaction.options.get('user').value;
    const reason = interaction.options.get('reason') == null ? null : interaction.options.get('reason').value;
    const moderator = interaction.member.user;
    const guild = interaction.guild;

    await unBan(userId, reason, interaction, guild)
      .then(logPunishment(userId, reason, moderator, 'unbans'));
  });

  updateSlashCommands(unBanData, 'unban');

  async function unBan(userId, reason, action, guild) {
    const user = await client.users.fetch(userId, false);
    const banList = await action.guild.bans.fetch();
    if (banList.find(x => x.user.id === userId) === undefined) return action.reply(`${user} is not banned`);
    if (!userId) throw new Error('BAN_RESOLVE_ID');
    await guild.bans(userId).delete({ reason: reason });
    await action.reply(`${user} has been unbanned`);
    try {
      await dmUser(user, (`You've been unbanned in ${guild}. Reason: ${reason}`));
      await action.reply(`${user} has been banned`);
    } catch {
      await action.reply(`Failed to dm ${user} action still performed`);
    }
    return client.users.resolve(user);
  }
}