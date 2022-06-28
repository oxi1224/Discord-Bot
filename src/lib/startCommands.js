import * as command from '#commands';
import * as listener from '#listeners';
import * as whs from '#whs';
import { initializeCommands, appendToCommandArray, config } from '#lib';

// Runs appendToCommandArray function in each file then runs initializeCommands.
export async function startCommands(client) {
  await config;

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
  command.timeout();
  command.untimeout();

  // Config
  command.setAutoDeleteConfig();
  command.toggleAutomod();

  // Info
  command.ping(client);
  command.avatar(client);
  command.userInfo(client);
  command.help();

  // Other
  command.suggest(client);

  // Dev
  command.evalCode(client);

  // WHS stuff
  setInterval(() => whs.stats(client), 60000);

  // Listeners
  listener.actionListeners(client);
  listener.errorListeners(client);
  listener.automod(client);
  setInterval(() => listener.expiringPunishments(client), 60000);

  initializeCommands(client, appendToCommandArray({ finalize: true }));
}