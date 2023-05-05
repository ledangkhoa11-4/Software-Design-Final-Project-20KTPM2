import knex from 'knex';

class Database {
  constructor() {
    if (!Database.instance) {
        console.log("Connecting database...")
      Database.instance = knex({
        client: 'mysql',
        connection: {
          host: 'sql615.main-hosting.eu',
          port: 3306,
          user: 'u123045693_PDKQ',
          password: '123456PdKq@',
          database: 'u123045693_cookery_db',
        }
      });
    }
    return Database.instance;
  }
}

const database = new Database();
try {
	await database.raw('select 1+1 as result');
    console.log("Database connected");
} catch (err) {
	console.log(err.stack);
	process.exit(-1);
}
export default database;