// Set up test environment variables
process.env.API__ACCESS_TOKEN = 'secret';
process.env.API__HOST = 'localhost';
process.env.API__PORT = '3000';
process.env.DATABASE__TYPE = 'postgres';
process.env.DATABASE__CREDENTIALS__DATABASE = 'kalos';
process.env.DATABASE__CREDENTIALS__HOST = 'localhost';
process.env.DATABASE__CREDENTIALS__PORT = '5432';
process.env.DATABASE__CREDENTIALS__PASSWORD = 'secret';
process.env.DATABASE__CREDENTIALS__USERNAME = 'admin';
process.env.ENVIRONMENT = 'development';
process.env.LOG_LEVEL = 'debug';
process.env.NODE_ENV = 'development';
process.env.REDIS__DB = '0';
process.env.REDIS__HOST = 'localhost';
process.env.REDIS__PORT = '6379';
