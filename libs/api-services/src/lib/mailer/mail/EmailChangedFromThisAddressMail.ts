import { Mail } from './Mail';
import dedent from 'dedent';
import { signature } from './reusables/signature';
import { sendMail } from '../sendMail';
import { globalServerConfig } from '@feynote/config';

export class EmailChangedFromThisAddressMail implements Mail {
  public readonly to: string[];
  public readonly cc: undefined;
  public readonly from = globalServerConfig.email.fromAddress;
  public readonly subject: string;
  public readonly html: string;
  public readonly plain: string;

  constructor(args: {
    to: string[];
    name: string;
    newEmail: string;
    authResetToken: string;
  }) {
    this.to = args.to;
    this.subject = this.getSubject();
    this.html = this.getHTML(args.name, args.newEmail, args.authResetToken);
    this.plain = this.getPlain(args.name, args.newEmail, args.authResetToken);
  }

  public send() {
    return sendMail(this);
  }

  private getSubject() {
    return 'FeyNote Email Changed';
  }

  private getHTML(name: string, newEmail: string, authResetToken: string) {
    return dedent`
      Hello ${name},
      <br /><br />
      You recently updated your FeyNote account email address to ${newEmail}. If this action was not taken by you, please contact us and forward this email to our support email address (support@feynote.com).
      <br /><br />
      ${signature.html}
      <br /><br />
      Signature: ${authResetToken}
    `;
  }

  private getPlain(name: string, newEmail: string, authResetToken: string) {
    return dedent`
      Hello ${name},

      You recently updated your FeyNote account email address to ${newEmail}. If this action was not taken by you, please contact us and forward this email to our support email address (support@feynote.com).

      ${signature.plain}

      Signature: ${authResetToken}
    `;
  }
}
