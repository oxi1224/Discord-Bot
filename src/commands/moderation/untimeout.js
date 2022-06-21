import { SlashCommandBuilder } from '@discordjs/builders';
import { logToDb, dmUser, logAction, appendToCommandArray, embed } from '#lib';

export default async function main() {
  // Create untimeout slash commmand
  const untimeoutData = new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('untimeouts given user')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter a user to untimeout')
      .setRequired(true))
    .addStringOption(option => option.setName('reason')
      .setDescription('Enter the untimeout reason')
      .setRequired(false));

  // Untimeouts given user
  async function untimeout({ action, userId, reason, guild, moderator }) {
    if (!userId || !(userId.match(/^[0-9]{15,18}/))) return action.reply(embed.commandFail('Invalid User.'));
    const member = await guild.members.fetch(userId);
    reason = !reason ? 'None' : reason;

    if (!member) return action.reply(embed.notInServer(member));
    if (!member.communicationDisabled) return action.reply(embed.commandFail(`${member} is not timedout.`));

    try {
      await dmUser(member, embed.dm('untimedout', guild, reason));
      await action.reply(embed.punishmentReply('untimedout', member));
    } catch {
      await action.reply(embed.dmFail(member));
    }

    await logToDb(userId, reason, moderator, 'untimeouts');
    await logAction('Member Untimedout', [
      { name: 'User', value: `${member}` },
      { name: 'Reason', value: `\`\`${reason}\`\`` }
    ], { mod: moderator });

    await member.timeout(null, reason);
  }

  appendToCommandArray({
    aliases: ['untimeout'],
    requiredPerms: 'MUTE_MEMBERS',
    slashData: untimeoutData,
    callback: untimeout,
    callbackParamInfo: ['userId', 'reason'],
    helpInfo: {
      title: 'Untimeout Command',
      category: 'Moderation',
      description: 'Untimeout a member of the server.',
      usage: ['untimeout <member> [reason]'],
      examples: ['untimeout @oxi#6219 fixing the bot'],
      aliases: ['untimeout'],
      arguments: [
        {
          argument: '<member>',
          description: 'The member to untimeout.',
          type: 'user or snowflake'
        },
        {
          argument: '[reason]',
          description: 'The reason of the untimeout.',
          type: 'string'
        }
      ]
    }
  });
}