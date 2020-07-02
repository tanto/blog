// Variabili globali:
// ******************
var map,vectors,formats;
var snapping,splitting;

// Separatore per la toolbar:
// **************************
function addSeparator(toolbar){
	toolbar.add(new Ext.Toolbar.Spacer());
	toolbar.add(new Ext.Toolbar.Separator());
	toolbar.add(new Ext.Toolbar.Spacer());
}


// Sceglie il formato di codifica/decodifica delle feature:
// ********************************************************
function updateFormats() {
		var inOptions = {
			'internalProjection': map.baseLayer.projection,
            'externalProjection': new OpenLayers.Projection(OpenLayers.Util.getElement("inproj").value)
        };   
        var outOptions = {
            'internalProjection': map.baseLayer.projection,
            'externalProjection': new OpenLayers.Projection(OpenLayers.Util.getElement("outproj").value)
        };
        var gmlOptions = {
        	featureType: "feature",
            featureNS: ""
        };
        var gmlOptionsIn = OpenLayers.Util.extend(
                OpenLayers.Util.extend({}, gmlOptions),
                inOptions
        );
        var gmlOptionsOut = OpenLayers.Util.extend(
                OpenLayers.Util.extend({}, gmlOptions),
                outOptions
        );
        var kmlOptionsIn = OpenLayers.Util.extend(
                {extractStyles: true}, inOptions)
        	formats = {
        	      'in': {
        	        WKT: new OpenLayers.Format.WKT(inOptions),
        	        GeoJSON: new OpenLayers.Format.GeoJSON(inOptions),
        	        GeoRSS: new OpenLayers.Format.GeoRSS(inOptions),
        	        GML2: new OpenLayers.Format.GML.v2(gmlOptionsIn),
        	        GML3: new OpenLayers.Format.GML.v3(gmlOptionsIn),
        	        KML: new OpenLayers.Format.KML(kmlOptionsIn)
        		}, 
        		'out': {
        	        WKT: new OpenLayers.Format.WKT(outOptions),
        	        GeoJSON: new OpenLayers.Format.GeoJSON(outOptions),
        	        GeoRSS: new OpenLayers.Format.GeoRSS(outOptions),
        	        GML2: new OpenLayers.Format.GML.v2(gmlOptionsOut),
        	        GML3: new OpenLayers.Format.GML.v3(gmlOptionsOut),
        	        KML: new OpenLayers.Format.KML(outOptions)
        	} 
        };
}


// Inizializza la mappa:
// ********************
function initMap(){
    
	// Evita le tiles rosa
	OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
	OpenLayers.Util.onImageLoadErrorColor = "transparent";
	
	//Extent iniziale
	startBounds = new OpenLayers.Bounds(-254382.430027,3793722.587385,3267835.832723,6978394.933289);
	
    options = {
	    controls:[],
	    projection: new OpenLayers.Projection("EPSG:900913"),
	    displayProjection: new OpenLayers.Projection("EPSG:4326"),
	    units: "m",
	    numZoomLevels: 18,
	    maxResolution: 156543.0339,
	    maxExtent: new OpenLayers.Bounds(-20037508,-20037508,20037508,20037508.34)
    };
    
    map = new OpenLayers.Map('map', options);
    
    // Layer vector
    OpenLayers.Feature.Vector.style['default']['strokeWidth'] = '3';
    vectors = new OpenLayers.Layer.Vector("LayerVettoriale");

    
    // OSM layer
    var mapnik = new OpenLayers.Layer.OSM("OSM");
    //Blank map
    var blank = new OpenLayers.Layer("Blank",{isBaseLayer : true,sphericalMercator: true});
    // Google Mercator Layers
    var gphy = new OpenLayers.Layer.Google("GoogleTerrain",{type: G_PHYSICAL_MAP, 'sphericalMercator': true});
    var gmap = new OpenLayers.Layer.Google("GoogleStreets",{'sphericalMercator': true});
    var gsat = new OpenLayers.Layer.Google("GoogleSatellite",{type: G_SATELLITE_MAP, 'sphericalMercator': true});
    var ghyb = new OpenLayers.Layer.Google("GoogleHybrid",{type: G_HYBRID_MAP, 'sphericalMercator': true});
    
    map.addLayers([gphy,gmap,gsat,ghyb,mapnik,blank,vectors]);
    
    // Controlli base della mappa
    //map.addControl(new OpenLayers.Control.LayerSwitcher());
    map.zoomToExtent(startBounds);
    
    
    // Configura snapping
    snapping = new OpenLayers.Control.Snapping({
        layer: vectors,
        targets: [vectors],
        greedy: false
    });
    map.addControl(snapping);
    snapping.activate();

   // Configura split
   splitting = new OpenLayers.Control.Split({
   	layer: vectors,
        source: vectors,
        tolerance: 0.0001,
        eventListeners: {
   	     aftersplit: function(event) {
   	          flashFeatures(event.features);
   	     }
       }
   });
   map.addControl(splitting);
   splitting.activate();

    
    // Cancella feature
    function deleteFeature(vectors)
    {
      this.layer.destroyFeatures([vectors]);
    } 

    // Richiama la funzione di aggiornamento dei formati di input/output
    updateFormats();
    

    // Controlli di editing
    drawControls = {
	    point   : new OpenLayers.Control.DrawFeature(vectors,OpenLayers.Handler.Point),
	    line    : new OpenLayers.Control.DrawFeature(vectors,OpenLayers.Handler.Path),
	    polygon : new OpenLayers.Control.DrawFeature(vectors,OpenLayers.Handler.Polygon),
	    modify  : new OpenLayers.Control.ModifyFeature(vectors),
	    select  : new OpenLayers.Control.SelectFeature(vectors,{
						onSelect:serialize,
	    					clickout: false,toggle: true,multiple: false, hover: false,
	    					box: false}),
	    delfeat : new OpenLayers.Control.SelectFeature(vectors,{box:true, onSelect:deleteFeature})
    };
    

    // MapFish Toolbar widget
    var toolbar = new mapfish.widgets.toolbar.Toolbar({map: map, configurable:false});
    toolbar.render('buttonbar');

    toolbar.add(new Ext.Toolbar.Button({iconCls:'zoomfull',tooltip:'Full extent',handler:function(){map.zoomToExtent(startBounds);}}));
    toolbar.addControl(new OpenLayers.Control.ZoomBox(), {iconCls: 'zoomin',tooltip:'Zoom area',toggleGroup: 'map'});
    toolbar.addControl(new OpenLayers.Control.ZoomOut(), {iconCls: 'zoomout',tooltip:'Zoom out',toggleGroup: 'map'});
    toolbar.addControl(new OpenLayers.Control.DragPan({isDefault: true}),{iconCls: 'pan', tooltip:'Pan',toggleGroup: 'map'});

    addSeparator(toolbar);
    
    var nav = new OpenLayers.Control.NavigationHistory();
    map.addControl(nav);
    nav.activate();
    
    toolbar.add(new Ext.Toolbar.Button({iconCls:'prev',tooltip:'Vista precedente',handler:nav.previous.trigger }));
    toolbar.add(new Ext.Toolbar.Button({iconCls:'next',tooltip:'Vista successiva',handler:nav.next.trigger }));
    
    addSeparator(toolbar);
    
    for(var key in drawControls) {
    	if (key == 'point'){
    		toolbar.addControl(drawControls[key],{iconCls: 'drawpoint', tooltip:'Disegna un punto',toggleGroup: 'map'});
    	}
    	if (key =='line') {
    		toolbar.addControl(drawControls[key],{iconCls: 'drawline', tooltip:'Disegna una linea',toggleGroup: 'map'});
    	}
    	if (key == 'polygon') {
    		toolbar.addControl(drawControls[key],{iconCls: 'drawpolygon', tooltip:'Disegna un poligono',toggleGroup: 'map'});
    	}
    	if (key == 'modify') {
    		toolbar.addControl(drawControls[key],{iconCls: 'editdraw', tooltip:'Modifica la feature selezionata',toggleGroup: 'map'});
    	}
    	if (key == 'select') {
    		toolbar.addControl(drawControls[key],{iconCls: 'selectdraw', tooltip:'Seleziona',toggleGroup: 'map'});
    	}
    	if (key == 'delfeat') {
    		toolbar.addControl(drawControls[key],{iconCls: 'erasedraw', tooltip:'Cancella una feature',toggleGroup: 'map'});
    	}
    }
    
    
    addSeparator(toolbar);

    toolbar.activate();  

// Mapfish Layer tree Widget
var model = [{
	text: "Mappe di base",
        expanded: true,
        children: [
                   {checked:true,text:"Terreno Google",layerName:"GoogleTerrain"},
                   {checked:false,text:"Strade Google",layerName:"GoogleStreets"},
		   {checked:false,text:"Satellitare Google",layerName:"GoogleSatellite"},
                   {checked:false,text:"Ibrida Google",layerName:"GoogleHybrid"},
		   {checked:false,text:"OpenStreetMap",layerName:"OSM"},
		   {checked:false,text:"Nessuno sfondo",layerName:"Blank"}
        ]},{
        text: "Layer",
        expanded: true,
        children: [
                  {checked:true,text:"Layer vettoriale",layerName:"LayerVettoriale"}
        ]}
];

var tree = new mapfish.widgets.LayerTree({map: map, el: 'tree', model: model, border:false, autoHeight:true});
tree.render();


    
} //Fine initMap


// Serializza le feature disegnate in stringhe nei vari formati:
// *************************************************************
function serialize(feature) {
	var type = document.getElementById("formatType").value;
        // scrive la stringa in formato pretty json (solo geojson)
        var pretty = document.getElementById("prettyPrint").checked;
        var str = formats['out'][type].write(feature, pretty);

        str = str.replace(/,/g, ', ');
        document.getElementById('output').value = str;
}

// Deserializza stringe codificate per produrre le feature:
// ********************************************************
function deserialize() {
            var element = document.getElementById('text');
            var type = document.getElementById("formatType").value;
            var features = formats['in'][type].read(element.value);
            var bounds;
            if(features) {
                if(features.constructor != Array) {
                    features = [features];
                }
                for(var i=0; i<features.length; ++i) {
                    if (!bounds) {
                        bounds = features[i].geometry.getBounds();
                    } else {
                        bounds.extend(features[i].geometry.getBounds());
                    }

                }
                vectors.addFeatures(features);
                map.zoomToExtent(bounds);
                var plural = (features.length > 1) ? 's' : '';
                element.value = features.length + ' feature' + plural + ' aggiunte'
            } else {
                element.value = 'Nessun input ' + type;
            }
}

// Seleziona la modalità di modifica delle feature:
// ************************************************
function updateEditMode() {
	   
    drawControls.modify.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
	
    var resize = document.getElementById("resize").checked;
    if (resize) {
        drawControls.modify.mode |= OpenLayers.Control.ModifyFeature.RESIZE;
	var keepAspectRatio = document.getElementById("ratio").checked;
                if (keepAspectRatio) {
                    drawControls.modify.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
                }

    }

    var rotate = document.getElementById("rotate").checked;
    if (rotate) {
        drawControls.modify.mode |= OpenLayers.Control.ModifyFeature.ROTATE;
    }

    var drag = document.getElementById("drag").checked;
    if (drag) {
        drawControls.modify.mode |= OpenLayers.Control.ModifyFeature.DRAG;
    }

    if (rotate || drag) {
       drawControls.modify.mode &= ~OpenLayers.Control.ModifyFeature.RESHAPE;
    }

}



// Evidenzia i segmenti prodotti durante l'operazione di splitting:
// ****************************************************************function flashFeatures(features, index) {
	if(!index) {
		index = 0;
        }
        var current = features[index];
        if(current && current.layer === vectors) {
	        vectors.drawFeature(features[index], "select");
        }
        var prev = features[index-1];
        if(prev && prev.layer === vectors) {
	        vectors.drawFeature(prev, "default");
        }
        ++index;
	if(index <= features.length) {
        	window.setTimeout(function() {flashFeatures(features, index)}, 75);
        }
}


// Abilita e disabilita splitting:
// *******************************
function toggleSnapping() {
		var snapOK = document.getElementById("snap").checked;
		if (snapOK) {
			snapping.activate();
		} else {
			snapping.deactivate();
		}
}

// Abilita e disabilita splitting:
// *******************************
function toggleSplitting() {
		var splitOK = document.getElementById("split").checked;
		if (splitOK) {
			splitting.activate();
		} else {
			splitting.deactivate();
		}
}
