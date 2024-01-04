import { Logger, Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { WinstonTransport as AxiomTransport } from '@axiomhq/axiom-node';

@Injectable()
export class CustomLogger extends Logger {
  private static formatTimestamp(date: Date): string {
    const hours = date.getHours();
    const hours12 = hours % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
    const amPm = hours >= 12 ? 'PM' : 'AM';

    return `${hours12}:${minutes}:${seconds}.${milliseconds} ${amPm}`;
  }

  private static combineLogs(params: any[]): string {
    return params
      ?.map((param) => {
        try {
          param = JSON.stringify(param, null, 2);
        } catch {
          param = param;
        }
        return param;
      })
      .join(' ');
  }

  private formatLog(level, params) {
    const timestamp = CustomLogger.formatTimestamp(new Date());
    return {
      level,
      message: CustomLogger.combineLogs(params),
      service: this.serviceName,
      timestamp,
    };
  }

  private readonly axiomLogger: winston.Logger;
  private readonly serviceName: string;

  constructor(serviceName) {
    super();
    const { combine, errors, json } = winston.format;
    const axiomTransport = new AxiomTransport();
    this.axiomLogger = winston.createLogger({
      level: 'silly',
      format: combine(errors({ stack: true }), json()),
      transports: [axiomTransport],
      exceptionHandlers: [axiomTransport],
      rejectionHandlers: [axiomTransport],
    });
    this.serviceName = serviceName;
  }

  logToAxiomAndConsole(logData) {
    switch (logData.level) {
      case 'info':
        super.log(logData?.message, this.serviceName, logData?.timestamp);
        break;
      case 'error':
        super.error(logData?.message, this.serviceName, logData?.timestamp);
        break;
      case 'warn':
        super.warn(logData?.message, this.serviceName, logData?.timestamp);
        break;
      case 'debug':
        super.debug(logData?.message, this.serviceName, logData?.timestamp);
        break;
      case 'verbose':
        super.verbose(logData?.message, this.serviceName, logData?.timestamp);
        break;
      default:
        super.log(logData?.message, this.serviceName, logData?.timestamp);
        break;
    }
    if (
      process.env.ENVIRONMENT == 'Staging' ||
      process.env.ENVIRONMENT == 'Production'
    )
      this.axiomLogger.log(logData);
  }

  log(...params: any[]) {
    this.logToAxiomAndConsole(this.formatLog('info', params));
  }

  error(...params: any[]) {
    this.logToAxiomAndConsole(this.formatLog('error', params));
  }

  warn(...params: any[]) {
    this.logToAxiomAndConsole(this.formatLog('warn', params));
  }

  debug(...params: any[]) {
    this.logToAxiomAndConsole(this.formatLog('debug', params));
  }

  verbose(...params: any[]) {
    this.logToAxiomAndConsole(this.formatLog('verbose', params));
  }

  logWithCustomFields(customFields, level = 'info') {
    return (...params: any[]) => {
      let logData = this.formatLog(level, params);
      logData = {
        ...customFields,
        ...logData,
      };
      this.logToAxiomAndConsole(logData);
    };
  }
}
