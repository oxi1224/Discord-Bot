import { SlashCommandBuilder } from '@discordjs/builders';
import { updateCommandList } from '../../updateSlashCommands.js';
import { getExpirationDate } from '../../common/getExpirationDate.js';
import { generateModLogID } from '../../common/generateModLogID.js';
import { createUserRow, readFromDb, changeColumnValues, existsRow } from '../../common/db.js';

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
    if (!interaction.isCommand()) return;
    if (!(interaction.commandName === 'ban')) return;
    const banList = await interaction.guild.bans.fetch();
    const userId = interaction.options.get('user').value;
    const userBanList = await readFromDb(userId);
    const reason = (() => {return interaction.options.get('reason') == null ? null : interaction.options.get('reason').value;})();
    // check for appropriate permissions
    if (!(interaction.member.permissions.has('BAN_MEMBERS'))) return interaction.reply('Insufficient Permissions');
    // check if user is already banned
    if (!(banList.find(x => x.user.id === userId) === undefined)) return interaction.reply(`${interaction.options.get('user').user} is already banned`);
    // ban the user
    await interaction.guild.members.ban(userId, { reason: reason })
      .then(interaction.reply(`${interaction.options.get('user').user} has been banned`))
      // .then(async () => {try {client.users.get(userId).send(`You've been banned in `);} catch {}})
      .then(async () => {
        // create user's row if doesn't exist
        if (!(await existsRow(userId))) {
          await createUserRow(userId);
        }
        // get the previous bans
        const bansList = await userBanList[0].bans;
        // update the ban list
        bansList.push({
          moderator: interaction.member.user,
          reason: reason,
          punishmentTime: new Date().getTime(),
          punishmentExpires: getExpirationDate(interaction.options.get('duration').value, new Date().getTime()),
          punishmentId: generateModLogID()
        });
        // sort the updated ban list and update cell in db
        await changeColumnValues(userId, { bans: bansList.sort((a, b) => parseFloat(a.punishmentExpires) - parseFloat(b.punishmentExpires)) });
      });
  });
  // update slash command list
  updateCommandList(banData, 'ban');
}