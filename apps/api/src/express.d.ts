declare module "express" {
  export interface Request {
    ip?: string;
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
    get(path: string, handler: (request: Request, response: Response) => void): void;
    use(handler: (request: Request, response: Response, next: NextFunction) => void): void;
    use(
      handler: (error: unknown, request: Request, response: Response, next: NextFunction) => void,
    ): void;
    listen(port: number, callback?: () => void): unknown;
  }

  export interface ExpressFactory {
    (): Express;
    json(): (request: Request, response: Response, next: NextFunction) => void;
  }

  const express: ExpressFactory;
  export default express;
}
