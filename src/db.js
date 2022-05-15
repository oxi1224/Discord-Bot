import { createRequire } from 'module';
import { PG_USER, PG_HOST, PG_PASSWORD, PG_DATABASE, PG_PORT } from './auth.js'; 
const require = createRequire(import.meta.url);
const { Client, Pool } = require('pg');

const config = {
  user: PG_USER,
  host: PG_HOST,
  database: PG_DATABASE,
  password: PG_PASSWORD,
  port: PG_PORT,
  ssl: { rejectUnauthorized: false }
};

export const client = new Client(config);
export const pool = new Pool(config);

export async function createLogsTable() {
  client.connect();
  const createTableText = `
  CREATE TABLE IF NOT EXISTS punishmentLogs (
    id text,
    warns JSONB [],
    mutes JSONB [],
    bans JSONB []
  );
  `;
  await client.query(createTableText);
  await changeRowValues('1', { warns: ['test', 'test2'], mutes: ['test3', 'test4'], bans: ['test5', 'test6'] });
  console.log(await client.query('SELECT * FROM punishmentLogs'));
  client.end();
}

export async function createUserRow(id) {
  // client.connect();
  await client.query('INSERT INTO punishmentLogs(id, warns, mutes, bans) VALUES($1, $2, $3, $4)', [id, [], [], []]);
  // client.end();
}

export async function readFromDb(id) {
  client.connect();
  const row = await client.query(
    `SELECT * 
    FROM punishmentLogs 
    WHERE id = ${id}::text`);
  client.end();
  return row.result.rows;
}

// FINISH THIS FUNCTION BECAUSE IT ERRORS
export async function changeRowValues(id, { warns = [], mutes = [], bans = [] }) {
  await client.query(
    `UPDATE punishmentLogs
    SET (warns, mutes, bans) = (${warns}, ${mutes}, ${bans})
    WHERE id = ${id}::text`
  );
}

export async function existsRow(id) {
  return await client.query(`select exists(select 1 from contact where id=${id}::text`);
}