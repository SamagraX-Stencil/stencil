import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Histogram, exponentialBuckets } from 'prom-client';
import {
  generateBaseJSON,
  generateRow,
  getDashboardByUID,
  getDashboardJSON,
  updateDashboard,
} from './utils';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  private histogram: Histogram;
  private logger: Logger;
  private dashboardUid: string;
  private dashboardId: string;

  constructor(histogramTitle: string, grafanaBaseURL: string) {
    const name = histogramTitle + '_response_time';
    this.logger = new Logger(name + '_interceptor');
    this.dashboardUid = null;
    this.init(histogramTitle, grafanaBaseURL);
  }

  async init(histogramTitle: string, grafanaBaseURL: string) {
    const name = histogramTitle + '_response_time';
    this.histogram = new Histogram({
      name: name,
      help: 'Response time of APIs',
      buckets: exponentialBuckets(1, 1.5, 30),
      labelNames: ['statusCode', 'endpoint'],
    });

    // updating the grafana JSON with the row for this panel
    try {
      // check to see if a dashboard titled "Response Times" already exists or not
      const dashboardJSONSearchResp = await getDashboardJSON(
        'glsa_81xg6BnRNIuLvTcgPgplYNvlwa0TieZS_87bbe96a',
        'Response Times',
        grafanaBaseURL,
      );
      console.log('dashboardJSONSearchResp: ', dashboardJSONSearchResp);
      this.dashboardUid =
        dashboardJSONSearchResp.length > 0
          ? dashboardJSONSearchResp[0]['uid']
          : undefined;
      let parsedContent: any;
      console.log('this.dashboardUid: ', this.dashboardUid);
      if (this.dashboardUid === null || !this.dashboardUid) {
        parsedContent = generateBaseJSON();
        // this.dashboardUid = uuidv4();
        // parsedContent['uid'] = this.dashboardUid;
      } else {
        parsedContent = await getDashboardByUID(
          this.dashboardUid,
          grafanaBaseURL,
        );
        if (parsedContent === undefined) parsedContent = generateBaseJSON();
      }
      // const parsedContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

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
      // fs.writeFileSync(jsonPath, JSON.stringify(parsedContent));
      parsedContent['uid'] = this.dashboardUid;
      const createResp = await updateDashboard(
        parsedContent,
        'glsa_81xg6BnRNIuLvTcgPgplYNvlwa0TieZS_87bbe96a',
        grafanaBaseURL,
      );
      this.dashboardUid = createResp['uid'];
      this.dashboardId = createResp['id'];
      console.log('createResp: ', createResp);
      this.logger.log('Successfully added histogram to dashboard!');
    } catch (err) {
      console.error('Error updating grafana JSON!', err);
      // this.logger.error('Error updating grafana JSON!', err);
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
