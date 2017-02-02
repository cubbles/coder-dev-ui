/**
 * Contains hookFunctions for component travel-planner
 */
(function () {
  'use strict';

  // set namespace containing the cubx-webpackage-viewer functions (i.e. hook functions)
  window.com_incowia_cubxWebpackageViewer_cubxComponentViewer = {

    // Hook function to build the config object to be send to ajaxRequest
    buildRequestConfigObject: function (url, next) {
      next({url: url});
    },

    // Hook function to check whether the manifest url is complete or not
    checkManifestUrl: function (url, next) {
      var self = window.com_incowia_cubxWebpackageViewer_cubxComponentViewer;
      if (url.indexOf('/manifest.webpackage') < 0) {
        if (url.lastIndexOf('/') !== url.length - 1) {
          url += '/';
        }
        url += 'manifest.webpackage';
      }
      self.buildRequestConfigObject(url, next);
    },

    // Hook function to send the root dependency within an array
    dependencyIntoArray: function (dep, next) {
      next([dep]);
    }

  };
})();
