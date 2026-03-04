// SMTP commands
export const COMMAND = {
  DATA: "DATA",
  EHLO: "EHLO",
  EXPN: "EXPN",
  HELO: "HELO",
  MAIL_FROM: "MAIL FROM",
  NOOP: "NOOP",
  QUIT: "QUIT",
  RCPT_TO: "RCPT TO",
  RSET: "RSET",
  SEND: "SEND",
  STARTTLS: "STARTTLS",
  UNKNOWN: "UNKNOWN",
  VRFY: "VRFY",
}

// SMTP commands in an array
export const COMMANDS = [
  COMMAND.DATA,
  COMMAND.EHLO,
  COMMAND.EXPN,
  COMMAND.HELO,
  COMMAND.MAIL_FROM,
  COMMAND.NOOP,
  COMMAND.QUIT,
  COMMAND.RCPT_TO,
  COMMAND.RSET,
  COMMAND.SEND,
  COMMAND.STARTTLS,
  COMMAND.VRFY,
] as const;

// SMTP status codes
export const STATUS_CODE = {
  // 2xx Positive Completion replies
  GREETING: 220, // Service ready
  START_TLS_READY: 220, // Ready to start TLS
  CLOSING: 221, // Service closing transmission channel
  AUTH_SUCCESS: 235, // Authentication successful
  OK: 250, // Requested mail action okay, completed
  VRFY_OR_EXPN_ACCEPTED: 252, // Cannot VRFY user, but will accept message and attempt delivery

  // 3xx Positive Intermediate replies
  START_MAIL_INPUT: 354, // Start mail input; end with <CRLF>.<CRLF>

  // 4xx Transient Negative Completion replies
  SERVER_TIMEOUT: 421, // Service not available, closing transmission channel
  MAILBOX_BUSY: 450, // Requested mail action not taken: mailbox unavailable
  LOCAL_ERROR_IN_PROCESSING: 451, // Requested action aborted: local error in processing
  INSUFFICIENT_STORAGE: 452, // Requested action not taken: insufficient system storage
  TEMPORARY_FAILURE: 454, // Temporary authentication failure

  // 5xx Permanent Negative Completion replies
  COMMAND_NOT_RECOGNIZED: 500, // Syntax error, command unrecognized
  SYNTAX_ERROR: 501, // Syntax error in parameters or arguments
  NOT_IMPLEMENTED: 502, // Command not implemented
  BAD_SEQUENCE_OF_COMMANDS: 503, // Bad sequence of commands
  COMMAND_PARAMETER_NOT_IMPLEMENTED: 504, // Command parameter not implemented
  AUTHENTICATION_REQUIRED: 530, // Authentication required
  ENCRYPTION_REQUIRED: 534, // Encryption required for requested authentication mechanism
  MAILBOX_NOT_FOUND: 550, // Requested action not taken: mailbox unavailable
  USER_NOT_LOCAL: 551, // User not local; please try <forward-path>
  EXCEEDED_STORAGE_ALLOCATION: 552, // Requested mail action aborted: exceeded storage allocation
  INVALID_MAILBOX_NAME: 553, // Mailbox name not allowed
  TRANSACTION_FAILED: 554, // Transaction failed
} as const;

// Enhanced SMTP status codes
export const ENHANCED_STATUS_CODE = {
  // 2.X.X Delivery, Transfer, or Relaying
  OTHER_OR_UNDEFINED_STATUS: "2.0.0",
  SYSTEM_STATUS_OR_SYSTEM_HELP_REPLY: "2.1.0",
  SYSTEM_STATUS: "2.1.1",
  SYSTEM_HELP_REPLY: "2.1.2",
  INFORMATION_ABOUT_THE_PROTOCOL: "2.1.3",
  INFORMATION_ABOUT_THE_VERSION: "2.1.4",
  EXTENDED_MAIL_SYSTEM_STATUS_CODE: "2.1.5",
  IMA_INTERNET_MESSAGE_ACCESS_PROTOCOL_OP_OBSOLETE_PROTOCOL: "2.2.0",
  SECURITY_FEATURES_NOT_SUPPORTED: "2.3.0",
  ENCRYPTION_REQUIRED_FOR_REQUESTED_AUTHENTICATION_MECHANISM: "2.3.1",
  ENCRYPTION_REQUIRED: "2.3.2",
  MAIL_DELIVERED: "2.5.0",

  // 4.X.X Delivery, Transfer, or Relaying (Transient Failure)
  NETWORK_CONGESTION: "4.0.0",
  INVALID_ELECTRONIC_ADDRESS: "4.1.0",
  BAD_DESTINATION_MAILBOX_ADDRESS: "4.1.1",
  BAD_DESTINATION_SYSTEM_ADDRESS: "4.1.2",
  BAD_DESTINATION_MAILBOX_ADDRESS_SYNTAX: "4.1.3",
  BAD_SENDER_S_MAILBOX_ADDRESS_SYNTAX: "4.1.7",
  BAD_SENDER_S_SYSTEM_ADDRESS: "4.1.8",
  MAIL_SYSTEM_FULL: "4.2.0",
  MAIL_SYSTEM_CANNOT_PROVIDE_SERVICE: "4.2.1",
  MAIL_SYSTEM_BUSY: "4.3.0",
  MAIL_SYSTEM_NOT_ABLE_TO_PERFORM_CONVERSION: "4.3.1",
  MAIL_SYSTEM_NOT_DEFINED: "4.3.2",
  NO_ANSWER_FROM_HOST: "4.4.1",
  BAD_CONNECTION: "4.4.2",
  ROUTING_SERVER_FAILURE: "4.4.3",
  UNABLE_TO_ROUTE: "4.4.4",
  MAIL_SYSTEM_INCORRECTLY_CONFIGURED: "4.4.5",
  MAIL_SYSTEM_UNABLE_TO_DELIVER_MESSAGE: "4.4.6",
  DELIVERY_TIME_EXPIRED: "4.4.7",
  MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE: "4.5.0",
  MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_POLICY_REASONS: "4.5.1",
  MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_SIZE_REASONS: "4.5.2",
  MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_SECURITY_REASONS: "4.5.3",
  MAIL_SYSTEM_UNABLE_TO_RELAY_MESSAGE: "4.6.0",
  DELIVERY_NOT_AUTHORIZED_MESSAGE_REFUSED: "4.7.0",
  DELIVERY_NOT_AUTHORIZED_MESSAGE_REFUSED_DUE_TO_POLICY_REASONS: "4.7.1",
  DELIVERY_NOT_AUTHORIZED_MESSAGE_REFUSED_DUE_TO_SECURITY_REASONS: "4.7.2",
  DELIVERY_NOT_AUTHORIZED_MESSAGE_REFUSED_DUE_TO_PROTOCOL_REASONS: "4.7.3",
  DELIVERY_NOT_AUTHORIZED_MESSAGE_REFUSED_DUE_TO_CONTENT_REASONS: "4.7.4",
  DELIVERY_NOT_AUTHORIZED_MESSAGE_REFUSED_DUE_TO_ADMINISTRATIVE_REASONS: "4.7.5",
  DELIVERY_NOT_AUTHORIZED_MESSAGE_REFUSED_DUE_TO_SIZE_REASONS: "4.7.6",
  DELIVERY_NOT_AUTHORIZED_MESSAGE_REFUSED_DUE_TO_ROUTING_REASONS: "4.7.7",
  DELIVERY_NOT_AUTHORIZED_MESSAGE_REFUSED_DUE_TO_RELAYING_REASONS: "4.7.8",
  DELIVERY_NOT_AUTHORIZED_MESSAGE_REFUSED_DUE_TO_SPAM_REASONS: "4.7.9",

  // 5.X.X Delivery, Transfer, or Relaying (Permanent Failure)
  SYNTAX_ERROR: "5.0.0",
  INVALID_ELECTRONIC_ADDRESS_PERMANENT: "5.1.0",
  BAD_DESTINATION_MAILBOX_ADDRESS_PERMANENT: "5.1.1",
  BAD_DESTINATION_SYSTEM_ADDRESS_PERMANENT: "5.1.2",
  BAD_DESTINATION_MAILBOX_ADDRESS_SYNTAX_PERMANENT: "5.1.3",
  DESTINATION_MAILBOX_ADDRESS_AMBIGUOUS: "5.1.4",
  DESTINATION_MAILBOX_ADDRESS_VALID: "5.1.5",
  MAILBOX_HAS_MOVED: "5.1.6",
  BAD_SENDER_S_MAILBOX_ADDRESS_SYNTAX_PERMANENT: "5.1.7",
  BAD_SENDER_S_SYSTEM_ADDRESS_PERMANENT: "5.1.8",
  MAIL_SYSTEM_FULL_PERMANENT: "5.2.0",
  MAIL_SYSTEM_CANNOT_PROVIDE_SERVICE_PERMANENT: "5.2.1",
  MAIL_SYSTEM_BUSY_PERMANENT: "5.3.0",
  MAIL_SYSTEM_NOT_ABLE_TO_PERFORM_CONVERSION_PERMANENT: "5.3.1",
  MAIL_SYSTEM_NOT_DEFINED_PERMANENT: "5.3.2",
  MAIL_SYSTEM_NOT_ABLE_TO_PROVIDE_SECURITY: "5.3.3",
  MAIL_SYSTEM_UNABLE_TO_AUTHENTICATE: "5.3.4",
  MAIL_SYSTEM_UNABLE_TO_AUTHORIZE: "5.3.5",
  NETWORK_CONGESTION_PERMANENT: "5.4.0",
  NO_ANSWER_FROM_HOST_PERMANENT: "5.4.1",
  BAD_CONNECTION_PERMANENT: "5.4.2",
  ROUTING_SERVER_FAILURE_PERMANENT: "5.4.3",
  UNABLE_TO_ROUTE_PERMANENT: "5.4.4",
  MAIL_SYSTEM_INCORRECTLY_CONFIGURED_PERMANENT: "5.4.5",
  MAIL_SYSTEM_UNABLE_TO_DELIVER_MESSAGE_PERMANENT: "5.4.6",
  DELIVERY_TIME_EXPIRED_PERMANENT: "5.4.7",
  MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_PERMANENT: "5.5.0",
  MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_POLICY_REASONS_PERMANENT: "5.5.1",
  MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_SIZE_REASONS_PERMANENT: "5.5.2",
  MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_SECURITY_REASONS_PERMANENT: "5.5.3",
  MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_PROTOCOL_REASONS: "5.5.4",
  MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_CONTENT_REASONS: "5.5.5",
  MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_ADMINISTRATIVE_REASONS: "5.5.6",
  MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_ROUTING_REASONS: "5.5.7",
  MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_RELAYING_REASONS: "5.5.8",
  MAIL_SYSTEM_UNABLE_TO_ACCEPT_MESSAGE_DUE_TO_SPAM_REASONS: "5.5.9",
  MAIL_SYSTEM_UNABLE_TO_RELAY_MESSAGE_PERMANENT: "5.6.0",
  DELIVERY_NOT_AUTHORIZED_MESSAGE_REFUSED_PERMANENT: "5.7.0",
  DELIVERY_NOT_AUTHORIZED_MESSAGE_REFUSED_DUE_TO_POLICY_REASONS_PERMANENT: "5.7.1",
  DELIVERY_NOT_AUTHORIZED_MESSAGE_REFUSED_DUE_TO_SECURITY_REASONS_PERMANENT: "5.7.2",
  DELIVERY_NOT_AUTHORIZED_MESSAGE_REFUSED_DUE_TO_PROTOCOL_REASONS_PERMANENT: "5.7.3",
  DELIVERY_NOT_AUTHORIZED_MESSAGE_REFUSED_DUE_TO_CONTENT_REASONS_PERMANENT: "5.7.4",
  DELIVERY_NOT_AUTHORIZED_MESSAGE_REFUSED_DUE_TO_ADMINISTRATIVE_REASONS_PERMANENT: "5.7.5",
  DELIVERY_NOT_AUTHORIZED_MESSAGE_REFUSED_DUE_TO_SIZE_REASONS_PERMANENT: "5.7.6",
  DELIVERY_NOT_AUTHORIZED_MESSAGE_REFUSED_DUE_TO_ROUTING_REASONS_PERMANENT: "5.7.7",
  DELIVERY_NOT_AUTHORIZED_MESSAGE_REFUSED_DUE_TO_RELAYING_REASONS_PERMANENT: "5.7.8",
  DELIVERY_NOT_AUTHORIZED_MESSAGE_REFUSED_DUE_TO_SPAM_REASONS_PERMANENT: "5.7.9",
} as const;

export const ENHANCED_STATUS_CODE_DESCRIPTIONS = {
  // 2.X.X Delivery, Transfer, or Relaying
  "2.0.0": "Other or undefined status",
  "2.1.0": "System status, or system help reply",
  "2.1.1": "System status",
  "2.1.2": "System help reply",
  "2.1.3": "Information about the protocol",
  "2.1.4": "Information about the version",
  "2.1.5": "Extended Mail System Status Code",
  "2.2.0": "IMA (Internet Message Access Protocol), OP (Obsolete Protocol)",
  "2.3.0": "Security features not supported",
  "2.3.1": "Encryption required for requested authentication mechanism",
  "2.3.2": "Encryption required",
  "2.5.0": "OK, delivered",

  // 4.X.X Delivery, Transfer, or Relaying (Transient Failure)
  "4.0.0": "Network congestion",
  "4.1.0": "Invalid electronic address",
  "4.1.1": "Bad destination mailbox address",
  "4.1.2": "Bad destination system address",
  "4.1.3": "Bad destination mailbox address syntax",
  "4.1.7": "Bad sender's mailbox address syntax",
  "4.1.8": "Bad sender's system address",
  "4.2.0": "Mail system full",
  "4.2.1": "Mail system cannot provide service",
  "4.3.0": "Mail system busy",
  "4.3.1": "Mail system not able to perform conversion",
  "4.3.2": "Mail system not defined",
  "4.4.1": "No answer from host",
  "4.4.2": "Bad connection",
  "4.4.3": "Routing server failure",
  "4.4.4": "Unable to route",
  "4.4.5": "Mail system incorrectly configured",
  "4.4.6": "Mail system unable to deliver message",
  "4.4.7": "Delivery time expired",
  "4.5.0": "Mail system unable to accept message",
  "4.5.1": "Mail system unable to accept message due to policy reasons",
  "4.5.2": "Mail system unable to accept message due to size reasons",
  "4.5.3": "Mail system unable to accept message due to security reasons",
  "4.6.0": "Mail system unable to relay message",
  "4.7.0": "Delivery not authorized, message refused",
  "4.7.1": "Delivery not authorized, message refused due to policy reasons",
  "4.7.2": "Delivery not authorized, message refused due to security reasons",
  "4.7.3": "Delivery not authorized, message refused due to protocol reasons",
  "4.7.4": "Delivery not authorized, message refused due to content reasons",
  "4.7.5": "Delivery not authorized, message refused due to administrative reasons",
  "4.7.6": "Delivery not authorized, message refused due to size reasons",
  "4.7.7": "Delivery not authorized, message refused due to routing reasons",
  "4.7.8": "Delivery not authorized, message refused due to relaying reasons",
  "4.7.9": "Delivery not authorized, message refused due to spam reasons",

  // 5.X.X Delivery, Transfer, or Relaying (Permanent Failure)
  "5.0.0": "Syntax error",
  "5.1.0": "Invalid electronic address",
  "5.1.1": "Bad destination mailbox address",
  "5.1.2": "Bad destination system address",
  "5.1.3": "Bad destination mailbox address syntax",
  "5.1.4": "Destination mailbox address ambiguous",
  "5.1.5": "Destination mailbox address valid",
  "5.1.6": "Mailbox has moved",
  "5.1.7": "Bad sender's mailbox address syntax",
  "5.1.8": "Bad sender's system address",
  "5.2.0": "Mail system full",
  "5.2.1": "Mail system cannot provide service",
  "5.3.0": "Mail system busy",
  "5.3.1": "Mail system not able to perform conversion",
  "5.3.2": "Mail system not defined",
  "5.3.3": "Mail system not able to provide security",
  "5.3.4": "Mail system unable to authenticate",
  "5.3.5": "Mail system unable to authorize",
  "5.4.0": "Network congestion",
  "5.4.1": "No answer from host",
  "5.4.2": "Bad connection",
  "5.4.3": "Routing server failure",
  "5.4.4": "Unable to route",
  "5.4.5": "Mail system incorrectly configured",
  "5.4.6": "Mail system unable to deliver message",
  "5.4.7": "Delivery time expired",
  "5.5.0": "Mail system unable to accept message",
  "5.5.1": "Mail system unable to accept message due to policy reasons",
  "5.5.2": "Mail system unable to accept message due to size reasons",
  "5.5.3": "Mail system unable to accept message due to security reasons",
  "5.5.4": "Mail system unable to accept message due to protocol reasons",
  "5.5.5": "Mail system unable to accept message due to content reasons",
  "5.5.6": "Mail system unable to accept message due to administrative reasons",
  "5.5.7": "Mail system unable to accept message due to routing reasons",
  "5.5.8": "Mail system unable to accept message due to relaying reasons",
  "5.5.9": "Mail system unable to accept message due to spam reasons",
  "5.6.0": "Mail system unable to relay message",
  "5.7.0": "Delivery not authorized, message refused",
  "5.7.1": "Delivery not authorized, message refused due to policy reasons",
  "5.7.2": "Delivery not authorized, message refused due to security reasons",
  "5.7.3": "Delivery not authorized, message refused due to protocol reasons",
  "5.7.4": "Delivery not authorized, message refused due to content reasons",
  "5.7.5": "Delivery not authorized, message refused due to administrative reasons",
  "5.7.6": "Delivery not authorized, message refused due to size reasons",
  "5.7.7": "Delivery not authorized, message refused due to routing reasons",
  "5.7.8": "Delivery not authorized, message refused due to relaying reasons",
  "5.7.9": "Delivery not authorized, message refused due to spam reasons",
} as const;

export default {
  COMMAND,
  COMMANDS,
  STATUS_CODE,
  ENHANCED_STATUS_CODE,
  ENHANCED_STATUS_CODE_DESCRIPTIONS,
}
