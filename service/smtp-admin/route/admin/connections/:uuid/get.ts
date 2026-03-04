import { default as cors } from "cors";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { default as isAllowedOrigins } from "../../../../helper/is-allowed-origins";
import { default as sanitizeMongoDBFilterOrPipeline } from "../../../../helper/sanitize-mongodb-filter-or-pipeline";
import { accessTokenCookieVerficationErrorResponse, accessTokenCookieVerficationForbiddenResponse, accessTokenCookieVerficationRedirect } from "../../../../middleware/access-token-cookie-verification";
import { db } from "../../../../database";
import { default as logger } from "../../../../logger";
import { connectionsByUuidDocumentTemplate, notFoundDocumentTemplate, unrecoverableDocumentTemplate } from "../../../../template";

const getAdminConnectionsByUuidParameterSchema = z.object({
  uuid: z.string().uuid(),
})

type Factory = () => RequestHandler

/**
 * Handles the incoming requests to the get /admin/connections/:uuid endpoint.
 */
export const getAdminConnectionsByUuid: Factory = () =>  async (incomingMessage, serverResponse) => {
  logger.debug('get request for /admin/connections/:uuid');

  // validate the incoming request
  // return an error if unable to do so.
  let uuid;
  try {
    const result = getAdminConnectionsByUuidParameterSchema.parse(incomingMessage.params);
    uuid = result.uuid;
  }
  catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach((issue) => logger.error('unable to validate url parameter', { issue }));
      serverResponse.status(StatusCodes.BAD_REQUEST);
      return void serverResponse.send();
    }
    logger.error('unable to validate url parameters', { error });
    serverResponse.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return void serverResponse.send();
  }

  // fetch to connection
  let connection;
  try {
    const sanitizedQuery = sanitizeMongoDBFilterOrPipeline({
      uuid,
    });
    connection = await db.collection('connections').findOne(sanitizedQuery);
  }
  catch (error) {
    logger.error('unable to fetch connection from database', { error });
    serverResponse.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return void serverResponse.send(unrecoverableDocumentTemplate());
  }
  if (connection === null) {
    logger.debug('connection not found', { uuid });
    serverResponse.status(StatusCodes.NOT_FOUND);
    return void serverResponse.send(notFoundDocumentTemplate());
  }

  // fetch the lines for the connection
  let lines;
  try {
    const sanitizedPipeline = sanitizeMongoDBFilterOrPipeline([
      { $match: { connectionId: connection._id } },
      { $sort: { index: 1 } },
      {
        $lookup: {
          from: 'responses',
          localField: '_id',
          foreignField: 'lineId',
          as: 'responses'
        }
      },
    ])
    lines = await db.collection('lines').aggregate(sanitizedPipeline).toArray();
  }
  catch (error) {
    logger.error('unable to fetch lines from database', { error });
    serverResponse.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return void serverResponse.send(unrecoverableDocumentTemplate());
  }

  // add the lines to the connection
  connection.lines = lines;

  // create the response
  const response = connectionsByUuidDocumentTemplate({
    connection,
  });

  // update the connection as been viewed
  // return an unrecoverable error if unable to do so.
  try {
    await db.collection('connections').updateOne(
      { _id: connection._id },
      { $set: { lastViewedAt: new Date() } }
    );
  }
  catch (error) {
    logger.error('unable to update connection as viewed', { error });
    serverResponse.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return void serverResponse.send(unrecoverableDocumentTemplate());
  }

  // add the connection to the response
  serverResponse.status(StatusCodes.OK);
  return void serverResponse.send(response);
};

//
export const getAdminConnectionsByUuidStack: Array<RequestHandler> = [
  cors({
    methods: ['GET', 'OPTIONS'],
    origin: isAllowedOrigins,
  }),
  accessTokenCookieVerficationErrorResponse(),
  accessTokenCookieVerficationForbiddenResponse(),
  accessTokenCookieVerficationRedirect(),
  getAdminConnectionsByUuid(),
]
