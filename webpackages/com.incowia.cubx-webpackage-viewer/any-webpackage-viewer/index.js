/**
 * Created by Edwin Gamboa on 20/10/2016.
 */
(function () {
  'use strict';

  var loadB = document.querySelector('#loadB');
  var urlTF = document.querySelector('#urlTF');
  var alertD = document.querySelector('#alertD');
  var alertDText = document.querySelector('#alertDText');
  var cubxWebpackageV = document.querySelector('cubx-webpackage-viewer');

  //When cif is ready the enable load button
  document.addEventListener('cifReady', function () {
    loadB.removeAttribute('disabled');
    var manifestUrlPar = $_GET('manifest-url');
    if (manifestUrlPar) {
      cubxWebpackageV.setManifestUrl(manifestUrlPar);
      urlTF.value = manifestUrlPar;
    }
  });

  //Add event listener to the load button
  loadB.addEventListener('click', function () {
    if (urlTF.value !== '') {
      cubxWebpackageV.setManifestUrl(urlTF.value);
    } else {
      alertDText.textContent = 'Please fill out the File url field';
      alertD.style.display = 'block';
    }
  });

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
    return vars; };

}());
