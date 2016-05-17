/**
 * Created by ega on 13.05.2016.
 */
(function () {
  'use strict';
  // set namespace containing cubx-data-flow-viewer functions
  window.com_incowia_cubx_data_flow_viewer = {
    showTooltip: function (evt, mouseovertext) {
      var tooltip = document.getElementById('tooltip');
      tooltip.style.top = (evt.clientY + 12) + 'px';
      tooltip.style.left = (evt.clientX + 12) + 'px';
      tooltip.textContent = mouseovertext;
      tooltip.style.display = 'block';
    },

    hideTooltip: function () {
      var tooltip = document.getElementById('tooltip');
      tooltip.style.display = 'none';
    }
  };
})();
