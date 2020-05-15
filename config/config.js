module.exports = {
  "dev": {
    "username": process.env.POSTGRES_USER,
    "password": process.env.POSTGRES_PASSWORD,
    "database": process.env.POSTGRES_DB,
    "host": process.env.POSTGRES_HOST,
    "dialect": "postgres",
    "operatorsAliases": false
  },
  "test": {
    "username": null,
    "password": null,
    "database": "main",
    "host": "localhost",
    "dialect": "sqlite"
  }
}