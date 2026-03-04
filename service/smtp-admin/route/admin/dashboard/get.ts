import { default as cors } from "cors";
import { RequestHandler } from "express";
import { StatusCodes } from 'http-status-codes';
import { default as isAllowedOrigins } from "../../../helper/is-allowed-origins";
import { accessTokenCookieVerficationErrorResponse, accessTokenCookieVerficationForbiddenResponse, accessTokenCookieVerficationRedirect } from "../../../middleware/access-token-cookie-verification";
import { db } from "../../../database";
import { default as logger } from "../../../logger";
import { dashboardDocumentTemplate, overviewTablePartialTemplate } from '../../../template'

/**
 * Returns the /admin/dashboard page html
 *
 * @param incomingMessage
 * @param serverResponse
 */
export const getAdminDashboard: () => RequestHandler = () => async (incomingMessage, serverResponse) => {

  // fetch the total connections count from the database
  let totalConnectionsAllTime;
  try {
    totalConnectionsAllTime = await db.collection('connections').countDocuments();
  }
  catch (error) {
    logger.error('Error while fetching connections', { error });
    serverResponse.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return void serverResponse.send();
  }

  // fetch the total connections count from the last 24 hours
  let totalConnections24Hours;
  try {
    const date24HoursAgo = new Date();
    date24HoursAgo.setDate(date24HoursAgo.getDate() - 1);
    totalConnections24Hours = await db.collection('connections').countDocuments({
      createdAt: {
        $gte: date24HoursAgo,
        $lt: new Date(),
      }
    });
  }
  catch (error) {
    logger.error('Error while fetching connections', { error });
    serverResponse.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return void serverResponse.send();
  }

  // return the dashboard document
  const templateData = {
    onLoadDelayInSeconds: 30,
    totalConnections24Hours: totalConnections24Hours.toString(),
    totalConnectionsAllTime: totalConnectionsAllTime.toString(),
  }
  serverResponse.status(StatusCodes.OK);
  if (incomingMessage.headers['hx-request'] === 'true') return void serverResponse.send(overviewTablePartialTemplate(templateData));
  else return void serverResponse.send(dashboardDocumentTemplate(templateData));
}

//
export const getAdminDashboardStack: Array<RequestHandler> = [
  cors({
    methods: ['GET', 'OPTIONS'],
    origin: isAllowedOrigins,
  }),
  accessTokenCookieVerficationErrorResponse(),
  accessTokenCookieVerficationForbiddenResponse(),
  accessTokenCookieVerficationRedirect(),
  getAdminDashboard(),
]
