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
        var viewer = event.target;
        viewer.removeEventListener(
                Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
                onGeometryLoadedHandler);
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
    console.log('pointData', pointData)
}




function wallOneTransform(){
   
        var matrix = new THREE.Matrix4();
        var t;
        var euler;

        switch (pointData.face.normal.x * pointData.face.normal.y === 0){
        case (pointData.face.normal.x === 0 && Math.round(pointData.face.normal.y) === 1):
            t = new THREE.Vector3(pointData.point.x , pointData.point.y + 7, pointData.point.z+4.1);
            euler = new THREE.Euler( 0, 0, 180 * Math.PI/180, 'XYZ');
            console.log('Inside Y = 1 Wall');
            break;
        case (pointData.face.normal.x === 0 && Math.round(pointData.face.normal.y) === -1) :
            t = new THREE.Vector3(pointData.point.x , pointData.point.y+5.1, pointData.point.z+4.1);
            euler = new THREE.Euler(0, 0, 0,'XYZ');
            console.log('Inside Y = -1 Wall');
            break;
        case (Math.round(pointData.face.normal.x) === 1 && pointData.face.normal.y === 0):
            t = new THREE.Vector3(pointData.point.x + 1 , pointData.point.y + 6, pointData.point.z + 4.1);
            euler = new THREE.Euler( 0, 0, 90 * Math.PI/180, 'XYZ');
            console.log('Inside X = 1 Wall');
            break;
        case (Math.round(pointData.face.normal.x) === -1 && pointData.face.normal.y === 0):
            t = new THREE.Vector3(pointData.point.x - 1 , pointData.point.y + 6, pointData.point.z + 4.1);
            euler = new THREE.Euler( 0, 0, 270 * Math.PI/180, 'XYZ');
            console.log('Inside X = -1 Wall');
            break;
        
        default:
            alert('You need to select one of the walls for this AC Unit');
        }

        var q = new THREE.Quaternion();
        q.setFromEuler(euler);
        var s = new THREE.Vector3(0.08, 0.08, 0.08);    
        matrix.compose(t, q, s);

        return matrix
 
}

function wallTwoTransform(){
   
        var matrix = new THREE.Matrix4();
        var t;
        var euler;

        switch (pointData.face.normal.x * pointData.face.normal.y === 0){
        case (pointData.face.normal.x === 0 && Math.round(pointData.face.normal.y) === 1):
            t = new THREE.Vector3(pointData.point.x , pointData.point.y + 5.2, pointData.point.z+2);
            euler = new THREE.Euler(270 * Math.PI/180, 0, 180 * Math.PI/180, 'XYZ');
            console.log('Inside Y = 1 Wall');
            break;
        case (pointData.face.normal.x === 0 && Math.round(pointData.face.normal.y) === -1) :
            t = new THREE.Vector3(pointData.point.x , pointData.point.y +5.2, pointData.point.z+2);
            euler = new THREE.Euler(90 * Math.PI/180,0, 0,'XYZ');
            console.log('Inside Y = -1 Wall');
            break;
        case (Math.round(pointData.face.normal.x) === 1 && pointData.face.normal.y === 0):
            t = new THREE.Vector3(pointData.point.x , pointData.point.y + 5.2, pointData.point.z + 2);
            euler = new THREE.Euler( 90 * Math.PI/180, 90 * Math.PI/180, 0, 'XYZ');
            console.log('Inside X = 1 Wall');
            break;
        case (Math.round(pointData.face.normal.x) === -1 && pointData.face.normal.y === 0):
            t = new THREE.Vector3(pointData.point.x , pointData.point.y + 5.2, pointData.point.z + 2);
            euler = new THREE.Euler( 90 * Math.PI/180, 270 * Math.PI/180, 0, 'XYZ');
            console.log('Inside X = -1 Wall');
            break;
        default:
            alert('You need to select one of the walls for this AC Unit');
        }

        var q = new THREE.Quaternion();
        q.setFromEuler(euler);
        var s = new THREE.Vector3(0.08, 0.08, 0.08);    
        matrix.compose(t, q, s);

        return matrix
 
}


function floorTransform(){
   
        var matrix = new THREE.Matrix4();
        var t;
        var euler;

        if (pointData.face.normal.x === 0 && pointData.face.normal.y === 0 ){
            t = new THREE.Vector3(pointData.point.x , pointData.point.y + 13 , pointData.point.z + 4.1);
            euler = new THREE.Euler(90 * Math.PI/180, 0, 0,'XYZ');
            console.log('Clipped to Floor Z axis');
        }
        else {
            alert('You need to select a point on the Floor');
        }

        var q = new THREE.Quaternion();
        q.setFromEuler(euler);
        var s = new THREE.Vector3(0.08, 0.08, 0.08);    
        matrix.compose(t, q, s);

        return matrix
 
}


function loadModel(viewables, lmvDoc, indexViewable) {
    return new Promise(async(resolve, reject)=> {
        var initialViewable = viewables[indexViewable];
        var svfUrl = lmvDoc.getViewablePath(initialViewable);
        var modelOptions;    
        var modelName;
        debugger;
        switch (lmvDoc.myData.status.toString() === "success" ) {
            case (lmvDoc.myData.guid.toString() === "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dmlld2VyLXJvY2tzLXJlYWN0L3dhbGxfMV90b25uYWdlLmYzZA"):
                modelOptions = {
                    placementTransform: wallOneTransform()
                };
                modelName = "wall-ac-unit-one.f3d"    
                break;
            case (lmvDoc.myData.guid.toString() === "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dmlld2VyLXJvY2tzLXJlYWN0L3dhbGwtdHlwZS12NC5mM2Q"):
                modelOptions = {
                    placementTransform: wallTwoTransform()
                };
                modelName = "wall-ac-unit-two.f3d"
                break;
            case (lmvDoc.myData.guid.toString() === "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dmlld2VyLXJvY2tzLXJlYWN0L0Zsb29yLUV4cG9zZWQtMV9Ub25uYWdlLmYzZA"):
                modelOptions = {
                    placementTransform: floorTransform()
                };
                modelName = "floor-ac-unit.f3d"
                break;
            default:
                modelOptions = {
                    sharedPropertyDbPath: lmvDoc.getPropertyDbPath(),
                };
                modelName = "Apartment.rvt"
        }
       
        viewer.loadModel(svfUrl, modelOptions, (model) => {
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