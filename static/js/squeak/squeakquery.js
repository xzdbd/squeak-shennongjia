/* ========================================================================
 * Squeak: squeakquery.js v0.1 (dojo)
 * ========================================================================
 * Generic handlers for Squeak Query Widget
 * 
 * How to use this widget.
 * var squeakQuery = new SqueakQuery({
    layer: "https://gis.xzdbd.com/arcgis/rest/services/dev/bus/MapServer/0",
    where: "OBJECTID < 10",
    returnGeometry: true,
    queryFields: ["OBJECTID", Z______ID", "NAME", "KIND"],
    displayFields: [
        {display: "OBJECTID", mapping: "OBJECTID", visible: false},
        {display: "ID", mapping: "Z______ID", visible: true},
        {display: "Name", mapping: "NAME", visible: true},
        {display: "kind", mapping: "KIND", visible: true}
    ],
    symbol: new SimpleMarkerSymbol({
                size: 10,
                color: "#FF4000",
                outline: {
                  color: [255, 64, 0, 0.4],
                  width: 7
                }
              }),
    usePopupTemplate: true,
    popupTemplate: new PopupTemplate({
                title: "Bus Station {NAME}",
                content: "ID: {Z______ID:StringFormat}"
              }),
    htmlDom: "#bus-info-table",
    zoom: 13,
    legend: true               
   });

   squeakQuery.executeQuery();

 * Note: 
 * 1. queryFields and displayFields must contain "OBJECTID" as primariy key.
 *
   ======================================================================== */

define([
    // ArcGIS
    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",
    "esri/layers/GraphicsLayer",
    "esri/Graphic",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/PopupTemplate",
    "esri/widgets/Legend",

    //dojo
    "dojo/query",
    "dojo/html",
    "dojo/_base/declare",
    "dojo/dom-class",

    "dojo/domReady!"
], function(QueryTask, Query, GraphicsLayer, Graphic, SimpleMarkerSymbol, PopupTemplate, Legend, query, html, declare, domClass) {
    var SqueakQueryWidget = declare(null, {

        _this: null,

        //--------------------------------------------------------------------------
        //
        //  Lifecycle
        //
        //--------------------------------------------------------------------------

        constructor: function (options) {
            _this = this;
            
            _this.params = options.params;
        },

        executeQuery: function() {
            var graphicsLayer = new GraphicsLayer();
            var htmlTemplate = ""
             
            var layer = _this.params.layer;
            var queryTask = new QueryTask({
                url: layer
            });
            var query1 = new Query();
            query1.returnGeometry = _this.params.returnGeometry;
            query1.outFields = _this.params.queryFields;
            query1.where = _this.params.where
            
            queryTask.execute(query1).then(function(result) {
                if (result.features.length > 0) {
                    htmlTemplate = initResultGrid(result.features)
                    result.features.forEach(function(graphic) {
                    graphic.symbol = _this.params.symbol;
                    if (_this.params.usePopupTemplate == true) {
                        graphic.popupTemplate = _this.params.popupTemplate;
                    }
                    graphicsLayer.add(graphic);
                    });
                    app.mapView.map.layers.add(graphicsLayer);               
                } else {
                    htmlTemplate = initNoResultGrid();
                }
                html.set(query(_this.params.htmlDom)[0], htmlTemplate);
                initResultEvent();
                if (_this.params.legend) {
                    showLegend();
                }
            }, function(error){
                html.set(query(_this.params.htmlDom)[0], initNoResultGrid());
            }); //end of queryTask.execute     

            query("#panelSqueakQuery").on("hide.bs.collapse", function(){
                app.mapView.map.layers.remove(graphicsLayer)
            });      


            //--------------------------------------------------------------------------
            //
            //  Private functions
            //
            //--------------------------------------------------------------------------

            function initResultGrid(features) {
                gridHtml = '<tbody>';
                gridHtml += '<tr>';
                _this.params.displayFields.forEach(function(field) {
                    if (field.visible == false) {
                        gridHtml += '<th class="success collapse">' + field.display + '</th>'
                    } else {
                        gridHtml += '<th class="success">' + field.display + '</th>'
                    }
                });
                gridHtml += '</tr>';
                features.forEach(function(feature) {
                    gridHtml += '<tr>';
                    for (i = 0; i < _this.params.displayFields.length; i++) {
                        if (_this.params.displayFields[i].visible == false) {
                            gridHtml += '<td class="collapse">' + feature.getAttribute(_this.params.displayFields[i].mapping) + '</td>';
                        } else {
                            gridHtml += '<td>'+ feature.getAttribute(_this.params.displayFields[i].mapping) + '</td>';
                        }
                    }
                    gridHtml += '</tr>';
                });
                gridHtml += '</tbody>';
                return gridHtml;
            }

            function initNoResultGrid() {
                gridHtml = '<div>' + 
                    'No result found' + 
                    '</div>';
                
                return gridHtml;
            }     

            function initResultEvent() {
                console.log(graphicsLayer)
                query(_this.params.htmlDom).on('td:click', function(evt){
                    query(_this.params.htmlDom + " .active").removeClass("active");
                    domClass.toggle(evt.selectorTarget.parentNode, "active");
                    zoomToGraphic(query(_this.params.htmlDom+' .active')[0].firstChild.innerHTML);
                });
            }

            function zoomToGraphic(id) {
                features = graphicsLayer.graphics;
                feature = features.find(function(obj) {
                    return obj.attributes.OBJECTID == id
                });
                app.mapView.center = [feature.geometry.longitude, feature.geometry.latitude];
                if (_this.params.zoom != ""){
                    app.mapView.zoom = _this.params.zoom
                }
            }

            function showLegend() {
                var legend = new Legend({
                    view: app.mapView,
                    layerInfos: [{
                        layer: graphicsLayer,
                        title: "图例"
                    }]
                });
                app.mapView.ui.add(legend, "bottom-right");
            }

        }
        
    });
    
    return SqueakQueryWidget;
});