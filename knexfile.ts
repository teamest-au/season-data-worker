module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'dataworker',
      password: process.env.MYSQL_PASS || 'dataworker',
      database: process.env.MYSQL_DATABASE || 'season_data',
    },
  },
};
