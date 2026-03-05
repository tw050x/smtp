# Demo

Welcome to the smtp server. This document will guide you through the DEMO of the applications and the agent. This entire document assumes you have completed the setup work required in the p [readme](./README.md).

## Getting Started

Once you have started the docker containers with `docker compose up` you should be able to access [http://localhost:9120/admin/dashboard](http://localhost:9120/admin/dashboard) which is an admin panel where you can view the recent connections made to the server. Its almost certainly empty to start.

You will also be able to connect to the smtp agent with `telnet` on port 9110.

```bash
telnet localhost 9110
```

Once a connection is established you should be able to type the available commands. Start with `HELO site.com` where `HELO` is the command and `site.com` is meant to be you introducing yourself to the server.

"Hello I am site.com`

## Reviewing the data

At this point you should be able to go back to the admin panel in the browser and see that a connection is now present from the last 24 hours.

If you go to [http://localhost:9120/admin/connections](http://localhost:9120/admin/connections) you will be able to see an table showing the latest connections and you can click into the connection to review the messages sent back and forth.

## Closing the connection

If the connection in the terminal has not yet been auto closed (from a timeout) then you can close it by sending a `QUIT` command on its own.

## A complete email

Sending a complete email consists of

1. sending the `HELO site.com` command to introduce yourself.
2. sending the `MAIL FROM: <sender@mail.com>` command to define who is sending the email
3. sending the `RCPT TO: <recipient@mail.com>` command to define who should receive the email (The `RCPT TO: <...>` can be sent multiple times in a row for multiple recipients).
4. sending the `DATA` command to inform the user that you are about to provide the email content.
5. sending a single `.` on a line on its own to signal that the `DATA` has been completely sent. In other words the email content email been sent.
6. sending a `QUIT` command to close the connection.

> Feel free to try these steps yourself.

## Reset

You can send an `RSET` command at any point to return back to the point where you send the `MAiL FROM: <...>` command.

## Multiple emails

You can complete one email and before closing the connection you can send another `RCPT TO: <...>` command to begin another email.

## SMTP features

Not all SMTP server feature are implemented. For example the `VRFY` command will return a successful response code but will inform the client that we have refused to verify any users.
