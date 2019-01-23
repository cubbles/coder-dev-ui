/* globals location */
'use strict';
/**
 * Read url get parameters, similar to PHP.
 * Source: https://www.creativejuiz.fr/blog/en/javascript-en/read-url-get-parameters-with-javascript
 * @param {string} param name of the parameter to read
 * @returns {*} the value of the parameter or an empty object if the parameter was not in the url
 */
function $_GET (param) {
  var vars = {};
  window.location.href.replace(location.hash, '').replace(
    /[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
    function (m, key, value) { // callback
      vars[decodeURIComponent(key)] = value !== undefined ? decodeURIComponent(value) : '';
    }
  );
  if (param) {
    return vars[param] ? vars[param] : null;
  }
  return vars;
};
