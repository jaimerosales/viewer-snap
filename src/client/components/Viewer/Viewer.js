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

import React, { Component } from 'react';
import Helpers from './Viewer-Helpers';
import Gallery from '../Gallery/Gallery';
import './Viewer.css';

class Viewer extends Component {

    componentDidMount() {
        // Revit Apartment
        var documentId = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6dmlld2VyLXJvY2tzLXJlYWN0L0FwYXJ0bWVudC1GdXJuaXNoZWQucnZ0';
        Helpers.launchViewer(documentId);         
    }  

    render() {
        return (
          <div>  
            <div id="viewerDiv" />
            <div className="forge-logo">
                <img className="logo-size" src="images/forge-logo.png" alt="Autodesk Forge" />
            </div>
            <Gallery />                   
          </div>
        );
    }
}

export default Viewer;
