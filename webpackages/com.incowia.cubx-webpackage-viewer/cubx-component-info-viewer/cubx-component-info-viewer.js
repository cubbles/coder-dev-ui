(function () {
  'use strict';
  /**
   * Get help:
   * > Lifecycle callbacks:
   * https://www.polymer-project.org/1.0/docs/devguide/registering-elements.html#lifecycle-callbacks
   *
   * Access the Cubbles-Component-Model:
   * > Access slot values:
   * slot 'a': this.getA(); | this.setA(value)
   */
  CubxPolymer({
    is: 'cubx-component-info-viewer',
    _cubxReady: false,

    /**
     * Manipulate an element’s local DOM when the element is created.
     */
    created: function () {
    },

    /**
     * Manipulate an element’s local DOM when the element is created and initialized.
     */
    ready: function () {
    },

    /**
     * Manipulate an element’s local DOM when the element is attached to the document.
     */
    attached: function () {
    },

    /**
     * Manipulate an element’s local DOM when the cubbles framework is initialized and ready to work.
     */
    cubxReady: function () {
      this._cubxReady = true;
    },

    /**
     *  Observe the Cubbles-Component-Model: If value for slot 'component' has changed ...
     */
    modelComponentChanged: function (component) {
      if (!this._cubxReady) { return; }
      this._updateSlotsInformation();
    },

    /**
     * Update the table which contains the information of the compound component slots
     */
    _updateSlotsInformation: function () {
      var iSlotsInfoTable = document.getElementById('i_slots_info_table');
      var oSlotsInfoTable = document.getElementById('o_slots_info_table');
      var row;
      var slotId;
      var type;
      var description;
      var slots = this.getComponent().slots;
      for (var i in slots) {
        for (var j in slots[i].direction) {
          if (slots[i].direction[j] === 'input') {
            row = iSlotsInfoTable.insertRow(iSlotsInfoTable.rows.length);
          } else {
            row = oSlotsInfoTable.insertRow(oSlotsInfoTable.rows.length);
          }
          slotId = row.insertCell(0);
          type = row.insertCell(1);
          description = row.insertCell(2);
          slotId.innerHTML = slots[i].slotId;
          type.innerHTML = slots[i].type;
          description.innerHTML = slots[i].description || '';
        }
      }
      if (iSlotsInfoTable.rows.length > 1) {
        document.getElementById('i_slots_info_div').style.display = 'block';
      }
      if (oSlotsInfoTable.rows.length > 1) {
        document.getElementById('o_slots_info_div').style.display = 'block';
      }
    }
  });
}());
