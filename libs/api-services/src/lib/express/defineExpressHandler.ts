import { Handler, NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';
import {
  BadRequestExpressError,
  InternalServerExpressError,
  ExpressError,
  UnauthorizedExpressError,
} from './expressErrors';
import { logExpressServerError } from './logExpressServerError';
import { Session } from '@prisma/client';
import { getSessionFromAuthHeader } from '../session/getSessionFromAuthHeader';

const handleServerError = (e: unknown, res: Response) => {
  let status = 500;
  if (e instanceof ExpressError) {
    status = e.status;
  }

  logExpressServerError(e);

  if (process.env['NODE_ENV'] !== 'production') {
    res.status(status).send(e.toString());
  } else {
    res.status(status).send('Internal server error');
  }
};

export enum AuthenticationEnforcement {
  Required = 'required',
  Optional = 'optional',
  None = 'none',
}
type SessionPresent = {
  [AuthenticationEnforcement.Required]: Session;
  [AuthenticationEnforcement.Optional]: Session | undefined;
  [AuthenticationEnforcement.None]: undefined;
};
type Zodifiable<P, Q, B, R> = {
  params?: ZodSchema<P>;
  query?: ZodSchema<Q>;
  body?: ZodSchema<B>;
  response?: ZodSchema<R>;
};
interface HandlerResult {
  statusCode: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}
export const defineExpressHandler = <
  GParams,
  GQuery,
  GBody,
  GResponse,
  GAuthentication extends AuthenticationEnforcement,
>(
  opts: {
    schema: Zodifiable<GParams, GQuery, GBody, GResponse>;
    authentication: GAuthentication;
    beforeHandlers?: Handler[];
    afterHandlers?: Handler[];
  },
  handler: (
    req: Request<GParams, GResponse, GBody, GQuery>,
    res: Response<
      GResponse,
      {
        session: SessionPresent[GAuthentication];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        unsafeStorage: any;
      }
    >,
    next: NextFunction,
  ) => Promise<HandlerResult | void>,
) => {
  return [
    async (req: Request, res: Response, next: NextFunction) => {
      console.log(`req1: ${req}`)
      try {
        try {
          opts.schema.params?.parse(req.params);
          opts.schema.query?.parse(req.query);
          opts.schema.body?.parse(req.body);
        } catch (e) {
          if (e instanceof ZodError) {
            console.log(e)
            throw new BadRequestExpressError(e.message);
          }
          throw new InternalServerExpressError('Unknown error parsing request');
        }
        let session: Session | undefined;
        if (opts.authentication !== AuthenticationEnforcement.None) {
          let authorization = req.headers.authorization;
          if (!authorization && req.query['token']) {
            authorization = `Bearer ${req.query['token']}`;
          }

          if (
            opts.authentication === AuthenticationEnforcement.Required &&
            !authorization
          ) {
            throw new UnauthorizedExpressError(
              'You must pass an authorization header',
            );
          }

          if (authorization) {
            session =
              (await getSessionFromAuthHeader(authorization)) || undefined;

            if (
              opts.authentication === AuthenticationEnforcement.Required &&
              !session
            ) {
              throw new UnauthorizedExpressError('Token is not valid');
            }
          }
        }

        res.locals['session'] = session;

        next();
      } catch (e) {
        handleServerError(e, res);
      }
    },
    ...(opts.beforeHandlers || []),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await handler(req as any, res as any, next);

        if (result) {
          res.status(result.statusCode).send(result.data);
        }
      } catch (e) {
        handleServerError(e, res);
      }
    },
    ...(opts.afterHandlers || []),
  ];
};
