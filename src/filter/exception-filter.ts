import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations httpAdapter might not be available in the
    // constructor method, thus we should resolve it here.
    console.log(exception)
    const { httpAdapter } = this.httpAdapterHost
    const {
      response: { statusCode, ...error } = {
        statusCode: 418,
      },
    } = exception as any
    const ctx = host.switchToHttp()

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.I_AM_A_TEAPOT

    const responseBody = {
      data: null,
      success: false,
      error,
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus)
  }
}
