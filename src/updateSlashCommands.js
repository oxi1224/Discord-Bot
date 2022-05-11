import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { CLIENT_ID, GUILD_ID, TOKEN } from './auth.js';

const rest = new REST({ version: '9' }).setToken(TOKEN);
const commands = [];

export async function updateCommandList(name, description) {
  commands.push({
      name: name,
      description: description
  });
  try {
      console.log('Started refreshing application (/) commands.');

  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands },
  );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}