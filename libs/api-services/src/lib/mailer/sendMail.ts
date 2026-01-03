import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
} from '@aws-sdk/client-ses';

import { Mail } from './mail/Mail';
import { globalServerConfig } from '@feynote/config';
import dedent from 'dedent';
import { logger } from '../logging/logger';

const ses = new SESClient({
  region: globalServerConfig.aws.region,
  credentials: {
    accessKeyId: globalServerConfig.aws.accessKeyId,
    secretAccessKey: globalServerConfig.aws.secretAccessKey,
  },
});

export const sendMail = async (mail: Mail) => {
  const params: SendEmailCommandInput = {
    Destination: {
      CcAddresses: mail.cc || [],
      ToAddresses: mail.to,
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: mail.html,
        },
        Text: {
          Charset: 'UTF-8',
          Data: mail.plain,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: mail.subject,
      },
    },
    Source: `"${globalServerConfig.email.fromName}" <${globalServerConfig.email.fromAddress}>`,
    ReplyToAddresses: [globalServerConfig.email.replyToAddress],
  };

  if (
    process.env['NODE_ENV'] === 'development' ||
    globalServerConfig.selfhost
  ) {
    logger.info(dedent`
      ======= sendEmail =======
      To: ${mail.to}
      Cc: ${mail.cc}
      Subject: ${mail.subject}
      HTML:
      ${mail.html}
      Text:
      ${mail.plain}
      ======= This mail was not sent due to development or selfhost mode =======
    `);
  } else {
    await ses.send(
      new SendEmailCommand({
        ...params,
      }),
    );
  }
};
