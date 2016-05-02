/**
 * Created by ega on 20.04.2016.
 */
/*global $, JSONEditor, location, d3, klay*/
'use strict';
/**
 * @Class CoderDevUI
 * Load the coder DevUI
 * @constructor
 */
var CoderDevUI = function (holderId, graphicHolderId) {
  this.holderId = holderId;
  this.graphicHolderId = graphicHolderId;
  this.graphicWidth = 800;
  this.graphicHeight = 500;
  var self = this;
  var zoom = d3.behavior.zoom()
    .on('zoom', function () {
      self.svg.attr('transform', 'translate(' + d3.event.translate + ')' + ' scale(' + d3.event.scale + ')');
    });
  this.svg = d3.select('#' + this.graphicHolderId).select('.modal-body')
    .append('svg')
    .attr('width', '100%')
    .attr('height', this.graphicHeight)
    .call(zoom)
    .append('g');
};

CoderDevUI.prototype.constructor = CoderDevUI;
/**
 * Load the json-editor and set its default parameters
 * @param {object} schema JSON schema of the editor
 */
CoderDevUI.prototype.loadEditor = function (schema) {
  this.setEditorsOptions();
  this.editor = new JSONEditor(document.getElementById(this.holderId), {
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
 * Set the editors' default options.
 */
CoderDevUI.prototype.setEditorsOptions = function () {
  JSONEditor.defaults.editors.array.options.collapsed = true;
  JSONEditor.defaults.editors.table.options.collapsed = true;
};

/**
 * Load the manifest.webpackage file retrieving its path from the url
 */
CoderDevUI.prototype.loadManifest = function () {
  var self = this;
  $.getJSON(this.$_GET('webpackage'), function (response) {
    self.editor.setValue(response);
    $('[data-toggle="popover"]').popover();
    self.addViewDiagramsButtons();
  });
};

/**
 * Load the JSON schema file retrieving its path from the url.
 *  Additionally add format to the schema for its representation
 */
CoderDevUI.prototype.loadSchema = function () {
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
    self.loadEditor(schema);
  });
};

/**
 * Read url get parameters, similar to PHP.
 * Source: https://www.creativejuiz.fr/blog/en/javascript-en/read-url-get-parameters-with-javascript
 * @param {string} param name of the parameter to read
 * @returns {*} the value of the parameter or an empty object if the parameter was not in the url
 */
CoderDevUI.prototype.$_GET = function (param) {
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
 * Add a button to each compound components view, to display its diagram
 */
CoderDevUI.prototype.addViewDiagramsButtons = function () {
  var compoundComponents = this.editor.getValue().artifacts.compoundComponents;
  var graphicHolderId = this.graphicHolderId;
  var viewDiagramButton;
  var icon;
  var compoundLabel;
  var self = this;
  for (var i in compoundComponents) {
    viewDiagramButton = document.createElement('button');
    viewDiagramButton.setAttribute('type', 'button');
    viewDiagramButton.setAttribute('class', 'btn btn-primary');
    viewDiagramButton.setAttribute('data-toggle', 'modal');
    viewDiagramButton.setAttribute('data-compound-index', i);
    icon = document.createElement('i');
    icon.setAttribute('class', 'glyphicon glyphicon-eye-open');
    viewDiagramButton.appendChild(icon);
    viewDiagramButton.appendChild(document.createTextNode('View diagram'));
    viewDiagramButton.onclick = function () {
      var graphicHolder = $('#' + graphicHolderId);
      self.drawGraph(self.generateGraph($(this).attr('data-compound-index'), self.editor.getValue()));
      graphicHolder.modal('show');
    };
    compoundLabel = $('[data-schemapath="root.artifacts.compoundComponents.' + i + '"]').find('label:first');
    compoundLabel.append(viewDiagramButton);
  }
};

/**
 * Generate the KGraph for a compound component
 * @param {number} index Index of the compound component in compoundComponents array of manifest.artifacts
 * @param {object} manifest Manifest object contain in the manifest.webpackage file
 * @returns {{id: string, children: Array}} Kgraph to be used to build and display the diagram
 */
CoderDevUI.prototype.generateGraph = function (index, manifest) {
  var graph = {id: 'root', children: []};
  var compoundComponent = manifest.artifacts.compoundComponents[index];
  var rootComponentPorts = [];

  var port;
  for (var i in compoundComponent.slots) {
    for (var j in compoundComponent.slots[i].direction) {
      port = {
        id: compoundComponent.slots[i].slotId + '_' + compoundComponent.slots[i].direction[j],
        properties: {
          portSide: (compoundComponent.slots[i].direction[j] === 'input') ? 'WEST' : 'EAST'
        },
        labels: [{text: compoundComponent.slots[i].slotId}],
        width: 10
        // labels: [{text: compoundComponent.slots[i].slotId +'_' +compoundComponent.slots[i].direction[j]}]
      };
      rootComponentPorts.push(port);
    }
  }

  var childComponentId;
  var memberId;
  var childComponent;
  var childPorts;
  var childPort;
  var component;
  var childComponents = [];
  for (var k in compoundComponent.members) {
    // TODO: this/ and external components
    childPorts = [];
    childComponentId = compoundComponent.members[k].componentId.replace('this/', '');
    memberId = compoundComponent.members[k].memberId;
    component = this.searchComponentIn(childComponentId, manifest.artifacts.elementaryComponents);
    if (!component) {
      component = this.searchComponentIn(childComponentId, manifest.artifacts.compoundComponents);
    }

    var maxPortWidth = 0;
    var portWidth;
    for (var l in component.slots) {
      for (var m in component.slots[l].direction) {
        portWidth = component.slots[l].slotId.length * 5;
        maxPortWidth = Math.max(portWidth, maxPortWidth);
        childPort = {
          id: component.slots[l].slotId + '_' + memberId + '_' + component.slots[l].direction[m],
          properties: {
            portSide: (component.slots[l].direction[m] === 'input') ? 'WEST' : 'EAST'
          },
          labels: [{
            text: component.slots[l].slotId,
            width: portWidth,
            height: 10
          }],
          width: 2
          // labels: [{text: component.slots[l].slotId + '_' + memberId + '_' + component.slots[l].direction[m]}]
        };
        childPorts.push(childPort);
      }
    }

    var titleWidth = component.artifactId.length * 7;
    childComponent = {
      id: memberId,
      labels: [{text: component.artifactId, width: titleWidth, height: 10}],
      width: Math.max(maxPortWidth * 2 + 20, titleWidth),
      height: childPorts.length * 15 + 40,
      ports: childPorts,
      properties: {
        portConstraints: 'FIXED_SIDE',
        portLabelPlacement: 'INSIDE',
        nodeLabelPlacement: 'INSIDE H_CENTER V_TOP',
        portAlignment: 'CENTER',
        portSpacing: 13
      }
    };
    childComponents.push(childComponent);
  }

  var edge;
  var rootEdges = [];
  for (var n in compoundComponent.connections) {
    var source;
    var sourcePort;
    if (compoundComponent.connections[n].source.memberIdRef) {
      source = compoundComponent.connections[n].source.memberIdRef;
      sourcePort = compoundComponent.connections[n].source.slot + '_' + compoundComponent.connections[n].source.memberIdRef + '_' + 'output';
    } else {
      source = compoundComponent.artifactId;
      sourcePort = compoundComponent.connections[n].source.slot + '_' + 'input';
    }
    var target;
    var targetPort;
    if (compoundComponent.connections[n].destination.memberIdRef) {
      target = compoundComponent.connections[n].destination.memberIdRef;
      targetPort = compoundComponent.connections[n].destination.slot + '_' + compoundComponent.connections[n].destination.memberIdRef + '_' + 'input';
    } else {
      target = compoundComponent.artifactId;
      targetPort = compoundComponent.connections[n].destination.slot + '_' + 'output';
    }
    edge = {
      id: compoundComponent.connections[n].connectionId,
      labels: [{
        text: compoundComponent.connections[n].connectionId,
        width: compoundComponent.connections[n].connectionId.length * 5,
        height: 10
      }],
      source: source,
      sourcePort: sourcePort,
      target: target,
      targetPort: targetPort
    };
    rootEdges.push(edge);
  }

  var rootComponent = {
    id: compoundComponent.artifactId,
    labels: [{text: compoundComponent.artifactId, width: 130, height: 20}],
    ports: rootComponentPorts,
    properties: {
      portConstraints: 'FIXED_SIDE',
      portLabelPlacement: 'INSIDE',
      nodeLabelPlacement: 'INSIDE,H_CENTER,V_TOP',
      portAlignment: 'CENTER',
      portSpacing: 13,
      borderSpacing: 40
    },
    children: childComponents
  };

  graph.children.push(rootComponent);
  graph.edges = rootEdges;
  return graph;
};

/**
 * Search a component in a components list using its id
 * @param {string} componentId Id of the component to be searched
 * @param {array} componentsList Array where the component will be seacrhed
 * @returns {*}
 */
CoderDevUI.prototype.searchComponentIn = function (componentId, componentsList) {
  for (var i in componentsList) {
    if (componentsList[i].artifactId === componentId) {
      return componentsList[i];
    }
  }
  return false;
};

/**
 * Build and append all the graphic elements of the diagram described by a Kgraph
 * @param {object} graph JSON Kgraph to be displayed
 */
CoderDevUI.prototype.drawGraph = function (graph) {
// group
  var root = this.svg.append('g');
  var layouter = klay.d3kgraph()
    .size([this.graphicWidth, this.graphicHeight])
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

  var self = this;
  layouter.on('finish', function (d) {
    var nodes = layouter.nodes();
    var links = layouter.links(nodes);

    var nodeData = root.selectAll('.node')
      .data(nodes, function (d) { return d.id; });

    var linkData = root.selectAll('.link')
      .data(links, function (d) { return d.id; });

    self.drawComponents(nodeData);
    self.drawComponentsSlots(nodeData);
    self.drawConnections(linkData);
  });

  layouter.kgraph(graph);
};

/**
 * Draw a square for each component and its id as label
 * @param {Object} componentsData Data of each component (D3)
 */
CoderDevUI.prototype.drawComponents = function (componentsData) {
  var node = componentsData.enter()
    .append('g')
    .attr('class', function (d) {
      if (d.children) {
        return 'node compound';
      } else {
        return 'node leaf';
      }
    });

  var atoms = node.append('rect')
    .attr('class', 'elementary')
    .attr('width', 10)
    .attr('height', 10);

  atoms.transition()
    .attr('width', function (d) { return d.width; })
    .attr('height', function (d) { return d.height; });

  // Apply node positions
  node.transition()
    .attr('transform', function (d) {
      return 'translate(' + (d.x || 0) + ' ' + (d.y || 0) + ')';
    });

  // Nodes labels
  var nodeLabel = node.selectAll('.nodeLabel')
    .data(function (d) {
      return d.labels || [];
    })
    .enter()
    .append('text')
    .text(function (d) {
      return d.text;
    })
    .attr('class', 'nodeLabel');

  nodeLabel.transition()
    .attr('height', function (d) { return d.height; });

  nodeLabel.transition()
    .attr('x', function (d) { return d.x; })
    .attr('y', function (d) { return d.y + d.height; });
};

/**
 * Draw the components' slots and their ids as labels
 * @param {Object} componentsData Data of each component (D3)
 */
CoderDevUI.prototype.drawComponentsSlots = function (componentsData) {
  // ports
  var port = componentsData.selectAll('.port')
    .data(function (d) { return d.ports || []; })
    .enter()
    .append('g')
    .attr('class', 'port');

  port.append('circle')
    .attr('class', 'portAtom');
  port.transition()
    .attr('transform', function (d) {
      return 'translate(' + (d.x || 0) + ' ' + (d.y || 0) + ')';
    });

  // ports labels
  var portLabel = port.selectAll('.portLabel')
    .data(function (d) { return d.labels; })
    .enter()
    .append('text')
    .text(function (d) { return d.text; })
    .attr('class', 'portLabel');
  portLabel.transition()
    .attr('x', function (d) {
      return d.x;
    })
    .attr('y', function (d) { return d.y + 7; });
};

/**
 * Draw the connections and their ids as labels
 * @param {Object} connectionData Data of each connection (D3)
 */
CoderDevUI.prototype.drawConnections = function (connectionData) {
  // build the arrow.
  this.svg.append('svg:defs').selectAll('marker')
    .data(['end'])                 // define link/path types
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

  // Add arrows
  var link = connectionData.enter()
    .append('path')
    .attr('class', 'link')
    .attr('d', 'M0 0')
    .attr('marker-end', 'url(#end)');

  // add edge labels
  var linkLabel = connectionData.enter()
    .append('text')
    .attr('class', 'linkLabel')
    .text(function (d) { return d.labels[0].text || ''; });

  // apply edge routes
  link.transition().attr('d', function (d) {
    var path = '';
    path += 'M' + (d.sourcePoint.x + 3) + ' ' + d.sourcePoint.y + ' ';
    (d.bendPoints || []).forEach(function (bp, i) {
      path += 'L' + bp.x + ' ' + bp.y + ' ';
    });
    path += 'L' + (d.targetPoint.x - 5) + ' ' + d.targetPoint.y + ' ';
    return path;
  });

  linkLabel.transition()
    .attr('x', function (d) { return d.labels[0].x; })
    .attr('y', function (d) { return d.labels[0].y + d.labels[0].height * 2.5; });
};

