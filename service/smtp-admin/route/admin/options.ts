import { default as cors } from "cors";
import { RequestHandler } from "express";
import { default as isAllowedOrigins } from "../../helper/is-allowed-origins";

/**
 * Stack of middleware for the admin route
 */
export const optionsAdminStack: Array<RequestHandler> = [
  cors({
    methods: ['GET', 'OPTIONS'],
    origin: isAllowedOrigins,
  }),
];
