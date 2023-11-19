import {
  LoggerOptions as WinstonLoggerOptions,
  createLogger as createWinstonLogger,
  format,
  transports,
} from 'winston'

type LoggerFormat = 'text' | 'json'

export interface LoggerOptions extends Omit<WinstonLoggerOptions, 'format'> {
  format?: LoggerFormat
}

export function createLogger(name: string, options?: LoggerOptions) {
  const defaultFormat = format.combine(format.timestamp(), format.label({ label: name }))

  const textFormat = format.combine(
    defaultFormat,
    format.colorize(),
    format.printf(({ level, message, label, timestamp }) => {
      return `${timestamp} ${level} [${label}]: ${message}`
    })
  )

  const jsonFormat = format.combine(defaultFormat, format.json())

  return createWinstonLogger({
    ...options,
    level: options?.level ?? 'info',
    format: options?.format === 'json' ? jsonFormat : textFormat,
    transports: options?.transports ? options.transports : [new transports.Console()],
  })
}
