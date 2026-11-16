// cPanel Phusion Passenger Node.js Application Entry Point
import { createRequire } from 'module';

process.env.CPANEL_ENV = 'production';
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

const require = createRequire(import.meta.url);
require('./server.cjs');
