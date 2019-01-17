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
      var container = $(this.source).find('.container'); 
      var tab =  container.find('a[data-tab-id=componentViewer]').parent();
      window.com_incowia_cubxWebpackageViewer_cubxComponentViewer.displayTab(tab, container);
      next(artifactId);
    },

    handleTabClick: function (e) {
      var currentTab = $(e.target.parentElement);
      var container = $(e.target.parentElement.parentElement.parentElement);
      window.com_incowia_cubxWebpackageViewer_cubxComponentViewer.displayTab(currentTab, container);
    },

    disableActiveTabs: function (container) {
      // Disable active tabs
      container.find('.active').removeClass('active');
      container.find('.in').removeClass('in');
    },

    displayTab: function (tab, container) {
      window.com_incowia_cubxWebpackageViewer_cubxComponentViewer.disableActiveTabs(container);
      // Enable and display current tab
      var dataTabId = tab.find('a').data('tabId');
      tab.addClass('active');
      var tabContent =  container.find('div.tab-content > [data-tab-id=' + dataTabId + ']');
      $(tabContent).addClass('in active');
      $(tabContent).trigger('shown.bs.tab');
    }
  };

})();
