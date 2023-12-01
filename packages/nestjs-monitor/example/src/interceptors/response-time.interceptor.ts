import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import * as client from 'prom-client';
import * as fs from 'fs';
import { generateBaseJSON, generateRow } from './utils';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  private histogram: client.Histogram;
  private logger: Logger;

  constructor(histogramTitle: string, jsonPath: string) {
    const name = histogramTitle + '_response_time';
    this.logger = new Logger(name + '_interceptor');

    this.histogram = new client.Histogram({
      name: name,
      help: 'Response time of APIs',
      buckets: client.exponentialBuckets(1, 1.5, 30),
      labelNames: ['statusCode', 'endpoint'],
    });

    // updating the grafana JSON with the row for this panel
    try {
      // check if the path exists or not?
      if (!fs.existsSync(jsonPath)) {
        fs.writeFileSync(jsonPath, JSON.stringify(generateBaseJSON()), 'utf8'); // create file if not exists
      }

      const parsedContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

      // skip creating the row if it already exists -- prevents multiple panels/rows on app restarts
      let isPresent = false;
      parsedContent.panels.forEach((panel: any) => {
        // TODO: Make this verbose and add types -- convert the grafana JSON to TS Types/interface
        if (
          panel.title.trim() ===
          name
            .split('_')
            .map((str) => str.charAt(0).toUpperCase() + str.slice(1))
            .join(' ')
            .trim()
        ) {
          isPresent = true;
        }
      });
      if (isPresent) return;

      parsedContent.panels.push(generateRow(name));
      // write back to file
      fs.writeFileSync(jsonPath, JSON.stringify(parsedContent));
      this.logger.log('Successfully added histogram to dashboard!');
    } catch (err) {
      this.logger.error('Error updating grafana JSON!', err);
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    const startTime = performance.now();
    return next.handle().pipe(
      tap(() => {
        // handles when there is no error propagating from the services to the controller
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        const statusCode = response.statusCode;
        const endpoint = request.url;
        this.histogram.labels({ statusCode, endpoint }).observe(responseTime);
      }),
      catchError((err) => {
        // handles when an exception is to be returned to the client
        this.logger.error('error: ', err);
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        const endpoint = request.url;
        this.histogram
          .labels({ statusCode: err.status, endpoint })
          .observe(responseTime);
        return throwError(() => {
          throw err;
        });
      }),
    );
  }
}
