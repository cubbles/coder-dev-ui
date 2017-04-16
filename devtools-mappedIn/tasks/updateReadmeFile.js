/* global module,require */
'use strict';
var inquirer = require('inquirer');
var path = require('path');

module.exports = function (grunt) {
  grunt.registerTask('updateReadmeFile', 'Update the README.md file according to the current manifest',
    function () {
      var manifest = grunt.file.readJSON(grunt.config.get('manifestWebpackagePath'));
      var _writeFile = function (answers) {
        var webpackagePath = grunt.config.get('param.src');
        var readmeFilePath = path.join(webpackagePath, 'README.md');
        var artifactTypes = {
          elementaryComponents: 'Elementary Component',
          compoundComponents: 'Compound Component',
          apps: 'Application',
          utilities: 'Utilities'
        };
        var lines = [
          '## ' + manifest.name,
          answers.description,
          '### Artifacts of the webpackage',
          '| Name | Type | Description | Links |',
          '|---|---|---|---|'
        ];
        for (var artifactType in manifest.artifacts) {
          for (var i = 0; i < manifest.artifacts[artifactType].length; i++) {
            var artifact = manifest.artifacts[artifactType][i];
            var url = 'https://cubbles.world/' + answers.base + '/' + manifest.name + '@' +
              manifest.version + '/' + artifact.artifactId;
            var line = '| **' + artifact.artifactId + '** | ' + artifactTypes[artifactType] +
              ' | ' + (artifact.description || ' ') + ' | ';
            if (artifact.runnables) {
              for (var j = 0; j < artifact.runnables.length; j++) {
                var runnable = artifact.runnables[j];
                line += '[' + runnable.name + '](' + url + runnable.path + ') ';
              }
            }
            line += ' |';
            lines.push(line);
          }
        }
        lines = lines.concat([
          '### Use of components',
          'The html file should contain the desire component using its tag, e.g. the `<' + answers.sampleComponent + '>`, as follows:',
          '```html\n<' + answers.sampleComponent + ' cubx-webpackage-id="' + manifest.name + '@' + manifest.version + '"></' + answers.sampleComponent + '>\n```',
          'Note that the `webpackageId` should be provided, which in this case is: `' + manifest.name + '@' + manifest.version + '`.',
          'Additionally, this component can be initialized using the `<cubx-core-slot-init>` tag (available from _cubx.core.rte@1.9.0_).',
          'For example, lets initialize the `' + answers.sampleSlot + '` slot to get the basic package of ckeditor:',
          '```html\n<' + answers.sampleComponent + ' cubx-webpackage-id="' + manifest.name + '@' + manifest.version + '"></' + answers.sampleComponent + '>',
          '\t<!--Initilization-->\n\t<cubx-core-init style="display:none">\n\t\t<cubx-core-slot-init slot="' + answers.sampleSlot + '">' + answers.sampleSlotValue + '</cubx-core-slot-init>',
          '\t</cubx-core-init>\n</' + answers.sampleComponent + '>\n```',
          'Or it can be initialized and later manipulated from Javascript as follows:',
          '```javascript\nvar component= document.querySelector(\'' + answers.sampleComponent + '\');',
          '// Wait until CIF is ready\ndocument.addEventListener(\'cifReady\', function() {',
          '\t// Manipulate slots\n\tcomponent.set' + answers.sampleSlot.substr(0, 1).toUpperCase() + answers.sampleSlot.substr(1) + '(' + answers.sampleSlotValue + ');',
          '});\n```\n[Want to get to know the Cubbles Platform?](https://cubbles.github.io)'
        ]);

        var content = lines.join('\n');
        if (grunt.file.exists(readmeFilePath)) {
          grunt.file.delete(readmeFilePath, {force: true});
        }
        grunt.file.write(readmeFilePath, content);
      };

      var components = [];
      if (manifest.artifacts && manifest.artifacts.elementaryComponents) {
        for (var i = 0; i < manifest.artifacts.elementaryComponents.length; i++) {
          components.push(manifest.artifacts.elementaryComponents[i].artifactId);
        }
      }
      if (manifest.artifacts && manifest.artifacts.compoundComponents) {
        for (var j = 0; j < manifest.artifacts.compoundComponents.length; j++) {
          components.push(manifest.artifacts.compoundComponents[j].artifactId);
        }
      }
      var questions = [
        {
          name: 'base',
          type: 'rawlist',
          message: 'Choose the name of the base or store where the webpackage will be available',
          choices: ['sandbox', 'shared', 'core', 'incowia']
        },
        {
          name: 'description',
          type: 'input',
          message: 'Provide a short description of the webpackage',
          default: 'This is a webpackage that contains Cubbles components.'
        },
        {
          name: 'sampleComponent',
          type: 'rawlist',
          message: 'Provide the artifactId of the component to be use as example.',
          choices: components
        },
        {
          name: 'sampleSlot',
          type: 'input',
          message: 'Provide the name of the slot to be use as example.'
        },
        {
          name: 'sampleSlotValue',
          type: 'input',
          message: 'Provide the value of the slot to be use as example.'
        }
      ];

      var done = this.async();
      inquirer.prompt(questions).then(function (answers) {
        _writeFile(answers);
        done();
      });
    }
    );
};
