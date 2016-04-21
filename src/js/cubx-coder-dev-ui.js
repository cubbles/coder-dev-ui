/**
 * Created by ega on 20.04.2016.
 */
var editor;
/**
 * Load the json-editor and set its default parameters
 * @param {object} schema JSON schema of the editor
 */
var loadEditor = function (schema) {
  setEditorsOptions();
  editor = new JSONEditor(document.getElementById('editor_holder'), {
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
  loadManifest();
};

/**
 * Set the editors' default options.
 */
var setEditorsOptions = function () {
  JSONEditor.defaults.editors.array.options.collapsed = true;
  JSONEditor.defaults.editors.table.options.collapsed = true;
};

/**
 * Load the manifest.webpackage file retrieving its path from the url
 */
var loadManifest = function () {
  loadJSON($_GET('manifest'), function(response) {
    editor.setValue(JSON.parse(response));
  });
};

/**
 * Load the JSON schema file retrieving its path from the url.
 *  Additionally add format to the schema for its representation
 */
var loadSchema = function () {
  loadJSON($_GET('schema'), function(response) {
    var schema;
    schema = JSON.parse(response);
    //var schema = loadSchema();
    for(var prop in schema.properties.artifacts.properties){
      schema.properties.artifacts.properties[prop].format = 'tabs';
    }
    var artifactsCommonProps = ['runnables', 'endpoints'];
    for(var i in artifactsCommonProps){
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
    loadEditor(schema)
  });
};

/**
 * Read url get parameters, similar to PHP.
 * Source: https://www.creativejuiz.fr/blog/en/javascript-en/read-url-get-parameters-with-javascript
 * @param {string} param name of the parameter to read
 * @returns {*} the value of the parameter or an empty object if the parameter was not in the url
 */
var $_GET = function (param) {
  var vars = {};
  window.location.href.replace( location.hash, '' ).replace(
    /[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
    function( m, key, value ) { // callback
      vars[key] = value !== undefined ? value : '';
    }
  );

  if ( param ) {
    return vars[param] ? vars[param] : null;
  }
  return vars;
};

/**
 * Load a JSON file (should be served).
 * Source: http://codepen.io/KryptoniteDove/post/load-json-file-locally-using-pure-javascript
 * @param {string} path path of the JSON file to be loaded
 * @param {function} callback function to be called after the file has loaded successfully
 */
var loadJSON = function (path, callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', path, true); // Replace 'my_data' with the path to your file
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
};