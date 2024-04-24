import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
} from '@aws-sdk/client-ses';

import { Mail } from './mail/Mail';
import { config } from '../config';

const ses = new SESClient({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
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
    Source: `"${config.email.fromName}" <${config.email.fromAddress}>`,
    ReplyToAddresses: [config.email.replyToAddress],
  };

  await ses.send(
    new SendEmailCommand({
      ...params,
    }),
  );
};
