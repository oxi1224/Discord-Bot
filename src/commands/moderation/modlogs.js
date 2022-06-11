import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { readFromDb, appendToCommandArray, embed } from '#lib';

export default async function main() {
  // Create ban slash command
  const modlogsData = new SlashCommandBuilder()
    .setName('modlogs')
    .setDescription('Shows the modlogs of given user')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter whose modlogs to show')
      .setRequired(true));

  async function showModlogs({ action, userId }) {
    if (userId === null || !(userId.match(/^[0-9]{15,18}/))) return action.reply(await embed.punishmentFail('Invalid User.'));
    const punishmentsJson = await readFromDb(userId);
    if (!punishmentsJson) return await action.reply(await embed.punishmentFail('User has no modlogs'));
    const usersPunishments = (punishmentsJson.warns).concat(
      punishmentsJson.mutes, punishmentsJson.unmutes, 
      punishmentsJson.bans, punishmentsJson.unbans, 
      punishmentsJson.kicks
    );
    usersPunishments.sort((a, b) => parseFloat(a.punishmentTime) - parseFloat(b.punishmentTime));
    
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
Expires: ${el.punishmentExpires === null ? '``false``' : `<t:${Math.floor(el.punishmentExpires / 1000)}>`}
Modlog ID: \`\`${el.punishmentId}\`\``));
    await action.reply({ embeds: [modlogEmbed], components: [buttonsRow] });
  }

  appendToCommandArray({
    aliases: ['modlogs'],
    requiredPerms: 'BAN_MEMBERS',
    slashData: modlogsData,
    callback: showModlogs
  });
}