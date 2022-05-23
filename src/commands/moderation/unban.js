import { SlashCommandBuilder } from '@discordjs/builders';
import { updateSlashCommands } from '../../lib/updateSlashCommands.js';

export async function main() {
  const { client } = await import('../../bot.js');

  async function unBan(user, reason) {
    const id = client.users.resolveId(user.user);
    if (!id) throw new Error('BAN_RESOLVE_ID');
    await client.api.guilds('613024666079985702').bans(id).delete({ reason: reason });
    return client.users.resolve(user.user);
  }
  
  // client.on('messageCreate', message => {
  //   if (!message.content.startsWith('!') || message.author.bot) return;
  //   const args = message.content.slice(1).trim().split(' ');
  //   const command = args.shift().toLowerCase();
  //   if (!(command == 'unban')) return;
  //   if (!(message.member.permissions.has('BAN_MEMBERS'))) return message.reply('Insufficient Permissions');
  // 
  //   const userId = message.mentions.users.first().id || args[0];
  //   const duration = args[1] === args[-1] ? null : args[1];
  //   const reason = args.slice(duration == null ? 1 : 1 + args.indexOf(duration)).join(' ') || null;
  //   const moderator = message.author;
  //   const guild = message.guild;
  // 
  //   try {
  //     performBan(message, userId, reason, moderator, duration, guild);
  //   } catch {
  //     message.reply('Something went wrong, please make sure all the provided information is correct');
  //   }
  // 
  // });

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
    const banList = await interaction.guild.bans.fetch();
    if (!(interaction.member.permissions.has('BAN_MEMBERS'))) return interaction.reply('Insufficient Permissions');
    // check if user is banned
    if (banList.find(x => x.user.id === interaction.options.get('user').value) === undefined) return interaction.reply(`${interaction.options.get('user').user} is not banned`);
    await unBan(interaction.options.get('user')).then(interaction.reply(`${interaction.options.get('user').user} has been unbanned`));
  });

  updateSlashCommands(unBanData, 'unban');
}