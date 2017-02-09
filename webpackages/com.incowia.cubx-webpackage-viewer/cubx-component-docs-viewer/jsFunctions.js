/* global $ */
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
    },

    handleArtifactChange: function (artifactId, next) {
      var docsV = document.querySelector('cubx-component-docs-viewer');
      window.com_incowia_cubxWebpackageViewer_cubxComponentViewer.handleInitialScale(
        'depsTreeViewerT',
        function (scale) {
          docsV.setDepsTreeVScale(scale);
        });
      window.com_incowia_cubxWebpackageViewer_cubxComponentViewer.handleInitialScale(
        'componentViewerT',
        function (scale) {
          docsV.setComponentVScale(scale);
        });
      next(artifactId);
    },

    // Aid function to handle initial scale of cubx-component-viewer and cubx-deps-tree-viewer
    handleInitialScale: function (tabId, setScaleFunction) {
      var tab = $('#' + tabId);
      if ($('ul.nav-tabs li.active a').attr('id') === tabId) {
        setScaleFunction('auto');
      } else {
        setScaleFunction('none');
        tab.on('shown.bs.tab', function (e) {
          if (e.target.id === tabId) {
            setScaleFunction('auto');
            tab.off('shown.bs.tab');
          }
        });
      }
    }
  };
  // document.addEventListener('cifReady', function () {
  //   $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
  //     if (e.target.id === 'depsTreeViewerT') {
  //       document.querySelector('cubx-deps-tree-viewer').setScale('auto');
  //     }
  //   });
  // });
})();
