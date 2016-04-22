/**
 * Created by ega on 20.04.2016.
 */
/*global $, JSONEditor, location*/
'use strict';
/**
 * @Class CoderDevUI
 * Load the coder DevUI
 * @constructor
 */
var CoderDevUI = function () {};

CoderDevUI.prototype.constructor = CoderDevUI;
/**
 * Load the json-editor and set its default parameters
 * @param {object} schema JSON schema of the editor
 */
CoderDevUI.prototype.loadEditor = function (schema) {
  this.setEditorsOptions();
  this.editor = new JSONEditor(document.getElementById('editor_holder'), {
    theme: 'bootstrap3',
    iconlib: 'bootstrap3',
    disable_array_add: true,
    disable_array_delete: true,
    disable_array_reorder: true,
    no_additional_properties: true,
    disable_edit_json: true,
    disable_properties: true,
    schema: schema
  });
  this.loadManifest();
};

/**
 * Set the editors' default options.
 */
CoderDevUI.prototype.setEditorsOptions = function () {
  JSONEditor.defaults.editors.array.options.collapsed = true;
  JSONEditor.defaults.editors.table.options.collapsed = true;
};

/**
 * Load the manifest.webpackage file retrieving its path from the url
 */
CoderDevUI.prototype.loadManifest = function () {
  var self = this;
  $.getJSON(this.$_GET('manifest'), function (response) {
    self.editor.setValue(response);
  });
};

/**
 * Load the JSON schema file retrieving its path from the url.
 *  Additionally add format to the schema for its representation
 */
CoderDevUI.prototype.loadSchema = function () {
  var self = this;
  $.getJSON(this.$_GET('schema'), function (response) {
    var schema = response;

    for (var prop in schema.properties.artifacts.properties) {
      schema.properties.artifacts.properties[prop].format = 'tabs';
    }
    var artifactsCommonProps = ['runnables', 'endpoints'];
    for (var i in artifactsCommonProps) {
      schema.definitions.appArtifact.properties[artifactsCommonProps[i]].format = 'tabs';
      schema.definitions.elementaryArtifact.properties[artifactsCommonProps[i]].format = 'tabs';
      schema.definitions.compoundArtifact.properties[artifactsCommonProps[i]].format = 'tabs';
    }
    schema.definitions.elementaryArtifact.properties.slots.format = 'tabs';
    schema.definitions.compoundArtifact.properties.slots.format = 'tabs';
    schema.definitions.compoundArtifact.properties.members.format = 'table';
    schema.definitions.compoundArtifact.properties.connections.format = 'tabs';
    schema.definitions.compoundArtifact.properties.inits.format = 'table';
    schema.format = 'grid';
    self.loadEditor(schema);
  });
};

/**
 * Read url get parameters, similar to PHP.
 * Source: https://www.creativejuiz.fr/blog/en/javascript-en/read-url-get-parameters-with-javascript
 * @param {string} param name of the parameter to read
 * @returns {*} the value of the parameter or an empty object if the parameter was not in the url
 */
CoderDevUI.prototype.$_GET = function (param) {
  var vars = {};
  window.location.href.replace(location.hash, '').replace(
    /[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
    function (m, key, value) { // callback
      vars[key] = value !== undefined ? value : '';
    }
  );

  if (param) {
    return vars[param] ? vars[param] : null;
  }
  return vars;
};
