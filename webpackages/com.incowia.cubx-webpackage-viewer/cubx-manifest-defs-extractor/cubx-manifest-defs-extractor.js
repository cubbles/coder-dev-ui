(function () {
  'use strict';
  /**
   * Get help:
   * > Lifecycle callbacks:
   * https://www.polymer-project.org/1.0/docs/devguide/registering-elements.html#lifecycle-callbacks
   *
   */
  CubxPolymer({
    is: 'cubx-manifest-defs-extractor',

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
    },

    /**
     *  Observe the Cubbles-Component-Model: If value for slot 'componentArtifactId' has changed ...
     */
    modelComponentArtifactIdChanged: function (componentArtifactId) {
      if (!this.getManifest() || !componentArtifactId) return;
      this._startWorking();
    },

    /**
     *  Observe the Cubbles-Component-Model: If value for slot 'manifest' has changed ...
     */
    modelManifestChanged: function (manifest) {
      if (!this.getComponentArtifactId() || !manifest) return;
      this._startWorking();
    },

    /**
     * Checks if component is within the manifest and starts the process to draw the component on
     * the viewer
     * @private
     */
    _startWorking: function () {
      this.status = 'init';
      this._initGlobalVars();
      var component = this._searchComponentInManifest(this.getComponentArtifactId(), this.getManifest());
      if (component) {
        this.setRootDependency(this._generateRootDependencyValue(component.artifactId));
        this.setComponent(component);
        this._generateDefinitions();
      } else {
        console.error('The component with ' + this.getComponentArtifactId() + ' artifactId was not found');
      }
    },

    _initGlobalVars: function () {
      this._componentsDefinitions = {};
      this._membersDefinitions = {};
      this._manifestCache = {};
      this._connections = [];
      this._processedMembers = 0;
    },

    _generateRootDependencyValue: function (artifactId)  {
      return {
        artifactId: artifactId,
        webpackageId: this._determineManifestWebpackageId(this.getManifest())
      }
    },

    _determineManifestWebpackageId: function (manifest) {
      return (manifest.groupId ? manifest.groupId + '.' : '') + manifest.name + '@' + manifest.version
    },

    _generateDefinitions: function () {
      var component = this.getComponent();
      component.webpackageId = this._determineManifestWebpackageId(this.getManifest())
      this._addComponentDefinition(component);
      if (this.getComponent().hasOwnProperty('connections')) {
        this._connections = this.getComponent().connections;
      }
      this._extractComponentMembers();
      this._extractComponentsDefinitions();
    },

    _extractComponentMembers: function () {
      if (this.getComponent() &&
        this.getComponent().hasOwnProperty('members') &&
        this.getComponent().members.length > 0) {
        if (this.getComponent().members[0].hasOwnProperty('componentId')) {
          this._membersDefinitions = parseModel8MembersToModel9.call(this, this.getComponent().members);
        } else {
          this._membersDefinitions = this.getComponent().members;
        }
      }

      function parseModel8MembersToModel9(members) {
        return members.map(function (member) {
          return {
            memberId: member.memberId,
            artifactId: this._determineArtifactIdOfModel8Member(member)
          }
        }.bind(this))
      }
    },

    _extractComponentsDefinitions: function () {
      if (this.getComponent() && this.getComponent().hasOwnProperty('members')) {
        this.getComponent().members.forEach(function (member) {
          var memberDependency = this._determineMemberDependency(member, this.getComponent());
          this._addMemberComponentDefinition(memberDependency)
        }.bind(this))
      }
    },

    _addComponentDefinition: function (componentDef) {
      this._componentsDefinitions[componentDef.artifactId] = componentDef;
      if (this._allMembersProcessed()) {
        this.status = 'ready';
        this.setComponentDefinitions({
          components: this._componentsDefinitions,
          members: this._membersDefinitions,
          connections: this._connections,
          componentArtifactId: this.getComponentArtifactId(),
        })
      }
    },

    _allMembersProcessed: function () {
      return this.getComponent().members && this.getComponent().members.length === this._processedMembers;
    },

    _addMemberComponentDefinition: function (dependency) {
      if (dependency.hasOwnProperty('webpackageId')) {
        if (this._manifestCache.hasOwnProperty(dependency.webpackageId)) {
          addComponentDefinitionFromManifest.call(this, this._manifestCache.webpackageId);
        } else {
          this._requestFile(
            this._determineManifestUrlOfExternalDependency(dependency),
            addComponentDefinitionFromManifest.bind(this)
          )
        }
      } else {
        addComponentDefinitionFromManifest.call(this, this.getManifest());
      }

      function addComponentDefinitionFromManifest (manifest) {
        this._processedMembers ++;
        this._addComponentDefinition(this._searchComponentInManifest(dependency.artifactId, manifest));
      }
    },

    _determineMemberDependency: function (member, parentComponent) {
      if (member.componentId) {
        return this._determineDependencyForModel8Member(member);
      }
      if (parentComponent.hasOwnProperty('dependencies')) {
        return parentComponent.dependencies.find(function (dep) {
          return dep.artifactId === member.artifactId;
        });
      }
      return null;
    },

    _determineDependencyForModel8Member: function (member) {
      var dependency = {};
      dependency.artifactId = this._determineArtifactIdOfModel8Member(member);
      var webpackageId = this._determineWebpackagetIdOfModel8Member(member);
      if (webpackageId !== 'this') {
        dependency.webpackageId = webpackageId;
      }
      return dependency;
    },

    _determineArtifactIdOfModel8Member: function (member) {
      return member.componentId.substr(member.componentId.indexOf('/') + 1);
    },

    _determineWebpackagetIdOfModel8Member: function (member) {
      return member.componentId.substr(0, member.componentId.indexOf('/'));
    },

    _determineManifestUrlOfExternalDependency: function (dependency) {
      return window.cubx.CRC._baseUrl + dependency.webpackageId + '/manifest.webpackage';
    },


    _requestFile: function(url, afterFileLoaded) {
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
          afterFileLoaded(JSON.parse(this.responseText));
        }
      };
      xhttp.open('GET', url, true);
      xhttp.send();
    },

    /**
     * Search a component in a determined manifest
     * @param {string} componentArtifactId - Artifact id of the component
     * @param {object} manifest - Manifest where the component will be searched
     * @returns {object} Found component
     * @private
     */
    _searchComponentInManifest: function (componentArtifactId, manifest) {
      if (!manifest.artifacts) {
        console.error('The manifest has no artifacts');
      }
      var componentDefinition = this._searchComponentInList(componentArtifactId, manifest.artifacts.elementaryComponents);
      if (!componentDefinition) {
        componentDefinition = this._searchComponentInList(componentArtifactId, manifest.artifacts.compoundComponents);
      }
      return componentDefinition;
    },

    /**
     * Search a component in a components list using its id
     * @param {string} componentId - Id of the component to be searched
     * @param {Array} componentsList - Array where the component will be searched
     * @returns {*} - Found component
     * @private
     */
    _searchComponentInList: function (componentId, componentsList) {
      for (var i = 0; i < componentsList.length; i++) {
        if (componentsList[ i ].artifactId === componentId) {
          return componentsList[ i ];
        }
      }
      return false;
    }
  });
}());
