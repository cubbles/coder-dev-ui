# cubx-webpackage-viewer
This webpackage contains components to visualize the structure of a (Cubbles) webpackage using its manifest.webpackege config file, the dataflow of compound components and interface of elementary components.

## Docs
The generated documentation for this webpackage and its artifacts is available [here][demoWebPV].

## Artifacts of the webpackage
| Name | Type | Description | Links |
|--------------------------------|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------|---------------------------|
| **cubx-component-viewer** | Elementary component | Viewer of components,  interface for elementary components and dataflow for compound components | [Demo][demoCompV] |
| **cubx-structure-viewer** | Elementary component | Component to visualize the structure of a webpackage using the manifest.webpackage file |  |
| **cubx-component-info-viewer** | Elementary component | Viewer of components information (by the moment only interface details) | [Demo][demoCompInfV] |
| **cubx-webpackage-viewer** | Compound component | Component to visualize the structure of a webpackage and the dataflow of its compound components | [Demo][demoWebPV] |
| **cubx-component-docs-viewer** | Compound component | Component to visualize a component (dataflow of a compound and interface of an elementary) and its interface details | [Demo][demoCompDocsV] |
| **any-webpackage-viewer** | Application | App to visualize the structure of any webpackage using its manifest url. This application uses the {{cubx-webpackage-viewer}} component | [App][anyWPApp] |
| **d3-tip** | Utility | Utility to use the d3-tip library v 0.6.7 | [Lib info][d3TipInfo] |
| **file-saver** | Utility | Utility to use the FileSaver.js library v 1.3.2 | [Lib info][fileSaverInfo] |

## Use of components

The html file should contain the desire component using its tag, in our case the `<cubx-webpackage-viewer>`, as follows:

```html
<cubx-webpackage-viewer cubx-webpackage-id="com.incowia.cubx-webpackage-viewer@1.5.0"></cubx-webpackage-viewer>
```

This component can be optionally initialized using the `<cubx-core-slot-init>` tag (available from _cubx.core.rte_ version 1.9.0). For example, lets initilize the 'manifestURl' slot as follows:

```html
<cubx-webpackage-viewer cubx-webpackage-id="com.incowia.cubx-webpackage-viewer@1.5.0">
        <!--Initilization-->
        <cubx-core-init>
                <cubx-core-slot-init slot="manifestURl">"../../manifest.webpackage"</cubx-core-slot-init>
        </cubx-core-init>
</cubx-webpackage-viewer>
```
Or it can be initialized and later manipulated from Javascript as follows:

```javascript
var webpackageViewer= document.querySelector('cubx-webpackage-viewer');
var manifestUrl = "../../manifest.webpackage";

// Wait until Cif is ready
document.addEventListener('cifReady', function() {
	// Manipulate slots
	webpackageViewer.setManifestUrl(manifestUrl);
});
```

The same process is valid for the other components.

[demoWebPV]: https://cubbles.world/core/com.incowia.cubx-webpackage-viewer@1.5.0/cubx-webpackage-viewer/demo/index.html
[demoCompV]: https://cubbles.world/core/com.incowia.cubx-webpackage-viewer@1.5.0/cubx-component-viewer/demo/index.html
[demoCompInfV]: https://cubbles.world/core/com.incowia.cubx-webpackage-viewer@1.5.0/cubx-component-info-viewer/demo/index.html
[demoCompDocsV]: https://cubbles.world/core/com.incowia.cubx-webpackage-viewer@1.5.0/cubx-component-docs-viewer/demo/index.html
[anyWPApp]: https://cubbles.world/core/com.incowia.cubx-webpackage-viewer@1.5.0/any-webpackage-viewer/index.html
[d3TipInfo]: https://github.com/Caged/d3-tip 
[fileSaverInfo]: https://github.com/eligrey/FileSaver.js/
