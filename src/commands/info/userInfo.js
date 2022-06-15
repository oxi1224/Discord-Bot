import humanizeDuration from 'humanize-duration';
import { SlashCommandBuilder } from '@discordjs/builders';
import { embed, appendToCommandArray } from '#lib';

export default async function main(client) {
  // create userInfo slash commmand
  const userInfoData = new SlashCommandBuilder()
    .setName('user')
    .setDescription('get info about a user')
    .addUserOption(option => option.setName('user')
      .setDescription('Enter the user who you want to see info about')
      .setRequired(false));

  async function getUserInfo({ action, userId, guild }) {
    if (userId && !(userId.match(/^[0-9]{15,18}/))) return action.reply(await embed.commandFail('Invalid User.'));
    const user = userId ? await client.users.fetch(userId) : action.author || action.member.user;
    const member = await (async () => { 
      try { 
        if (userId) return await guild.members.fetch(userId); 
        return await guild.members.fetch(action.author || action.member.user);
      } catch { return null; } })();

    const embedTemplate = {
      author: { name: `${user.username}#${user.discriminator}`, iconURL: user.displayAvatarURL() },
      thumbnail: user.displayAvatarURL(),
      description: `${user}`,
      fields: [
        { 
          name: 'Created at:', 
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}>\n(${humanizeDuration(user.createdTimestamp - new Date().getTime(), { largest: 3 })})`,
          inline: true 
        },
      ],
      footer: { text: `ID: ${user.id}` },
      timestamp: true
    };

    if (member) {
      embedTemplate.fields.push(
        { 
          name: 'Joined at:', 
          value: `<t:${Math.floor(member.joinedTimestamp / 1000)}>\n(${humanizeDuration(member.joinedTimestamp - new Date().getTime(), { largest: 3 })})`,
          inline: true 
        },
        { name: 'Presence', value: `» **Status**: ${member.presence.status} \n${getActivities(member)}` }
      );
      member._roles ? embedTemplate.fields.push({ name: `Roles [${member._roles.length}]`, 
        value: `${member._roles.length !== 0 ? member._roles.map(role => `<@&${role}>`).join(' ') : 'User has no roles'}` }) : null;
      embedTemplate.color = member.displayHexColor;
    }
    await action.reply(await embed.createReplyEmbed(embedTemplate));
  }

  function getActivities(member) {
    const dataToAdd = [];
    if (!member.presence.activities || member.presence.activities.length === 0) return '';
    member.presence.activities.forEach(activity => {
      if (activity.name === 'Custom Status') {
        dataToAdd.push(`» **Custom Status**: \`\`${activity.state}\`\``);
        return;
      }
      dataToAdd.push(`» **Activity**: \`\`${activity.name}\`\``);
    });
    return dataToAdd.join('\n');
  }

  appendToCommandArray({
    aliases: ['user', 'user-info', 'userinfo', 'whois'], 
    slashData: userInfoData,
    callback: getUserInfo,
    helpInfo: {
      title: 'User Info Command',
      category: 'Info',
      description: 'Gets info about a user.',
      usage: ['user [user]'],
      examples: ['user', 'user @oxi#6219'],
      aliases: ['user', 'user-info', 'userinfo', 'whois'],
      arguments: [
        {
          argument: '[user]',
          description: 'The user who you want to see info about.',
          type: 'user or snowflake'
        }
      ]
    }
  });
}