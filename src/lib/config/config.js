import * as configRaw from './config.json' assert {type: 'json'}
const config = configRaw.default;

export const guildId = config.guild;
export const loggingChannel = config.loggingChannel;
export const errorsChannel = config.errorsChannel;
export const mutedRole = config.mutedRole;
export const prefix = config.prefix;
export const emotes = config.emotes;
export const embedColor = config.colors;