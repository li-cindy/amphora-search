'use strict';

const _ = require('lodash'),
  files = require('nymag-fs'),
  path = require('path'),
  es = require('./services/elastic');

var mappings = {},
  handlers = {},
  settings = {};

/**
 * Load the mappings from the mappings folder.
 *
 * The name of the file becomes the name of the index (convention over configuration).
 * @param {String} mappingDir
 */
function loadMappingConfiguration(mappingDir) {
  const list = files.getFiles(mappingDir);

  _.each(list, function (filename) {
    const mappingName = filename.split('.')[0],
      mapping = files.getYaml(path.join(mappingDir, mappingName));

    if (mappingName && mapping) {
      mappings[mappingName] = mapping;
    }
  });

  // Export the object so we can use it elsewhere
  module.exports.mappings = mappings;
}


/**
 * Load index settings and analyzers from the settings folder.
 *
 */
function loadSettingsConfiguration(settingsDir) {
  const list = files.getFiles(settingsDir);

  _.each(list, function (filename) {
    const settingsName = filename.split('.')[0],
      settings = files.getYaml(path.join(settingsDir, settingsName));

    if (settingsName && settings) {
      settings[settingsName] = settings;
    }
  });

  console.log('what are settings', settings);
  // Export the object so we can use it elsewhere
  module.exports.settings = settings;
}


/**
 * Load in the handlers from the Clay instance
 *
 * @param  {String} handlersDir
 */
function loadHandlers(handlersDir) {
  const list = files.getFiles(handlersDir);

  _.each(list, function (file) {
    const splitFile = file.split('.');

    if (splitFile && splitFile[1] === 'js') {
      handlers[splitFile[0]] = require(path.resolve(handlersDir, splitFile[0]));
    }
  });

  module.exports.handlers = handlers;
}

/**
 * [setPrefix description]
 * @param {String} prefix
 */
function setPrefix(prefix) {
  if (_.isString(prefix)) {
    module.exports.prefix = prefix;
  }
}

/**
 * Setup all necessary parts else necessary to use Elastic
 * TODO: BETTER DOCS PLZ
 *
 * @param  {Object} options
 * @return {Promise}
 */
function setup(options) {
  // Make the options accessible
  module.exports.options = options;
  // Grab the mappings from the specified directory
  loadMappingConfiguration(options.mappings);
  // Grab indices managed by this plugin
  loadMappingConfiguration(path.resolve(__dirname, '../mappings'));
  // Load handlers
  loadHandlers(options.handlers);
  // Set prefix
  setPrefix(options.prefix);
  // Setup the ES client
  es.setup(module.exports.host);
  // Validate and create the indices
  return es.validateIndices(mappings, module.exports.prefix);
}

function setDB(db) {
  module.exports.options.db = db;
}

module.exports = setup;
module.exports.options = {};
module.exports.mappings = {};
module.exports.handlers = {};
module.exports.settings = {};
module.exports.prefix = '';
module.exports.loadHandlers = loadHandlers;

// For testing
module.exports.setDB = setDB;