import { CONNECTION_STRING } from './auth.js'; 
import { Sequelize, DataTypes } from 'sequelize';

export const sequelize = new Sequelize(CONNECTION_STRING, {
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

// Create main table if it doesnt exist
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
    kicks: DataTypes.ARRAY(DataTypes.JSONB)
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
    kicks: []
  });
  user.save();
}

// Read row from the database
export async function readFromDb(id) {
  const row = await User.findOne({
    where: {
      id: id
    }
  });
  return !row ? null : row.dataValues;
}

// Change one or many column values in a row
export async function changeColumnValues(id, column, data) {
  const user = await User.findOne({ where: { id: id } });
  user[column] = data;
  await user.save();
}

// Check if row exists
export async function existsRow(id) {
  const response = await readFromDb(id);
  return !response ? false : true;
}

// Update the expiringPunishments database with updated punishment list
export async function updateExpiringPunishments(expiringPunishments) {
  const row = await ExpiringPunishmentsRow.findOne({ where: { id: '0' } });
  row.punishmentInfo = expiringPunishments;
  await row.save();
}

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
    kicks: DataTypes.ARRAY(DataTypes.JSONB)
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