import { RequestHandler } from "express";
// import { StatusCodes } from 'http-status-codes';
// import { default as redirectCredentialLoginUrl } from "../helper/redirect-to-credential-login-url";
// import { default as logger } from "../logger";
// import { forbiddenDocumentTemplate, unrecoverableDocumentTemplate } from "../template";

type Factory = () => RequestHandler

/**
 * Checks authentication middleware results and returns an error document when any error has occured
 * This should be called after the "verifyAccessTokenCookie" middleware
 */
export const accessTokenCookieVerficationErrorResponse: Factory = () => async (incomingMessage, serverResponse, nextMiddleware) => {
  // DEVELOPER NOTE:
  // Removed to allow services to be run without supporting software
  //
  // if (incomingMessage.authAccessToken.errors.length > 0) {
  //   incomingMessage.authAccessToken.errors.forEach((error) => logger.error('an error occurred during auth token verification', { error }));
  //   serverResponse.status(StatusCodes.INTERNAL_SERVER_ERROR);
  //   return void serverResponse.send(unrecoverableDocumentTemplate());
  // }
  nextMiddleware();
}

/**
 * Check authentication middleware results and returns a forbidden document when the user is not authorized
 * This should be called after the "verifyAccessTokenCookie" middleware
 */
export const accessTokenCookieVerficationForbiddenResponse: Factory = () => async (incomingMessage, serverResponse, nextMiddleware) => {
  // DEVELOPER NOTE:
  // Removed to allow services to be run without supporting software
  //
  // if (incomingMessage.authAccessToken.isAuthorized === false) {
  //   serverResponse.status(StatusCodes.UNAUTHORIZED);
  //   return void serverResponse.send(forbiddenDocumentTemplate());
  // }
  nextMiddleware();
}

/**
 * Check authentication middleware results and returns a redirect to the login page when we cannot determine if the user is authorized
 * This should be called after the "verifyAccessTokenCookie" middleware
 */
export const accessTokenCookieVerficationRedirect: Factory = () => async (incomingMessage, serverResponse, nextMiddleware) => {
  // DEVELOPER NOTE:
  // Removed to allow services to be run without supporting software
  //
  // if (incomingMessage.authAccessToken.isAuthorized === null) {
  //   return void redirectCredentialLoginUrl(incomingMessage, serverResponse);
  // }
  nextMiddleware();
}
