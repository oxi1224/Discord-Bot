import { main as ping } from '../commands/info/ping.js';
import { main as ban } from '../commands/moderation/ban.js';
import { main as unban } from '../commands/moderation/unban.js';
import { main as actionLogging } from '../listeners/actionListeners.js';
import { main as warn } from '../commands/moderation/warn.js';
import { main as kick } from '../commands/moderation/kick.js';
import { main as expiringPunishments } from '../listeners/expiringPunishments.js';
import { main as modlogs } from '../commands/moderation/modlogs.js';
import { main as errorListeners } from '../listeners/errorListeners.js';
import { main as mute } from '../commands/moderation/mute.js';
import { main as unmute } from '../commands/moderation/unmute.js';
import { main as purge } from '../commands/moderation/purge.js';
import { initializeCommands, appendToCommandArray } from './commandHandler.js';

// Executes the main function from each command's file
export async function startCommands(client) {
  // Moderation
  ban(client);
  unban(client);
  warn(client);
  kick(client);
  mute();
  unmute();
  modlogs();
  purge();

  // Listeners
  actionLogging(client);
  errorListeners(client);
  setInterval(() => expiringPunishments(client), 10000);

  // Info
  ping(client);

  initializeCommands(client, appendToCommandArray({ finalize: true }));
}