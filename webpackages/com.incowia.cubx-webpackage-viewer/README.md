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
| **any-webpackage-viewer** | Application | App to visualize the structure of any webpackage using its manifest url. This application uses the `cubx-webpackage-viewer` component | [App][anyWPApp] |
| **any-component-docs-viewer** | Application | App to visualize the generated docs of any component using its manifest url and artifact id. This application uses the `cubx-component-docs-viewer` component | [App][anyCDApp] |
| **d3-tip** | Utility | Utility to use the d3-tip library v 0.6.7 | [Lib info][d3TipInfo] |
| **file-saver** | Utility | Utility to use the FileSaver.js library v 1.3.2 | [Lib info][fileSaverInfo] |

## Use of components

The html file should contain the desire component using its tag, in our case the `<cubx-webpackage-viewer>`, as follows:

```html
<cubx-webpackage-viewer cubx-webpackage-id="com.incowia.cubx-webpackage-viewer@1.6.0"></cubx-webpackage-viewer>
```

This component can be optionally initialized using the `<cubx-core-slot-init>` tag (available from _cubx.core.rte_ version 1.9.0). For example, lets initilize the 'manifestURl' slot as follows:

```html
<cubx-webpackage-viewer cubx-webpackage-id="com.incowia.cubx-webpackage-viewer@1.6.0">
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

## Use of the any-webpackage-viewer app
The `any-webpackage-viewer` app allows you to visualize the documentation of any webpackage by providing its manifest url. The app offers two options for providing this url:

 1. **Using the input field:** when you load the app you will find an input field and a *Load* button. So, you should type or copy and paste the manifest url of the desired webpackage and then click on `Load`.
 2. **Using the url parameter:** you can also provide the manifest url as parameter in the url of the application. The parameter is called `manifest-url`.  The pattern to use it would be:

 ```
 any-webpackage-app-url?manifest-url=desired-webpackge-manifest-url
 ```
An example of its use to show the documentation of the `ckeditor@1.0.0` webpackage is shown below:
 ```
https://cubbles.world/sandbox/com.incowia.cubx-webpackage-viewer@1.6.0/any-webpackage-viewer/index.html?manifest-url=https://cubbles.world/sandbox/ckeditor@1.0.0/manifest.webpackage
```

## Use of the any-component-docs-viewer app
The `any-component-docs-viewer` app allows you to visualize the documentation of any component by providing its manifest url and its artifact id. To aim that you should use the available url parameters:

 1. **manifest-url:** use this parameter to provide the url of the manifest, which contains the definition of the desired component.
 2. **artifact-id:** use this parameter to provide `artifactId` of the desired component.
 
 Both parameters are required for the application to work correctly. The pattern to use would be:

 ```
 any-component-docs-app-url?manifest-url=desired-webpackge-manifest-url&artifact-id=desired-component-artifact-id
 ```
An example of its use to show the documentation of the `cubx-ckeditor` component is shown below:
 ```
https://cubbles.world/sandbox/com.incowia.cubx-webpackage-viewer@1.6.0/any-component-docs-viewer/index.html?manifest-url=https://cubbles.world/sandbox/ckeditor@1.0.0/manifest.webpackage&artifact-id=cubx-ckeditor
```

[Want to get to know the Cubbles Platform?](https://cubbles.github.io)

[demoWebPV]: https://cubbles.world/core/com.incowia.cubx-webpackage-viewer@1.6.0/cubx-webpackage-viewer/demo/index.html
[demoCompV]: https://cubbles.world/core/com.incowia.cubx-webpackage-viewer@1.6.0/cubx-component-viewer/demo/index.html
[demoCompInfV]: https://cubbles.world/core/com.incowia.cubx-webpackage-viewer@1.6.0/cubx-component-info-viewer/demo/index.html
[demoCompDocsV]: https://cubbles.world/core/com.incowia.cubx-webpackage-viewer@1.6.0/cubx-component-docs-viewer/demo/index.html
[anyWPApp]: https://cubbles.world/core/com.incowia.cubx-webpackage-viewer@1.6.0/any-webpackage-viewer/index.html
[anyCDApp]: https://cubbles.world/core/com.incowia.cubx-webpackage-viewer@1.6.0/any-component-docs-viewer/index.html
[d3TipInfo]: https://github.com/Caged/d3-tip 
[fileSaverInfo]: https://github.com/eligrey/FileSaver.js/
