import { default as cors } from "cors";
import { format } from "date-fns";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { default as isAllowedOrigins } from "../../../helper/is-allowed-origins";
import { default as sanitizeMongoDBFilterOrPipeline } from "../../../helper/sanitize-mongodb-filter-or-pipeline";
import { accessTokenCookieVerficationErrorResponse, accessTokenCookieVerficationForbiddenResponse, accessTokenCookieVerficationRedirect } from "../../../middleware/access-token-cookie-verification";
import { db } from "../../../database";
import { default as logger } from "../../../logger";
import { connectionsDocumentTemplate, connectionsTablePartialTemplate, unrecoverableDocumentTemplate } from "../../../template";

const getAdminConnectionsQuerySchema = z.object({
  pi: z.preprocess((value) => parseInt(value as string, 10), z.number().int().nonnegative()),
  ps: z.preprocess((value) => parseInt(value as string, 10), z.number().int().positive()),
  df: z.string(),
  dt: z.string(),
});

type Factory = () => RequestHandler

/**
 * Handles the incoming requests to the get /admin/messages endpoint.
 */
export const getAdminConnections: Factory = () => async (incomingMessage, serverResponse) => {

  // validate the incoming request
  // return a redirect to show the correct search params
  let pageIndex: number;
  let pageSize: number;
  let searchFilters: {
    dateFrom?: string;
    dateTo?: string;
  } = {};

  try {
    const result = getAdminConnectionsQuerySchema.parse(incomingMessage.query);
    pageIndex = result.pi;
    pageSize = result.ps;

    // Set default date range if no dates provided
    if (!result.df && !result.dt) {
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);

      searchFilters.dateFrom = format(sevenDaysAgo, 'yyyy-MM-dd');
      searchFilters.dateTo = format(today, 'yyyy-MM-dd');
    } else {
      // Add filters if they exist - only add non-empty values
      if (result.df && result.df.trim() !== '') searchFilters.dateFrom = result.df;
      if (result.dt && result.dt.trim() !== '') searchFilters.dateTo = result.dt;
    }
  }
  catch (error) {
    if (error instanceof z.ZodError) {
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);

      const defaultDateFrom = format(sevenDaysAgo, 'yyyy-MM-dd');
      const defaultDateTo = format(today, 'yyyy-MM-dd');

      serverResponse.status(StatusCodes.MOVED_PERMANENTLY);
      serverResponse.setHeader('Location', `/admin/connections?pi=0&ps=10&df=${defaultDateFrom}&dt=${defaultDateTo}`);
      return void serverResponse.send();
    }
    serverResponse.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return void serverResponse.send(unrecoverableDocumentTemplate());
  }

  // Build filter conditions based on the provided filters
  const filterMatch: Record<string, any> = {};

  // Add date range filters if provided
  if (searchFilters.dateFrom || searchFilters.dateTo) {
    const dateFilter: Record<string, Date> = {};
    if (searchFilters.dateFrom) {
      dateFilter.$gte = new Date(searchFilters.dateFrom);
    }
    if (searchFilters.dateTo) {
      // Add one day to include the end date (since dates are stored at midnight)
      const endDate = new Date(searchFilters.dateTo);
      endDate.setDate(endDate.getDate() + 1);
      dateFilter.$lt = endDate;
    }
    filterMatch.createdAt = dateFilter;
  }

  // fetch and filter the connections for the current page
  // return an error if unable to do so.
  let connections;
  try {
    const pipeline = sanitizeMongoDBFilterOrPipeline([
      { $match: filterMatch },
      { $sort: { createdAt: -1 } },
      { $skip: pageIndex * pageSize },
      { $limit: pageSize },
      {
        $lookup: {
          from: 'lines',
          localField: '_id',
          foreignField: 'connectionId',
          as: 'lines'
        }
      },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          lastViewedAt: 1,
          linesCount: { $size: "$lines" },
          reviews: 1,
          uuid: 1,
        }
      }
    ]);
    connections = await db.collection('connections').aggregate(pipeline).toArray();
  }
  catch (error) {
    logger.error('Error while fetching connections', { error });
    serverResponse.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return void serverResponse.send();
  }

  // map connections
  connections = connections.map((connection) => {
    return {
      lastViewedAt: connection.lastViewedAt,
      linesCount: connection.linesCount,
      received: format(connection.createdAt, 'yyyy-MM-dd HH:mm:ss'),
      uuid: connection.uuid,
    }
  });

  // fetch the total number of connections filtered by the same criteria
  // return an error if unable to do so.
  let connectionsCount
  try {
    const countPipeline = [];

    // Add match filter if needed
    if (Object.keys(filterMatch).length > 0) {
      countPipeline.push({ $match: filterMatch });
    }

    countPipeline.push({ $count: 'total' });
    const pipeline = sanitizeMongoDBFilterOrPipeline(countPipeline);
    connectionsCount = await db.collection('connections').aggregate(pipeline).toArray();
  }
  catch (error) {
    logger.error('Error while fetching connections count', { error });
    serverResponse.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return void serverResponse.send();
  }

  const totalPageCount = connectionsCount.length > 0 ? Math.ceil(connectionsCount[0].total / pageSize) : 0;

  // Return appropriate response based on request type
  const templateData = {
    connections,
    connectionsTableId: 'connections-table',
    onLoadDelayInSeconds: 30,
    pagination: {
      pageIndex,
      pageSize,
      totalPageCount,
    },
    searchFilters: Object.keys(searchFilters).length > 0 ? searchFilters : undefined
  };

  serverResponse.status(StatusCodes.OK);
  if (incomingMessage.headers['hx-request'] === 'true') return void serverResponse.send(connectionsTablePartialTemplate(templateData));
  else return void serverResponse.send(connectionsDocumentTemplate(templateData));
}

//
export const getAdminConnectionsStack: Array<RequestHandler> = [
  cors({
    methods: ['GET', 'OPTIONS'],
    origin: isAllowedOrigins,
  }),
  accessTokenCookieVerficationErrorResponse(),
  accessTokenCookieVerficationForbiddenResponse(),
  accessTokenCookieVerficationRedirect(),
  getAdminConnections(),
]
