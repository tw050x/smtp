import { default as configuration } from "../configuration";

// Developer Note:
// This is a custom implementation of the cors module's origin callback (StaticOrigin)
// type as it is not exprted by the module.
type Callback = (err: Error | null, origin?: boolean | string | RegExp | Array<boolean | string | RegExp>) => void

/**
 * Check if the origin is allowed
 * @param origin The origin to check
 * @param callback The callback to call with the result
 * @returns void
 */
const isAllowedOrigins = (origin: string | undefined, callback: Callback) => {
  if (origin === undefined) {
    return void callback(null, false);
  }

  const allowedOrigins = configuration.smtpServiceAdminAllowedOrigins.split(',').map((origin) => origin.trim());
  if (Array.isArray(allowedOrigins) === false) {
    return void callback(null, false);
  }

  const originUrl = new URL(origin);
  if (allowedOrigins.includes(originUrl.host) === false) {
    return void callback(null, false);
  }

  return void callback(null, true);
}

export default isAllowedOrigins;
