export interface LogFields { [key: string]: unknown }

export interface Logger {
  info(message: string, fields?: LogFields): void
  error(message: string, fields?: LogFields): void
  debug(message: string, fields?: LogFields): void
  with(fields: LogFields): Logger
}

class ConsoleJsonLogger implements Logger {
  constructor(private readonly context: LogFields = {}) {}

  private line(level: string, message: string, fields?: LogFields) {
    const payload = { ts: new Date().toISOString(), level, message, ...this.context, ...(fields || {}) }
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(payload))
  }

  info(message: string, fields?: LogFields) { this.line('info', message, fields) }
  error(message: string, fields?: LogFields) { this.line('error', message, fields) }
  debug(message: string, fields?: LogFields) { if (process.env.NODE_ENV !== 'production') this.line('debug', message, fields) }
  with(fields: LogFields): Logger { return new ConsoleJsonLogger({ ...this.context, ...fields }) }
}

export const logger: Logger = new ConsoleJsonLogger()