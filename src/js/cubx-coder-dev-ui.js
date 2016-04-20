/**
 * Created by ega on 20.04.2016.
 */
var editor;
var initEditor = function () {

  var schema = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "title": "json schema for manifest.webpackage",
    "type": "object",
    "additionalProperties": false,
    "required": [
      "name",
      "groupId",
      "version",
      "modelVersion",
      "docType",
      "author",
      "license",
      "artifacts"
    ],
    "properties": {
      "name": {
        "type": "string",
        "description": "The name of the webpackage.",
        "pattern": "^([a-z][a-z0-9]*)([a-z\\-]*(([0-9])+([0-9\\.]+)*([0-9])+)*)*([a-z0-9]*)$"
      },
      "groupId": {
        "type": "string",
        "description": "Use this to define/select a namespace for the webpackage (e.g. org.example).",
        "pattern": "^([a-z0-9]+||([a-z0-9]+[a-z0-9-][a-z0-9]+)*)(\\.([a-z0-9]+||([a-z0-9]+[a-z0-9-][a-z0-9]+)*))*$"
      },
      "version": {
        "type": "string",
        "description": "Version number of the webpackage.",
        "pattern": "^(\\d+)(\\.[\\d]+)*(-SNAPSHOT)?$"
      },
      "modelVersion": {
        "type": "string",
        "description": "Version of the webpackage specification.",
        "enum": [
          "8.3.0"
        ]
      },
      "docType": {
        "type": "string",
        "description": "Type of this document (must be 'webpackage').",
        "enum": [
          "webpackage"
        ]
      },
      "description": {
        "type": "string",
        "description": "A short description of the webpackage."
      },
      "author": {
        "type": "object",
        "description": "The author of this webpackage.",
        "$ref": "#/definitions/person"
      },
      "contributors": {
        "type": "array",
        "description": "A list of contributors of this webpackage.",
        "minItems": 0,
        "items": {
          "$ref": "#/definitions/person"
        }
      },
      "license": {
        "type": "string",
        "description": "License name. Recommended values see https://spdx.org/licenses/."
      },
      "homepage": {
        "type": "string",
        "description": "The url of the webpackage related website.",
        "pattern": "^(https?):\/\/[^\\s\\/$.?#].[^\\s]*$"
      },
      "keywords": {
        "type": "array",
        "description": "Keywords which support other developers to find this webpackage.",
        "items": {
          "type": "string"
        }
      },
      "man": {
        "description": "1..n urls to external manual(s) related to this webpackage.",
        "oneOf": [
          {
            "type": "string",
            "pattern": "^(https?):\/\/[^\\s\\/$.?#].[^\\s]*$"
          },
          {
            "type": "array",
            "items": {
              "type": "string",
              "pattern": "^(https?):\/\/[^\\s\\/$.?#].[^\\s]*$"
            }
          }
        ]
      },
      "runnables": {
        "type": "array",
        "minItems": 0,
        "additionalItems": false,
        "description": "Resources that are actually runnable in a users webbrowser.",
        "items": {
          "$ref": "#/definitions/runnable"

        }
      },
      "artifacts": {
        "type": "object",
        "description": "Artifacts represent independent parts of a webpackage - with an enclosed responsibility and usable as a dependency of other artifacts.",
        "additionalProperties": false,
        "properties": {
          "apps": {
            "type": "array",
            "minItems": 0,
            "additionalItems": false,
            "description": "refer to 0..n apps within your webpackage",
            "items": {
              "$ref": "#/definitions/appArtifact"
            }
          },
          "compoundComponents": {
            "type": "array",
            "minItems": 0,
            "additionalItems": false,
            "description": "refer to 0..n compounds within your webpackage",
            "items": {
              "$ref": "#/definitions/compoundArtifact"
            }
          },
          "elementaryComponents": {
            "type": "array",
            "minItems": 0,
            "additionalItems": false,
            "description": "refer to 0..n elementaries within your webpackage",
            "items": {
              "$ref": "#/definitions/elementaryArtifact"
            }
          },
          "utilities": {
            "type": "array",
            "minItems": 0,
            "additionalItems": false,
            "description": "refer to 0..n utilities within your webpackage",
            "items": {
              "$ref": "#/definitions/utilArtifact"
            }
          }
        }
      }
    },
    "definitions": {
      "person": {
        "type": "object",
        "required": [
          "name",
          "email"
        ],
        "properties": {
          "name": {
            "type": "string",
            "description": "a persons name",
            "pattern": "^(([A-Za-zäöüÄÖÜ]+[\\-\\']?)*([A-Za-zäöüÄÖÜ]+)?[\\.]?\\s)+([A-Za-zäöüÄÖÜ]+[\\-\\']?)*([A-Za-zäöüÄÖÜ]+)?$"
          },
          "email": {
            "type": "string",
            "description": "email address",
            "pattern": "^([\\w-]+(?:\\.[\\w-]+)*)@((?:[\\w-]+\\.)*\\w[\\w-]{0,66})\\.([a-z]{2,6}(?:\\.[a-z]{2})?)$"
          },
          "url": {
            "type": "string",
            "description": "url of a person (e.g. the personal homepage)",
            "pattern": "^(https?):\/\/[^\\s\\/$.?#].[^\\s]*$"
          }
        }
      },
      "runnable": {
        "type": "object",
        "required": [
          "name",
          "path"
        ],
        "properties": {
          "name": {
            "type": "string",
            "description": "A (short) name for the runnable.",
            "pattern": "^(.)+$"
          },
          "path": {
            "type": "string",
            "description": "Path to the 'runnable' resource - relative to the webpackage itself (e.g. '/doc/index.html').",
            "pattern": "^/(.)+$"
          },
          "description": {
            "type": "string",
            "description": "Short description of the runnable: short content description, target group etc."
          }
        }
      },
      "appArtifact": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "artifactId", "runnables"
        ],
        "properties": {
          "runnables": {
            "type": "array",
            "minItems": 0,
            "additionalItems": false,
            "description": "Resources that are actually runnable in a users webbrowser.",
            "items": {
              "$ref": "#/definitions/runnable"

            }
          },
          "artifactId": {
            "type": "string",
            "description": "a name of this artifact - unique within the webpackage.",
            "pattern": "^[a-z0-9-]+$"
          },
          "description": {
            "type": "string",
            "description": "Description of this artifact: responsibility, usage scenarios."
          },
          "endpoints": {
            "type": "array",
            "minItems": 1,
            "additionalItems": false,
            "description": "1..n endpoints other artifacts can refer to. A 'main' -artifactEndpoint is required.",
            "items": {
              "$ref": "#/definitions/artifactEndpointItem"
            }
          }
        }
      },
      "compoundArtifact": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "artifactId",
          "endpoints",
          "members",
          "connections"
        ],
        "properties": {
          "artifactId": {
            "type": "string",
            "description": "a name of this artifact - unique within the webpackage.",
            "pattern": "^[a-z0-9]+(-[a-z0-9]+)+$"
          },
          "description": {
            "type": "string",
            "description": "Description of this artifact: responsibility, usage scenarios."
          },
          "runnables": {
            "type": "array",
            "minItems": 0,
            "additionalItems": false,
            "description": "Resources that are actually runnable in a users webbrowser.",
            "items": {
              "$ref": "#/definitions/runnable"

            }
          },
          "endpoints": {
            "type": "array",
            "minItems": 1,
            "additionalItems": false,
            "description": "1..n endpoints other artifacts can refer to. A 'main' -artifactEndpoint is required.",
            "items": {
              "$ref": "#/definitions/artifactEndpointItem"
            }
          },
          "slots": {
            "type": "array",
            "minItems": 0,
            "description": "1..n slots to exchange data with other elementaries or compounds.",
            "items": {
              "$ref": "#/definitions/compoundArtifactSlotItem"
            }
          },
          "members": {
            "type": "array",
            "minItems": 0,
            "description": "Referenced components (elementaries or compounds) acting as members of this compound component.",
            "items": {
              "$ref": "#/definitions/compoundArtifactMemberItem"
            },
            "additionalItems": false
          },
          "connections": {
            "type": "array",
            "minItems": 0,
            "description": "List of designed connection between the members and between members and this compound component.",
            "items": {
              "$ref": "#/definitions/compoundArtifactConnectionItem"
            },
            "additionalItems": false
          },
          "inits": {
            "type": [
              "array"
            ],
            "description": "List of slot initializations of the compound and member component(s).",
            "items": {
              "$ref": "#/definitions/compoundArtifactInitItem"
            },
            "additionalItems": false
          }
        }
      },
      "compoundArtifactSlotItem": {
        "type": "object",
        "required": [
          "slotId",
          "type"
        ],
        "properties": {
          "slotId": {
            "type": "string",
            "description": "Identifier for this slot item - unique within this component.",
            "pattern": "^[a-z][a-zA-Z0-9-]+$"
          },
          "type": {
            "type": "string",
            "description": "Data type of the slot."
          },
          "direction": {
            "type": "array",
            "uniqueItems": true,
            "description": "A slot can be public accessible as input-slot (receive data), output-slot (propagate data) or both. If this attribute not exist, is the slot bidirectional",
            "items": {
              "type": "string",
              "enum": [
                "input",
                "output"
              ]
            }
          },
          "description": {
            "type": "string",
            "description": "Description of this slot: responsibility, expected data-structure etc."
          }
        }
      },
      "compoundArtifactMemberItem": {
        "type": "object",
        "required": [
          "memberId",
          "componentId"
        ],
        "additionalProperties": false,
        "properties": {
          "memberId": {
            "type": "string",
            "pattern": "^[a-z][a-zA-Z0-9-]+$",
            "description": "Identifier for this member item - unique within this compound component."
          },
          "componentId": {
            "type": "string",
            "description": "Id of the component for this member item (e.g. 'org.example.my-package@1.0/artifact1')",
            "pattern": "^([a-z0-9]+||([a-z0-9]+[a-z0-9-][a-z0-9]+)*)(\\.([a-z0-9]+||([a-z0-9]+[a-z0-9-][a-z0-9]+)*))*[@](\\d+)(\\.[\\d]+)*(-SNAPSHOT)?||(this)/([a-z0-9-]+)$"
          },
          "displayName": {
            "type": "string",
            "minLength": 1,
            "description": "Display name of the referenced member for design view of the BDE"
          },
          "description": {
            "type": "string",
            "description": "Description of this member: responsibility, usage notes etc."
          }
        }
      },
      "compoundArtifactConnectionItem": {
        "type": "object",
        "additionalProperties": false,
        "description": "Definition of a connection.",
        "required": [
          "connectionId",
          "source",
          "destination"
        ],
        "properties": {
          "connectionId": {
            "type": "string",
            "pattern": "^[a-z][a-zA-Z0-9-:]+$",
            "description": "Identifier for this connection item - unique within this compound component."
          },
          "source": {
            "$ref": "#/definitions/connectionEndpoint"
          },
          "destination": {
            "$ref": "#/definitions/connectionEndpoint"
          },
          "copyValue": {
            "type": "boolean",
            "description": "Indicate to copy or not to copy the payload (inc case the payload is an object). true: make a copy, false: do not make a copy - pass by reference. (default == true)"
          },
          "repeatedValues": {
            "type": "boolean",
            "description": "If repeatedValues is true, the same value consecutively will propagated, otherwise not. The default value is false."
          },
          "hookFunction": {
            "type": "string",
            "description": "A function declaration as a string or a global function name. This function will called, before a connection destination model variable setted."
          },
          "description": {
            "type": "string",
            "description": "A short description of this connection: responsibility etc."
          }
        }
      },
      "connectionEndpoint": {
        "additionalProperties": false,
        "type": "object",
        "description": "Describes a source or target -endpoint of a connection.",
        "required": [
          "slot"
        ],
        "properties": {
          "memberIdRef": {
            "type": "string",
            "pattern": "^[a-zA-Z0-9-]+$",
            "description": "The 'memberId' value of the member item, the slot belongs to. If the memberIdRef property is missed, it will connected with an own slot of the compound component."
          },
          "slot": {
            "type": "string",
            "description": "The name of the slot."
          }
        }
      },
      "compoundArtifactInitItem": {
        "type": "object",
        "required": [
          "slot"
        ],
        "additionalProperties": false,
        "properties": {
          "memberIdRef": {
            "type": "string",
            "pattern": "^[a-zA-Z0-9-]+$",
            "description": "The 'memberId' value of the member item, the slot belongs to. If the property is missed, it refers to an own slot of the compound component."
          },
          "slot": {
            "type": "string",
            "description": "Name of the slot to be initialized."
          },
          "value": {
            "type": [
              "boolean",
              "string",
              "number",
              "object",
              "array",
              "function"
            ],
            "description": "The value to init the slot with."
          },
          "description": {
            "type": "string",
            "description": "A short description of this init item: responsibility etc."
          }
        }
      },
      "elementaryArtifact": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "artifactId",
          "endpoints"
        ],
        "properties": {
          "artifactId": {
            "type": "string",
            "description": "a name of this artifact - unique within the webpackage.",
            "pattern": "^[a-z0-9]+(-[a-z0-9]+)+$"
          },
          "description": {
            "type": "string",
            "description": "Description of this artifact: responsibility, usage scenarios."
          },
          "runnables": {
            "type": "array",
            "minItems": 0,
            "additionalItems": false,
            "description": "Resources that are actually runnable in a users webbrowser.",
            "items": {
              "$ref": "#/definitions/runnable"

            }
          },
          "endpoints": {
            "type": "array",
            "minItems": 1,
            "additionalItems": false,
            "description": "1..n endpoints other artifacts can refer to. A 'main' -artifactEndpoint is required.",
            "items": {
              "$ref": "#/definitions/artifactEndpointItem"
            }
          },
          "slots": {
            "type": "array",
            "additionalProperties": false,
            "description": "1..n slots to exchange data with other elementaries or compounds.",
            "items": {
              "$ref": "#/definitions/elementaryArtifactSlotItem"
            }
          }
        }
      },
      "elementaryArtifactSlotItem": {
        "type": "object",
        "required": [
          "slotId",
          "type"
        ],
        "properties": {
          "slotId": {
            "type": "string",
            "description": "Identifier for this slot item - unique within this component.",
            "pattern": "^[a-z][a-zA-Z0-9-]+$"
          },
          "type": {
            "enum": [
              "boolean",
              "string",
              "number",
              "object",
              "array",
              "function"
            ],
            "description": "Data type of the slot."
          },
          "direction": {
            "type": "array",
            "uniqueItems": true,
            "description": "A slot can be public accessible as input-slot (receive data), output-slot (propagate data) or both. If this attribute does not exist, the slot is bidirectional",
            "items": {
              "enum": [
                "input",
                "output"
              ]
            }
          },
          "value": {
            "type":
              [
                "boolean",
                "string",
                "number",
                "object",
                "array",
                "function"
              ],
            "description": "Default value for the slot."
          },
          "description": {
            "type": "string",
            "description": "description of this slot: responsibility, expected data-structure etc."
          }
        }
      },
      "utilArtifact": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "artifactId",
          "endpoints"
        ],
        "properties": {
          "artifactId": {
            "type": "string",
            "description": "a name of this artifact - unique within the webpackage.",
            "pattern": "^[a-z0-9-]+$"
          },
          "runnables": {
            "type": "array",
            "minItems": 0,
            "additionalItems": false,
            "description": "Resources that are actually runnable in a users webbrowser.",
            "items": {
              "$ref": "#/definitions/runnable"

            }
          },
          "description": {
            "type": "string",
            "description": "Description of this artifact: responsibility, usage scenarios."
          },
          "endpoints": {
            "type": "array",
            "minItems": 1,
            "additionalItems": false,
            "description": "1..n endpoints other artifacts can refer to. A 'main' -artifactEndpoint is required.",
            "items": {
              "$ref": "#/definitions/artifactEndpointItem"
            }
          }
        }
      },
      "artifactEndpointItem": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "endpointId",
          "resources"
        ],
        "properties": {
          "endpointId": {
            "type": "string",
            "description": "Identifier for this slot item - unique within this component.",
            "pattern": "^[a-z0-9-]+$"
          },
          "description": {
            "type": "string",
            "description": "Description of this endpoint: What does the endpoint provide? When to use? etc."
          },
          "resources": {
            "description": "Contains the first-level resources of this endpoint.",
            "type": "array",
            "items": {
              "$ref": "#/definitions/resourceItem"
            },
            "additionalItems": false
          },
          "dependencies": {
            "description": "0..n other artifacts-endpoints this artifact-endpoint needs to work properly. Note: 'webpackage': 'this' refers artifact(s) of the this webpackage.",
            "type": "array",
            "additionalItems": false,
            "items": {
              "type": "string",
              "pattern": "^[a-z0-9-@\\.]+(-SNAPSHOT)?\\/[a-z0-9-]+\\/[a-z0-9-]+$"
            }
          }
        }
      },
      "resourceItem": {
        "type": [
          "string",
          "object"
        ],
        "anyOf": [
          {
            "$ref": "#/definitions/resourceObject"
          },
          {
            "$ref": "#/definitions/resourceString"
          }
        ]
      },
      "resourceObject": {
        "additionalProperties": false,
        "type": "object",
        "required": [
          "prod",
          "dev"
        ],
        "description": "Resource definition, separated for runtimeMode \"prod\" and \"dev\".",
        "properties": {
          "prod": {
            "type": "string",
            "description": "Path to potentially optimized resource."
          },
          "dev": {
            "type": "string",
            "description": "Path to resource for development."
          }
        }
      },
      "resourceString": {
        "type": "string",
        "description": "Path to resource. This resource will be used for both runtimeMode \"prod\" and \"dev\"."
      }
    }
  };
  for(var prop in schema.properties.artifacts.properties){
    schema.properties.artifacts.properties[prop].format = 'tabs';
  }

  var artifactsCommonProps = ['runnables', 'endpoints'];
  for(var i in artifactsCommonProps){
    schema.definitions.appArtifact.properties[artifactsCommonProps[i]].format = 'tabs';
    schema.definitions.elementaryArtifact.properties[artifactsCommonProps[i]].format = 'tabs';
    schema.definitions.compoundArtifact.properties[artifactsCommonProps[i]].format = 'tabs';
  }

  schema.definitions.elementaryArtifact.properties.slots.format = 'tabs';
  schema.definitions.compoundArtifact.properties.slots.format = 'tabs';
  schema.definitions.compoundArtifact.properties.members.format = 'table';
  schema.definitions.compoundArtifact.properties.connections.format = 'tabs';
  schema.definitions.compoundArtifact.properties.inits.format = 'table';

  schema.format = 'grid';

  JSONEditor.defaults.editors.array.options.collapsed = true;
  JSONEditor.defaults.editors.table.options.collapsed = true;

  var starting_value = {
    "name": "basic-html-components",
    "groupId": "com.incowia",
    "version": "0.1.0-SNAPSHOT",
    "modelVersion": "8.3.0",
    "docType": "webpackage",
    "author": {
      "name": "Edwin Gamboa",
      "email": "edwin.gamboa@incowia.com"
    },
    "license": "MIT",
    "keywords": [],
    "man": [],
    "artifacts": {
      "apps": [],
      "elementaryComponents": [
        {
          "artifactId": "cubx-input",
          "description": "Customizable html input ",
          "runnables": [
            {
              "name": "demo",
              "path": "/demo/index.html",
              "description": "cubx-input demo"
            }
          ],
          "endpoints": [
            {
              "endpointId": "main",
              "description": "This is recommended for you use with webcomponents.",
              "resources": [
                "cubx-input.html"
              ],
              "dependencies": [
                "cubx.core.rte@1.8.0-SNAPSHOT/cubxpolymer/main"
              ]
            }
          ],
          "slots": [
            {
              "slotId": "id",
              "type": "string",
              "direction": [
                "input"
              ],
              "value": "inputId"
            },
            {
              "slotId": "type",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "name",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "required",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "readonly",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "disabled",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "label",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "value",
              "type": "string",
              "direction": [
                "input",
                "output"
              ]
            },
            {
              "slotId": "placeholder",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "min",
              "type": "number",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "max",
              "type": "number",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "step",
              "type": "number",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "checked",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "accept",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "alt",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "height",
              "type": "number",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "width",
              "type": "number",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "src",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "rightText",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "tabindex",
              "type": "number",
              "direction": [
                "input"
              ]
            }
          ]
        },
        {
          "artifactId": "cubx-select",
          "description": "Select html component",
          "runnables": [
            {
              "name": "demo",
              "path": "/demo/index.html",
              "description": "Demo app..."
            }
          ],
          "endpoints": [
            {
              "endpointId": "main",
              "description": "This is recommended for you use with webcomponents.",
              "resources": [
                "cubx-select.html"
              ],
              "dependencies": [
                "cubx.core.rte@1.8.0-SNAPSHOT/cubxpolymer/main"
              ]
            }
          ],
          "slots": [
            {
              "slotId": "id",
              "type": "string",
              "direction": [
                "input"
              ],
              "value": "selectId"
            },
            {
              "slotId": "value",
              "type": "string",
              "direction": [
                "input",
                "output"
              ]
            },
            {
              "slotId": "name",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "required",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "disabled",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "label",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "size",
              "type": "number",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "options",
              "type": "object",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "tabindex",
              "type": "number",
              "direction": [
                "input"
              ]
            }
          ]
        },
        {
          "artifactId": "cubx-textarea",
          "description": "Textarea component",
          "runnables": [
            {
              "name": "demo",
              "path": "/demo/index.html",
              "description": "Demo app..."
            }
          ],
          "endpoints": [
            {
              "endpointId": "main",
              "description": "This is recommended for you use with webcomponents.",
              "resources": [
                "cubx-textarea.html"
              ],
              "dependencies": [
                "cubx.core.rte@1.8.0-SNAPSHOT/cubxpolymer/main"
              ]
            }
          ],
          "slots": [
            {
              "slotId": "id",
              "type": "string",
              "direction": [
                "input"
              ],
              "value": "textareaId"
            },
            {
              "slotId": "value",
              "type": "string",
              "direction": [
                "input",
                "output"
              ]
            },
            {
              "slotId": "required",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "readonly",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "disabled",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "name",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "label",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "cols",
              "type": "number",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "rows",
              "type": "number",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "maxLength",
              "type": "number",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "minLength",
              "type": "number",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "tabindex",
              "type": "number",
              "direction": [
                "input"
              ]
            }
          ]
        },
        {
          "artifactId": "cubx-button",
          "description": "Button component",
          "runnables": [
            {
              "name": "demo",
              "path": "/demo/index.html",
              "description": "Demo app..."
            }
          ],
          "endpoints": [
            {
              "endpointId": "main",
              "description": "This is recommended for you use with webcomponents.",
              "resources": [
                "cubx-button.html"
              ],
              "dependencies": [
                "cubx.core.rte@1.8.0-SNAPSHOT/cubxpolymer/main"
              ]
            }
          ],
          "slots": [
            {
              "slotId": "id",
              "type": "string",
              "direction": [
                "input"
              ],
              "value": "buttonId"
            },
            {
              "slotId": "name",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "disabled",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "onclick",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "type",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "value",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "text",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "tabindex",
              "type": "number",
              "direction": [
                "input"
              ]
            }
          ]
        },
        {
          "artifactId": "cubx-p",
          "description": "P component (<p> from HTML)",
          "runnables": [
            {
              "name": "demo",
              "path": "/demo/index.html",
              "description": "Demo app..."
            }
          ],
          "endpoints": [
            {
              "endpointId": "main",
              "description": "This is recommended for you use with webcomponents.",
              "resources": [
                "cubx-p.html"
              ],
              "dependencies": [
                "cubx.core.rte@1.8.0-SNAPSHOT/cubxpolymer/main"
              ]
            }
          ],
          "slots": [
            {
              "slotId": "text",
              "type": "string",
              "direction": [
                "input"
              ]
            }
          ]
        },
        {
          "artifactId": "cubx-ol",
          "description": "ol component (<ol> from HTML)",
          "runnables": [
            {
              "name": "demo",
              "path": "/demo/index.html",
              "description": "Demo app..."
            }
          ],
          "endpoints": [
            {
              "endpointId": "main",
              "description": "This is recommended for you use with webcomponents.",
              "resources": [
                "cubx-ol.html"
              ],
              "dependencies": [
                "cubx.core.rte@1.8.0-SNAPSHOT/cubxpolymer/main"
              ]
            }
          ],
          "slots": [
            {
              "slotId": "list",
              "type": "object",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "type",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "start",
              "type": "number",
              "direction": [
                "input"
              ]
            }
          ]
        },
        {
          "artifactId": "cubx-ul",
          "description": "ul component (<ul> from html)",
          "runnables": [
            {
              "name": "demo",
              "path": "/demo/index.html",
              "description": "Demo app..."
            }
          ],
          "endpoints": [
            {
              "endpointId": "main",
              "description": "This is recommended for you use with webcomponents.",
              "resources": [
                "cubx-ul.html"
              ],
              "dependencies": [
                "cubx.core.rte@1.8.0-SNAPSHOT/cubxpolymer/main"
              ]
            }
          ],
          "slots": [
            {
              "slotId": "list",
              "type": "object",
              "direction": [
                "input"
              ]
            }
          ]
        },
        {
          "artifactId": "cubx-img",
          "description": "img component (<img> from HTML)",
          "runnables": [
            {
              "name": "demo",
              "path": "/demo/index.html",
              "description": "Demo app..."
            }
          ],
          "endpoints": [
            {
              "endpointId": "main",
              "description": "This is recommended for you use with webcomponents.",
              "resources": [
                "cubx-img.html"
              ],
              "dependencies": [
                "cubx.core.rte@1.8.0-SNAPSHOT/cubxpolymer/main"
              ]
            }
          ],
          "slots": [
            {
              "slotId": "alt",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "height",
              "type": "number",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "width",
              "type": "number",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "src",
              "type": "string",
              "direction": [
                "input"
              ]
            }
          ]
        }
      ],
      "compoundComponents": [
        {
          "artifactId": "cubx-text-input",
          "description": "Text input component",
          "runnables": [
            {
              "name": "demo",
              "path": "/demo/index.html",
              "description": "Demo app..."
            }
          ],
          "endpoints": [
            {
              "endpointId": "main",
              "resources": [
                "css/cubx-text-input.css"
              ],
              "dependencies": [
                "this/cubx-input/main"
              ]
            }
          ],
          "slots": [
            {
              "slotId": "id",
              "type": "string",
              "direction": [
                "input"
              ],
              "value": "inputId"
            },
            {
              "slotId": "name",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "required",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "readonly",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "disabled",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "placeholder",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "label",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "value",
              "type": "string",
              "direction": [
                "input",
                "output"
              ]
            },
            {
              "slotId": "tabindex",
              "type": "number",
              "direction": [
                "input"
              ]
            }
          ],
          "members": [
            {
              "memberId": "input1",
              "componentId": "this/cubx-input"
            }
          ],
          "connections": [
            {
              "connectionId": "con1",
              "source": {
                "slot": "placeholder"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "placeholder"
              }
            },
            {
              "connectionId": "con2",
              "source": {
                "slot": "label"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "label"
              }
            },
            {
              "connectionId": "con3",
              "source": {
                "slot": "id"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "id"
              }
            },
            {
              "connectionId": "con4",
              "source": {
                "slot": "value"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "value"
              },
              "repeatedValues": true
            },
            {
              "connectionId": "con4-1",
              "source": {
                "memberIdRef": "input1",
                "slot": "value"
              },
              "destination": {
                "slot": "value"
              }
            },
            {
              "connectionId": "con8",
              "source": {
                "slot": "name"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "name"
              }
            },
            {
              "connectionId": "con9",
              "source": {
                "slot": "required"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "required"
              }
            },
            {
              "connectionId": "con10",
              "source": {
                "slot": "readonly"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "readonly"
              }
            },
            {
              "connectionId": "con11",
              "source": {
                "slot": "disabled"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "disabled"
              }
            },
            {
              "connectionId": "con12",
              "source": {
                "slot": "tabindex"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "tabindex"
              }
            }
          ],
          "inits": [
            {
              "slot": "type",
              "value": "text",
              "memberIdRef": "input1"
            }
          ]
        },
        {
          "artifactId": "cubx-number-input",
          "description": "Number input component",
          "runnables": [
            {
              "name": "demo",
              "path": "/demo/index.html",
              "description": "Demo app..."
            }
          ],
          "endpoints": [
            {
              "endpointId": "main",
              "resources": [
                "css/cubx-number-input.css"
              ],
              "dependencies": [
                "this/cubx-input/main"
              ]
            }
          ],
          "slots": [
            {
              "slotId": "id",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "required",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "name",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "readonly",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "disabled",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "subtype",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "min",
              "type": "number",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "max",
              "type": "number",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "step",
              "type": "number",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "label",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "value",
              "type": "string",
              "direction": [
                "input",
                "output"
              ]
            },
            {
              "slotId": "tabindex",
              "type": "number",
              "direction": [
                "input"
              ]
            }
          ],
          "members": [
            {
              "memberId": "input1",
              "componentId": "this/cubx-input"
            }
          ],
          "connections": [
            {
              "connectionId": "con1",
              "source": {
                "slot": "subtype"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "type"
              }
            },
            {
              "connectionId": "con2",
              "source": {
                "slot": "min"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "min"
              }
            },
            {
              "connectionId": "con3",
              "source": {
                "slot": "max"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "max"
              }
            },
            {
              "connectionId": "con4",
              "source": {
                "slot": "step"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "step"
              }
            },
            {
              "connectionId": "con5",
              "source": {
                "slot": "label"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "label"
              }
            },
            {
              "connectionId": "con6",
              "source": {
                "slot": "id"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "id"
              }
            },
            {
              "connectionId": "con7",
              "source": {
                "slot": "value"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "value"
              }
            },
            {
              "connectionId": "con7-1",
              "source": {
                "memberIdRef": "input1",
                "slot": "value"
              },
              "destination": {
                "slot": "value"
              }
            },
            {
              "connectionId": "con8",
              "source": {
                "slot": "name"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "name"
              }
            },
            {
              "connectionId": "con9",
              "source": {
                "slot": "required"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "required"
              }
            },
            {
              "connectionId": "con10",
              "source": {
                "slot": "readonly"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "readonly"
              }
            },
            {
              "connectionId": "con11",
              "source": {
                "slot": "disabled"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "disabled"
              }
            },
            {
              "connectionId": "con12",
              "source": {
                "slot": "tabindex"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "tabindex"
              }
            }
          ],
          "inits": [
            {
              "slot": "type",
              "value": "number",
              "memberIdRef": "input1"
            }
          ]
        },
        {
          "artifactId": "cubx-checkbox",
          "description": "Checkbox input component",
          "runnables": [
            {
              "name": "demo",
              "path": "/demo/index.html",
              "description": "Demo app..."
            }
          ],
          "endpoints": [
            {
              "endpointId": "main",
              "resources": [
                "css/cubx-checkbox.css"
              ],
              "dependencies": [
                "this/cubx-input/main"
              ]
            }
          ],
          "slots": [
            {
              "slotId": "id",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "required",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "readonly",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "disabled",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "name",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "checked",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "rightText",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "label",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "value",
              "type": "string",
              "direction": [
                "input",
                "output"
              ]
            },
            {
              "slotId": "tabindex",
              "type": "number",
              "direction": [
                "input"
              ]
            }
          ],
          "members": [
            {
              "memberId": "input1",
              "componentId": "this/cubx-input"
            }
          ],
          "connections": [
            {
              "connectionId": "con1",
              "source": {
                "slot": "checked"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "checked"
              }
            },
            {
              "connectionId": "con3",
              "source": {
                "slot": "rightText"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "rightText"
              }
            },
            {
              "connectionId": "con4",
              "source": {
                "slot": "label"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "label"
              }
            },
            {
              "connectionId": "con5",
              "source": {
                "slot": "id"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "id"
              }
            },
            {
              "connectionId": "con6",
              "source": {
                "slot": "value"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "value"
              }
            },
            {
              "connectionId": "con6-1",
              "source": {
                "memberIdRef": "input1",
                "slot": "value"
              },
              "destination": {
                "slot": "value"
              }
            },
            {
              "connectionId": "con7",
              "source": {
                "slot": "name"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "name"
              }
            },
            {
              "connectionId": "con8",
              "source": {
                "slot": "required"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "required"
              }
            },
            {
              "connectionId": "con9",
              "source": {
                "slot": "readonly"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "readonly"
              }
            },
            {
              "connectionId": "con10",
              "source": {
                "slot": "disabled"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "disabled"
              }
            },
            {
              "connectionId": "con11",
              "source": {
                "slot": "tabindex"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "tabindex"
              }
            }
          ],
          "inits": [
            {
              "slot": "type",
              "value": "checkbox",
              "memberIdRef": "input1"
            }
          ]
        },
        {
          "artifactId": "cubx-radio-button",
          "description": "Radio button input component",
          "runnables": [
            {
              "name": "demo",
              "path": "/demo/index.html",
              "description": "Demo app..."
            }
          ],
          "endpoints": [
            {
              "endpointId": "main",
              "resources": [
                "css/cubx-radio-button.css"
              ],
              "dependencies": [
                "this/cubx-input/main"
              ]
            }
          ],
          "slots": [
            {
              "slotId": "id",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "required",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "readonly",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "disabled",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "name",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "checked",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "rightText",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "label",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "value",
              "type": "string",
              "direction": [
                "input",
                "output"
              ]
            },
            {
              "slotId": "tabindex",
              "type": "number",
              "direction": [
                "input"
              ]
            }
          ],
          "members": [
            {
              "memberId": "input1",
              "componentId": "this/cubx-input"
            }
          ],
          "connections": [
            {
              "connectionId": "con1",
              "source": {
                "slot": "checked"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "checked"
              }
            },
            {
              "connectionId": "con2",
              "source": {
                "slot": "name"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "name"
              }
            },
            {
              "connectionId": "con3",
              "source": {
                "slot": "rightText"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "rightText"
              }
            },
            {
              "connectionId": "con4",
              "source": {
                "slot": "label"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "label"
              }
            },
            {
              "connectionId": "con5",
              "source": {
                "slot": "id"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "id"
              }
            },
            {
              "connectionId": "con6",
              "source": {
                "slot": "value"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "value"
              }
            },
            {
              "connectionId": "con6-1",
              "source": {
                "slot": "value",
                "memberIdRef": "input1"
              },
              "destination": {
                "slot": "value"
              }
            },
            {
              "connectionId": "con8",
              "source": {
                "slot": "required"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "required"
              }
            },
            {
              "connectionId": "con9",
              "source": {
                "slot": "readonly"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "readonly"
              }
            },
            {
              "connectionId": "con10",
              "source": {
                "slot": "disabled"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "disabled"
              }
            },
            {
              "connectionId": "con11",
              "source": {
                "slot": "tabindex"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "tabindex"
              }
            }
          ],
          "inits": [
            {
              "slot": "type",
              "value": "radio",
              "memberIdRef": "input1"
            }
          ]
        },
        {
          "artifactId": "cubx-date-input",
          "description": "Date input component",
          "runnables": [
            {
              "name": "demo",
              "path": "/demo/index.html",
              "description": "Demo app..."
            }
          ],
          "endpoints": [
            {
              "endpointId": "main",
              "resources": [
                "css/cubx-date-input.css"
              ],
              "dependencies": [
                "this/cubx-input/main"
              ]
            }
          ],
          "slots": [
            {
              "slotId": "id",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "name",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "required",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "readonly",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "disabled",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "label",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "value",
              "type": "string",
              "direction": [
                "input",
                "output"
              ]
            },
            {
              "slotId": "tabindex",
              "type": "number",
              "direction": [
                "input"
              ]
            }
          ],
          "members": [
            {
              "memberId": "input1",
              "componentId": "this/cubx-input"
            }
          ],
          "connections": [
            {
              "connectionId": "con1",
              "source": {
                "slot": "label"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "label"
              }
            },
            {
              "connectionId": "con2",
              "source": {
                "slot": "id"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "id"
              }
            },
            {
              "connectionId": "con3",
              "source": {
                "slot": "value"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "value"
              }
            },
            {
              "connectionId": "con3-1",
              "source": {
                "memberIdRef": "input1",
                "slot": "value"
              },
              "destination": {
                "slot": "value"
              }
            },
            {
              "connectionId": "con4",
              "source": {
                "slot": "name"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "name"
              }
            },
            {
              "connectionId": "con5",
              "source": {
                "slot": "required"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "required"
              }
            },
            {
              "connectionId": "con6",
              "source": {
                "slot": "readonly"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "readonly"
              }
            },
            {
              "connectionId": "con7",
              "source": {
                "slot": "disabled"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "disabled"
              }
            },
            {
              "connectionId": "con8",
              "source": {
                "slot": "tabindex"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "tabindex"
              }
            }
          ],
          "inits": [
            {
              "slot": "type",
              "value": "date",
              "memberIdRef": "input1"
            }
          ]
        },
        {
          "artifactId": "cubx-file-input",
          "description": "File input component",
          "runnables": [
            {
              "name": "demo",
              "path": "/demo/index.html",
              "description": "Demo app..."
            }
          ],
          "endpoints": [
            {
              "endpointId": "main",
              "resources": [
                "css/cubx-file-input.css"
              ],
              "dependencies": [
                "this/cubx-input/main"
              ]
            }
          ],
          "slots": [
            {
              "slotId": "id",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "name",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "required",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "readonly",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "disabled",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "accept",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "label",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "value",
              "type": "string",
              "direction": [
                "input",
                "output"
              ]
            },
            {
              "slotId": "tabindex",
              "type": "number",
              "direction": [
                "input"
              ]
            }
          ],
          "members": [
            {
              "memberId": "input1",
              "componentId": "this/cubx-input"
            }
          ],
          "connections": [
            {
              "connectionId": "con1",
              "source": {
                "slot": "accept"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "accept"
              }
            },
            {
              "connectionId": "con2",
              "source": {
                "slot": "label"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "label"
              }
            },
            {
              "connectionId": "con3",
              "source": {
                "slot": "id"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "id"
              }
            },
            {
              "connectionId": "con4",
              "source": {
                "slot": "value"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "value"
              }
            },
            {
              "connectionId": "con4-1",
              "source": {
                "memberIdRef": "input1",
                "slot": "value"
              },
              "destination": {
                "slot": "value"
              }
            },
            {
              "connectionId": "con5",
              "source": {
                "slot": "name"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "name"
              }
            },
            {
              "connectionId": "con6",
              "source": {
                "slot": "required"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "required"
              }
            },
            {
              "connectionId": "con7",
              "source": {
                "slot": "readonly"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "readonly"
              }
            },
            {
              "connectionId": "con8",
              "source": {
                "slot": "disabled"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "disabled"
              }
            },
            {
              "connectionId": "con9",
              "source": {
                "slot": "tabindex"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "tabindex"
              }
            }
          ],
          "inits": [
            {
              "slot": "type",
              "value": "file",
              "memberIdRef": "input1"
            }
          ]
        },
        {
          "artifactId": "cubx-image-input",
          "description": "Image input component",
          "runnables": [
            {
              "name": "demo",
              "path": "/demo/index.html",
              "description": "Demo app..."
            }
          ],
          "endpoints": [
            {
              "endpointId": "main",
              "resources": [
                "css/cubx-image-input.css"
              ],
              "dependencies": [
                "this/cubx-input/main"
              ]
            }
          ],
          "slots": [
            {
              "slotId": "id",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "name",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "required",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "readonly",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "disabled",
              "type": "boolean",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "alt",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "height",
              "type": "number",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "width",
              "type": "number",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "src",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "label",
              "type": "string",
              "direction": [
                "input"
              ]
            },
            {
              "slotId": "value",
              "type": "string",
              "direction": [
                "input",
                "output"
              ]
            },
            {
              "slotId": "tabindex",
              "type": "number",
              "direction": [
                "input"
              ]
            }
          ],
          "members": [
            {
              "memberId": "input1",
              "componentId": "this/cubx-input"
            }
          ],
          "connections": [
            {
              "connectionId": "con1",
              "source": {
                "slot": "alt"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "alt"
              }
            },
            {
              "connectionId": "con2",
              "source": {
                "slot": "height"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "height"
              }
            },
            {
              "connectionId": "con3",
              "source": {
                "slot": "width"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "width"
              }
            },
            {
              "connectionId": "con4",
              "source": {
                "slot": "src"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "src"
              }
            },
            {
              "connectionId": "con5",
              "source": {
                "slot": "label"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "label"
              }
            },
            {
              "connectionId": "con6",
              "source": {
                "slot": "id"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "id"
              }
            },
            {
              "connectionId": "con7",
              "source": {
                "slot": "value"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "value"
              }
            },
            {
              "connectionId": "con7-1",
              "source": {
                "memberIdRef": "input1",
                "slot": "value"
              },
              "destination": {
                "slot": "value"
              }
            },
            {
              "connectionId": "con8",
              "source": {
                "slot": "name"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "name"
              }
            },
            {
              "connectionId": "con9",
              "source": {
                "slot": "required"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "required"
              }
            },
            {
              "connectionId": "con10",
              "source": {
                "slot": "readonly"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "readonly"
              }
            },
            {
              "connectionId": "con11",
              "source": {
                "slot": "disabled"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "disabled"
              }
            },
            {
              "connectionId": "con12",
              "source": {
                "slot": "tabindex"
              },
              "destination": {
                "memberIdRef": "input1",
                "slot": "tabindex"
              }
            }
          ],
          "inits": [
            {
              "slot": "type",
              "value": "image",
              "memberIdRef": "input1"
            }
          ]
        }
      ],
      "utilities": []
    }
  };
  editor = new JSONEditor(document.getElementById('editor_holder'), {
    theme: 'bootstrap3',
    iconlib: 'bootstrap3',
    disable_array_add: true,
    disable_array_delete: true,
    disable_array_reorder: true,
    no_additional_properties: true,
    disable_edit_json: true,
    disable_properties: true,
    schema: schema,
    startval: starting_value
  });
  //editor.disable();
};