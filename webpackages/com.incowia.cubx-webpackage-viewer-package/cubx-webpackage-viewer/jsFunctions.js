/**
 * Contains hookFunctions for component travel-planner
 */
(function () {
  'use strict';

  // set namespace containing the cubx-webpackage-viewer functions (i.e. hook functions)
  window.com_incowia_cubxWebpackageViewer_cubxWebpackageViewer = {

    // Hook function to build the config object to be send to ajaxRequest
    buildConfigObject: function (url, next) {
      next({url: url});
    },

    // Hook function to parser the status of a request as boolean
    isLoaded: function (status, next) {
      next(status === 'idle');
    }
  };
})();
