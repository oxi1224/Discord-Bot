import { SlashCommandBuilder } from '@discordjs/builders';
import { appendToCommandArray, embed, config } from '#lib';

export default async function main() {
  // Create role slash command
  const roleData = new SlashCommandBuilder()
    .setName('role')
    .setDescription('Adds or removes a role from a user.')
    .addStringOption(option => option.setName('function')
      .setDescription('Decide whether to add or remove a role')
      .setRequired(true)
      .addChoices(
        { name: 'Add', value: 'add' },
        { name: 'Remove', value: 'remove' },
      ))
    .addUserOption(option => option.setName('user')
      .setDescription('The user who will obtain or get the role removed.')
      .setRequired(true))
    .addRoleOption(option => option.setName('role')
      .setDescription('Enter the role to add or remove')
      .setRequired(true));

  // Adds or removes a role from given user
  async function manageRole({ action, roleFunction, userId, roleInfo, guild }) {
    if (!userId || !(userId.match(/^[0-9]{15,18}/))) return action.reply(embed.commandFail('Invalid user.'));
    const member = await guild.members.fetch(userId, false);
    if (!member) return action.reply(embed.notInServer(`<@${userId}>`));

    roleInfo = Array.isArray(roleInfo) ? roleInfo.join(' ') : roleInfo;

    // Check if roleInfo is the name or ID of a role then get role object
    const role = await (async () => {
      if (roleInfo.match(/^\d+/)) return config.roles.roleBlacklisted.ids.includes(roleInfo) ? 'blacklisted role' : await guild.roles.cache.find(Role => Role.id === roleInfo);
      return config.roles.roleBlacklisted.names.includes(roleInfo.toLowerCase()) ? 'blacklisted role' : await guild.roles.cache.find(Role => Role.name === roleInfo);
    })();
    if (role === 'blacklisted role') return action.reply(embed.commandFail('Cannot modify blacklisted roles.'));
    if (!role) return action.reply(embed.commandFail('No such role found.'));

    switch (roleFunction.toLowerCase()) {

    case 'ra':
    case 'add':
      try {
        await member.roles.add(role);
        action.reply(embed.commandSuccess(`Successfully added ${role} to ${member}.`));
      } catch { action.reply(embed.commandFail(`${role} is higher in hierarchy than me.`)); }
      break;

    case 'rm':
    case 'remove':
      try {
        await member.roles.remove(role);
        action.reply(embed.commandSuccess(`Successfully removed ${role} from ${member}.`));
      } catch { action.reply(embed.commandFail(`${role} is higher in hierarchy than me.`)); }
      break;

    default:
      action.reply(embed.commandFail('Unknow function (must be add or remove)'));
    }
  }

  appendToCommandArray({
    aliases: ['role', 'ra', 'rm'],
    requiredPerms: 'BAN_MEMBERS',
    slashData: roleData,
    callback: manageRole,
    callbackParamInfo: ['roleFunction', 'userId', 'roleInfo'],
    helpInfo: {
      title: 'Role Command',
      category: 'Moderation',
      description: 'Adds or removes a role from a user.',
      usage: ['role <function> <user> <role>'],
      examples: [
        'role add @oxi#6219 muted',
        'role remove @oxi#6219 muted'
      ],
      aliases: ['role', 'ra (role add)', 'rm (role remove)'],
      arguments: [
        {
          argument: '<function>',
          description: 'The function of the ban.',
          type: 'add or remove',
        },
        {
          argument: '<user>',
          description: 'The user to ban.',
          type: 'user or snowflake'
        },
        {
          argument: '<role>',
          description: 'The role to add or remove.',
          type: 'role name or role id'
        }
      ]
    }
  });
}