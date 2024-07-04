import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Histogram, exponentialBuckets } from 'prom-client';
import axios from 'axios'; 

import {
  generateBaseJSON,
  generateRow,
  getDashboardByUID,
  getDashboardJSON,
} from './utils';

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
    console.log("apiToken", this.apiToken);
    console.log("grafanaBaseURL", grafanaBaseURL);
    try {
      const dashboardJSONSearchResp = await getDashboardJSON(
        this.apiToken,
        histogramTitle,
        grafanaBaseURL,
      );
      this.dashboardUid =
        dashboardJSONSearchResp.length > 0
          ? dashboardJSONSearchResp[0]['uid']
          : undefined;
      let parsedContent: any;

      if (this.dashboardUid === null || !this.dashboardUid) {
        parsedContent = generateBaseJSON(histogramTitle);
        
        let isPresent = false;

      parsedContent.dashboard.panels.forEach((panel: any) => {
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
       parsedContent.dashboard.panels.push(generateRow(name));
      } else {
        parsedContent = await getDashboardByUID(this.dashboardUid, grafanaBaseURL, this.apiToken);
        
        
        let isPresent = false;
        parsedContent.panels.forEach((panel: any) => {
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
      }
      

     
      const FINAL_JSON = parsedContent;
       await axios.post(`${grafanaBaseURL}/api/dashboards/db`, FINAL_JSON, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiToken}`
        }
      });
      
      this.logger.log('Successfully added histogram to dashboard!');
    } catch (err) {
      console.error('Error updating grafana JSON!', err);
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



