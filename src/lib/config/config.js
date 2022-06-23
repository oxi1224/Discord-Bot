import * as configRaw from './config.json' assert {type: 'json'}
const config = configRaw.default;

export const guildId = config.guild;
export const loggingChannel = config.loggingChannel;
export const errorsChannel = config.errorsChannel;
export const mutedRole = config.mutedRole;
export const prefix = config.prefix;
export const emotes = config.emotes;
export const embedColors = config.colors;
export const blacklistedRoles = config.blacklistedRoles;
/**
 * messageLimit - Messages it takes before it's counted as spam.
 * timeDifference - The time difference between messages for them to get added to spam message count (ms).
 * expiryTime - The time it takes for the spam messsage count to expire (ms).
 * muteDuration - Duration of the issued mute.
 */
export const automodConfig = config.automodConfig;
export const owners = config.owners;

// WHS
export const statsChannels = config.statsChannels;