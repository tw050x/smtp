import { Socket } from 'node:net';

import * as vars from '../jest.vars';

const CLIENT_HOST = 'dummy.com';

describe('KC-1 - Implement SMTP server to RFC 5321 standards', () => {
  describe('Handling the EHLO command', () => {
    it('should respond with a successful code when the EHLO command is sent', done => {
      const client = new Socket();
      let step = 1;

      const serverHostLength = vars.smtpServiceAgentServerHost.length;

      const handler = (data: Buffer) => {
        const dataAsString = data.toString()
        switch (step) {
          case 1:
            expect(dataAsString.slice(0, serverHostLength + 10)).toEqual(`220 ${vars.smtpServiceAgentServerHost} ESMTP`);
            client.write(`EHLO ${CLIENT_HOST}\r\n`);
            step++;
            break;
          case 2:
            const lines = dataAsString.split('\r\n').slice(0, -1);
            lines.forEach((line) => expect(line.slice(0, 3)).toEqual(`250`));
            client.end();
            break;
        }
      }

      client.on('data', handler);
      client.on('end', done);
      client.connect(Number(vars.smtpServiceAgentServerPort), vars.smtpServiceAgentServerHost);
    });
  });
});
