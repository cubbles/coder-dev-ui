/*global $, JSONEditor*/
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
    is: 'cubx-structure-viewer',

    currentComponentIndex: 0,
    structureHolderId: 'structure_view_holder',
    componentViewModalId: 'dataflow_view_modal',

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
      this.$$('#hideElementsButton').style.display = 'none';
      this._addListenerToHideElementsButton();
    },

    /**
     *  Observe the Cubbles-Component-Model: If value for slot 'manifest' has changed ...
     */
    modelManifestChanged: function (manifest) {
      this.setCurrentComponentArtifactId(undefined);
      if (!this.getSchemaLoaded()) return;
      this._loadStructureView();
    },

    /**
     *  Observe the Cubbles-Component-Model: If value for slot 'schema' has changed ...
     */
    modelSchemaChanged: function (schema) {
      for (var prop in this.getSchema().properties.artifacts.properties) {
        this.getSchema().properties.artifacts.properties[prop].format = 'tabs';
      }
      this.getSchema().properties.contributors.format = 'table';

      var artifacts = ['appArtifact', 'elementaryArtifact', 'compoundArtifact'];
      for (var i in artifacts) {
        this.getSchema().definitions[artifacts[i]].properties.runnables.format = 'table';
        this.getSchema().definitions[artifacts[i]].properties.endpoints.format = 'tabs';
      }
      this.getSchema().definitions.elementaryArtifact.properties.slots.format = 'tabs';
      this.getSchema().definitions.compoundArtifact.properties.slots.format = 'tabs';
      this.getSchema().definitions.compoundArtifact.properties.members.format = 'table';
      this.getSchema().definitions.compoundArtifact.properties.connections.format = 'tabs';
      this.getSchema().definitions.compoundArtifact.properties.inits.format = 'table';
      if (this.getManifestLoaded()) {
        this._loadStructureView();
      }
    },

    /**
     * Add a click event to the hideElementsButton
     * @private
     */
    _addListenerToHideElementsButton: function () {
      var self = this;
      $('#hideElementsButton').click(function () {
        if (self.hiddenProperties) {
          self._showEmptyProperties();
          $('#hideElementsButton').find('i:first').attr('class', 'glyphicon glyphicon-eye-close');
          $('#hideElementsButton').find('span:first').text('Hide empty properties');
        } else {
          self._hideEmptyProperties();
          $('#hideElementsButton').find('i:first').attr('class', 'glyphicon glyphicon-eye-open');
          $('#hideElementsButton').find('span:first').text('Show empty properties');
        }
      });
    },

    /**
     * Show the empty properties in the structure view
     * @private
     */
    _showEmptyProperties: function () {
      this.structureView.editors.root.showEmptyProperties();
      this.hiddenProperties = false;
    },

    /**
     * Hide the empty properties in the structure view
     * @private
     */
    _hideEmptyProperties: function () {
      this.structureView.editors.root.hideEmptyProperties();
      this.hiddenProperties = true;
    },

    /**
     * Perform the necessary actions before loading the structure
     * @private
     */
    _beforeLoadingStructure: function () {
      this.$$('#hideElementsButton').style.display = 'none';
      var viewer = this.$$('[data-schemaid="root"]');
      if (viewer) {
        this.$$('#structure_view_holder').removeChild(viewer);
      }
    },
    /**
     * Perform the necessary actions after loading the structure
     * @private
     */
    _afterLoadingStructure: function () {
      this._hideRootLabel();
      this._addViewDataflowButtons();
      this._hideEmptyProperties();
      this.$$('#hideElementsButton').style.display = 'block';
      $('[data-toggle="popover"]').popover();
      $('[data-toggle="tooltip"]').tooltip();
    },

    /**
     * Load the structureView which is a json-editor
     * @private
     */
    _loadStructureView: function () {
      this._beforeLoadingStructure();
      this._setStructureViewOptions();
      this.structureView = new JSONEditor(document.getElementById(this.structureHolderId), {
        theme: 'bootstrap3',
        iconlib: 'bootstrap3',
        no_additional_properties: true,
        keep_oneof_values: false,
        disable_array_reorder: true,
        disable_edit_json: true,
        disable_properties: true,
        disable_array_add: true,
        disable_array_delete: true,
        asViewer: true,
        schema: this.getSchema(),
        startval: this.getManifest()
      });
      this._afterLoadingStructure();
    },

    /**
     * Set the json-editors' default options.
     * @private
     */
    _setStructureViewOptions: function () {
      JSONEditor.defaults.editors.array.options.collapsed = true;
      JSONEditor.defaults.editors.table.options.collapsed = true;
    },

    /**
     * Add a button to each compound components view, to display its dataflow view
     * @private
     */
    _addViewDataflowButtons: function () {
      var self = this;
      var types = ['compoundComponents', 'elementaryComponents'];
      var artifacts = this.getManifest().artifacts;
      for (var i in types) {
        for (var j in artifacts[types[i]]) {
          this._createViewComponentButton(j, types[i]);
        }
      }
      $('#dataflow_view_modal').on('shown.bs.modal', function () {
        self._updateCurrentComponent(self.getManifest().artifacts[self.currentComponentsType][self.currentComponentIndex]);
      });
    },

    /**
     * Create a button to display the view of a certain component
     * @param {number} componentIndex - Index of the component within artifacts array of manifest
     * @param {string} componentsKey - Key in artifacts -> compoundComponents or elementaryComponents
     * @private
     */
    _createViewComponentButton: function (componentIndex, componentsKey) {
      var self = this;
      var viewDataflowButton = document.createElement('button');
      viewDataflowButton.setAttribute('type', 'button');
      viewDataflowButton.setAttribute('class', 'btn btn-primary btn-view-diagram');
      viewDataflowButton.setAttribute('data-toggle', 'modal');
      viewDataflowButton.setAttribute('data-compound-index', componentIndex);
      var viewIcon = document.createElement('i');
      viewIcon.setAttribute('class', 'glyphicon glyphicon-eye-open');
      viewDataflowButton.appendChild(viewIcon);
      var buttonText = document.createElement('span');
      buttonText.innerText = (componentsKey === 'compoundComponents') ? ' Dataflow view' : ' Interface view';
      viewDataflowButton.appendChild(buttonText);
      viewDataflowButton.onclick = function () {
        self.currentComponentIndex = $(this).attr('data-compound-index');
        self.currentComponentsType = componentsKey;
        $('#dataflow_view_holder').html('');
        var diagramContainer = $('#' + self.componentViewModalId);
        diagramContainer.find('.modal-title').text(buttonText.innerText);
        diagramContainer.modal('show');
      };
      $('[data-schemapath="root.artifacts.' + componentsKey + '.' + componentIndex + '"]').prepend(viewDataflowButton);
    },

    /**
     * Updates the artifactId of the current compound component
     * @param {object} component - New current component
     * @private
     */
    _updateCurrentComponent: function (component) {
      this.setCurrentComponentArtifactId(component.artifactId);
    },

    /**
     * Hides the root label and button generated bx the json-editor library
     * @private
     */
    _hideRootLabel: function () {
      $('[data-schemaid = "root"]').find('label:first').css('display', 'none');
    }
  });
}());
