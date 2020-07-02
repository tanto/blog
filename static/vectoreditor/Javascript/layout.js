//Crea form di selezione proiezioni e formati:
//********************************************
Ext.namespace('Combo.formats','Combo.inProj','Combo.outProj');

Combo.formats = [
	['WK','WKT','Well-Known Text'],
	['GJ','GeoJSON','GeoJSON'],
	['KM','KML','KML (Google Earth)'],
	['GR','GeoRSS','GeoRSS'],
	['G2','GML2','GML (v2)'],
	['G3','GML3','GML (v3)']
];

Combo.proj = [
	['WG','EPSG:4326','WGS84'],
	['SM','EPSG:900913','Spherical Mercator']
];

var formatCombo = new Ext.form.ComboBox({
	fieldLabel: 'Formato',
	store:new Ext.data.SimpleStore({fields: ['abbr', 'format','show'],data : Combo.formats }),
        //id: 'formatType',
	hiddenName:'formatType',
	displayField:'show',
	valueField:'format',
        typeAhead: true,
	mode: 'local',
        forceSelection: true,
        triggerAction: 'all'
});

formatCombo.setValue('WKT');

var prettyCheck = new Ext.form.Checkbox({
	boxLabel: 'Pretty',
    xtype:'checkbox',
	labelWidth:1,
	labelSeparator:'&nbsp;',
    checked:true,
    id: 'prettyPrint'
});

var inprojCombo = new Ext.form.ComboBox({
	fieldLabel: 'Proiezione input',
	store:new Ext.data.SimpleStore({fields: ['abbr', 'format','show'],data : Combo.proj }),
    //id: 'inproj',
	hiddenName:'inproj',
	displayField:'show',
	valueField:'format',
    typeAhead: true,
	mode: 'local',
    forceSelection: true,
    triggerAction: 'all',
    //emptyText:'Scegli una proiezione...',
	onChange:updateFormats
});

inprojCombo.setValue('EPSG:4326');

var outprojCombo = new Ext.form.ComboBox({
	fieldLabel: 'Proiezione output',
	store:new Ext.data.SimpleStore({fields: ['abbr', 'format','show'],data : Combo.proj }),
    //id: 'outproj',
	hiddenName:'outproj',
	displayField:'show',
	valueField:'format',
    typeAhead: true,
	mode: 'local',
    forceSelection: true,
    triggerAction: 'all',
	onChange:updateFormats
});

outprojCombo.setValue('EPSG:4326');

var projForm = new Ext.FormPanel({
    labelWidth: 120,
    frame:false,
    border:false,
    bodyStyle:'padding:12px 0 0 30px;',
    autoWidth:true,
    autoHeight:true,
    defaults: {width: 200},
    items: [formatCombo ,prettyCheck,inprojCombo,outprojCombo]
});


//Crea form di selezione per i modi di editing:
//*********************************************
var resizeChk = new Ext.form.Checkbox({
    boxLabel: 'Ridimensiona',
    id: 'resize',
    listeners:{'check':updateEditMode}
});

var ratioChk = new Ext.form.Checkbox({
    boxLabel: 'Mantieni le proporzioni',
    checked:true,
    id: 'ratio',
    listeners:{'check':updateEditMode}
});

var rotateChk = new Ext.form.Checkbox({
    boxLabel: 'Ruota',
    id: 'rotate',
    listeners:{'check':updateEditMode}
});

var dragChk = new Ext.form.Checkbox({
    boxLabel: 'Sposta',
    id: 'drag',
    listeners:{'check':updateEditMode}
});

var editOptionsForm = new Ext.FormPanel({
    frame:false,
    border:false,
    autoWidth:true,
    autoHeight:true,
	layout:'column',
	items:[{
		width:170,
		border:false,
		items:[resizeChk,rotateChk,dragChk]
		},{
		width:170,
		border:false,
		items:[ratioChk]
	}]
});


//Crea form di selezione per snap e split:
//****************************************
var snapChk = new Ext.form.Checkbox({
    boxLabel: 'Abilita snap',
    checked:true,
    id: 'snap',
    listeners:{'check':toggleSnapping}
});


var splitChk = new Ext.form.Checkbox({
    boxLabel: 'Abilita split',
    checked:true,
    id: 'split',
    listeners:{'check':toggleSplitting}
});

var snapOptionsForm = new Ext.FormPanel({
        frame:false,
        border:false,
        autoWidth:true,
        autoHeight:true,
	layout:'column',
	items:[{
		width:170,
		border:false,
		items:[snapChk]
		},{
		width:170,
		border:false,
		items:[splitChk]
	}]
});


//Crea form per serializzare le feature:
//**************************************
var serializeForm = new Ext.FormPanel({
	frame:false,
    border:false,
	defaultType:'textarea',
	labelWidth:1,
	labelSeparator:'&nbsp;',
	items:[{
		id: 'output',
		width:335,
	        height:100
	}],

    buttons: [{
		text:'Pulisci',
		iconCls:'brush',
		handler:function () {
			document.getElementById("output").value = "";
			vectors.destroyFeatures();
		}
	}]
});

//Crea form per deserializzare i codici:
//**************************************
var deserializeForm = new Ext.FormPanel({
	frame:false,
    border:false,
	defaultType:'textarea',
	labelWidth:1,
	labelSeparator:'&nbsp;',
	items:[{
		id: 'text',
		width:335,
	        height:200
	}],

    buttons: [{
		text:'Aggiungi',
		iconCls:'check',
		handler:deserialize
		},{
		text:'Pulisci',
		iconCls:'brush',
		handler:function () {document.getElementById("text").value = "";}
	}]
});

// reference local blank image
Ext.BLANK_IMAGE_URL = 'MapFish/client/mfbase/ext/resources/images/default/s.gif';


//Inizializza ExtJs:
//******************
Ext.onReady(function() {	
	Ext.QuickTips.init();

    // turn on validation errors beside the field globally
    Ext.form.Field.prototype.msgTarget = 'side';
	
    //Crea il layout:
    //***************
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
                border:false,
                items:[{
                        region:'north',
                        margins:'0 4 2 4',
                        contentEl:'buttonbar',
                        height:26
                        },{
                        region:'center',
                        contentEl:'map',
                        margins:'0 4 4 4'
                        },{
                        region:'south',
                        height:20,
                        margins:'0 4 4 4',
						html:'Esempio realizzato da <a href="http://alessiodilorenzo.it" target="_blank">Alessio Di Lorenzo</a> per <a href="http://blog.spaziogis.it/" target="_blank">TANTO</a>',
						bodyStyle:'padding:2px;font-size:12px;font-family:tahoma,arial,helvetica'
                }]
                },{
                region:'east',
                layout:'border',
                border:false,
                margins:'0 4 4 0',
                width:400,
                items:[{
                	region:'north',
                	collapsible:false,
                	title:'Selezioni',
                	iconCls:'selection',
                	height:150,
                	items:[projForm]
                },{
                	region:'center',
                	layout:'accordion',
                	border:false,
                	items:[{
                		title:'Digitalizza sulla mappa',
                		iconCls:'edit',
                		layout:'border',
                		items:[{
                				region:'center',
                				autoScroll:true,
                				border:false,
                				bodyStyle:'padding:10px 7.5px 0 7.5px;',
                				items:[{
                					xtype:'fieldset',
                					collapsible:false,
                					title:'Opzioni di modifica',
                					autoHeight:true,
                					width:369,
                					defaultType: 'checkbox',
                					items:[editOptionsForm]
                					},{
		        			        xtype:'fieldset',
		        			        collapsible:false,
		        			        title:'Opzioni di snapping e splitting',
		        			        autoHeight:true,
		        			        width:369,
		        			        defaultType:'checkbox',
		        			        items:[snapOptionsForm]
                				    },{
	                			    xtype:'fieldset',
	                			    collapsible:false,
	                			    title:'Codifica della feature selezionata',
	                			    autoHeight:true,
	            			        width:369,
	            			        items:[serializeForm]
                				}]
                				
                		}]
                		},{
                		title:'Crea le geometrie da testo',
                		iconCls:'import',
				layout:'border',
				items:[{
					region:'north',
					border:false,
					height:100,
					autoScroll:true,
					html:'Inserire la codifica di una geometria in uno dei formati selezionabili dal menu a tendina qui sopra (es: Well-Known Text) e cliccare su "Aggiungi" per visualizzare l\'elemento sulla mappa.<br/>La visuale si sposter&agrave; automaticamente centrandosi e zoomando sulla geometria inserita. Questa potr&agrave; essere modificata a piacimento con gli strumenti di eding accessibili dalla toolbar',
					bodyStyle:'padding:10px 7.5px 0 7.5px;text-align:justify;'
					},{
					region:'center',
					border:false,
					autoScroll:true,
                	bodyStyle:'padding:10px 7.5px 0 7.5px;',
                	items:[{
							xtype:'fieldset',
	                		collapsible:false,
	                		title:'Inserisci la striga nel formato selezionato',
	                		autoHeight:true,
	            			width:369,
	            			items:[deserializeForm]
					}]	
				}]
				},{
				title:'Lista layer',
				iconCls:'tree',
				contentEl:'tree'
                		},{
				title:'Informazioni',
				iconCls:'info',
				contentEl:'info',
				bodyStyle:'padding:10px 7.5px 0 7.5px;text-align:justify;'
		}]
            }]
                
        }]

    });

});
