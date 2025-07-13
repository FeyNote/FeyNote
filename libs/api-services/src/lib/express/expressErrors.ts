export class ExpressError extends Error {
  constructor(
    public status: number,
    ...args: ConstructorParameters<typeof Error>
  ) {
    super(...args);
  }
}

export class BadRequestExpressError extends ExpressError {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(400, ...args);
  }
}

export class UnauthorizedExpressError extends ExpressError {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(401, ...args);
  }
}

export class ForbiddenExpressError extends ExpressError {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(403, ...args);
  }
}

export class NotFoundExpressError extends ExpressError {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(404, ...args);
  }
}

export class NotAcceptableExpressError extends ExpressError {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(406, ...args);
  }
}

export class RateLimitExpressError extends ExpressError {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(429, ...args);
  }
}

export class InternalServerExpressError extends ExpressError {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(500, ...args);
  }
}
