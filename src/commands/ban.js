import { SlashCommandBuilder } from '@discordjs/builders';
import { updateCommandList } from '../updateSlashCommands.js';

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
 
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName === 'ban') {
      if (interaction.member.permissions.has('BAN_MEMBERS')) {
        // console.log(interaction.options.get('user').value);
        await interaction.options.get('user').member.ban().then(interaction.reply('L bozo'));
      } else {
        interaction.reply('Insufficient Permissions');
      }
    }
  });

  const unBanData = new SlashCommandBuilder()
    .setName('unban')
    .setDescription('unbans given user')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter user to unban')
      .setRequired(true));

  client.on('interactionCreate', async interaction => {
    const banList = await interaction.guild.bans.fetch();
    if (!interaction.isCommand()) return;
    if (interaction.commandName === 'unban') {
      if (interaction.member.permissions.has('BAN_MEMBERS')) {
        if (banList.find(x => x.user.id === interaction.options.get('user').value) === undefined) return interaction.reply('User is not banned');
        await unBan(interaction.options.get('user')).then(interaction.reply('Member unbanned'));
      } else {
        interaction.reply('Insufficient Permissions');
      }
    }
  });

  async function unBan(user, reason) {
    const id = client.users.resolveId(user.user);
    if (!id) throw new Error('BAN_RESOLVE_ID');
    await client.api.guilds('613024666079985702').bans(id).delete({ reason });
    return client.users.resolve(user.user);
  }
  updateCommandList(banData, 'ban');
  updateCommandList(unBanData, 'unban');
}
