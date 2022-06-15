import * as command from '#commands';
import * as listener from '#listeners';
import { initializeCommands, appendToCommandArray } from './commandHandler.js';

// Executes the main function from each command's file
export async function startCommands(client) {
  // Moderation
  command.ban(client);
  command.unban(client);
  command.warn(client);
  command.kick(client);
  command.modlogs(client);
  command.hidePunishment(client);
  command.role();
  command.mute();
  command.unmute();
  command.purge();

  // Listeners
  listener.actionListeners(client);
  listener.errorListeners(client);
  setInterval(() => listener.expiringPunishments(client), 10000);

  // Info
  command.ping(client);
  command.help();

  initializeCommands(client, appendToCommandArray({ finalize: true }));
}