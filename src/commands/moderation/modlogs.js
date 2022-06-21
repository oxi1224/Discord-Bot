import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { readFromDb, appendToCommandArray, embed } from '#lib';

export default async function main(client) {
  // Create ban slash command
  const modlogsData = new SlashCommandBuilder()
    .setName('modlogs')
    .setDescription('Shows the modlogs of given user')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter whose modlogs to show')
      .setRequired(true));

  async function showModlogs({ action, userId }) {
    if (!userId || !(userId.match(/^[0-9]{15,18}/))) return action.reply(embed.commandFail('Invalid User.'));
    const punishmentsJson = await readFromDb(userId);
    if (!punishmentsJson) return await action.reply(embed.commandFail('User has no modlogs'));
    const usersPunishments = (punishmentsJson.warns).concat(
      punishmentsJson.mutes, punishmentsJson.unmutes, 
      punishmentsJson.bans, punishmentsJson.unbans, 
      punishmentsJson.kicks, punishmentsJson.blocks,
      punishmentsJson.unblocks
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

    usersPunishments.forEach(el => {
      modlogEmbed.addField(`Type: ${el.punishmentType}`, `
Reason: \`\`${el.reason}\`\`
Moderator: <@${el.moderator.id}>
Punnishment time: <t:${Math.floor(el.punishmentTime / 1000)}>
Expires: ${!el.punishmentExpires ? '``false``' : `<t:${Math.floor(el.punishmentExpires / 1000)}>`}
Modlog ID: \`\`${el.punishmentId}\`\`
    `.trim());

      if (el.punishmentType !== 'unblock' || el.punishmentType !== 'block') return;
      modlogEmbed.addField(`Type: ${el.punishmentType}`, `
Channel: ${el.additionalInfo.channel}
Reason: \`\`${el.reason}\`\`
Moderator: <@${el.moderator.id}>
Punnishment time: <t:${Math.floor(el.punishmentTime / 1000)}>
Expires: ${!el.punishmentExpires ? '``false``' : `<t:${Math.floor(el.punishmentExpires / 1000)}>`}
Modlog ID: \`\`${el.punishmentId}\`\`
    `.trim());
    });
    await action.reply({ embeds: [modlogEmbed], components: [buttonsRow] });
  }

  client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    if (!interaction.customId == 'modlog-delete') return;
    if (!interaction.member.permissions.has('MANAGE_MESSAGES')) return;
    await interaction.message.delete();
  });

  appendToCommandArray({
    aliases: ['modlogs'],
    requiredPerms: 'BAN_MEMBERS',
    slashData: modlogsData,
    callback: showModlogs,
    callbackParamInfo: ['userId'],
    helpInfo: {
      title: 'Modlogs Command',
      category: 'Moderation',
      description: 'Checks the modlogs of a user.',
      usage: ['modlogs <user>'],
      examples: ['modlogs @oxi#6219'],
      aliases: ['modlogs'],
      arguments: [
        {
          argument: '<user>',
          description: 'The user whose modlogs to check.',
          type: 'user or snowflake'
        },
      ]
    }
  });
}