import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';


@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly logger: LoggerService) { }

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest()
        const response = context.switchToHttp().getResponse()

        const { method, originalUrl } = request
        const start = Date.now()

        return next.handle().pipe(
            tap(() => {
                const response = context.switchToHttp().getResponse();
                const duration = Date.now() - start;

                this.logger.log(
                    `${method} ${originalUrl} ${response.statusCode} - ${duration}ms`,
                );
            }),
            catchError((error) => {
                const duration = Date.now() - start;

                this.logger.error(
                    `${method} ${originalUrl} failed - ${duration}ms`,
                    error.stack,
                );

                return throwError(() => error)
            })
        )
    }
}