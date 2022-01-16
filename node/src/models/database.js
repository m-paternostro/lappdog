import mysql2 from 'mysql2';

const poolMap = {};

const createPool = (database) => mysql2.createPool(
  {
    host: process.env.LAPPDOG_DB_HOST,
    port: process.env.LAPPDOG_DB_PORT,
    user: process.env.LAPPDOG_DB_USER,
    password: process.env.LAPPDOG_DB_PASSWORD,
    database,
  },
).promise();

const getPool = async (database) => poolMap[database] || (poolMap[database] = createPool(database));

const executeQuery = async (connection, query) => {
  const [rows] = await connection.query(query);
  return rows;
};

const executeQueries = async (database, ...queries) => {
  if (queries.length > 0) {
    const pool = await getPool(database);
    const connection = await pool.getConnection();
    try {
      const results = await Promise.all(queries.map((query) => executeQuery(connection, query)));
      return queries.length === 1 ? results[0] : results;
    } finally {
      await connection.release();
    }
  }
  return undefined;
};

const executeStatement = async (database, statement, placeholderValues) => {
  const pool = await getPool(database);
  await pool.query(statement, placeholderValues);
  return true;
};

const end = async (database) => {
  const pool = poolMap[database];
  if (pool) {
    delete poolMap[database];
    await pool.end();
    console.log(`Database pool for '${database}' closed.`);
  }
};

export default (database) => ({
  query: async (...queries) => executeQueries(database, ...queries),
  execute: async (statement, placeholderValues) => executeStatement(database, statement, placeholderValues),
  end: async () => end(database),
});
