import { SlashCommandBuilder } from '@discordjs/builders';
import { embed, appendToCommandArray } from '#lib';

export default async function main(client) {
  // create avatar slash commmand
  const avatarData = new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('gets the avatar of a user')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter the user whose avatar you want to see')
      .setRequired(false));

  async function getAvatar({ action, userId }) {
    if (userId && !(userId.match(/^[0-9]{15,18}/))) return action.reply(await embed.commandFail('Invalid User.'));
    const user = userId ? await client.users.fetch(userId) : action.author || action.member.user;
    await action.reply(await embed.createReplyEmbed({
      title: `${user.username}#${user.discriminator}'s Avatar`,
      image: user.displayAvatarURL()
    }));
  }

  appendToCommandArray({
    aliases: ['avatar', 'av'], 
    slashData: avatarData,
    callback: getAvatar,
    helpInfo: {
      title: 'Avatar Command',
      category: 'Info',
      description: 'Gets the avatar of a user.',
      usage: ['avatar [user]'],
      examples: ['avatar', 'avatar @oxi#6219'],
      aliases: ['avatar', 'av'],
      arguments: [
        {
          argument: '[user]',
          description: 'The user whose avatar to check.',
          type: 'user or snowflake'
        }
      ]
    }
  });
}