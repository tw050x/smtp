// Node internals
import { Socket } from "node:net";

// Third party modules
import { faker } from "@faker-js/faker";
import { Collection, Document, MongoClient } from "mongodb";

// local modules
import * as vars from "../jest.vars";

describe("Implement SMTP server to RFC 821 standards", () => {
  describe("Responding to input data", () => {
    it("should respond with a successful code when the DATA command is sent after the MAIL FROM and RCPT TO commands", (done) => {
      const client = new Socket();
      let step = 1;

      const senderEmail = faker.internet.email();
      const recipientEmail = faker.internet.email();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            client.write(`MAIL FROM:<${senderEmail}>\r\n`);
            step++;
            break;
          case 3:
            client.write(`RCPT TO:<${recipientEmail}>\r\n`);
            step++;
            break;
          case 4:
            client.write("DATA\r\n");
            step++;
            break;
          case 5:
            expect(dataAsString.slice(0, 3)).toEqual("354");
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it('should not respond until the "." command is sent after the DATA command', (done) => {
      const client = new Socket();
      let step = 1;

      const senderEmail = faker.internet.email();
      const recipientEmail = faker.internet.email();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            client.write(`MAIL FROM:<${senderEmail}>\r\n`);
            step++;
            break;
          case 3:
            client.write(`RCPT TO:<${recipientEmail}>\r\n`);
            step++;
            break;
          case 4:
            client.write("DATA\r\n");
            step++;
            break;
          case 5:
            expect(dataAsString.slice(0, 3)).toEqual("354");
            client.write("This is a test email\r\n");
            client.write("This is a test email\r\n");
            client.write("This is a test email\r\n");
            client.write("This is a test email\r\n");
            client.write(".\r\n");
            step++;
            break;
          case 6:
            expect(dataAsString.slice(0, 3)).toEqual("250");
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with an error code when the DATA command is sent before the HELO command", (done) => {
      const client = new Socket();
      let step = 1;

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`DATA\r\n`);
            step++;
            break;
          case 2:
            expect(dataAsString.slice(0, 3)).toEqual("503");
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with an error code when the DATA command is sent before the MAIL FROM command", (done) => {
      const client = new Socket();
      let step = 1;

      const senderEmail = faker.internet.email();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            client.write(`DATA\r\n`);
            step++;
            break;
          case 3:
            expect(dataAsString.slice(0, 3)).toEqual("503");
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with an error code when the DATA command is sent before the RCPT TO command", (done) => {
      const client = new Socket();
      let step = 1;

      const senderEmail = faker.internet.email();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            client.write(`MAIL FROM:<${senderEmail}>\r\n`);
            step++;
            break;
          case 3:
            client.write(`DATA\r\n`);
            step++;
            break;
          case 4:
            expect(dataAsString.slice(0, 3)).toEqual("503");
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with an error code when the DATA command is sent twice in a row", (done) => {
      const client = new Socket();
      let step = 1;

      const senderEmail = faker.internet.email();
      const recipientEmail = faker.internet.email();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            client.write(`MAIL FROM:<${senderEmail}>\r\n`);
            step++;
            break;
          case 3:
            client.write(`RCPT TO:<${recipientEmail}>\r\n`);
            step++;
            break;
          case 4:
            client.write("DATA\r\n");
            step++;
            break;
          case 5:
            client.write(".\r\n");
            step++;
            break;
          case 6:
            client.write("DATA\r\n");
            step++;
            break;
          case 7:
            expect(dataAsString.slice(0, 3)).toEqual("503");
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with a successful code when the EXPN command is sent with a mailing list", (done) => {
      const client = new Socket();
      let step = 1;

      const mailingList = faker.food.dish();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            client.write(`EXPN ${mailingList}\r\n`);
            step++;
            break;
          case 3:
            expect(dataAsString.slice(0, 3)).toEqual("252");
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with an error code when the EXPN command is sent before the HELO command", (done) => {
      const client = new Socket();
      let step = 1;

      const mailingList = faker.food.dish();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`EXPN ${mailingList}\r\n`);
            step++;
            break;
          case 2:
            expect(dataAsString.slice(0, 3)).toEqual("503");
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with a successful code when the HELO command is sent with the domain", (done) => {
      const client = new Socket();
      let step = 1;

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            expect(dataAsString.slice(0, vars.smtpServiceAgentServerHost.length + 10)).toEqual(`220 ${vars.smtpServiceAgentServerHost} ESMTP`);
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            expect(dataAsString.slice(0, 3)).toEqual(`250`);
            expect(dataAsString).toContain(vars.smtpServiceAgentServerHost);
            expect(dataAsString).toContain(vars.smtpServiceAgentServerHost);
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with an error code when the HELO command is sent without the domain", (done) => {
      const client = new Socket();
      let step = 1;

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            expect(dataAsString.slice(0, vars.smtpServiceAgentServerHost.length + 10)).toEqual(`220 ${vars.smtpServiceAgentServerHost} ESMTP`);
            client.write("HELO\r\n");
            step++;
            break;
          case 2:
            expect(dataAsString.slice(0, 3)).toEqual("501");
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with a successful code when the MAIL FROM command includes a valid email address (variation 1)", (done) => {
      const client = new Socket();
      let step = 1;

      const senderEmail = faker.internet.email();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            client.write(`MAIL FROM:<${senderEmail}>\r\n`);
            step++;
            break;
          case 3:
            expect(dataAsString.slice(0, 3)).toEqual(`250`);
            expect(dataAsString).toContain(senderEmail);
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with a successful code when the MAIL FROM command includes a valid email address (variation 2)", (done) => {
      const client = new Socket();
      let step = 1;

      const senderEmail = faker.internet.email();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            client.write(`MAIL FROM: <${senderEmail}>\r\n`);
            step++;
            break;
          case 3:
            expect(dataAsString.slice(0, 3)).toEqual(`250`);
            expect(dataAsString).toContain(senderEmail);
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it('should respond with a successful code when the MAIL FROM command is sent after the MAIL FROM command was initally sent before the HELO command', (done) => {
      const client = new Socket();
      let step = 1;

      const senderEmail = faker.internet.email();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`MAIL FROM:<${senderEmail}> \r\n`);
            step++;
            break
          case 2:
            expect(dataAsString.slice(0, 3)).toEqual("503");
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 3:
            expect(dataAsString.slice(0, vars.smtpServiceAgentServerHost.length + 10)).toEqual(`250 ${vars.smtpServiceAgentServerHost} Hello`);
            client.write(`MAIL FROM:<${senderEmail}>\r\n`);
            step++;
            break;
          case 4:
            expect(dataAsString.slice(0, 3)).toEqual("250");
            expect(dataAsString).toContain(senderEmail);
            client.end();
        }
      }

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with an error when the MAIL FROM command is sent before the HELO command", (done) => {
      const client = new Socket();
      let step = 1;

      const senderEmail = faker.internet.email();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`MAIL FROM:<${senderEmail}>\r\n`);
            step++;
            break;
          case 2:
            expect(dataAsString.slice(0, 3)).toEqual("503");
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with an error code when a MAIL FROM command is sent without an email address", (done) => {
      const client = new Socket();
      let step = 1;

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            client.write("MAIL FROM:\r\n");
            step++;
            break;
          case 3:
            expect(dataAsString.slice(0, 3)).toEqual("501");
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it('should respond with an error code when the MAIL FROM command is sent with 2 email addresses', (done) => {
      const client = new Socket();
      let step = 1;

      const senderEmailOne = faker.internet.email();
      const senderEmailTwo = faker.internet.email();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write('HELO ${vars.smtpServiceAgentServerHost}\r\n');
            step++;
            break;
          case 2:
            client.write(`MAIL FROM:<${senderEmailOne} ${senderEmailTwo}>\r\n`);
            step++;
            break;
          case 3:
            expect(dataAsString.slice(0, 3)).toEqual("501");
            client.end();
            break;
        }
      }

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it('should respond with an error code when the MAIL FROM command is sent with 1 email address and 1 malformed email address', (done) => {
      const client = new Socket();
      let step = 1;

      const senderEmailOne = faker.internet.email();
      const senderEmailTwo = faker.internet.email().replace("@", "");

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write('HELO ${vars.smtpServiceAgentServerHost}\r\n');
            step++;
            break;
          case 2:
            client.write(`MAIL FROM:<${senderEmailOne} ${senderEmailTwo}>\r\n`);
            step++;
            break;
          case 3:
            expect(dataAsString.slice(0, 3)).toEqual("501");
            client.end();
            break;
        }
      }

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it('should respond with an error code when the MAIL FROM command is sent with 1 malformed email address and 1 email address', (done) => {
      const client = new Socket();
      let step = 1;

      const senderEmailOne = faker.internet.email().replace("@", "");
      const senderEmailTwo = faker.internet.email();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write('HELO ${vars.smtpServiceAgentServerHost}\r\n');
            step++;
            break;
          case 2:
            client.write(`MAIL FROM:<${senderEmailOne} ${senderEmailTwo}>\r\n`);
            step++;
            break;
          case 3:
            expect(dataAsString.slice(0, 3)).toEqual("501");
            client.end();
            break;
        }
      }

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it('should respond with an error code when the MAIL FROM command is sent with 2 malformed email addresses', (done) => {
      const client = new Socket();
      let step = 1;

      const senderEmailOne = faker.internet.email().replace("@", "");
      const senderEmailTwo = faker.internet.email().replace("@", "");

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write('HELO ${vars.smtpServiceAgentServerHost}\r\n');
            step++;
            break;
          case 2:
            client.write(`MAIL FROM:<${senderEmailOne} ${senderEmailTwo}>\r\n`);
            step++;
            break;
          case 3:
            expect(dataAsString.slice(0, 3)).toEqual("501");
            client.end();
            break;
        }
      }

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with an error code when a MAIL FROM command is sent twice in a row", (done) => {
      const client = new Socket();
      let step = 1;

      const senderEmail = faker.internet.email();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            client.write(`MAIL FROM:<${senderEmail}>\r\n`);
            step++;
            break;
          case 3:
            client.write(`MAIL FROM:<${senderEmail}>\r\n`);
            step++;
            break;
          case 4:
            expect(dataAsString.slice(0, 3)).toEqual("503");
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with an error code when the MAIL FROM command is sent a second time without an email address", (done) => {
      const client = new Socket();
      let step = 1;

      const senderEmail = faker.internet.email();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            client.write(`MAIL FROM:<${senderEmail}>\r\n`);
            step++;
            break;
          case 3:
            client.write("MAIL FROM:\r\n");
            step++;
            break;
          case 4:
            expect(dataAsString.slice(0, 3)).toEqual("503");
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond successfully when a NOOP command is sent", (done) => {
      const client = new Socket();
      let step = 1;

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            client.write("NOOP\r\n");
            step++;
            break;
          case 3:
            expect(dataAsString.slice(0, 3)).toEqual("250");
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should close the connection when the QUIT command is sent after connecting", (done) => {
      const client = new Socket();
      let step = 1;

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write("QUIT Goodbye\r\n");
            step++;
            break;
          case 2:
            expect(dataAsString.slice(0, 3)).toEqual("221");
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should close the connection when the QUIT command is sent after HELO command is sent", (done) => {
      const client = new Socket();
      let step = 1;

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            client.write("QUIT Goodbye\r\n");
            step++;
            break;
          case 3:
            expect(dataAsString.slice(0, 3)).toEqual("221");
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should close the connection when the QUIT command is sent after MAIL FROM command is sent", (done) => {
      const client = new Socket();
      let step = 1;

      const senderEmail = faker.internet.email();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            client.write(`MAIL FROM:<${senderEmail}>\r\n`);
            step++;
            break;
          case 3:
            client.write("QUIT Goodbye\r\n");
            step++;
            break;
          case 4:
            expect(dataAsString.slice(0, 3)).toEqual("221");
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should close the connection when the QUIT command is sent after RCPT TO command is sent", (done) => {
      const client = new Socket();
      let step = 1;

      const senderEmail = faker.internet.email();
      const recipientEmail = faker.internet.email();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            client.write(`MAIL FROM:<${senderEmail}>\r\n`);
            step++;
            break;
          case 3:
            client.write(`RCPT TO:<${recipientEmail}>\r\n`);
            step++;
            break;
          case 4:
            client.write("QUIT Goodbye\r\n");
            step++;
            break;
          case 5:
            expect(dataAsString.slice(0, 3)).toEqual("221");
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with a successful code when a valid email address is sent in the RCPT TO command after the MAIL FROM command (variation 1)", (done) => {
      const client = new Socket();
      let step = 1;

      const senderEmail = faker.internet.email();
      const recipientEmail = faker.internet.email();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            client.write(`MAIL FROM:<${senderEmail}>\r\n`);
            step++;
            break;
          case 3:
            client.write(`RCPT TO:<${recipientEmail}>\r\n`);
            step++;
            break;
          case 4:
            expect(dataAsString.slice(0, 3)).toEqual(`250`);
            expect(dataAsString).toContain(recipientEmail);
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with a successful code when a valid email address is sent in the RCPT TO command after the MAIL FROM command (variation 2)", (done) => {
      const client = new Socket();
      let step = 1;

      const senderEmail = faker.internet.email();
      const recipientEmail = faker.internet.email();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            client.write(`MAIL FROM: <${senderEmail}>\r\n`);
            step++;
            break;
          case 3:
            client.write(`RCPT TO: <${recipientEmail}>\r\n`);
            step++;
            break;
          case 4:
            expect(dataAsString.slice(0, 3)).toEqual(`250`);
            expect(dataAsString).toContain(recipientEmail);
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with a successful code when multiple RCPT TO commands to be sent in a row", (done) => {
      const client = new Socket();
      let step = 1;

      const senderEmail = faker.internet.email();
      const recipientEmail1 = faker.internet.email();
      const recipientEmail2 = faker.internet.email();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            client.write(`MAIL FROM: <${senderEmail}>\r\n`);
            step++;
            break;
          case 3:
            client.write(`RCPT TO: <${recipientEmail1}>\r\n`);
            step++;
            break;
          case 4:
            client.write(`RCPT TO: <${recipientEmail2}>\r\n`);
            step++;
            break;
          case 5:
            expect(dataAsString.slice(0, 3)).toEqual(`250`);
            expect(dataAsString).toContain(recipientEmail2);
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with an error code when the RCPT TO command is sent before the HELO command", (done) => {
      const client = new Socket();
      let step = 1;

      const recipientEmail = faker.internet.email();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`RCPT TO:<${recipientEmail}>\r\n`);
            step++;
            break;
          case 2:
            expect(dataAsString.slice(0, 3)).toEqual("503");
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with an error code when a RCPT TO command is sent without an email address", (done) => {
      const client = new Socket();
      let step = 1;

      const senderEmail = faker.internet.email();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            client.write(`MAIL FROM:<${senderEmail}>\r\n`);
            step++;
            break;
          case 3:
            client.write("RCPT TO:\r\n");
            step++;
            break;
          case 4:
            expect(dataAsString.slice(0, 3)).toEqual("501");
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with an error code when a RCPT TO command is sent before a MAIL FROM command", (done) => {
      const client = new Socket();
      let step = 1;

      const recipientEmail = faker.internet.email();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            client.write(`RCPT TO:<${recipientEmail}>\r\n`);
            step++;
            break;
          case 3:
            expect(dataAsString.slice(0, 3)).toEqual("503");
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with a successful code when the RSET command is sent before the HELO command", (done) => {
      const client = new Socket();
      let step = 1;

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write("RSET\r\n");
            step++;
            break;
          case 2:
            expect(dataAsString.slice(0, 3)).toEqual("503");
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with a successful code when the RSET command is sent before the MAIL FROM command", (done) => {
      const client = new Socket();
      let step = 1;

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            client.write("RSET\r\n");
            step++;
            break;
          case 3:
            expect(dataAsString.slice(0, 3)).toEqual("250");
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with a successful code when the RSET command is sent before the RCPT TO command", (done) => {
      const client = new Socket();
      let step = 1;

      const senderEmail = faker.internet.email();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            client.write(`MAIL FROM:<${senderEmail}>\r\n`);
            step++;
            break;
          case 3:
            client.write("RSET\r\n");
            step++;
            break;
          case 4:
            expect(dataAsString.slice(0, 3)).toEqual("250");
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with an error code when the SEND command is sent before the HELO command", (done) => {
      const client = new Socket();
      let step = 1;

      const senderEmail = faker.internet.email();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`SEND ${senderEmail}\r\n`);
            step++;
            break;
          case 2:
            expect(dataAsString.slice(0, 3)).toEqual("503");
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with an error code when the SEND command is sent", (done) => {
      const client = new Socket();
      let step = 1;

      const senderEmail = faker.internet.email();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            client.write(`SEND ${senderEmail}\r\n`);
            step++;
            break;
          case 3:
            expect(dataAsString.slice(0, 3)).toEqual("502");
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with a successful code when the VRFY command is sent with a username", (done) => {
      const client = new Socket();
      let step = 1;

      const username = faker.internet.username();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`HELO ${vars.smtpServiceAgentServerHost}\r\n`);
            step++;
            break;
          case 2:
            client.write(`VRFY ${username}\r\n`);
            step++;
            break;
          case 3:
            expect(dataAsString.slice(0, 3)).toEqual("252");
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should respond with an error code when the VRFY command is sent before the HELO command", (done) => {
      const client = new Socket();
      let step = 1;

      const username = faker.internet.username();

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`VRFY ${username}\r\n`);
            step++;
            break;
          case 2:
            expect(dataAsString.slice(0, 3)).toEqual("503");
            client.end();
            break;
        }
      };

      client.on("data", onDataHandler);
      client.on("end", done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });
  });

  describe("Storing the input data in the database", () => {
    let mongodbClient: MongoClient;

    let connectionCollection: Collection<Document>;
    let linesCollection: Collection<Document>;

    afterAll(async () => {
      await mongodbClient.close();
    });

    beforeAll(async () => {
      mongodbClient = new MongoClient(
        vars.smtpDatabaseUri,
        {
          auth: {
            username: 'user',
            password: 'password',
          },
        }
      );
      await mongodbClient.connect();
      const db = mongodbClient.db(vars.smtpDatabaseName);
      connectionCollection = db.collection("connections");
      linesCollection = db.collection("lines");
    });

    it('should store the connection data when no input data is sent', (done) => {
      const client = new Socket();
      let step = 1;

      const serverHostLength = vars.smtpServiceAgentServerHost.length;
      const uuidOffset = serverHostLength + 11;

      const onDataHandler = async (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            expect(dataAsString.slice(0, serverHostLength + 10)).toEqual(`220 ${vars.smtpServiceAgentServerHost} ESMTP`);
            client.end();
            await new Promise((resolve) => setTimeout(resolve, 2000));
            connectionCollection
              .findOne({ uuid: dataAsString.slice(uuidOffset, uuidOffset + 36) })
              .then((data) => {
                expect(data).not.toBeNull();
              })
              .then(done)
              .catch(done);
        }
      };

      client.on("data", onDataHandler);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should store the input data when only a QUIT command is sent", (done) => {
      const client = new Socket();
      let step = 1;

      const quitMessage = `QUIT Bye [testid:${faker.string.uuid()}]`;

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`${quitMessage}\r\n`);
            step++;
            break;
          case 2:
            expect(dataAsString.slice(0, 3)).toEqual("221");
            client.end();
        }
      };

      const onEndHandler = async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        linesCollection
          .findOne({ data: quitMessage })
          .then((data) => {
            expect(data).not.toBeNull();
          })
          .then(done)
          .catch(done);
      };

      client.on("data", onDataHandler);
      client.on("end", onEndHandler);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should store the input data when a only a HELO command is sent", (done) => {
      const client = new Socket();
      let step = 1;

      const heloMessage = `HELO ${vars.smtpServiceAgentServerHost} [testid:${faker.string.uuid()}]`;
      const quitMessage = `QUIT Bye [testid:${faker.string.uuid()}]`;

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`${heloMessage}\r\n`);
            step++;
            break;
          case 2:
            client.write(`${quitMessage}\r\n`);
            step++;
            break;
          case 3:
            expect(dataAsString.slice(0, 3)).toEqual("221");
            client.end();
        }
      };

      const onEndHandler = async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const heloQuery = linesCollection.findOne({ data: heloMessage });
        const quitQuery = linesCollection.findOne({ data: quitMessage });

        await Promise.all([heloQuery, quitQuery])
          .then(([heloData, quitData]) => {
            expect(heloData).not.toBeNull();
            expect(quitData).not.toBeNull();
          })
          .then(done)
          .catch(done);
      };

      client.on("data", onDataHandler);
      client.on("end", onEndHandler);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should store the input data when a HELO and MAIL FROM command are sent", (done) => {
      const client = new Socket();
      let step = 1;

      const heloMessage = `HELO ${vars.smtpServiceAgentServerHost} [testid:${faker.string.uuid()}]`;
      const mailFromMessage = `MAIL FROM:<${faker.internet.email()}> [testid:${faker.string.uuid()}]`;
      const quitMessage = `QUIT Bye [testid:${faker.string.uuid()}]`;

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`${heloMessage}\r\n`);
            step++;
            break;
          case 2:
            client.write(`${mailFromMessage}\r\n`);
            step++;
            break;
          case 3:
            client.write(`${quitMessage}\r\n`);
            step++;
            break;
          case 4:
            expect(dataAsString.slice(0, 3)).toEqual("221");
            client.end();
        }
      };

      const onEndHandler = async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const heloQuery = linesCollection.findOne({ data: heloMessage });
        const mailFromQuery = linesCollection.findOne({
          data: mailFromMessage,
        });
        const quitQuery = linesCollection.findOne({ data: quitMessage });

        await Promise.all([heloQuery, mailFromQuery, quitQuery])
          .then(([heloData, mailFromData, quitData]) => {
            expect(heloData).not.toBeNull();
            expect(mailFromData).not.toBeNull();
            expect(quitData).not.toBeNull();
          })
          .then(done)
          .catch(done);
      };

      client.on("data", onDataHandler);
      client.on("end", onEndHandler);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should store the input data when a HELO, MAIL FROM, and RCPT TO command are sent", (done) => {
      const client = new Socket();
      let step = 1;

      const heloMessage = `HELO ${vars.smtpServiceAgentServerHost} [testid:${faker.string.uuid()}]`;
      const mailFromMessage = `MAIL FROM:<${faker.internet.email()}> [testid:${faker.string.uuid()}]`;
      const rcptToMessage = `RCPT TO:<${faker.internet.email()}> [testid:${faker.string.uuid()}]`;
      const quitMessage = `QUIT Bye [testid:${faker.string.uuid()}]`;

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`${heloMessage}\r\n`);
            step++;
            break;
          case 2:
            client.write(`${mailFromMessage}\r\n`);
            step++;
            break;
          case 3:
            client.write(`${rcptToMessage}\r\n`);
            step++;
            break;
          case 4:
            client.write(`${quitMessage}\r\n`);
            step++;
            break;
          case 5:
            expect(dataAsString.slice(0, 3)).toEqual("221");
            client.end();
        }
      };

      const onEndHandler = async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const heloQuery = linesCollection.findOne({ data: heloMessage });
        const mailFromQuery = linesCollection.findOne({
          data: mailFromMessage,
        });
        const rcptToQuery = linesCollection.findOne({ data: rcptToMessage });
        const quitQuery = linesCollection.findOne({ data: quitMessage });

        await Promise.all([heloQuery, mailFromQuery, rcptToQuery, quitQuery])
          .then(([heloData, mailFromData, rcptToData, quitData]) => {
            expect(heloData).not.toBeNull();
            expect(mailFromData).not.toBeNull();
            expect(rcptToData).not.toBeNull();
            expect(quitData).not.toBeNull();
          })
          .then(done)
          .catch(done);
      };

      client.on("data", onDataHandler);
      client.on("end", onEndHandler);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should store the input data when a HELO, MAIL FROM, RCPT TO, and DATA command are sent", (done) => {
      const client = new Socket();
      let step = 1;

      const heloMessage = `HELO ${vars.smtpServiceAgentServerHost} [testid:${faker.string.uuid()}]`;
      const mailFromMessage = `MAIL FROM:<${faker.internet.email()}> [testid:${faker.string.uuid()}]`;
      const rcptToMessage = `RCPT TO:<${faker.internet.email()}> [testid:${faker.string.uuid()}]`;
      const dataMessage = `DATA`;
      const dataContentMessage = faker.lorem.paragraphs();
      const dataEndMessage = `.`;
      const quitMessage = `QUIT Bye [testid:${faker.string.uuid()}]`;

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`${heloMessage}\r\n`);
            step++;
            break;
          case 2:
            client.write(`${mailFromMessage}\r\n`);
            step++;
            break;
          case 3:
            client.write(`${rcptToMessage}\r\n`);
            step++;
            break;
          case 4:
            client.write(`${dataMessage}\r\n`);
            step++;
            break;
          case 5:
            client.write(`${dataContentMessage}\r\n`);
            client.write(`${dataEndMessage}\r\n`);
            step++;
            break;
          case 6:
            client.write(`${quitMessage}\r\n`);
            step++;
            break;
          case 7:
            expect(dataAsString.slice(0, 3)).toEqual("221");
            client.end();
        }
      };

      const onEndHandler = async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const heloQuery = linesCollection.findOne({ data: heloMessage });
        const mailFromQuery = linesCollection.findOne({
          data: mailFromMessage,
        });
        const rcptToQuery = linesCollection.findOne({ data: rcptToMessage });
        const dataQuery = linesCollection.findOne({ data: dataMessage });
        const quitQuery = linesCollection.findOne({ data: quitMessage });

        await Promise.all([heloQuery, mailFromQuery, rcptToQuery, dataQuery, quitQuery])
          .then(([heloData, mailFromData, rcptToData, dataData, quitData]) => {
            expect(heloData).not.toBeNull();
            expect(mailFromData).not.toBeNull();
            expect(rcptToData).not.toBeNull();
            expect(dataData).not.toBeNull();
            expect(quitData).not.toBeNull();
          })
          .then(done)
          .catch(done);
      };

      client.on("data", onDataHandler);
      client.on("end", onEndHandler);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should store the input data when the HELO, MAIL FROM are sent along with multiple RCPT TO commands", (done) => {
      const client = new Socket();
      let step = 1;

      const heloMessage = `HELO ${vars.smtpServiceAgentServerHost} [testid:${faker.string.uuid()}]`;
      const mailFromMessage = `MAIL FROM:<${faker.internet.email()}> [testid:${faker.string.uuid()}]`;
      const rcptToMessage1 = `RCPT TO:<${faker.internet.email()}> [testid:${faker.string.uuid()}]`;
      const rcptToMessage2 = `RCPT TO:<${faker.internet.email()}> [testid:${faker.string.uuid()}]`;
      const quitMessage = `QUIT Bye [testid:${faker.string.uuid()}]`;

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`${heloMessage}\r\n`);
            step++;
            break;
          case 2:
            client.write(`${mailFromMessage}\r\n`);
            step++;
            break;
          case 3:
            client.write(`${rcptToMessage1}\r\n`);
            step++;
            break;
          case 4:
            client.write(`${rcptToMessage2}\r\n`);
            step++;
            break;
          case 5:
            client.write(`${quitMessage}\r\n`);
            step++;
            break;
          case 6:
            expect(dataAsString.slice(0, 3)).toEqual("221");
            client.end();
        }
      };

      const onEndHandler = async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const heloQuery = linesCollection.findOne({ data: heloMessage });
        const mailFromQuery = linesCollection.findOne({
          data: mailFromMessage,
        });
        const rcptToQuery1 = linesCollection.findOne({ data: rcptToMessage1 });
        const rcptToQuery2 = linesCollection.findOne({ data: rcptToMessage2 });
        const quitQuery = linesCollection.findOne({ data: quitMessage });

        await Promise.all([heloQuery, mailFromQuery, rcptToQuery1, rcptToQuery2, quitQuery])
          .then(
            ([heloData, mailFromData, rcptToData1, rcptToData2, quitData]) => {
              expect(heloData).not.toBeNull();
              expect(mailFromData).not.toBeNull();
              expect(rcptToData1).not.toBeNull();
              expect(rcptToData2).not.toBeNull();
              expect(quitData).not.toBeNull();
            }
          )
          .then(done)
          .catch(done);
      };

      client.on("data", onDataHandler);
      client.on("end", onEndHandler);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should store the input data when the HELO is sent and then MAIL FROM, RCPT TO, DATA are sent twice", (done) => {
      const client = new Socket();
      let step = 1;

      const heloMessage = `HELO ${vars.smtpServiceAgentServerHost} [testid:${faker.string.uuid()}]`;
      const mailFromMessage1 = `MAIL FROM:<${faker.internet.email()}> [testid:${faker.string.uuid()}]`;
      const rcptToMessage1 = `RCPT TO:<${faker.internet.email()}> [testid:${faker.string.uuid()}]`;
      const dataMessage1 = `DATA [testid:${faker.string.uuid()}]`;
      const dataContentMessage1 = faker.lorem.paragraphs();
      const dataEndMessage1 = `.`;
      const mailFromMessage2 = `MAIL FROM:<${faker.internet.email()}> [testid:${faker.string.uuid()}]`;
      const rcptToMessage2 = `RCPT TO:<${faker.internet.email()}> [testid:${faker.string.uuid()}]`;
      const dataMessage2 = `DATA [testid:${faker.string.uuid()}]`;
      const dataContentMessage2 = faker.lorem.paragraphs();
      const dataEndMessage2 = `.`;
      const quitMessage = `QUIT Bye [testid:${faker.string.uuid()}]`;

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`${heloMessage}\r\n`);
            step++;
            break;
          case 2:
            client.write(`${mailFromMessage1}\r\n`);
            step++;
            break;
          case 3:
            client.write(`${rcptToMessage1}\r\n`);
            step++;
            break;
          case 4:
            client.write(`${dataMessage1}\r\n`);
            step++;
            break;
          case 5:
            client.write(`${dataContentMessage1}\r\n`);
            client.write(`${dataEndMessage1}\r\n`);
            step++;
            break;
          case 6:
            client.write(`${mailFromMessage2}\r\n`);
            step++;
            break;
          case 7:
            client.write(`${rcptToMessage2}\r\n`);
            step++;
            break;
          case 8:
            client.write(`${dataMessage2}\r\n`);
            step++;
            break;
          case 9:
            client.write(`${dataContentMessage2}\r\n`);
            client.write(`${dataEndMessage2}\r\n`);
            step++;
            break;
          case 10:
            client.write(`${quitMessage}\r\n`);
            step++;
            break;
          case 11:
            expect(dataAsString.slice(0, 3)).toEqual("221");
            client.end();
        }
      };

      const onEndHandler = async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const heloQuery = linesCollection.findOne({ data: heloMessage });
        const mailFromQuery1 = linesCollection.findOne({
          data: mailFromMessage1,
        });
        const rcptToQuery1 = linesCollection.findOne({ data: rcptToMessage1 });
        const dataQuery1 = linesCollection.findOne({ data: dataMessage1 });
        const mailFromQuery2 = linesCollection.findOne({
          data: mailFromMessage2,
        });
        const rcptToQuery2 = linesCollection.findOne({ data: rcptToMessage2 });
        const dataQuery2 = linesCollection.findOne({ data: dataMessage2 });
        const quitQuery = linesCollection.findOne({ data: quitMessage });

        await Promise.all([heloQuery, mailFromQuery1, rcptToQuery1, dataQuery1, mailFromQuery2, rcptToQuery2, dataQuery2, quitQuery])
          .then(
            ([heloData, mailFromData1, rcptToData1, dataData1, mailFromData2, rcptToData2, dataData2, quitData]) => {
              expect(heloData).not.toBeNull();
              expect(mailFromData1).not.toBeNull();
              expect(rcptToData1).not.toBeNull();
              expect(dataData1).not.toBeNull();
              expect(mailFromData2).not.toBeNull();
              expect(rcptToData2).not.toBeNull();
              expect(dataData2).not.toBeNull();
              expect(quitData).not.toBeNull();
            }
          )
          .then(done)
          .catch(done);
      };

      client.on("data", onDataHandler);
      client.on("end", onEndHandler);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });

    it("should store the input data when the HELO is sent and then MAIL FROM, RCPT TO, DATA are sent twice with a RSET command in between", (done) => {
      const client = new Socket();
      let step = 1;

      const heloMessage = `HELO ${vars.smtpServiceAgentServerHost} [testid:${faker.string.uuid()}]`;
      const mailFromMessage1 = `MAIL FROM:<${faker.internet.email()}> [testid:${faker.string.uuid()}]`;
      const rcptToMessage1 = `RCPT TO:<${faker.internet.email()}> [testid:${faker.string.uuid()}]`;
      const dataMessage1 = `DATA [testid:${faker.string.uuid()}]`;
      const dataContentMessage1 = faker.lorem.paragraphs();
      const dataEndMessage1 = `.`;
      const mailFromMessage2 = `MAIL FROM:<${faker.internet.email()}> [testid:${faker.string.uuid()}]`;
      const rcptToMessage2 = `RCPT TO:<${faker.internet.email()}> [testid:${faker.string.uuid()}]`;
      const rsetMessage = `RSET [testid:${faker.string.uuid()}]`;
      const mailFromMessage3 = `MAIL FROM:<${faker.internet.email()}> [testid:${faker.string.uuid()}]`;
      const rcptToMessage3 = `RCPT TO:<${faker.internet.email()}> [testid:${faker.string.uuid()}]`;
      const dataMessage3 = `DATA [testid:${faker.string.uuid()}]`;
      const dataContentMessage3 = faker.lorem.paragraphs();
      const dataEndMessage3 = `.`;
      const quitMessage = `QUIT Bye [testid:${faker.string.uuid()}]`;

      const onDataHandler = (data: Buffer) => {
        const dataAsString = data.toString();
        switch (step) {
          case 1:
            client.write(`${heloMessage}\r\n`);
            step++;
            break;
          case 2:
            client.write(`${mailFromMessage1}\r\n`);
            step++;
            break;
          case 3:
            client.write(`${rcptToMessage1}\r\n`);
            step++;
            break;
          case 4:
            client.write(`${dataMessage1}\r\n`);
            step++;
            break;
          case 5:
            client.write(`${dataContentMessage1}\r\n`);
            client.write(`${dataEndMessage1}\r\n`);
            step++;
            break;
          case 6:
            client.write(`${mailFromMessage2}\r\n`);
            step++;
            break;
          case 7:
            client.write(`${rcptToMessage2}\r\n`);
            step++;
            break;
          case 8:
            client.write(`${rsetMessage}\r\n`);
            step++;
            break;
          case 9:
            client.write(`${mailFromMessage3}\r\n`);
            step++;
            break;
          case 10:
            client.write(`${rcptToMessage3}\r\n`);
            step++;
            break;
          case 11:
            client.write(`${dataMessage3}\r\n`);
            step++;
            break;
          case 12:
            client.write(`${dataContentMessage3}\r\n`);
            client.write(`${dataEndMessage3}\r\n`);
            step++;
            break;
          case 13:
            client.write(`${quitMessage}\r\n`);
            step++;
            break;
          case 14:
            expect(dataAsString.slice(0, 3)).toEqual("221");
            client.end();
        }
      };

      const onEndHandler = async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const heloQuery = linesCollection.findOne({ data: heloMessage });
        const mailFromQuery1 = linesCollection.findOne({
          data: mailFromMessage1,
        });
        const rcptToQuery1 = linesCollection.findOne({ data: rcptToMessage1 });
        const dataQuery1 = linesCollection.findOne({ data: dataMessage1 });
        const mailFromQuery2 = linesCollection.findOne({
          data: mailFromMessage2,
        });
        const rcptToQuery2 = linesCollection.findOne({ data: rcptToMessage2 });
        const rsetQuery = linesCollection.findOne({ data: rsetMessage });
        const mailFromQuery3 = linesCollection.findOne({
          data: mailFromMessage3,
        });
        const rcptToQuery3 = linesCollection.findOne({ data: rcptToMessage3 });
        const dataQuery3 = linesCollection.findOne({ data: dataMessage3 });
        const quitQuery = linesCollection.findOne({ data: quitMessage });

        await Promise.all([heloQuery, mailFromQuery1, rcptToQuery1, dataQuery1, mailFromQuery2, rcptToQuery2, rsetQuery, mailFromQuery3, rcptToQuery3, dataQuery3, quitQuery])
          .then(
            ([heloData, mailFromData1, rcptToData1, dataData1, mailFromData2, rcptToData2, rsetData, mailFromData3, rcptToData3, dataData3, quitData]) => {
              expect(heloData).not.toBeNull();
              expect(mailFromData1).not.toBeNull();
              expect(rcptToData1).not.toBeNull();
              expect(dataData1).not.toBeNull();
              expect(mailFromData2).not.toBeNull();
              expect(rcptToData2).not.toBeNull();
              expect(rsetData).not.toBeNull();
              expect(mailFromData3).not.toBeNull();
              expect(rcptToData3).not.toBeNull();
              expect(dataData3).not.toBeNull();
              expect(quitData).not.toBeNull();
            }
          )
          .then(done)
          .catch(done);
      };

      client.on("data", onDataHandler);
      client.on("end", onEndHandler);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });
  });
});
