/**
 * Created by ega on 20.04.2016.
 */
/*global $, JSONEditor, location, d3, klay*/
'use strict';
/**
 * @Class WebpackageViewer
 * Load the Webpackage Viewer
 * @constructor
 * @param {string} structureHolderId - Id of the html element that holds the structure view
 * @param {string} dataflowHolderId - Id of the html element that holds the dataflow view
 */
var WebpackageViewer = function (structureHolderId, dataflowHolderId) {
  this.structureHolderId = structureHolderId;
  this.dataflowHolderId = dataflowHolderId;
  this.dataflowViewWidth = 800;
  this.dataflowViewHeight = 500;
};

WebpackageViewer.prototype.constructor = WebpackageViewer;

/**
 * Load the structureView which is a json-editor
 * @param {object} schema - JSON schema of the structureView
 */
WebpackageViewer.prototype.loadStructureView = function (schema) {
  this.setStructureViewOptions();
  this.structureView = new JSONEditor(document.getElementById(this.structureHolderId), {
    theme: 'bootstrap3',
    iconlib: 'bootstrap3',
    disable_array_reorder: true,
    no_additional_properties: true,
    disable_edit_json: true,
    disable_properties: true,
    keep_oneof_values: false,
    schema: schema
  });
};

/**
 * Set the json-editors' default options.
 */
WebpackageViewer.prototype.setStructureViewOptions = function () {
  JSONEditor.defaults.editors.array.options.collapsed = true;
  JSONEditor.defaults.editors.table.options.collapsed = true;
};

/**
 * Load the manifest.webpackage file retrieving its path from the url
 */
WebpackageViewer.prototype.loadManifest = function () {
  var self = this;
  $.getJSON(this.$_GET('webpackage'), function (response) {
    self.structureView.setValue(response);
    $('[data-toggle="popover"]').popover();
    self.addViewDataflowButtons();
  });
};

/**
 * Load the JSON schema file retrieving its path from the url.
 * Additionally add format to the schema for its representation
 */
WebpackageViewer.prototype.loadSchema = function () {
  var self = this;
  $.getJSON(this.$_GET('schema'), function (response) {
    var schema = response;

    for (var prop in schema.properties.artifacts.properties) {
      schema.properties.artifacts.properties[prop].format = 'tabs';
    }
    schema.properties.contributors.format = 'table';
    schema.properties.author.format = 'grid';

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
    // schema.format = 'grid';
    self.loadStructureView(schema);
  });
};

/**
 * Read url get parameters, similar to PHP.
 * Source: https://www.creativejuiz.fr/blog/en/javascript-en/read-url-get-parameters-with-javascript
 * @param {string} param - Name of the parameter to read
 * @returns {*} the value of the parameter or an empty object if the parameter was not in the url
 */
WebpackageViewer.prototype.$_GET = function (param) {
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
};

/**
 * Add a button to each compound components view, to display its dataflow view
 */
WebpackageViewer.prototype.addViewDataflowButtons = function () {
  var compoundComponents = this.structureView.getValue().artifacts.compoundComponents;
  var dataflowHolderId = this.dataflowHolderId;
  var viewDataflowButton;
  var viewIcon;
  var compoundLabel;
  var self = this;
  for (var i in compoundComponents) {
    viewDataflowButton = document.createElement('button');
    viewDataflowButton.setAttribute('type', 'button');
    viewDataflowButton.setAttribute('class', 'btn btn-primary');
    viewDataflowButton.setAttribute('data-toggle', 'modal');
    viewDataflowButton.setAttribute('data-compound-index', i);
    viewIcon = document.createElement('i');
    viewIcon.setAttribute('class', 'glyphicon glyphicon-eye-open');
    viewDataflowButton.appendChild(viewIcon);
    viewDataflowButton.appendChild(document.createTextNode('View diagram'));
    viewDataflowButton.onclick = function () {
      var dataflowHolder = $('#' + dataflowHolderId);
      self.drawDataflow(self.generateDataflowGraph($(this).attr('data-compound-index'), self.structureView.getValue()));
      dataflowHolder.modal('show');
    };
    compoundLabel = $('[data-schemapath="root.artifacts.compoundComponents.' + i + '"]').find('label:first');
    compoundLabel.append(viewDataflowButton);
  }
};

/**
 * Generate the KGraph that represents to the dataflow of a compound component
 * @param {number} index - Index of the compound component in compoundComponents array of manifest.artifacts
 * @param {object} manifest - Manifest object contain in the manifest.webpackage file
 * @returns {{id: string, children: Array}} KGraph to be used to build and display the dataflow view
 */
WebpackageViewer.prototype.generateDataflowGraph = function (index, manifest) {
  var dataflowGraph = {id: 'root', children: []};
  var compoundComponent = manifest.artifacts.compoundComponents[index];

  var rootComponent = this.generateGraphMember(
    compoundComponent,
    compoundComponent.artifactId,
    {portLabelPlacement: 'OUTSIDE', borderSpacing: 40}
  );
  rootComponent.children = this.generateGraphMembers(compoundComponent.members, manifest);

  dataflowGraph.children.push(rootComponent);
  dataflowGraph.edges = this.generateGraphConnections(compoundComponent.connections, compoundComponent.artifactId);
  return dataflowGraph;
};

/**
 * Generate a list of GraphMembers (KNodes) using a a list of components which belong to a compound component that
 * is defined in manifest
 * @param {Array} compoundMembers - Components which belong to a compound component
 * @returns {Array} List of GraphMembers (KNodes)
 */
WebpackageViewer.prototype.generateGraphMembers = function (compoundMembers) {
  var graphMember;
  var component;
  var graphMembers = [];
  for (var k in compoundMembers) {
    component = this.componentDefinitionOfMember(compoundMembers[k]);
    graphMember = this.generateGraphMember(component, compoundMembers[k].memberId);
    graphMembers.push(graphMember);
  }
  return graphMembers;
};

/**
 * Generate a GraphMember (KNode) that represents a Component
 * @param {string} component - Component to be represented as GraphMember
 * @param {string} memberId - memberId of the component within a compoundComponent
 * @param {object[]} [optionals] - Optional parameters
 * @param {string} [optionals[].portLabelPlacement='INSIDE']- Placement of the slots for the node
 * @param {number} [optionals[].borderSpacing=12] - Optional parameters
 * @returns {object}
 */
WebpackageViewer.prototype.generateGraphMember = function (component, memberId, optionals) {
  var graphMemberSlots = this.generateGraphMemberSlots(component, memberId);
  var titleWidth = component.artifactId.length * 7;

  var graphMember = {
    id: memberId,
    labels: [{text: component.artifactId, width: titleWidth, height: 10}],
    width: Math.max(graphMemberSlots.maxSlotWidth * 2 + 20, titleWidth),
    height: graphMemberSlots.slots.length * 15 + 40,
    ports: graphMemberSlots.slots,
    properties: {
      portConstraints: 'FIXED_SIDE',
      portLabelPlacement: (optionals) ? optionals.portLabelPlacement : 'INSIDE',
      nodeLabelPlacement: 'V_TOP',
      portAlignment: 'CENTER',
      portSpacing: 3,
      borderSpacing: (optionals) ? optionals.borderSpacing : 12,
      labelSpacing: 6
    }
  };
  return graphMember;
};

/**
 * Generate the slots (ports) of a GraphMember (KNode)
 * @param {object} compoundMember - Component which is a member of a compound component
 * @param {string} memberId - memberId of the component within a compoundComponent
 * @returns {{slots: Array, maxSlotWidth: number}} - List of slots and the width of the widest slot
 */
WebpackageViewer.prototype.generateGraphMemberSlots = function (compoundMember, memberId) {
  var graphMemberSlots = [];
  var graphMemberSlot;
  var maxSlotWidth = 0;
  var slotLabelWidth;
  for (var l in compoundMember.slots) {
    for (var m in compoundMember.slots[l].direction) {
      slotLabelWidth = compoundMember.slots[l].slotId.length * 5;
      maxSlotWidth = Math.max(slotLabelWidth, maxSlotWidth);
      graphMemberSlot = this.generateGraphMemberSlot(
        compoundMember.slots[l].slotId,
        memberId,
        compoundMember.slots[l].direction[m],
        slotLabelWidth
      );
      graphMemberSlots.push(graphMemberSlot);
    }
  }
  return {slots: graphMemberSlots, maxSlotWidth: maxSlotWidth};
};

/**
 * Generate a slot (port) of a GraphMember (KNode)
 * @param {string} slotId - Id of the slot
 * @param {string} memberId - memberId of the component within a compoundComponent
 * @param {string} direction - direction of the slot (input, output)
 * @param {number} slotWidth - Width of the slot
 * @returns {object} Generated slot (port)
 */
WebpackageViewer.prototype.generateGraphMemberSlot = function (slotId, memberId, direction, slotWidth) {
  var graphMemberSlot = {
    id: slotId + '_' + memberId + '_' + direction,
    properties: {
      portSide: (direction === 'input') ? 'WEST' : 'EAST'
    },
    labels: [{
      text: slotId,
      width: slotWidth,
      height: 10
    }],
    height: 10
  };
  return graphMemberSlot;
};

/**
 * Generate the connections (edges) using a list of connections of a compound component
 * @param {Array} compoundConnections - List of connections of a compound component
 * @param {string} compoundId - artifactId of the compound component
 * @returns {Array} Generated connections
 */
WebpackageViewer.prototype.generateGraphConnections = function (compoundConnections, compoundId) {
  var connection;
  var connections = [];
  for (var n in compoundConnections) {
    connection = this.generateGraphConnection(compoundConnections[n], compoundId);
    connections.push(connection);
  }
  return connections;
};

/**
 * Generate a graph connection (edge) of a compound component
 * @param {object} compoundConnection - Connection within the compound component
 * @param {string} compoundId - artifactId of the compound component
 * @returns {object} Generated connection
 */
WebpackageViewer.prototype.generateGraphConnection = function (compoundConnection, compoundId) {
  var source;
  var sourcePort = compoundConnection.source.slot + '_';
  if (compoundConnection.source.memberIdRef) {
    source = compoundConnection.source.memberIdRef;
    sourcePort += compoundConnection.source.memberIdRef + '_' + 'output';
  } else {
    source = compoundId;
    sourcePort += compoundId + '_' + 'input';
  }
  var target;
  var targetPort = compoundConnection.destination.slot + '_';
  if (compoundConnection.destination.memberIdRef) {
    target = compoundConnection.destination.memberIdRef;
    targetPort += compoundConnection.destination.memberIdRef + '_' + 'input';
  } else {
    target = compoundId;
    targetPort += compoundId + '_' + 'output';
  }
  var connection = {
    id: compoundConnection.connectionId,
    labels: [{
      text: compoundConnection.connectionId,
      width: compoundConnection.connectionId.length * 5,
      height: 10
    }],
    source: source,
    sourcePort: sourcePort,
    target: target,
    targetPort: targetPort
  };
  return connection;
};

/**
 * Returns the component definition of a member from the same manifest or from a manifest located in a store
 * @param {object} member - Member of a compound component
 * @returns {object} Component from a manifest
 */
WebpackageViewer.prototype.componentDefinitionOfMember = function (member) {
  // TODO: define how this url will be passed
  var store = 'https://cubbles.world/sandbox/';
  var componentArtifactId = member.componentId.substr(member.componentId.indexOf('/') + 1);
  var component;
  if (member.componentId.includes('this/')) {
    component = this.searchComponentInManifest(componentArtifactId, this.structureView.getValue());
  } else {
    var self = this;
    var manifestUrl = store + member.componentId.substr(0, member.componentId.indexOf('/'));
    $.ajaxSetup({async: false});
    $.getJSON(manifestUrl, function (response) {
      component = self.searchComponentInManifest(componentArtifactId, response);
    });
    $.ajaxSetup({async: true});
  }
  return component;
};

/**
 * Search a component in a determined manifest
 * @param {string} componentArtifactId - Artifact id of the component
 * @param {object} manifest - Manifest where the component will be searched
 * @returns {object} Found component
 */
WebpackageViewer.prototype.searchComponentInManifest = function (componentArtifactId, manifest) {
  var componentDefinition = this.searchComponentIn(componentArtifactId, manifest.artifacts.elementaryComponents);
  if (!componentDefinition) {
    componentDefinition = this.searchComponentIn(componentArtifactId, manifest.artifacts.compoundComponents);
  }
  return componentDefinition;
};

/**
 * Search a component in a components list using its id
 * @param {string} componentId - Id of the component to be searched
 * @param {Array} componentsList - Array where the component will be searched
 * @returns {*}
 */
WebpackageViewer.prototype.searchComponentIn = function (componentId, componentsList) {
  for (var i in componentsList) {
    if (componentsList[i].artifactId === componentId) {
      return componentsList[i];
    }
  }
  return false;
};

/**
 * Build and append all the graphic elements of the dataflow view described by a Kgraph
 * @param {object} dataflowGraph - JSON KGraph to be displayed
 */
WebpackageViewer.prototype.drawDataflow = function (dataflowGraph) {
// group
  d3.select('#' + this.dataflowHolderId).select('.modal-body').html('');
  var self = this;
  var zoom = d3.behavior.zoom()
    .on('zoom', function () {
      self.svg.attr('transform', 'translate(' + d3.event.translate + ')' + ' scale(' + d3.event.scale + ')');
    });
  this.svg = d3.select('#' + this.dataflowHolderId).select('.modal-body')
    .append('svg')
    .attr('width', '100%')
    .attr('height', this.dataflowViewHeight)
    .call(zoom)
    .append('g');
  var root = this.svg.append('g');
  var layouter = klay.d3kgraph()
    .size([this.dataflowViewWidth, this.dataflowViewHeight])
    .transformGroup(root)
    .options({
      layoutHierarchy: true,
      intCoordinates: true,
      direction: 'RIGHT',
      edgeRouting: 'ORTHOGONAL',
      nodeLayering: 'NETWORK_SIMPLEX',
      nodePlace: 'BRANDES_KOEPF',
      crossMin: 'LAYER_SWEEP',
      algorithm: 'de.cau.cs.kieler.klay.layered'
    });
  layouter.on('finish', function (d) {
    var components = layouter.nodes();
    var connections = layouter.links(components);

    var componentsData = root.selectAll('.node')
      .data(components, function (d) { return d.id; });

    var connectionsData = root.selectAll('.link')
      .data(connections, function (d) { return d.id; });

    self.drawComponents(componentsData);
    self.drawComponentsSlots(componentsData);
    self.drawConnections(connectionsData);
  });

  layouter.kgraph(dataflowGraph);
};

/**
 * Draw a square for each component and its id as label
 * @param {Object} componentsData - Data of each component (D3)
 */
WebpackageViewer.prototype.drawComponents = function (componentsData) {
  var componentView = componentsData.enter()
    .append('g')
    .attr('class', function (d) {
      if (d.children) {
        return 'componentView compound';
      } else {
        return 'componentView leaf';
      }
    });

  var atoms = componentView.append('rect')
    .attr('class', 'componentViewAtom');

  // Apply componentView positions
  componentView.transition()
    .attr('transform', function (d) {
      return 'translate(' + (d.x || 0) + ' ' + (d.y || 0) + ')';
    });

  atoms.transition()
    .attr('width', function (d) { return d.width; })
    .attr('height', function (d) { return d.height; });

  // Nodes labels
  var componentViewLabel = componentView.selectAll('.componentViewLabel')
    .data(function (d) {
      return d.labels || [];
    })
    .enter()
    .append('text')
    .text(function (d) {
      return d.text;
    })
    .attr('class', 'componentViewLabel');

  componentViewLabel.transition()
    .attr('height', function (d) { return d.height; })
    .attr('width', function (d) { return d.width; });

  componentViewLabel.transition()
    .attr('x', function (d) { return d.x + 5; })
    .attr('y', function (d) { return d.y + d.height + 5; });
};

/**
 * Draw the components' slots and their ids as labels
 * @param {Object} componentsData - Data of each component (D3)
 */
WebpackageViewer.prototype.drawComponentsSlots = function (componentsData) {
  // slots
  var slotView = componentsData.selectAll('.slotView')
    .data(function (d) { return d.ports || []; })
    .enter()
    .append('g')
    .attr('class', 'slotView');

  slotView.append('circle')
    .attr('class', 'slotViewAtom');

  // slots labels
  var slotViewLabel = slotView.selectAll('.slotViewLabel')
    .data(function (d) { return d.labels; })
    .enter()
    .append('text')
    .text(function (d) { return d.text; })
    .attr('class', 'slotViewLabel');

  slotView.transition()
    .attr('transform', function (d) {
      return 'translate(' + (d.x || 0) + ' ' + (d.y || 0) + ')';
    });

  slotViewLabel.transition()
    .attr('x', function (d) {
      return d.x;
    })
    .attr('y', function (d) { return d.y + 3; });
};

/**
 * Draw the connections and their ids as labels
 * @param {Object} connectionData - Data of each connection (D3)
 */
WebpackageViewer.prototype.drawConnections = function (connectionData) {
  // build the arrow.
  this.svg.append('svg:defs').selectAll('marker')
    .data(['end'])                 // define connectionView/path types
    .enter().append('svg:marker')    // add arrows
    .attr('id', String)
    .attr('class', 'arrowEnd')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 10)
    .attr('refY', 0)
    .attr('markerWidth', 5)        // marker settings
    .attr('markerHeight', 5)
    .attr('orient', 'auto')  // arrowhead color
    .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5');

  // Add connections arrows
  var connectionView = connectionData.enter()
    .append('path')
    .attr('class', 'connectionView')
    .attr('d', 'M0 0')
    .attr('marker-end', 'url(#end)');

  // Add connections labels
  var connectionViewLabel = connectionData.enter()
    .append('text')
    .attr('class', 'connectionViewLabel')
    .text(function (d) { return d.labels[0].text || ''; });

  // Apply connections routes
  connectionView.transition().attr('d', function (d) {
    var path = '';
    path += 'M' + (d.sourcePoint.x + 5) + ' ' + (d.sourcePoint.y - 5) + ' ';
    (d.bendPoints || []).forEach(function (bp, i) {
      path += 'L' + bp.x + ' ' + (bp.y - 5) + ' ';
    });
    path += 'L' + (d.targetPoint.x - 5) + ' ' + (d.targetPoint.y - 5) + ' ';
    return path;
  });

  connectionViewLabel.transition()
    .attr('x', function (d) { return d.labels[0].x; })
    .attr('y', function (d) { return d.labels[0].y + d.labels[0].height * 2.2; });
};

