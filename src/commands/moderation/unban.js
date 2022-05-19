import { SlashCommandBuilder } from '@discordjs/builders';
import { updateCommandList } from '../../lib/updateSlashCommands.js';

export async function main() {
  const { client } = await import('../../bot.js');

  // unbans given user with given reason
  async function unBan(user, reason) {
    const id = client.users.resolveId(user.user);
    if (!id) throw new Error('BAN_RESOLVE_ID');
    await client.api.guilds('613024666079985702').bans(id).delete({ reason: reason });
    return client.users.resolve(user.user);
  }
  
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
    // check for appropriate permissions
    if (!(interaction.member.permissions.has('BAN_MEMBERS'))) return interaction.reply('Insufficient Permissions');
    // check if user is banned
    if (banList.find(x => x.user.id === interaction.options.get('user').value) === undefined) return interaction.reply(`${interaction.options.get('user').user} is not banned`);
    // call the unban function
    await unBan(interaction.options.get('user')).then(interaction.reply(`${interaction.options.get('user').user} has been unbanned`));
  });

  // update slash command list
  updateCommandList(unBanData, 'unban');
}