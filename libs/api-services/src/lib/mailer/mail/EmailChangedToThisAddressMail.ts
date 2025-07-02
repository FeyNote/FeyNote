import { Mail } from './Mail';
import dedent from 'dedent';
import { signature } from './reusables/signature';
import { sendMail } from '../sendMail';
import { globalServerConfig } from '@feynote/config';

export class EmailChangedToThisAddressMail implements Mail {
  public readonly to: string[];
  public readonly cc: undefined;
  public readonly from = globalServerConfig.email.fromAddress;
  public readonly subject: string;
  public readonly html: string;
  public readonly plain: string;

  constructor(args: { to: string[]; name: string }) {
    this.to = args.to;
    this.subject = this.getSubject();
    this.html = this.getHTML(args.name);
    this.plain = this.getPlain(args.name);
  }

  public send() {
    return sendMail(this);
  }

  private getSubject() {
    return 'FeyNote Email Changed';
  }

  private getHTML(name: string) {
    return dedent`
      Hello ${name},
      <br /><br />
      Someone recently updated their FeyNote account email address to this email. If that is unexpected or in error, please contact us.
      <br /><br />
      ${signature.html}
    `;
  }

  private getPlain(name: string) {
    return dedent`
      Hello ${name},

      Someone recently updated their FeyNote account email address to this email. If that is unexpected or in error, please contact us.

      ${signature.plain}
    `;
  }
}
