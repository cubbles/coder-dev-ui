/* global $, JSONEditor */
(function () {
  'use strict';

  CubxComponent({
    is: 'cubx-structure-viewer',

    structureHolderId: 'structureViewHolder',
    componentViewModalId: 'dataflow_view_modal',
    depTreeModalId: 'dep_tree_view_modal',

    /**
     * Manipulate an element’s local DOM when the cubbles framework is initialized and ready to work.
     */
    contextReady: function () {
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
      this._processSchema();
      if (this.getManifestLoaded()) {
        this._loadStructureView();
      }
    },

    /**
     * Add format attributes to some manifest properties in order to be visualized correctly
     * @private
     */
    _processSchema: function () {
      // Format for artifacts
      for (var prop in this.getSchema().properties.artifacts.properties) {
        this.getSchema().properties.artifacts.properties[prop].format = 'tabs';
      }
      // Format for contributors
      this.getSchema().properties.contributors.format = 'table';
      // Format for list of runnables and endpoints
      var artifacts = ['appArtifact', 'elementaryArtifact', 'compoundArtifact'];
      for (var i = 0; i < artifacts.length; i++) {
        this.getSchema().definitions[artifacts[i]].properties.runnables.format = 'table';
        this.getSchema().definitions[artifacts[i]].properties.endpoints.format = 'tabs';
      }
      // Format for list of slots
      this.getSchema().definitions.elementaryArtifact.properties.slots.format = 'tabs';
      this.getSchema().definitions.compoundArtifact.properties.slots.format = 'tabs';
      // Format for members, connections and inits
      this.getSchema().definitions.compoundArtifact.properties.members.format = 'table';
      this.getSchema().definitions.compoundArtifact.properties.connections.format = 'tabs';
      this.getSchema().definitions.compoundArtifact.properties.inits.format = 'table';
      // Format for value of slots
      this.getSchema().definitions.compoundArtifactInitItem.properties.value.format = 'json';
      this.getSchema().definitions.elementaryArtifactSlotItem.properties.value.format = 'json';
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
      this._addFunctionButtons();
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
    _addFunctionButtons: function () {
      var self = this;
      var types = ['compoundComponents', 'elementaryComponents'];
      var artifacts = this.getManifest().artifacts;
      for (var i = 0; i < types.length; i++) {
        var componentType = types[i];
        var buttonText = (componentType === 'compoundComponents') ? ' Dataflow view' : ' Interface view';
        for (var j = 0; j < artifacts[componentType].length; j++) {
          var loadExtDocsBton = this._createFunctionButton(
            j, componentType, ' Load docs externally', 'glyphicon-new-window', null,
            determineComponentDocsViewerFullUrl(componentType, j)
          );
          var viewDepTreeBton = this._createOpenModalButton(
            j, componentType, ' Dependency tree', showViewerModal, this.depTreeModalId
          );
          var viewCompViewBton = this._createOpenModalButton(
            j, componentType, buttonText, showViewerModal, this.componentViewModalId
          );
          addFunctionButton(loadExtDocsBton, j, componentType);
          addFunctionButton(viewDepTreeBton, j, componentType);
          addFunctionButton(viewCompViewBton, j, componentType);
        }
      }
      function determineComponentDocsViewerFullUrl (componentType, index) {
        var manifestUrl = '../../' +
          (self.getManifest().groupId ? self.getManifest().groupId + '.' : '') +
          self.getManifest().name + '@' + self.getManifest().version + '/manifest.webpackage';
        var artifactId = artifacts[componentType][index].artifactId;
        var webpackageViewerId = self.getRuntimeId().substr(0, self.getRuntimeId().indexOf('/'));
        return window.cubx.CRC._baseUrl + webpackageViewerId +
          '/any-component-docs-viewer/index.html' +
          '?manifest-url=' + manifestUrl +
          '&artifact-id=' + artifactId;
      }
      function showViewerModal () {
        var diagramContainer = $('#' + $(this).attr('data-modal-id'));
        diagramContainer.find('.modal-title').text($(this).attr('data-modal-title'));
        diagramContainer.modal('show');
        var button = this;        
        var compoundType = $(button).attr('data-compound-type');
        var compoundIndex = $(button).attr('data-compound-index');
        self._updateCurrentComponent(self.getManifest().artifacts[compoundType][compoundIndex]);
      }
      function addFunctionButton (button, componentIndex, componentType) {
        $('[data-schemapath="root.artifacts.' + componentType + '.' + componentIndex + '"]').prepend(button);
      }
    },

    /**
     * Create and append a button to the view of a certain component
     * @param {number} componentIndex - Index of the component within artifacts array of manifest
     * @param {string} componentType - Key in artifacts -> compoundComponents or elementaryComponents
     * @param {string} buttonText - Text to be set to the button
     * @param {function} onclick - Function to be called when the button is clicked
     * @param {string} modalId - Id of the modal that will be shown when this button is clicked
     * @private
     */
    _createOpenModalButton: function (componentIndex, componentType, buttonText, onclick, modalId) {
      var openModalBtn = this._createFunctionButton(
        componentIndex,
        componentType,
        buttonText,
        'glyphicon-eye-open',
        onclick
      );
      openModalBtn.setAttribute('data-modal-id', modalId);
      return openModalBtn;
    },

    /**
     * Create and append a button to the view of a certain component
     * @param {number} componentIndex - Index of the component within artifacts array of manifest
     * @param {string} componentType - Key in artifacts -> compoundComponents or elementaryComponents
     * @param {string} buttonText - Text to be set to the button
     * @param {string} iconClass - Bootstrap particular class for the icon to be used
     * @param {function} onclick - Function to be called when the button is clicked
     * @param {string} href - Url to be loaded when needed
     * @private
     */
    _createFunctionButton: function (componentIndex, componentType, buttonText, iconClass, onclick, href) {
      var functionBton = document.createElement('a');
      if (href) {
        functionBton.setAttribute('href', href);
        functionBton.setAttribute('target', '_blank');
      }
      if (onclick) {
        functionBton.onclick = onclick;
      }
      functionBton.setAttribute('type', 'button');
      functionBton.setAttribute('class', 'btn btn-primary btn-component-view');
      functionBton.setAttribute('data-toggle', 'modal');
      functionBton.setAttribute('data-compound-index', componentIndex);
      functionBton.setAttribute('data-compound-type', componentType);
      functionBton.setAttribute('data-modal-title', buttonText);
      var viewIcon = document.createElement('i');
      viewIcon.setAttribute('class', 'glyphicon ' + iconClass);
      functionBton.appendChild(viewIcon);
      var buttonTextSpan = document.createElement('span');
      buttonTextSpan.innerText = buttonText;
      functionBton.appendChild(buttonTextSpan);
      return functionBton;
    },

    /**
     * Updates the artifactId of the current compound component
     * @param {object} component - New current component
     * @private
     */
    _updateCurrentComponent: function (component) {
      this.setCurrentComponentArtifactId(component.artifactId);
      this._handleInitialScale(this.depTreeModalId, function () { 
        this.setDepsTreeVScale('auto');
      }.bind(this),
      function () {
        this.setDepsTreeVScale('none');
      }.bind(this));

      this._handleInitialScale(this.componentViewModalId, function () {
        this.setComponentVScale('auto');
        this.setComponentVStartWorking(true);
      }.bind(this),
      function () {
        this.setComponentVScale('none');
      }.bind(this));
    },

    /**
     * handle initial scale of cubx-component-viewer and cubx-deps-tree-viewer
     * @param modalId
     * @private
     */
    _handleInitialScale: function (modalId, shownCbFunction, hiddenCbFunction) {
      var modal = $('#' + modalId);
      if (modal.hasClass('in')) {
        shownCbFunction();
      } else {
        hiddenCbFunction();
        modal.one('shown.bs.modal', function (e) {
          shownCbFunction();
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
