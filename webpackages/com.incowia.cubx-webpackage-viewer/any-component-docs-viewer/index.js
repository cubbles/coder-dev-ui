/* globals $_GET */
(function () {
  'use strict';

  var manifestUrlParName = 'manifest-url';
  var artifactIdParName = 'artifact-id';
  var cubxComponentV = document.querySelector('cubx-component-docs-viewer');

  // When cif is ready the enable load button
  document.addEventListener('cifReady', function () {
    var error = false;
    var errorMsgs = [];
    var manifestUrl = $_GET(manifestUrlParName);
    var artifactId = $_GET(artifactIdParName);
    if (!manifestUrl) {
      errorMsgs.push('Please provide the manifestUrl of the component using the \'' +
        manifestUrlParName + '\' parameter');
      error = true;
    }
    if (!artifactId) {
      errorMsgs.push('Please provide the artifactId of the component using the \'' +
        artifactIdParName + '\' parameter');
    }
    if (!error) {
      updateAppTitle('<' + artifactId + '> generated Docs');
      initComponentDocsViewer(manifestUrl, artifactId);
    } else {
      displayErrors(errorMsgs);
    }
  });

  /**
   * Display a red div to display an error within the app
   * @param {string} errorMsgs - Error message to be displayed to the user
   */
  function displayErrors (errorMsgs) {
    if (errorMsgs.length > 0) {
      var alertD = document.querySelector('#alertD');
      var errorsList = document.querySelector('#errorsList');
      errorMsgs.forEach(function (errMsg, i) {
        var li = document.createElement('li');
        li.innerHTML = errMsg;
        errorsList.appendChild(li);
      });
      alertD.style.display = 'block';
    }
  }

  /**
   * Set the necessary slots values to init the 'cubx-component-docs-viewer' component
   * @param {string} manifestUrl - Url of the component's manifest
   * @param {string} artifactId - artifactId of the component
   */
  function initComponentDocsViewer (manifestUrl, artifactId) {
    cubxComponentV.setManifestUrl(manifestUrl);
    cubxComponentV.setComponentArtifactId(artifactId);
  }

  /**
   * Update the title of the app (Only h1 within the body)
   * @param {string} title - Title to be displayed
   */
  function updateAppTitle (title) {
    var appH1Element = document.querySelector('#appTitle');
    var titleTextNode = document.createTextNode(title);
    appH1Element.appendChild(titleTextNode);
  }
}());
