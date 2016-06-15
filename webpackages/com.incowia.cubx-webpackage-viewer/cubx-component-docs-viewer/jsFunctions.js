/**
 * Contains hookFunctions for component travel-planner
 */
(function () {
  'use strict';

  // set namespace containing the cubx-webpackage-viewer functions (i.e. hook functions)
  window.com_incowia_cubxWebpackageViewer_cubxComponentViewer = {

    // Hook function to build the config object to be send to ajaxRequest
    buildConfigObject: function (url, next) {
      next({url: url});
    }
  };
})();
