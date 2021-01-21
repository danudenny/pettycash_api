/**
 * This file used for CustomConfig typeorm CLI
 * e.g: Using CustomNamingStrategy, etc.
 */

import { LoaderEnv } from './loader';

// Add Custom typeorm cli config if needed.
const config = {
  ...LoaderEnv.getTypeOrmConfig(),
};

if (LoaderEnv.isDebugMode()) {
  // tslint:disable-next-line: no-console
  console.dir(config, { colors: true, depth: null });
}

module.exports = config;
