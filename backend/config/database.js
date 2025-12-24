const { Sequelize } = require('sequelize');

const shouldUseSsl =
  process.env.DB_SSL === 'true' ||
  (typeof process.env.DATABASE_URL === 'string' && process.env.DATABASE_URL.includes('supabase'));

const baseOptions = {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, baseOptions)
  : new Sequelize(
    process.env.DB_NAME || 'nadeemandsonstech',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      ...baseOptions
    }
  );

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected successfully');

    // Sync all models
    await sequelize.sync({
      alter: process.env.DB_SYNC === 'true' || process.env.NODE_ENV === 'development'
    });
    console.log('Database synchronized');
  } catch (error) {
    console.error('Unable to connect to PostgreSQL:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
