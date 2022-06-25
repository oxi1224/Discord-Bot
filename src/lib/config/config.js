import * as fs from 'fs/promises';
import * as configRaw from './config.json' assert {type: 'json'}

class Config {
  constructor(config) {
    this.#updateConfig(config);
  }

  #updateConfig(config) {
    this.config = config;
    this.guildId = config.guildId;
    this.owners = config.owners;
    this.prefix = config.prefix;
    this.channels = config.channels;
    this.roles = config.roles;
    this.emotes = config.emotes;
    this.colors = config.colors;
    this.automod = config.automod;
  }

  async setKey(key, value) {
    this.config[key] = value;
    await fs.writeFile('src/lib/config/config.json', JSON.stringify(config, null, 2));
    this.#updateConfig(this.config);
  }
}

export const config = new Config(configRaw.default);