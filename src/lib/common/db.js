import { createRequire } from 'module';
import { CONNECTION_STRING } from './auth.js'; 
const require = createRequire(import.meta.url);
const { Client } = require('pg');

const config = {
  connectionString: CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  }
};

export const client = new Client(config);

// Create main table if it doesnt exist
export async function createLogsTable() {
  client.connect();
  const createTableText = `
  CREATE TABLE IF NOT EXISTS punishmentLogs (
    id text,
    warns JSONB [],
    mutes JSONB [],
    unmutes JSONB [],
    bans JSONB [],
    unbans JSONB [],
    kicks JSONB []
  );

  CREATE TABLE IF NOT EXISTS expiringPunishments (
    id text,
    punishmentInfo JSONB []
  );
  `;
  await client.query(createTableText);
  console.log((await readFromDb('344452070360875008'))[0].mutes);
  (await client.query('SELECT * FROM expiringPunishments')).rows.length < 1 ?
    await client.query('INSERT INTO expiringPunishments(id, punishmentInfo) VALUES($1, $2)', ['0', []]) : null;
}

// Create row from user id
export async function createUserRow(id) {
  await client.query('INSERT INTO punishmentLogs(id, warns, mutes, unmutes, bans, unbans, kicks) VALUES($1, $2, $3, $4, $5, $6, $7)', [id, [], [], [], [], [], []]);
}

// Read row from the database
export async function readFromDb(id) {
  const row = await client.query(
    `SELECT * 
    FROM punishmentLogs
    WHERE id = ${id}::text`);
  return row.rows;
}

// Change one or many column values in a row
export async function changeColumnValues(id, column, data) {
  client
    .query(`UPDATE punishmentLogs SET ${column}=$2 WHERE id = $1::text`, [id, data])
    .then(res => console.log(res.rows[0]))
    .catch(e => console.error(e.stack));
}

// Check if row exists
export async function existsRow(id) {
  const response = await client.query(`select 1 from punishmentLogs where id=${id}::text`);
  return response.rows.length < 1 ? false : true;
}

// Update the expiringPunishments database with updated punishment list
export async function updateExpiringPunishments(expiringPunishments) {
  await client.query('UPDATE expiringPunishments SET punishmentInfo=$1 WHERE id=0::text', [expiringPunishments])
    .then(res => console.log(res.rows[0]))
    .catch(e => console.error(e.stack));
}

export async function fetchExpiringPunishments() {
  return await (await client.query('SELECT punishmentInfo FROM expiringPunishments WHERE id=0::text')).rows[0].punishmentinfo;
}