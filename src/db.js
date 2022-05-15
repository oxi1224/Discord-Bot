import { createRequire } from 'module';
import { PG_USER, PG_HOST, PG_PASSWORD, PG_DATABASE, PG_PORT } from './auth.js'; 
const require = createRequire(import.meta.url);
const { Client } = require('pg');

const config = {
  user: PG_USER,
  host: PG_HOST,
  database: PG_DATABASE,
  password: PG_PASSWORD,
  port: PG_PORT,
  ssl: { rejectUnauthorized: false }
};

const client = new Client(config);

// create main table if it doesnt exist
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
  client.end();
}

// create row from user id
export async function createUserRow(id) {
  client.connect();
  await client.query('INSERT INTO punishmentLogs(id, warns, mutes, bans) VALUES($1, $2, $3, $4)', [id, [{}], [{}], [{}]]);
  client.end();
}

// read row from the database
export async function readFromDb(id) {
  client.connect();
  const row = await client.query(
    `SELECT * 
    FROM punishmentLogs 
    WHERE id = ${id}::text`);
  client.end();
  return row.result;
}

// change one or many column values in a row
export async function changeColumnValues(id, { warns = [{}], mutes = [{}], bans = [{}] }) {
  client.connect();
  const query = {
    name: 'change-row-value',
    text: 'UPDATE punishmentLogs SET (warns, mutes, bans) = ($2, $3, $4) WHERE id = $1::text RETURNING *',
    values: [id, warns, mutes, bans],
  };
  client
    .query(query)
    .then(res => console.log(res.rows[0]))
    .catch(e => console.error(e.stack));
  
  client.end();
}

// check if row exists
export async function existsRow(id) {
  client.connect();
  const bool = await client.query(`select exists(select 1 from contact where id=${id}::text`);
  client.end();
  return bool;
}