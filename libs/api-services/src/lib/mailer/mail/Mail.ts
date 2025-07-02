export class Mail {
  public readonly to: string[];
  public readonly cc: string[] | undefined;
  public readonly from: string;
  public readonly subject: string;
  public readonly html: string;
  public readonly plain: string;

  constructor(args: {
    to: string[];
    cc: string[] | undefined;
    from: string;
    subject: string;
    html: string;
    plain: string;
  }) {
    this.to = args.to;
    this.cc = args.cc;
    this.from = args.from;
    this.subject = args.subject;
    this.html = args.html;
    this.plain = args.plain;
  }

  send(): Promise<void> {
    return Promise.resolve();
  }
}
