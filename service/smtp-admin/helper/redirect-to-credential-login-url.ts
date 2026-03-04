// import { randomBytes } from "node:crypto";
// import { Request, Response } from "express";
// import { StatusCodes } from "http-status-codes";
// import { encrypt } from "../encryption"
// import { default as configuration } from "../configuration";

/**
 * Redirect a credential login URL
 *
 * @param options
 * @param incomingMessage
 * @returns credential login URL
 */
// const redirectCredentialLoginUrl = (incomingMessage: Request, serverResponse: Response) => {
//   const returnUrl = new URL(incomingMessage.url, `https://${configuration.smtpServiceAdminServerHost}`);
//   const credentialsLoginUrl = new URL(configuration.authServiceApplicationCredentialsLoginUrl);
//   const encryptedUrlState = JSON.stringify(encrypt(JSON.stringify({
//     return_url: returnUrl,
//     salt: randomBytes(16).toString('hex') // ensures that the encrypted URL state is unique each time
//   })));
//   credentialsLoginUrl.searchParams.set('state', encodeURIComponent(encryptedUrlState));
//   credentialsLoginUrl.toString();

//   if (incomingMessage.headers['hx-request'] === 'true') {
//     serverResponse.setHeader('HX-Redirect', credentialsLoginUrl.toString());
//     serverResponse.status(StatusCodes.MOVED_TEMPORARILY);
//     return void serverResponse.send();
//   }
//   else return void serverResponse.redirect(credentialsLoginUrl.toString());
// }

// export default redirectCredentialLoginUrl;
