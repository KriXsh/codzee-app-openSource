export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string = 'error',
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const notFound = (message = 'Not found') => new HttpError(404, message, 'not_found');
export const conflict = (message: string) => new HttpError(409, message, 'conflict');
export const badRequest = (message: string) => new HttpError(400, message, 'bad_request');
export const gone = (message = 'Link has expired') => new HttpError(410, message, 'gone');
