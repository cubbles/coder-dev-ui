/* globals hljs*/
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
      this.$$('h2').style.display = 'none';
    },

    /**
     *  Observe the Cubbles-Component-Model: If value for slot 'component' has changed ...
     */
    modelComponentChanged: function (component) {
      if (!this._cubxReady) { return; }
      this._updateInterfaceInfo();
    },

    /**
     *  Observe the Cubbles-Component-Model: If value for slot 'showTitle' has changed ...
     */
    modelShowTitleChanged: function (showTitle) {
      var titleElement = this.$$('h2');
      if (showTitle) {
        titleElement.style.display = 'block';
      } else {
        titleElement.style.display = 'none';
      }
    },

    /**
     * Update slots and inits information of the component
     * @private
     */
    _updateInterfaceInfo: function () {
      var compoundInits = {};
      if ('inits' in this.getComponent()) {
        compoundInits = this._updateMembersInits();
      }
      this._updateSlotsInfo(compoundInits);
    },

    /**
     * Update input and output slots information of the component
     * @param {object} compoundInits - Object containing (if any) init values in case this the
     * component is a compound
     * @private
     */
    _updateSlotsInfo: function (compoundInits) {
      var iSlotsInfoTable = this.$$('#i_slots_info_table');
      var oSlotsInfoTable = this.$$('#o_slots_info_table');
      var slots = this.getComponent().slots;
      for (var i in slots) {
        for (var j in slots[i].direction) {
          var row;
          if (slots[i].direction[j] === 'input') {
            row = iSlotsInfoTable.insertRow(iSlotsInfoTable.rows.length);
          } else {
            row = oSlotsInfoTable.insertRow(oSlotsInfoTable.rows.length);
          }
          var slotId = row.insertCell(0);
          var type = row.insertCell(1);
          var description = row.insertCell(2);
          var value = row.insertCell(3);
          slotId.innerHTML = slots[i].slotId;
          type.innerHTML = slots[i].type;
          description.innerHTML = slots[i].description || '';
          var valueText = 'value' in slots[i] ? JSON.stringify(slots[i].value)
            : compoundInits[slots[i].slotId] || '';
          value.appendChild(this._createPreAndCodeElement(valueText));
        }
      }
    },

    /**
     * Update initial values of the members in case the component is a compound
     * @returns {{slotId: value}} - object containing members' initial values
     * @private
     */
    _updateMembersInits: function () {
      var compoundInits = {};
      var membersInitsTable = this.$$('#members_inits_table');
      var inits = this.getComponent().inits;
      for (var k in inits) {
        if ('memberIdRef' in inits[k]) {
          var row = membersInitsTable.insertRow(membersInitsTable.rows.length);
          var memberId = row.insertCell(0);
          var slotId = row.insertCell(1);
          var value = row.insertCell(2);

          memberId.innerHTML = inits[k].memberIdRef;
          slotId.innerHTML = inits[k].slot;
          value.appendChild(this._createPreAndCodeElement(JSON.stringify(inits[k].value)));
        } else {
          compoundInits[inits[k].slot] = JSON.stringify(inits[k].value);
        }
      }
      return compoundInits;
    },

    _createPreAndCodeElement: function (codeText) {
      if (codeText) {
        var code = document.createElement('code');
        code.className = 'javascript';
        code.appendChild(document.createTextNode(codeText));
        var pre = document.createElement('pre');
        pre.className = this.is;
        pre.appendChild(code);
        hljs.highlightBlock(pre);
        return pre;
      }
      return document.createTextNode('');
    }
  });
}());
