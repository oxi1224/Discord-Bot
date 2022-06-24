import Conf from 'conf';
import * as template from './configTemplates.js';

const config = new Conf({
  guild: { type: 'string' },
  loggingChannel: { type: 'string' },
  errorsChannel: { type: 'string' },
  mutedRole: { type: 'string' },
  prefix: { type: 'string' },
  owners: { type: 'string[]' },
  colors: { type: 'object' },
  blacklistedRoles: { type: 'object' },
  automodConfig: { type: 'object' },
  statsChannels: { type: 'object' }
});

config.set(template.whs);

export const guildId = config.get('guild');
export const loggingChannel = config.get('loggingChannel');
export const errorsChannel = config.get('errorsChannel');
export const mutedRole = config.get('mutedRole');
export const prefix = config.get('prefix');
export const emotes = config.get('emotes');
export const embedColors = config.get('colors');
export const blacklistedRoles = config.get('blacklistedRoles');
/**
 * messageLimit - Messages it takes before it's counted as spam.
 * timeDifference - The time difference between messages for them to get added to spam message count (ms).
 * expiryTime - The time it takes for the spam messsage count to expire (ms).
 * muteDuration - Duration of the issued mute.
 */
export const automodConfig = config.get('automodConfig');
export const owners = config.get('owners');

// WHS
export const statsChannels = config.get('statsChannels');