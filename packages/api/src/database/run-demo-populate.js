require('../../modes/dev');
process.env['NODE_CONFIG_DIR'] = './packages/api/config';
const config = require('config');

const run = async () => {
  await config.get('DB_ENCRYPTION_SECRET');
  require('./demo-populate');
};
run();
