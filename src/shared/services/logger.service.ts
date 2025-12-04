import { Injectable, Logger } from '@nestjs/common';

export interface LogContext {
  userId?: string;
  requestId?: string;
  operation?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class LoggerService {
  private logger = new Logger(LoggerService.name);

  log(message: string, context?: LogContext): void {
    const enhancedMessage = this.enhanceMessage(message, context);
    this.logger.log(enhancedMessage, context?.operation);
  }

  error(message: string, trace?: string, context?: LogContext): void {
    const enhancedMessage = this.enhanceMessage(message, context);
    this.logger.error(enhancedMessage, context?.operation);
  }

  warn(message: string, context?: LogContext): void {
    const enhancedMessage = this.enhanceMessage(message, context);
    this.logger.warn(enhancedMessage, context?.operation);
  }

  debug(message: string, context?: LogContext): void {
    const enhancedMessage = this.enhanceMessage(message, context);
    this.logger.debug(enhancedMessage, context?.operation);
  }

  verbose(message: string, context?: LogContext): void {
    const enhancedMessage = this.enhanceMessage(message, context);
    this.logger.verbose(enhancedMessage, context?.operation);
  }

  private enhanceMessage(message: string, context?: LogContext): string {
    const parts: string[] = [];

    if (context?.userId) {
      parts.push(`[User:${context.userId}]`);
    }

    if (context?.requestId) {
      parts.push(`[Request:${context.requestId}]`);
    }

    parts.push(message);

    if (context?.metadata) {
      parts.push(`Metadata: ${JSON.stringify(context.metadata)}`);
    }

    return parts.join(' ');
  }
}
