import { SlashCommandBuilder } from '@discordjs/builders';
import { logAction, appendToCommandArray, embed, readFromDb, changeColumnValues } from '#lib';

export default async function main(client) {
  // Create hidePunishmentData slash command
  const hidePunishmentData = new SlashCommandBuilder()
    .setName('hide-punishment')
    .setDescription('Hides punishment with specified punishment ID of given user')
    .addStringOption(option => option.setName('punishment_id')
      .setDescription('Punishment ID of the punishment')
      .setRequired(true))
    .addUserOption(option => option.setName('user')
      .setDescription('User whose modlog to delete')
      .setRequired(true));

  // Removes punishment with specificed caseID of given user from modlogs
  async function hidePunishment({ action, userId, moderator, punishmentId }) {
    if (!userId || !(userId.match(/^[0-9]{15,18}/))) return action.reply(embed.commandFail('Invalid user.'));
    
    const punishmentsJson = await readFromDb(userId);
    if (!punishmentsJson) return action.reply(embed.commandFail(`${user} has no punishment history.`));

    const user = await client.users.fetch(userId, false);
    // Connect all punishment type arrays into one
    const usersPunishments = (punishmentsJson.warns).concat(
      punishmentsJson.mutes, punishmentsJson.unmutes, 
      punishmentsJson.bans, punishmentsJson.unbans, 
      punishmentsJson.kicks);
    const punishmentToRemove = usersPunishments.find(punishment => punishment.punishmentId === punishmentId);
    if (!punishmentToRemove) return action.reply(embed.commandFail('No punishment with such ID found'));

    // Punishment type array without specificed modlog 
    const finalPunishmentArray = punishmentsJson[`${punishmentToRemove.punishmentType}s`];
    finalPunishmentArray.splice(punishmentsJson[`${punishmentToRemove.punishmentType}s`].indexOf(punishmentToRemove), 1);
    
    await changeColumnValues(userId, `${punishmentToRemove.punishmentType}s`, finalPunishmentArray);
    logAction('Punishment Removed', [
      { name: 'User', value: `${user}` },
      { name: 'Punishment ID', value: `\`\`${punishmentId}\`\`` },
      { name: 'Punishment Info', value: `**Type**: ${punishmentToRemove.punishmentType} 
      **Reason**: \`\`${punishmentToRemove.reason}\`\`
      **Moderator**: <@${punishmentToRemove.moderator.id}>
      **Punnishment time**: <t:${Math.floor(punishmentToRemove.punishmentTime / 1000)}>
      **Expires**: ${!punishmentToRemove.punishmentExpires ? '``false``' : `<t:${Math.floor(punishmentToRemove.punishmentExpires / 1000)}>`}` }
    ], { mod: moderator });

    action.reply(embed.commandSuccess(`Successfully hidden the punishment with ID \`\`${punishmentId}\`\``));
  }

  appendToCommandArray({
    aliases: ['hide-punishment', 'hide-modlog', 'del-warn'],
    requiredPerms: 'BAN_MEMBERS',
    slashData: hidePunishmentData,
    callback: hidePunishment,
    callbackParamInfo: ['punishmentId', 'userId'],
    helpInfo: {
      title: 'Hide-punishment Command',
      category: 'Moderation',
      description: 'Hides punishment with specificed caseID of given user.',
      usage: ['hide-punishment <punshment ID> <user>'],
      examples: ['hide-punishment @oxi#6219 dQw4w9WgXcQ'],
      aliases: ['hide-punishment', 'hide-modlog', 'del-warn'],
      arguments: [
        {
          argument: '<punishment ID>',
          description: 'The ID of the Punishment (found by using the modlogs command).',
          type: 'punishment ID'
        },
        {
          argument: '<user>',
          description: 'The user whose punishment to hide.',
          type: 'user or snowflake'
        }
      ]
    }
  });
}