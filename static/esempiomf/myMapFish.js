Ext.onReady(function() {
	new Ext.Viewport({
	  layout:'border',
	  items:[{
	    region:'north',
	    margins:'4 4 4 4',
	    height: 63,
	    html: '<img src="http://blog.spaziogis.it/wp-content/themes/blacknwhite/blacknwhite/images/TANTO_logo.png"/>',
	    bodyStyle:'padding:2px;'
	  },{
	    region:'center',
	    layout:'border',
	    margins:'0 4 4 4',
	    items:[{
	      region:'north',
	      border:false,
	      contentEl:'buttonbar',
	      height:26
	      },{
	      region:'center',
	      contentEl:'map',
	      border:false
	    }] /* qui c'era una virgola di troppo */
	  },{  
	    title:'Layer tree',
	    region:'east',
	    margins:'0 4 4 0',
	    width:350,
	    contentEl:'tree',
	    collapsible:true
	  },{
	    region:'south',
	    margins:'0 4 4 4',
	    height:20,
	    html:'Esempio realizzato da <a href="mailto:alessio.dl@gmail.com">Alessio Di Lorenzo</a> per <a href="http://blog.spaziogis.it/2009/04/23/introduzione-a-mapfish-openlayer-e-extjs-a-braccetto/" target="_blank">TANTO</a>',
	    bodyStyle:'padding:2px;font-size:12px;font-family:tahoma,arial,helvetica'
	  }]

	});

}); 


function init(){

        var map = new OpenLayers.Map('map',{
		controls:[
			new OpenLayers.Control.Navigation(),
			new OpenLayers.Control.PanZoomBar()
			]
		});
		
		var bounds = new OpenLayers.Bounds(5,36,21,50);
		
		var jpl_wms = new OpenLayers.Layer.WMS("NASA_Global_Mosaic","http://t1.hypercube.telascience.org/cgi-bin/landsat7",{layers: "landsat7"});
		
        var ol_wms = new OpenLayers.Layer.WMS("OpenLayers_WMS","http://labs.metacarta.com/wms/vmap0",{layers: 'basic'});
		
	    var grass_users = new OpenLayers.Layer.WMS.Untiled("Utenti_grass","http://mapserver.gdf-hannover.de/cgi-bin/grassuserwms?",
			      {layers: 'GRASS-Users',transparent:true, format:'image/png'},
			      {isBaseLayer:false}); /* qui mancava il ; finale */
				  
	    map.addLayers([jpl_wms,ol_wms,grass_users]);
		
		/*Aggiungo il toolbar widget di MapFish:
	    /**************************************/
	      /* 1 - creo la toolbar */
		var toolbar = new mapfish.widgets.toolbar.Toolbar({map: map, configurable:true});
	      /* 2 - scelgo di renderizzare la toolbar in un div con id = buttonbar */
		toolbar.render('buttonbar');
	      /* 3 - aggiungo i bottoni/controlli */
		toolbar.addControl(new OpenLayers.Control.ZoomBox(), {iconCls: 'zoomin',toggleGroup: 'map'});
		toolbar.addControl(new OpenLayers.Control.ZoomOut(), {iconCls: 'zoomout',toggleGroup: 'map'});
		toolbar.addControl(new OpenLayers.Control.DragPan({isDefault: true}),{iconCls: 'pan', toggleGroup: 'map'});
	      /* 4 - attivo la toolbar */
		toolbar.activate();


	    /* Layer tree
	    /***************************************/

	    var model = [{
                text: "Mappe di base",
                expanded: true,
                children: [
                        {checked:true,text:"Nasa Global Mosaic",layerName:"NASA_Global_Mosaic"},
                        {checked:false,text:"OpenLayers WMS",layerName:"OpenLayers_WMS"}
                ]},{
                text: "Layer",
                expanded: true,
                children: [
                        {checked:false,text:"Utenti GRASS",layerName:"Utenti_grass"}
                ]}
	    ];

	    var tree = new mapfish.widgets.LayerTree({map: map, el: 'tree', model: model, border:false, autoHeight:true});
	    tree.render();

	    /* Centra la mappa */
            map.zoomToExtent(bounds);
}
