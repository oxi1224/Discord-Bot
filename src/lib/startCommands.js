import * as command from '#commands';
import * as listener from '#listeners';
import { initializeCommands, appendToCommandArray } from './commandHandler.js';

// Runs appendToCommandArray function in each file then runs initializeCommands.
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
  command.block();
  command.unblock();

  // Listeners
  listener.actionListeners(client);
  listener.errorListeners(client);
  listener.automod(client);
  setInterval(() => listener.expiringPunishments(client), 10000);

  // Info
  command.ping(client);
  command.avatar(client);
  command.userInfo(client);
  command.help();

  initializeCommands(client, appendToCommandArray({ finalize: true }));
}