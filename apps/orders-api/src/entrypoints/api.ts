import closeWithGrace from 'close-with-grace';
import { buildApp } from '../app.js';
import { buildDeps } from '../composition.js';
import { loadConfig } from '../config.js';

const config = loadConfig();
const deps = buildDeps(config);
const app = await buildApp(deps);

closeWithGrace({ delay: 10_000 }, async ({ signal, err }) => {
  if (err) {
    app.log.error({ err }, 'fatal error');
  }
  app.log.info({ signal }, 'shutting down');
  await app.close();
  await deps.dispose();
});

await app.listen({ host: '0.0.0.0', port: config.PORT });
