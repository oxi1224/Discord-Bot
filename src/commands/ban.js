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
    const banList = await interaction.guild.bans.fetch();
    if (!interaction.isCommand()) return;
    if (interaction.commandName === 'ban') {
      // check for appropriate permissions
      if (interaction.member.permissions.has('BAN_MEMBERS')) {
        // check if user is already banned
        if (!(banList.find(x => x.user.id === interaction.options.get('user').value) === undefined)) return interaction.reply(`${interaction.options.get('user').user} is already banned`);
        // ban the user
        await interaction.options.get('user').member.ban().then(interaction.reply(`${interaction.options.get('user').user} has been banned`));
      } else { interaction.reply('Insufficient Permissions'); }
    }
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
    const banList = await interaction.guild.bans.fetch();
    if (!interaction.isCommand()) return;
    if (interaction.commandName === 'unban') {
      // check for appropriate permissions
      if (interaction.member.permissions.has('BAN_MEMBERS')) {
        // check if user is banned
        if (banList.find(x => x.user.id === interaction.options.get('user').value) === undefined) return interaction.reply(`${interaction.options.get('user').user} is not banned`);
        // call the unban function
        await unBan(interaction.options.get('user')).then(interaction.reply(`${interaction.options.get('user').user} has been unbanned`));
      } else { interaction.reply('Insufficient Permissions'); }
    }
  });

  // unbans given user with given reason
  async function unBan(user, reason) {
    const id = client.users.resolveId(user.user);
    if (!id) throw new Error('BAN_RESOLVE_ID');
    await client.api.guilds('613024666079985702').bans(id).delete({ reason });
    return client.users.resolve(user.user);
  }

  // update slash command list
  updateCommandList(banData, 'ban');
  updateCommandList(unBanData, 'unban');
}
