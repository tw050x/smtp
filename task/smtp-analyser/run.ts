import { default as getConnectionsToBeAnalysed } from "./helper/get-connections-to-be-analysed";
import { default as logger } from "./logger";

/**
 * Run the analysis every minute
 */
(async function runAnalysis() {
  try {
    logger.info(`[${new Date().toISOString()}] Running analysis...`);

    const connectionsToBeAnalysed = await getConnectionsToBeAnalysed([
      "connectionHasDataCommand",
      "connectionHasDataCommandButEmpty",
    ]);

    console.log('Connections to be analysed:', connectionsToBeAnalysed);
  }
  catch (error) {
    logger.error('Error running analysis:', { error });
  }
}).
call(this).
catch((error) => {
  logger.error('Fatal error in analysis runner:', { error });
  process.exit(1);
});
