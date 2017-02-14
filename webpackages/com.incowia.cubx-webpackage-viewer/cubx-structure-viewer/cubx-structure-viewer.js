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

    structureHolderId: 'structureViewHolder',
    componentViewModalId: 'dataflow_view_modal',
    depTreeModalId: 'dep_tree_view_modal',

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
      this._addListenerToHideElementsButton();
    },

    /**
     *  Observe the Cubbles-Component-Model: If value for slot 'manifest' has changed ...
     */
    modelManifestChanged: function (manifest) {
      this.setCurrentComponentArtifactId(undefined);
      if (!this.getSchemaLoaded()) {
        return;
      }
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
      this.$$('#structureViewHolder').style.display = 'none';
      var viewer = this.$$('[data-schemaid="root"]');
      if (viewer) {
        this.$$('#structureViewHolder').removeChild(viewer);
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
      this.$$('#structureViewHolder').style.display = 'block';
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
     * Add show Dataflow/Interface view and show Dependency Tree button to each component's view.
     * @private
     */
    _addViewDataflowButtons: function () {
      var self = this;
      var types = ['compoundComponents', 'elementaryComponents'];
      var artifacts = this.getManifest().artifacts;
      for (var i in types) {
        var componentsType = types[i];
        var buttonText = (componentsType === 'compoundComponents') ? ' Dataflow view' : ' Interface view';
        for (var j = 0; j < artifacts[componentsType].length; j++) {
          this._createComponentViewButton(j, componentsType, 'Dependency tree', this.depTreeModalId, showViewerModal);
          this._createComponentViewButton(j, componentsType, buttonText, this.componentViewModalId, showViewerModal);
        }
      }
      function showViewerModal () {
        var diagramContainer = $('#' + $(this).attr('data-modal-id'));
        diagramContainer.find('.modal-title').text($(this).attr('data-modal-title'));
        diagramContainer.modal('show');
        self._updateCurrentComponent(self.getManifest()
          .artifacts[$(this).attr('data-compound-type')][$(this).attr('data-compound-index')]);
      }
    },

    /**
     * Create and append a button to the view of a certain component
     * @param {number} componentIndex - Index of the component within artifacts array of manifest
     * @param {string} componentType - Key in artifacts -> compoundComponents or elementaryComponents
     * @param {string} buttonText - Text to be set to the button
     * @param {string} modalId - Id of the modal that will be shown when this button is clicked
     * @param {function} onclick - Function to be called when the button is clicked
     * @private
     */
    _createComponentViewButton: function (componentIndex, componentType, buttonText, modalId, onclick) {
      var viewDataflowButton = document.createElement('button');
      viewDataflowButton.setAttribute('type', 'button');
      viewDataflowButton.setAttribute('class', 'btn btn-primary btn-component-view');
      viewDataflowButton.setAttribute('data-toggle', 'modal');
      viewDataflowButton.setAttribute('data-compound-index', componentIndex);
      viewDataflowButton.setAttribute('data-compound-type', componentType);
      viewDataflowButton.setAttribute('data-modal-id', modalId);
      viewDataflowButton.setAttribute('data-modal-title', buttonText);
      var viewIcon = document.createElement('i');
      viewIcon.setAttribute('class', 'glyphicon glyphicon-eye-open');
      viewDataflowButton.appendChild(viewIcon);
      var buttonTextSpan = document.createElement('span');
      buttonTextSpan.innerText = buttonText;
      viewDataflowButton.appendChild(buttonTextSpan);
      viewDataflowButton.onclick = onclick;
      $('[data-schemapath="root.artifacts.' + componentType + '.' + componentIndex + '"]').prepend(viewDataflowButton);
    },

    /**
     * Updates the artifactId of the current compound component
     * @param {object} component - New current component
     * @private
     */
    _updateCurrentComponent: function (component) {
      this.setCurrentComponentArtifactId(component.artifactId);
      this._handleInitialScale(this.depTreeModalId, this.setDepsTreeVScale.bind(this));
      this._handleInitialScale(this.componentViewModalId, this.setComponentVScale.bind(this));
    },

    /**
     * handle initial scale of cubx-component-viewer and cubx-deps-tree-viewer
     * @param modalId
     * @private
     */
    _handleInitialScale: function (modalId, setScaleFunction) {
      var modal = $('#' + modalId);
      if (modal.hasClass('in')) {
        setScaleFunction('auto');
      } else {
        setScaleFunction('none');
        modal.on('shown.bs.modal', function (e) {
          if (e.target.id === modalId) {
            setScaleFunction('auto');
            modal.off('shown.bs.modal');
          }
        });
      }
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
