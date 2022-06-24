import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { CLIENT_ID, TOKEN } from '#auth';
import { guildId } from '#lib';

const rest = new REST({ version: '9' }).setToken(TOKEN);
const commands = [];

/**
 * Updates slash commands with new ones.
 * @param {object} data - Data of the slash command. 
 * @param {string} name - The name of the slash command.
 */
export async function updateSlashCommands(data, name) {
  commands.push(data);
  try {
    console.log(`Updating ${name} (/) command`);
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, guildId),
      { body: commands },
    );
    console.log(`Successfully reloaded ${name} (/) command.`);
  } catch (error) {
    console.error(error);
  }
}