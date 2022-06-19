import { CONNECTION_URL } from './auth.js'; 
import { Sequelize, DataTypes } from 'sequelize';

export const sequelize = new Sequelize(CONNECTION_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  define: {
    timestamps: false
  },
  logging: false
});
const queryInterface = sequelize.getQueryInterface();
let User, ExpiringPunishmentsRow;

// Creates main tables if they don't exist
export async function createLogsTable() {
  await queryInterface.createTable('punishmentLogs', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    warns: DataTypes.ARRAY(DataTypes.JSONB),
    mutes: DataTypes.ARRAY(DataTypes.JSONB),
    unmutes: DataTypes.ARRAY(DataTypes.JSONB),
    bans: DataTypes.ARRAY(DataTypes.JSONB),
    unbans: DataTypes.ARRAY(DataTypes.JSONB),
    kicks: DataTypes.ARRAY(DataTypes.JSONB),
    blocks: DataTypes.ARRAY(DataTypes.JSONB),
    unblocks: DataTypes.ARRAY(DataTypes.JSONB),
    timeouts: DataTypes.ARRAY(DataTypes.JSONB),
    untimeouts: DataTypes.ARRAY(DataTypes.JSONB),
  });

  await queryInterface.createTable('expiringPunishments', {
    id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    punishmentInfo: DataTypes.ARRAY(DataTypes.JSONB)
  });

  await initRowTemplates();
  if (!(await fetchExpiringPunishments())) await ExpiringPunishmentsRow.create({ id: '0', punishmentInfo: [] });
}

// Create row from user id
export async function createUserRow(id) {
  const user = await User.create({
    id: id,
    warns: [],
    mutes: [],
    unmutes: [],
    bans: [],
    unbans: [],
    kicks: [],
    blocks: [],
    unblocks: [],
    timeouts: [],
    untimeouts: [],
  });
  user.save();
}

/**
 * Searches the punishmentLogs table to find punishment data of specificed user.
 * @param {string} id - ID of the user whose information you want to get.
 * @returns {(object[]|null)} Punishment data of specified user.
 */
export async function readFromDb(id) {
  const row = await User.findOne({
    where: {
      id: id
    }
  });
  return !row ? null : row.dataValues;
}

/**
 * Replaces a column in specified user's row with provided data.
 * @param {string} id - ID of the user whose logs you want to modify.
 * @param {string} column - The column which will get changed.
 * @param {object[]} data - The data that will replace the old one.
 */
export async function changeColumnValues(id, column, data) {
  const user = await User.findOne({ where: { id: id } });
  user[column] = data;
  await user.save();
}

/**
 * Checks if user has a row.
 * @param {string} id - ID of the user. 
 * @returns {boolean}
 */
export async function existsRow(id) {
  const response = await readFromDb(id);
  return !response ? false : true;
}

/**
 * Replaces old information in the expiringPunishments table with new data.
 * @param {object[]} expiringPunishments - Data that will replace the old information.
 */
export async function updateExpiringPunishments(expiringPunishments) {
  const row = await ExpiringPunishmentsRow.findOne({ where: { id: '0' } });
  row.punishmentInfo = expiringPunishments;
  await row.save();
}

/**
 * Fetches data from the expiringPunishments table.
 * @returns {object[]} The data of he expiringPunishments table.
 */
export async function fetchExpiringPunishments() {
  const response = await ExpiringPunishmentsRow.findOne({
    where: {
      id: '0'
    }
  });
  return !response ? null : response.dataValues.punishmentInfo;
}

async function initRowTemplates() {
  User = sequelize.define('User', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    warns: DataTypes.ARRAY(DataTypes.JSONB),
    mutes: DataTypes.ARRAY(DataTypes.JSONB),
    unmutes: DataTypes.ARRAY(DataTypes.JSONB),
    bans: DataTypes.ARRAY(DataTypes.JSONB),
    unbans: DataTypes.ARRAY(DataTypes.JSONB),
    kicks: DataTypes.ARRAY(DataTypes.JSONB),
    blocks: DataTypes.ARRAY(DataTypes.JSONB),
    unblocks: DataTypes.ARRAY(DataTypes.JSONB),
    timeouts: DataTypes.ARRAY(DataTypes.JSONB),
    untimeouts: DataTypes.ARRAY(DataTypes.JSONB),
  }, {
    tableName: 'punishmentLogs'
  });

  ExpiringPunishmentsRow = sequelize.define('ExpiringPunishmentsRow', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    punishmentInfo: DataTypes.ARRAY(DataTypes.JSONB)
  }, {
    tableName: 'expiringPunishments'
  });
}