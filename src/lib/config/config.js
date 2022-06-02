/* eslint-disable */
import config from './config.json' assert {type: 'json'};

export const guildId = config.guild;
export const loggingChannel = config.loggingChannel;
export const errorsChannel = config.errorsChannel;
export const mutedRole = config.mutedRole;
export const errorEmote = config.emotes.error;
export const successEmote = config.emotes.success;
export const infoEmote = config.emotes.info;