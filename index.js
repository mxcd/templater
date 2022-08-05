import * as yaml from 'js-yaml';
import fs from 'fs';
import * as path from 'path';
import Mustache from 'mustache';
import {LOG_FORMAT, YAML_STRUCTURE} from './util.js';
import * as winston from 'winston';
import * as yamlValidator from 'yaml-validator';
import YamlValidator from 'yaml-validator';

let log = winston.createLogger({
  level: 'warn',
  format: LOG_FORMAT,
  transports: [new winston.transports.Console()]
});

/*
async function template(options): boolean

options: {
  workingDirectory: string
    directory to be used as working directory and source of manifest.yml files and templates
    default: '.' (current directory)
  log: winston.Logger
    logger to be used for logging
}
*/
export async function template(options) {
  if(options.log) {
    log = options.log;
  }
  
  const workingDirectory = path.resolve(options.workingDirectory || '.');
  log.debug(`working directory: ${workingDirectory}`);

  const templates = getTemplates(workingDirectory);

  let manifest = {};

  if(!options.manifestData) {
    const manifestFiles = getManifestFiles(workingDirectory, options.manifest);
    for(const manifestFile of manifestFiles) {
      try {
        const doc = yaml.load(fs.readFileSync(manifestFile, 'utf8'));
        manifest = mergeDeep(manifest, doc);
      }
      catch(err) {
        log.error(`Error loading manifest file: ${manifestFile}`);
      }    
    }
  }
  else {
    try {
      // TODO validate manifestData
      manifest = yaml.load(options.manifestData);
    }
    catch(err) {
      log.error(`Error reading manifest data`);
    }
  }

  for(const file of manifest.files) {
    let templateMatch = false;
    let templateFile = '';
    for(const template of templates) {
      if(template.endsWith(file.template) || template.endsWith(`${file.template}.mustache`)) {
        templateMatch = true;
        templateFile = template;
        break;
      }
    }
    if(!templateMatch) {
      log.error(`template ${file.template} not found`);
      throw new Error(`template '${file.template}' not found`);
    }

    const template = fs.readFileSync(templateFile, 'utf8');
    const output = Mustache.render(template, file.values);

    if(!options.dryrun) {
      const outputFile = path.resolve(path.join(workingDirectory, file.destination));
      const parentDir = path.dirname(outputFile);
      if(!fs.existsSync(parentDir)) {
        log.debug(`creating parent dir '${parentDir}'`); 
        fs.mkdirSync(parentDir, { recursive: true});
      }
      log.debug(`writing file: ${outputFile}`);
      fs.writeFileSync(outputFile, output);
    }

    if(options.console) {
      console.log(`# From template '${file.template}'`);
      console.log(output);
    }
  }
}

function getTemplates(workingDirectory) {
  const templates = [];
  try {
    const files = fs.readdirSync(workingDirectory);
    for(const file of files) {
      const filePath = path.join(workingDirectory, file);
      if(!fs.statSync(filePath).isDirectory() && file.endsWith('.mustache')) {
        log.debug(`found template: ${filePath}`);
        templates.push(filePath);
      }
    }
  }
  catch(err) {
    log.error(err);
  }
  return templates;
}

function getManifestFiles(workingDirectory, manifestFile) {
  const manifests = [];

  const addManifestFile = (file, fail) => {
    const valid = validateManifestFile(file);
    if(valid) {
      log.debug(`found valid manifest file: ${file}`);
      manifests.push(file);
    }
    else {
      const exists = fs.existsSync(file);
      const message = exists ? `invalid manifest file: ${file}` : `manifest file '${file}' does not exist`;
      if(fail) {
        log.error(message);
        throw new Error(message);
      }
      else {
        log.warn(message);
      }
    }
  }
  
  // check if --manifest is specified in options
  const manifestFileGiven = manifestFile && typeof(manifestFile) === 'string' && manifestFile.length > 0;
  if(manifestFileGiven) {
    const manifestFilePath = path.resolve(manifestFile);
    addManifestFile(manifestFilePath, true);
  }
  // otherwise check for manifest.yml in working directory
  else {
    const manifestFileDefaults = ['manifest.yml', 'manifest.yaml'];
    for(const manifestFileDefault of manifestFileDefaults) {
      const manifestFilePath = path.join(workingDirectory, manifestFileDefault);
      if(fs.existsSync(manifestFilePath)) {
        addManifestFile(manifestFilePath, false);
        break;
      }
    }
  }
  // otherwise check for any .yml files in working directory
  if(manifests.length === 0) {
    const files = fs.readdirSync(workingDirectory);
    for(const file of files) {
      const filePath = path.join(workingDirectory, file);
      if(!fs.statSync(filePath).isDirectory() && (file.endsWith('.yml') || file.endsWith('.yaml'))) {
        addManifestFile(filePath, false);
      }
    }
  }

  if(manifests.length === 0) {
    log.error('no valid manifest files available');
    throw new Error('no valid manifest files available');
  }

  return manifests;
}

function validateManifestFile(file) {
  if(!fs.existsSync(file)) {
    log.error(`manifest file does not exist: ${file}`);
    throw new Error(`manifest file does not exist: ${file}`);
  }
  const options = {
    log: true,
    structure: YAML_STRUCTURE,
    writeJson: false,
    onWarning: (warning) => {
      log.warn(warning);
    }
  }
  const validator = new YamlValidator(options);
  validator.validate([file]);
  return validator.report() === 0;
}

function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

function mergeDeep(target, ...sources) {
  if (!sources.length)  { return target; }
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} });
        }
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

/* 
try {
  const doc = yaml.load(fs.readFileSync('/home/ixti/example.yml', 'utf8'));
  console.log(doc);
} catch (e) {
  console.log(e);
}



var view = {
  title: "Joe",
  calc: function () {
    return 2 + 4;
  }
};

var output = Mustache.render("{{title}} spends {{calc}}", view); */
