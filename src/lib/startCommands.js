import { main as ping } from '../commands/ping.js';
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

// Executes the main function from each command's file
export async function startCommands() {
  // Moderation
  ban();
  unban();
  warn();
  kick();
  mute();
  unmute();
  modlogs();
  
  // Listeners
  actionLogging();
  errorListeners();
  setInterval(expiringPunishments, 10000);

  // Misc
  ping();
}