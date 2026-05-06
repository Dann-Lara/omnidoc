import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { Request } from 'express'

@Injectable()
export class TimezoneInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>()
    const timezone = req.headers['x-timezone'] as string

    if (timezone) {
      ;(req as any).userTimezone = timezone
    }

    return next.handle()
  }
}
