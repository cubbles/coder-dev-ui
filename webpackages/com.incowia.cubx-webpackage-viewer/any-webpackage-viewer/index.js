/* globals $_GET */
(function () {
  'use strict';

  var loadB = document.querySelector('#loadB');
  var urlTF = document.querySelector('#urlTF');
  var alertD = document.querySelector('#alertD');
  var alertDText = document.querySelector('#alertDText');
  var cubxWebpackageV = document.querySelector('cubx-webpackage-viewer');

  // When cif is ready the enable load button
  document.addEventListener('cifReady', function () {
    loadB.removeAttribute('disabled');
    var manifestUrlPar = $_GET('manifest-url');
    if (manifestUrlPar) {
      cubxWebpackageV.setManifestUrl(manifestUrlPar);
      urlTF.value = manifestUrlPar;
    }
  });

  // Add event listener to the load button
  loadB.addEventListener('click', function () {
    if (urlTF.value !== '') {
      cubxWebpackageV.setManifestUrl(urlTF.value);
    } else {
      alertDText.textContent = 'Please fill out the File url field';
      alertD.style.display = 'block';
    }
  });
}());
