import { createRequire } from 'module';
import { PG_USER, PG_HOST, PG_PASSWORD, PG_DATABASE, PG_PORT } from './auth.js'; 
const require = createRequire(import.meta.url);
const { Client } = require('pg');

const config = {
  host: PG_HOST,
  port: PG_PORT,
  database: PG_DATABASE,
  user: PG_USER,
  password: PG_PASSWORD,
  ssl: { rejectUnauthorized: false }
};

export const client = new Client(config);

// create main table if it doesnt exist
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
  (await client.query('SELECT * FROM expiringPunishments')).rows.length < 1 ?
    await client.query('INSERT INTO expiringPunishments(id, punishmentInfo) VALUES($1, $2)', ['0', []]) : null;
}

// create row from user id
export async function createUserRow(id) {
  await client.query('INSERT INTO punishmentLogs(id, warns, mutes, unmutes, bans, unbans, kicks) VALUES($1, $2, $3, $4, $5, $6, $7)', [id, [], [], [], [], [], []]);
}

// read row from the database
export async function readFromDb(id) {
  const row = await client.query(
    `SELECT * 
    FROM punishmentLogs
    WHERE id = ${id}::text`);
  return row.rows;
}

// change one or many column values in a row
export async function changeColumnValues(id, column, data) {
  client
    .query(`UPDATE punishmentLogs SET ${column}=$2 WHERE id = $1::text`, [id, data])
    .then(res => console.log(res.rows[0]))
    .catch(e => console.error(e.stack));
}

// check if row exists
export async function existsRow(id) {
  const response = await client.query(`select 1 from punishmentLogs where id=${id}::text`);
  return response.rows.length < 1 ? false : true;
}