#!/usr/bin/env node

// Imports
import { ArgumentParser } from "argparse";
import { template } from './index.js'
import * as winston from 'winston';
import { LOG_FORMAT } from "./util.js";

const version = "1.0.2";
 
const parser = new ArgumentParser({
  description: 'tmpltr'
});

parser.add_argument('-v', '--version', { action: 'version', version });
parser.add_argument('--verbose', {action: 'store_true', help: 'increased console output'});
parser.add_argument('--dryrun', {action: 'store_true', help: 'do not write any files'});
parser.add_argument('--console', {action: 'store_true', help: 'print templated text to console'});
parser.add_argument('workingDirectory', {metavar: 'workingDirectory', type: String, nargs: '?', default: '.', help: 'working directory'});
parser.add_argument('--manifest', {metavar: 'manifest', type: String, nargs: '?', default: '', help: 'manifest file'});


const args = parser.parse_args();

const log = winston.createLogger({
  level: args.verbose ? 'debug' : 'info',
  format: LOG_FORMAT,
  transports: [new winston.transports.Console()]
});

log.debug(JSON.stringify(args))

args.log = log;


(async () => {
  await template(args);
})();

