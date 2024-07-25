import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Histogram, exponentialBuckets } from 'prom-client';
import axios from 'axios';
import { Mutex } from './mutex';

import {
  generateBaseJSON,
  generateRow,
  getDashboardByUID,
  getDashboardJSON,
} from './utils';

const mutex = new Mutex();
@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  private histogram: Histogram;
  private logger: Logger;
  private dashboardUid: string;
  private grafanaBaseURL: string;
  private apiToken: string;

  constructor(
    histogramTitle: string,
    grafanaBaseURL: string,
    apiToken: string,
  ) {
    const name = histogramTitle + '_response_time';
    this.logger = new Logger(name + '_interceptor');
    this.dashboardUid = null;
    this.grafanaBaseURL = grafanaBaseURL;
    this.apiToken = apiToken;
    this.init(histogramTitle);
  }

  async init(histogramTitle: string) {
    const name = histogramTitle + '_response_time';
    this.histogram = new Histogram({
      name: name,
      help: 'Response time of APIs',
      buckets: exponentialBuckets(1, 1.5, 30),
      labelNames: ['statusCode', 'endpoint'],
    });

    const unlock = await mutex.lock(); 
    try {
      const dashboardJSONSearchResp = await getDashboardJSON(
        this.apiToken,
        'Response_Times',
        this.grafanaBaseURL,
      );
      this.dashboardUid =
        dashboardJSONSearchResp.length > 0
          ? dashboardJSONSearchResp[0]['uid']
          : undefined;
      let parsedContent: any;

      if (this.dashboardUid === undefined || !this.dashboardUid) {
        parsedContent = generateBaseJSON();
        
        if (!parsedContent.dashboard.panels) {
          parsedContent.dashboard.panels = [];
        }

        if (!this.isPanelPresent(parsedContent.dashboard.panels, name)) {
          parsedContent.dashboard.panels.push(generateRow(name));
        }

        const FINAL_JSON = parsedContent;
        await axios.post(`${this.grafanaBaseURL}/api/dashboards/db`, FINAL_JSON, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiToken}`
          }
        });
      } else {
        parsedContent = await getDashboardByUID(this.dashboardUid, this.grafanaBaseURL, this.apiToken);

        if (!parsedContent.dashboard.panels) {
          parsedContent.dashboard.panels = [];
        }

        if (!this.isPanelPresent(parsedContent.dashboard.panels, name)) {
          parsedContent.dashboard.panels.push(generateRow(name));
        }
        await this.updateDashboard(parsedContent);
      }
      this.logger.log('Successfully added histogram to dashboard!');
    } catch (err) {
      console.error('Error updating Grafana JSON!');
    } finally {
      unlock();
    }
  }
  isPanelPresent(panels: any[], name: string): boolean {
    const formattedName = name
      .split('_')
      .map((str) => str.charAt(0).toUpperCase() + str.slice(1))
      .join(' ')
      .trim();

    return panels.some((panel) => panel.title.trim() === formattedName);
  }

  async updateDashboard(FINAL_JSON: any) {
    try {
      await axios.post(`${this.grafanaBaseURL}/api/dashboards/db`, FINAL_JSON, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiToken}`
        }
      });
    } catch (err) {
      const updatedDashboard = FINAL_JSON;
      if (err.response && err.response.data && err.response.data.status === 'version-mismatch') {
        this.logger.log('Dashboard version mismatch, retrying with latest version...');
        updatedDashboard.dashboard.version++;
        await axios.post(`${this.grafanaBaseURL}/api/dashboards/db`, updatedDashboard, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiToken}`
          }
        });
      } else {
        throw err;
      }
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    const startTime = performance.now();
    return next.handle().pipe(
      tap(() => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        const statusCode = response.statusCode;
        const endpoint = request.url;
        this.histogram.labels({ statusCode, endpoint }).observe(responseTime);
      }),
      catchError((err) => {
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        const endpoint = request.url;
        this.histogram.labels({ statusCode: err.status, endpoint }).observe(responseTime);
        return throwError(() => {
          throw err;
        });
      }),
    );
  }
}



