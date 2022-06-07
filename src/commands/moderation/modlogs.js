import { SlashCommandBuilder } from '@discordjs/builders';
import { updateSlashCommands } from '../../lib/updateSlashCommands.js';
import { readFromDb } from '../../lib/common/db.js';
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { emotes, prefix } from '../../lib/config/config.js';
import * as embed from '../../lib/util/embeds.js';

export async function main() {
  const { client } = await import('../../bot.js');

  // Listen for ban commands
  client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(1).trim().split(' ').filter(str => str !== '');
    const command = args.shift().toLowerCase();
    if (!(command == 'modlogs')) return;
    if (!(message.member.permissions.has('BAN_MEMBERS'))) return message.react(emotes.error);

    const userId = await (async () => {
      try { return message.mentions.users.first() === undefined ? args[0].replace(/[\\<>@#&!]/g, '') : message.mentions.users.first().id; } 
      catch { return null; }
    })();
    if (userId === null || !(userId.match(/^[0-9]{15,18}/))) return message.channel.send(await embed.punishmentFail('Invalid User.'));

    await showModlogs(userId, message);
  });

  // Create ban slash command
  const modlogs = new SlashCommandBuilder()
    .setName('modlogs')
    .setDescription('Shows the modlogs of given user')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter whose modlogs to show')
      .setRequired(true));
  
  // Listen for ban interactions
  client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (!(interaction.commandName === 'modlogs')) return;
    if (!(interaction.member.permissions.has('BAN_MEMBERS'))) return interaction.reply({ content: 'Insufficient Permissions', ephemeral: true });
    
    const userId = interaction.options.get('user').value;
    await showModlogs(userId, interaction);
  });

  updateSlashCommands(modlogs, 'modlogs');

  async function showModlogs(userId, action) {
    const punishmentsJson = (await readFromDb(userId))[0];
    if (!punishmentsJson) return await action.reply(await embed.punishmentFail('User has no modlogs'));
    const usersPunishments = (punishmentsJson.warns).concat(
      punishmentsJson.mutes, punishmentsJson.unmutes, 
      punishmentsJson.bans, punishmentsJson.unbans, 
      punishmentsJson.kicks
    );
    usersPunishments.sort((a, b) => parseFloat(b.punishmentTime) - parseFloat(a.punishmentTime));
    
    const modlogEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`${userId}'s modlogs`)
      .setTimestamp();
  
    const buttonsRow = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('modlog-delete')
          .setLabel('Delete')
          .setStyle('DANGER')
      );

    usersPunishments.forEach(el => modlogEmbed.addField(`Type: ${el.punishmentType}`, `Reason: \`\`${el.reason}\`\`
Moderator: <@${el.moderator.id}>
Punnishment time: <t:${Math.floor(el.punishmentTime / 1000)}>
Expires: \`\`${el.punishmentExpires === null ? 'false' : `<t:${Math.floor(el.punishmentExpires / 1000)}>`}\`\`
Modlog ID: \`\`${el.punishmentId}\`\``));
    await action.reply({ embeds: [modlogEmbed], components: [buttonsRow] });
  }
  client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    if (!interaction.customId == 'modlog-delete') return;
    if (!interaction.member.permissions.has('MANAGE_MESSAGES')) return;
    await interaction.message.delete();
  });
}