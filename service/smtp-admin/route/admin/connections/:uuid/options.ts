import { default as cors } from "cors"
import { RequestHandler } from "express"
import { default as isAllowedOrigins } from "../../../../helper/is-allowed-origins"

//
export const optionsAdminConnectionsByUuidStack: Array<RequestHandler> = [
  cors({
    methods: ['GET', 'OPTIONS'],
    origin: isAllowedOrigins,
  }),
]
