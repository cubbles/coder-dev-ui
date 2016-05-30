/*global $, JSONEditor, location*/
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
      this.loadSchema();
    },
    /**
     *  Observe the Cubbles-Component-Model: If value for slot 'schemaUrl' has changed ...
     */
    modelSlotSchemaUrlChanged: function (schemaUrl) {
      this.loadSchema();
    },
    /**
     *  Observe the Cubbles-Component-Model: If value for slot 'manifestUrl' has changed ...
     */
    modelSlotManifestUrlChanged: function (manifestUrl) {
      this.loadManifest();
    },

    /**
     * Load the structureView which is a json-editor
     * @param {object} schema - JSON schema of the structureView
     */
    loadStructureView: function (schema) {
      this.setStructureViewOptions();
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
        schema: schema
      });
    },

    /**
     * Set the json-editors' default options.
     */
    setStructureViewOptions: function () {
      JSONEditor.defaults.editors.array.options.collapsed = true;
      JSONEditor.defaults.editors.table.options.collapsed = true;
    },

    /**
     * Load the manifest.webpackage file retrieving its path from the url
     */
    loadManifest: function () {
      var self = this;
      $.getJSON(this.getManifestUrl(), function (response) {
        self.structureView.setValue(response);
        self.setManifest(response);
        self.addViewDataflowButtons();
        $('[data-toggle="popover"]').popover();
        $('[data-toggle="tooltip"]').tooltip();
      });
    },

    /**
     * Load the JSON schema file retrieving its path from the url.
     * Additionally add format to the schema for its representation
     */
    loadSchema: function () {
      var self = this;
      $.getJSON(this.getSchemaUrl(), function (response) {
        var schema = response;

        for (var prop in schema.properties.artifacts.properties) {
          schema.properties.artifacts.properties[prop].format = 'tabs';
        }
        schema.properties.contributors.format = 'table';

        var artifacts = ['appArtifact', 'elementaryArtifact', 'compoundArtifact'];
        for (var i in artifacts) {
          schema.definitions[artifacts[i]].properties.runnables.format = 'table';
          schema.definitions[artifacts[i]].properties.endpoints.format = 'tabs';
        }
        schema.definitions.elementaryArtifact.properties.slots.format = 'tabs';
        schema.definitions.compoundArtifact.properties.slots.format = 'tabs';
        schema.definitions.compoundArtifact.properties.members.format = 'table';
        schema.definitions.compoundArtifact.properties.connections.format = 'tabs';
        schema.definitions.compoundArtifact.properties.inits.format = 'table';
        self.loadStructureView(schema);
        self.hideRootLabel();
        self.loadManifest();
      });
    },

    /**
     * Read url get parameters, similar to PHP.
     * Source: https://www.creativejuiz.fr/blog/en/javascript-en/read-url-get-parameters-with-javascript
     * @param {string} param - Name of the parameter to read
     * @returns {*} the value of the parameter or an empty object if the parameter was not in the url
     */
    $_GET: function (param) {
      var vars = {};
      window.location.href.replace(location.hash, '').replace(
        /[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
        function (m, key, value) { // callback
          vars[key] = value !== undefined ? value : '';
        }
      );

      if (param) {
        return vars[param] ? vars[param] : null;
      }
      return vars;
    },

    /**
     * Add a button to each compound components view, to display its dataflow view
     */
    addViewDataflowButtons: function () {
      var self = this;
      var types = ['compoundComponents', 'elementaryComponents'];
      var artifacts = this.structureView.getValue().artifacts;
      for (var i in types) {
        for (var j in artifacts[types[i]]) {
          this.createViewComponentButton(j, types[i]);
        }
      }
      $('#dataflow_view_modal').on('shown.bs.modal', function () {
        self.updateCurrentComponent(self.structureView.getValue().artifacts[self.currentComponentsType][self.currentComponentIndex]);
      });
    },

    createViewComponentButton: function (componentIndex, componentsType) {
      var self = this;
      var viewDataflowButton = document.createElement('button');
      viewDataflowButton.setAttribute('type', 'button');
      viewDataflowButton.setAttribute('class', 'btn btn-primary btn-view-diagram');
      viewDataflowButton.setAttribute('data-toggle', 'modal');
      viewDataflowButton.setAttribute('data-compound-index', componentIndex);
      var viewIcon = document.createElement('i');
      viewIcon.setAttribute('class', 'glyphicon glyphicon-eye-open');
      viewDataflowButton.appendChild(viewIcon);
      var buttonText = (componentsType === 'compoundComponents') ? ' Dataflow view' : ' Interface view';
      viewDataflowButton.appendChild(document.createTextNode(buttonText));
      viewDataflowButton.onclick = function () {
        self.currentComponentIndex = $(this).attr('data-compound-index');
        self.currentComponentsType = componentsType;
        $('#dataflow_view_holder').html('');
        var diagramContainer = $('#' + self.componentViewModalId);
        diagramContainer.find('.modal-title').html(buttonText);
        diagramContainer.modal('show');
      };
      $('[data-schemapath="root.artifacts.' + componentsType + '.' + componentIndex + '"]').prepend(viewDataflowButton);
    },

    /**
     * Updates the artifactId of the current compound component
     * @param {object} component - New current component
     */
    updateCurrentComponent: function (component) {
      this.setCurrentComponentArtifactId(component.artifactId);
    },

    hideRootLabel: function () {
      $('[data-schemaid = "root"]').find('label:first').css('display', 'none');
    }
  });
}());
