import { main as ping } from '../commands/ping.js';
import { main as ban } from '../commands/moderation/ban.js';
import { main as unban } from '../commands/moderation/unban.js';
import { main as logging } from '../commands/moderation/actionLogger.js';
import { main as warn } from '../commands/moderation/warn.js';
import { main as kick } from '../commands/moderation/kick.js';
import { main as expiringPunishments } from '../commands/moderation/expiringPunishments.js';

// Executes the main function from each command's file
export async function startCommands() {
  // moderation
  ping();
  ban();
  unban();
  logging();
  warn();
  kick();
  setInterval(expiringPunishments, 10000);
}