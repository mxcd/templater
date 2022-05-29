import { format } from 'logform';

export const LOG_FORMAT = format.combine(
  format.colorize(),
  format.timestamp(),
  format.align(),
  format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);


export const YAML_STRUCTURE = {
  files: [
    {
      destination: 'string',
      template: 'string',
      'values?': 'object'
    }
  ]
}