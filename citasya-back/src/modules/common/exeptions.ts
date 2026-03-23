// Custom error classes for Express app
export class HttpException extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'HttpException';
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string = 'Not Found') {
    super(message, 404);
    this.name = 'NotFoundException';
  }
}
