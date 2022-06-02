import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { CLIENT_ID, TOKEN } from './common/auth.js';
import { guildId } from './config/config.js';

const rest = new REST({ version: '9' }).setToken(TOKEN);
const commands = [];

export async function updateSlashCommands(data, name) {
  commands.push(data);
  try {
    console.log(`Updating ${name} (/) command`);
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, '508779434929815554'),
      { body: commands },
    );
    console.log(`Successfully reloaded ${name} (/) command.`);
  } catch (error) {
    console.error(error);
  }
}