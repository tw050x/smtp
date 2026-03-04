import { default as cors } from "cors";
import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { default as isAllowedOrigins } from "../../helper/is-allowed-origins";
import { accessTokenCookieVerficationErrorResponse, accessTokenCookieVerficationForbiddenResponse, accessTokenCookieVerficationRedirect } from "../../middleware/access-token-cookie-verification";

/**
 * Middleware that will always redirect to the dashboard
 *
 * @param incomingMessage
 * @param serverResponse
 */
export const getAdmin: () => RequestHandler = () => async (_, serverResponse) => {

  // redirect to the dashboard
  serverResponse.status(StatusCodes.MOVED_TEMPORARILY);
  return void serverResponse.redirect('/admin/dashboard');
}

/**
 * Stack of middleware for the index route
 */
export const getAdminStack: Array<RequestHandler> = [
  cors({
    methods: ['GET', 'OPTIONS'],
    origin: isAllowedOrigins,
  }),
  accessTokenCookieVerficationErrorResponse(),
  accessTokenCookieVerficationForbiddenResponse(),
  accessTokenCookieVerficationRedirect(),
  getAdmin(),
]
