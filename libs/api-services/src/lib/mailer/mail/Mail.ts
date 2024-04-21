export class Mail {
  constructor(
    public readonly to: string[],
    public readonly cc: string[] | undefined,
    public readonly from: string,
    public readonly subject: string,
    public readonly html: string,
    public readonly plain: string,
  ) {}
}
