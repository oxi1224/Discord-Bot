import * as fs from 'fs/promises';
import * as configRaw from './config.json' assert {type: 'json'}

class Config {
  constructor(config) {
    this.config = config;
    this.guildId = config.guildId;
    this.loggingChannel = config.loggingChannel;
    this.errorsChannel = config.errorsChannel;
    this.mutedRole = config.mutedRole;
    this.prefix = config.prefix;
    this.emotes = config.emotes;
    this.embedColors = config.colors;
    this.blacklistedRoles = config.blacklistedRoles;
    this.automodConfig = config.automodConfig;
    this.owners = config.owners;
    this.autoDelete = config.autoDelete;
    this.statsChannels = config.statsChannels;
  }

  async #updateConfig(config) {
    this.config = config;
    this.guildId = config.guildId;
    this.loggingChannel = config.loggingChannel;
    this.errorsChannel = config.errorsChannel;
    this.mutedRole = config.mutedRole;
    this.prefix = config.prefix;
    this.emotes = config.emotes;
    this.embedColors = config.colors;
    this.blacklistedRoles = config.blacklistedRoles;
    this.automodConfig = config.automodConfig;
    this.owners = config.owners;
    this.autoDelete = config.autoDelete;
    this.statsChannels = config.statsChannels;
  }

  async setKey(key, value) {
    this.config[key] = value;
    await fs.writeFile('src/lib/config/config.json', JSON.stringify(config, null, 2));
    this.#updateConfig(this.config);
  }
}

export const config = new Config(await configRaw.default);

// export const guildId = config.guild;
// export const loggingChannel = config.loggingChannel;
// export const errorsChannel = config.errorsChannel;
// export const mutedRole = config.mutedRole;
// export const prefix = config.prefix;
// export const emotes = config.emotes;
// export const embedColors = config.colors;
// export const blacklistedRoles = config.blacklistedRoles;

/**
 * messageLimit - Messages it takes before it's counted as spam.
 * timeDifference - The time difference between messages for them to get added to spam message count (ms).
 * expiryTime - The time it takes for the spam messsage count to expire (ms).
 * muteDuration - Duration of the issued mute.
 */
// export const automodConfig = config.automodConfig;

// export const owners = config.owners;
// export const autoDelete = config.autoDelete;

// WHS
// export const statsChannels = config.statsChannels;