/////////////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Jaime Rosales 2016 - Forge Developer Partner Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////////////////

import Client from '../Client';
import ModelTransformerExtension from '../../Viewing.Extension.ModelTransformer';
import EventTool from '../Viewer.EventTool/Viewer.EventTool'

var viewer;
var pointer;

var getToken = { accessToken: Client.getaccesstoken()};
var pointData ={};

/// WHY I'M USING GLOBAL VARIABLES, SIMPLE I'M SETTING UP WITH REACT-SCRIPTS FOR EASIER 3RD PARTY DEVELOPER USE OF PROJECT
/// https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#using-global-variables

const Autodesk = window.Autodesk;
const THREE = window.THREE;


function launchViewer(documentId) {
 getToken.accessToken.then((token) => { 
    var options = {
            env: 'AutodeskProduction',
            accessToken: token.access_token
    };
    
    var viewerDiv = document.getElementById('viewerDiv');
    viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerDiv);

    Autodesk.Viewing.Initializer(options, function onInitialized(){
        var errorCode = viewer.start();

        // Check for initialization errors.
        if (errorCode) {
            console.error('viewer.start() error - errorCode:' + errorCode);
            return;
        }
            Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
        });
 })
}


/**
 * Autodesk.Viewing.Document.load() success callback.
 * Proceeds with model initialization.
 */
function onDocumentLoadSuccess(doc) {

    // A document contains references to 3D and 2D viewables.
    var viewables = Autodesk.Viewing.Document.getSubItemsWithProperties(doc.getRootItem(), {'type':'geometry'}, true);
    if (viewables.length === 0) {
        console.error('Document contains no viewables.');
        return;
    }

    var eventTool = new EventTool(viewer)
    eventTool.activate()
    eventTool.on('singleclick', (event) => {
        pointer = event
    })

    //load model.
    viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, onGeometryLoadedHandler);
    viewer.addEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,onSelection);
    viewer.prefs.tag('ignore-producer');
    
    viewer.impl.disableRollover(true);
    viewer.loadExtension(ModelTransformerExtension, {
         parentControl: 'modelTools',
         autoLoad: true
    })  
    // Choose any of the available viewables.
    var indexViewable = 0;
    var lmvDoc = doc;

    // Everything is set up, load the model.
    loadModel(viewables, lmvDoc, indexViewable);
}

/**
* Autodesk.Viewing.Document.load() failuire callback.
**/
function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
}

//////////////////////////////////////////////////////////////////////////
// Model Geometry loaded callback
//
//////////////////////////////////////////////////////////////////////////
function onGeometryLoadedHandler(event) {
        event.target.model = event.model
        var viewer = event.target;
        debugger
        viewer.removeEventListener(
                Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
                onGeometryLoadedHandler);
        viewer.setQualityLevel(false,false);
        
        viewer.setGroundShadow(false);
        viewer.fitToView();
}


function loadNextModel(documentId) {
     const extInstance = viewer.getExtension(ModelTransformerExtension);
     const pickVar = extInstance.panel;

     pickVar.tooltip.setContent(`
      <div id="pickTooltipId" class="pick-tooltip">
        <b>Pick position ...</b>
      </div>`, '#pickTooltipId')

    if (!pointData.point){
        alert('You need to select a point in your house to snap the AC first');
        pickVar.tooltip.activate();
    }
    else{
        Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
        pickVar.tooltip.deactivate();
    }
   
}


function onSelection (event) {

    if (event.selections && event.selections.length) {
      pointData = viewer.clientToWorld(
        pointer.canvasX,
        pointer.canvasY,
        true)
      
    }
}




function wallOneTransform(){

        var transform = {
            translation: new THREE.Vector3(0.0, 0.0, 0.0),
            rotation: new THREE.Vector3(0.0, 0.0, 0.0),
            scale: new THREE.Vector3(0.08, 0.08, 0.08)
        }
        switch (pointData.face.normal.x * pointData.face.normal.y === 0){
        case (pointData.face.normal.x === 0 && Math.round(pointData.face.normal.y) === 1):
            transform.translation = new THREE.Vector3(pointData.point.x , pointData.point.y+0.3, pointData.point.z);
            transform.rotation = new THREE.Vector3(90, 180, 0);
            console.log('Inside Y = 1 Wall');
            break;
        case (pointData.face.normal.x === 0 && Math.round(pointData.face.normal.y) === -1) :
            transform.translation = new THREE.Vector3(pointData.point.x , pointData.point.y-0.3, pointData.point.z);
            transform.rotation = new THREE.Vector3(90, 0, 0);
            console.log('Inside Y = -1 Wall');
            break;
        case (Math.round(pointData.face.normal.x) === 1 && pointData.face.normal.y === 0):
            transform.translation = new THREE.Vector3(pointData.point.x+0.3 , pointData.point.y, pointData.point.z);
            transform.rotation = new THREE.Vector3(90, 90, 0);
            console.log('Inside X = 1 Wall');
            break;
        case (Math.round(pointData.face.normal.x) === -1 && pointData.face.normal.y === 0):
            transform.translation = new THREE.Vector3(pointData.point.x-0.35 , pointData.point.y, pointData.point.z);
            transform.rotation = new THREE.Vector3(90, 270, 0);
            console.log('Inside X = -1 Wall');
            break;
        default:
            alert('You need to select one of the walls for this AC Unit');
        }
        return transform
        
 
}

function wallTwoTransform(){
   
        var transform = {
            translation: new THREE.Vector3(0.0, 0.0, 0.0),
            rotation: new THREE.Vector3(0.0, 0.0, 0.0),
            scale: new THREE.Vector3(0.08, 0.08, 0.08)
        }
        switch (pointData.face.normal.x * pointData.face.normal.y === 0){
        case (pointData.face.normal.x === 0 && Math.round(pointData.face.normal.y) === 1):
            transform.translation = new THREE.Vector3(pointData.point.x , pointData.point.y+0.2, pointData.point.z);
            transform.rotation = new THREE.Vector3(270, 0, 180);
            console.log('Inside Y = 1 Wall');
            break;
        case (pointData.face.normal.x === 0 && Math.round(pointData.face.normal.y) === -1) :
            transform.translation = new THREE.Vector3(pointData.point.x , pointData.point.y-0.2, pointData.point.z);
            transform.rotation = new THREE.Vector3(90, 0, 0);
            console.log('Inside Y = -1 Wall');
            break;
        case (Math.round(pointData.face.normal.x) === 1 && pointData.face.normal.y === 0):
            transform.translation = new THREE.Vector3(pointData.point.x +0.2 , pointData.point.y, pointData.point.z);
            transform.rotation = new THREE.Vector3(90, 90, 0);
            console.log('Inside X = 1 Wall');
            break;
        case (Math.round(pointData.face.normal.x) === -1 && pointData.face.normal.y === 0):
            transform.translation = new THREE.Vector3(pointData.point.x - 0.2 , pointData.point.y, pointData.point.z);
            transform.rotation = new THREE.Vector3(90, 270, 0);
            console.log('Inside X = -1 Wall');
            break;
        default:
            alert('You need to select one of the walls for this AC Unit');
        }
        return transform
 
}


function floorTransform(){
    var transform = {
        translation: new THREE.Vector3(0.0, 0.0, 0.0),
        rotation: new THREE.Vector3(90.0, 0.0, 0.0),
        scale: new THREE.Vector3(0.08, 0.08, 0.08)
    }
        console.log(transform);
        if (pointData.face.normal.x === 0 && pointData.face.normal.y === 0 ){
            transform.translation = new THREE.Vector3(pointData.point.x , pointData.point.y , pointData.point.z+1);
            console.log('Clipped to Floor Z axis');
        }
        else {
            alert('You need to select a point on the Floor');
        }
        return transform;
}


function loadModel(viewables, lmvDoc, indexViewable) {

    return new Promise(async(resolve, reject)=> {
        var initialViewable = viewables[indexViewable];
        var svfUrl = lmvDoc.getViewablePath(initialViewable);
        var panel;
        var modelName;

        var modelOptions = {
                    sharedPropertyDbPath: lmvDoc.getPropertyDbPath(),
        };

        viewer.loadModel(svfUrl, modelOptions, (model) => {
            
            switch (lmvDoc.myData.status.toString() === "success" ) {
            case (lmvDoc.myData.guid.toString() === "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dmlld2VyLXJvY2tzLXJlYWN0L3dhbGxfMV90b25uYWdlLmYzZA"):
                
                panel = viewer.getExtension(ModelTransformerExtension).panel;
                panel.setTransform(wallOneTransform());
                panel.applyTransform(model);
                modelName = "wall-ac-unit-one.f3d"    
                break;
            case (lmvDoc.myData.guid.toString() === "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dmlld2VyLXJvY2tzLXJlYWN0L3dhbGwtdHlwZS12NC5mM2Q"):
                
                panel = viewer.getExtension(ModelTransformerExtension).panel;
                panel.setTransform(wallTwoTransform()); 
                panel.applyTransform(model); 
                modelName = "wall-ac-unit-two.f3d"
                break;
            case (lmvDoc.myData.guid.toString() === "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dmlld2VyLXJvY2tzLXJlYWN0L0Zsb29yLUV4cG9zZWQtMV9Ub25uYWdlLmYzZA"):
                panel = viewer.getExtension(ModelTransformerExtension).panel;
                panel.setTransform(floorTransform());
                panel.applyTransform(model);
                modelName = "floor-ac-unit.f3d"
                break;
            default:
                viewer.impl.toggleCelShading(true);
                modelName = "Apartment.rvt";
            }

            model.name = modelName;
            resolve(model)
        })
    })
}


const Helpers = {
  launchViewer,
  loadNextModel
};

export default Helpers;