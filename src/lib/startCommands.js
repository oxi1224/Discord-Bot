import { main as ping } from '../commands/ping.js';
import { main as ban } from '../commands/moderation/ban.js';
import { main as unban } from '../commands/moderation/unban.js';
import { main as logging } from '../commands/moderation/actionLogger.js';
import { main as warn } from '../commands/moderation/warn.js';

export async function startCommands() {
  // moderation
  ping();
  ban();
  unban();
  logging();
  warn();
}