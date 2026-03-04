import { default as cors } from "cors";
import { RequestHandler } from "express";
import { default as isAllowedOrigins } from "../../../helper/is-allowed-origins";

/**
 * Stack of middleware for the index route
 */
export const optionsAdminDashboardStack: Array<RequestHandler> = [
  cors({
    methods: ['GET', 'OPTIONS'],
    origin: isAllowedOrigins,
  }),
];
