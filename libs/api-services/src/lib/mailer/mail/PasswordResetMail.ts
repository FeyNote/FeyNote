import { Mail } from './Mail';
import dedent from 'dedent';
import { signature } from './reusables/signature';
import { sendMail } from '../sendMail';
import { globalServerConfig } from '@feynote/config';

export class PasswordResetMail implements Mail {
  public readonly to: string[];
  public readonly cc: undefined;
  public readonly from = globalServerConfig.email.fromAddress;
  public readonly subject: string;
  public readonly html: string;
  public readonly plain: string;

  constructor(to: string[], name: string, resetLink: string) {
    this.to = to;
    this.subject = this.getSubject();
    this.html = this.getHTML(name, resetLink);
    this.plain = this.getPlain(name, resetLink);
  }

  public send() {
    return sendMail(this);
  }

  private getSubject() {
    return 'DnD Assistant Password Reset';
  }

  private getHTML(name: string, resetLink: string) {
    return dedent`
      Hello ${name},
      <br /><br />
      Someone recently requested a password reset link for the DnD Assistant account associated with this email address.
      <br /><br />
      If you did not request a password reset, please disregard this email.
      <br /><br />
      To reset your password, paste this url into your browser: <a href="${resetLink}">${resetLink}</a>
      <br /><br />
      ${signature.html}
    `;
  }

  private getPlain(name: string, resetLink: string) {
    return dedent`
      Hello ${name},

      Someone recently requested a password reset link for the DnD Assistant account associated with this email address.

      If you did not request a password reset, please disregard this email.

      To reset your password, paste this url into your browser: ${resetLink}

      ${signature.plain}
    `;
  }
}
