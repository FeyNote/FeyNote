export class UserAlreadyExistError extends Error {
  constructor() {
    super();
    this.name = 'UserAlreadyExistError';
  }
}
export class UserNotFoundError extends Error {
  constructor() {
    super();
    this.name = 'UserNotFoundError';
  }
}
export class UserNoPasswordError extends Error {
  constructor() {
    super();
    this.name = 'UserNoPasswordError';
  }
}
export class InvalidCredentialsError extends Error {
  constructor() {
    super();
    this.name = 'InvalidCredentialsError';
  }
}
export class TimeoutError extends Error {
  constructor() {
    super();
    this.name = 'TimeoutError';
  }
}
