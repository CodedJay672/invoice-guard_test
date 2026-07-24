declare module "express" {
  export type RequestHandler = (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => unknown;

  export interface Request {
    clerkUserId?: string;
    verifiedEmail?: string;
    ip?: string;
    query: Record<string, unknown>;
    params: Record<string, string | undefined>;
    headers: Record<string, string | string[] | undefined>;
    body: unknown;
    socket: {
      remoteAddress?: string;
    };
    get(name: string): string | undefined;
    header(name: string): string | undefined;
  }

  export interface Response {
    json(body: unknown): Response;
    status(code: number): Response;
  }

  export interface NextFunction {
    (error?: unknown): void;
  }

  export interface Express {
    disable(setting: string): void;
    get(path: string, handler: RequestHandler): void;
    post(path: string, handler: RequestHandler): void;
    post(path: string, middleware: RequestHandler, handler: RequestHandler): void;
    use(handler: RequestHandler): void;
    use(
      handler: (error: unknown, request: Request, response: Response, next: NextFunction) => void,
    ): void;
    listen(port: number, callback?: () => void): unknown;
  }

  export interface ExpressFactory {
    (): Express;
    json(): (request: Request, response: Response, next: NextFunction) => void;
    raw(options: {
      type: string;
    }): (request: Request, response: Response, next: NextFunction) => void;
  }

  const express: ExpressFactory;
  export default express;
}
