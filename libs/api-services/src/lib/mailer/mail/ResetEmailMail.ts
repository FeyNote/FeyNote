import { Mail } from './Mail';
import dedent from 'dedent';
import { signature } from './reusables/signature';
import { sendMail } from '../sendMail';
import { globalServerConfig } from '@feynote/config';

export class ResetEmailMail implements Mail {
  public readonly to: string[];
  public readonly cc: undefined;
  public readonly from = globalServerConfig.email.fromAddress;
  public readonly subject: string;
  public readonly html: string;
  public readonly plain: string;

  constructor(args: { to: string[]; name: string; resetLink: string }) {
    this.to = args.to;
    this.subject = this.getSubject();
    this.html = this.getHTML(args.name, args.resetLink);
    this.plain = this.getPlain(args.name, args.resetLink);
  }

  public send() {
    return sendMail(this);
  }

  private getSubject() {
    return 'FeyNote Email Change';
  }

  private getHTML(name: string, resetLink: string) {
    return dedent`
      Hello ${name},
      <br /><br />
      Someone recently requested to change the email address for the FeyNote account associated with this email address.
      <br /><br />
      If you did not request this, please disregard this email.
      <br /><br />
      To change your email, paste this url into your browser: <a href="${resetLink}">${resetLink}</a>
      <br /><br />
      ${signature.html}
    `;
  }

  private getPlain(name: string, resetLink: string) {
    return dedent`
      Hello ${name},

      Someone recently requested to change the email address for the FeyNote account associated with this email address.

      If you did not request this, please disregard this email.

      To change your email, paste this url into your browser: ${resetLink}

      ${signature.plain}
    `;
  }
}
