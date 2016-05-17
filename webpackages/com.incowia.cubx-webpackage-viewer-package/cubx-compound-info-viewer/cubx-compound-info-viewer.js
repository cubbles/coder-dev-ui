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
    is: 'cubx-compound-info-viewer',
    isCubxReady: false,

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
      this.isCubxReady = true;
    },

    /**
     *  Observe the Cubbles-Component-Model: If value for slot 'compoundComponent' has changed ...
     */
    modelCompoundComponentChanged: function (compoundComponent) {
      if (!this.isCubxReady) { return; }
      this.updateSlotsInformation();
    },

    /**
     * Update the table which contains the information of the compound component slots
     */
    updateSlotsInformation: function () {
      var slotsInfoTable = document.getElementById('slots_info_table');
      var row;
      var slotId;
      var type;
      var description;
      for (var i in this.getCompoundComponent().slots) {
        row = slotsInfoTable.insertRow(slotsInfoTable.rows.length);
        slotId = row.insertCell(0);
        type = row.insertCell(1);
        description = row.insertCell(2);
        slotId.innerHTML = this.getCompoundComponent().slots[i].slotId;
        type.innerHTML = this.getCompoundComponent().slots[i].type;
        description.innerHTML = this.getCompoundComponent().slots[i].description || '';
      }
    }
  });
}());
