import { resolve } from "node:path";
import { default as express } from "express";
import { getAdminConnectionsStack } from "./route/admin/connections/get";
import { optionsAdminConnectionsStack } from "./route/admin/connections/options";
import { getAdminConnectionsByUuidStack } from "./route/admin/connections/:uuid/get";
import { optionsAdminConnectionsByUuidStack } from "./route/admin/connections/:uuid/options";
import { getAdminDashboardStack } from "./route/admin/dashboard/get";
import { optionsAdminDashboardStack } from "./route/admin/dashboard/options";
import { getAdminStack } from "./route/admin/get";
import { optionsAdminStack } from "./route/admin/options";
import { default as configuration } from "./configuration";
import { default as logger } from "./logger";

const app = express();

// Settings
app.set('query parser', (queryString: string) => {
  const query = new URLSearchParams(queryString);
  const queryObject: Record<string, string> = {};

  for (const [key, value] of query) {
    try {
      queryObject[key] = decodeURIComponent(value);
    }
    catch (error) {
      logger.error(error);
    }
  }

  return queryObject;
});

// Routes - /admin
app.get('/admin', ...getAdminStack);
app.options('/admin', ...optionsAdminStack);

// Routes - /admin/connections
app.get('/admin/connections', ...getAdminConnectionsStack);
app.options('/admin/connections', ...optionsAdminConnectionsStack);

// Routes - /admin/connections/:uuid
app.get('/admin/connections/:uuid', ...getAdminConnectionsByUuidStack);
app.options('/admin/connections/:uuid', ...optionsAdminConnectionsByUuidStack);

// Routes - /admin/dashboard
app.get('/admin/dashboard', ...getAdminDashboardStack);
app.options('/admin/dashboard', ...optionsAdminDashboardStack);

// Healthcheck
app.get('/admin/healthcheck', (_, serverResponse) => {
  serverResponse.writeHead(200, {
    'Content-Type': 'application/json',
  });

  serverResponse.end(JSON.stringify({
    status: 'ok',
  }));
});

// Static files
app.use('/admin', express.static(resolve(__dirname, 'public')));

// Start the server
app.listen(
  configuration.smtpServiceAdminServerPort,
  () => logger.info(`service is running on port ${configuration.smtpServiceAdminServerPort}`)
);
