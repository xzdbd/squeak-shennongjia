/* ========================================================================
 * pollution main.js
 * ========================================================================
 *
   ======================================================================== */

var app;

require([
  // ArcGIS
  "esri/Map",
  "esri/Basemap",
  "esri/layers/VectorTileLayer",
  "esri/views/MapView",
  "esri/views/SceneView",
  "esri/widgets/Search",
  "esri/widgets/Popup",
  "esri/widgets/Home",
  "esri/widgets/Legend",
  "esri/widgets/ColorPicker",
  "esri/core/watchUtils",
  "esri/layers/FeatureLayer",
  "esri/layers/MapImageLayer",
  "esri/layers/TileLayer",
  "esri/symbols/PictureMarkerSymbol",
  "esri/tasks/QueryTask",
  "esri/tasks/support/Query",
  "esri/layers/GraphicsLayer",
  "esri/tasks/Geoprocessor",
  "esri/tasks/support/FeatureSet",
  "esri/layers/support/Field",

  "dojo/query",
  "dojo/dom-class",
  "dojo/dom",
  "dojo/on",
  "dojo/dom-construct",
  "dojo/date",
  "dojo/date/locale",
  "dojo/request",
  "dojo/_base/declare",
  "dojo/dom-style",
  "dojo/_base/fx",

  //cedar chart
  "cedar",

  // Calcite Maps
  "calcite-maps/calcitemaps-v0.3",

  // Boostrap
  "bootstrap/Collapse",
  "bootstrap/Dropdown",
  "bootstrap/Tab",
  "bootstrap/Carousel",
  "bootstrap/Tooltip",
  "bootstrap/Modal",

  // Dojo
  "dojo/domReady!"
], function (Map, Basemap, VectorTileLayer, MapView, SceneView, Search, Popup, Home, Legend, ColorPicker,
  watchUtils, FeatureLayer, MapImageLayer, TileLayer, PictureMarkerSymbol, QueryTask, Query, GraphicsLayer, Geoprocessor, FeatureSet, Field, query, domClass, dom, on, domConstruct, date, locale, request, declare, domStyle, fx, Cedar, CalciteMapsSettings) {

    app = {
      scale: 577790.554289,
      lonlat: [110.51261901855055, 31.553827338163142],
      mapView: null,
      mapDiv: "mapViewDiv",
      mapFL: null,
      vectorLayer: null,
      sceneView: null,
      sceneDiv: "sceneViewDiv",
      sceneFL: null,
      activeView: null,
      searchWidgetNav: null,
      searchWidgetPanel: null,
      searchWidgetSettings: null,
      basemapSelected: "topo",
      basemapSelectedAlt: "topo",
      legendLayer: null,
      legend: null,
      padding: {
        top: 85,
        right: 0,
        bottom: 0,
        left: 0
      },
      uiPadding: {
        components: ["zoom", "attribution", "home", "compass"],
        padding: {
          top: 15,
          right: 15,
          bottom: 30,
          left: 15
        }
      },
      popupOptions: {
        autoPanEnabled: true,
        messageEnabled: false,
        spinnerEnabled: false,
        dockEnabled: true,
        dockOptions: {
          buttonEnabled: true,
          breakpoint: 544 // default
        }
      },
      loading: null,
    }

    //----------------------------------
    // App
    //----------------------------------
    initializeLoadingOverlay();
    initializeMapViews();
    initializeViewsLayer();
    initializeStationsLayer();
    initializeAppUI();


    //----------------------------------
    // Loading Overlay
    //----------------------------------

    function initializeLoadingOverlay() {
      var Loading = declare(null, {
        overlayNode: null,
        indicatorNode: null,
        fadedout: null,
        constructor: function () {
          // save a reference to the overlay
          this.overlayNode = dom.byId("loadingOverlay");
          this.indicatorNode = dom.byId("loadingIndicator");
          this.fadedout = true;
        },
        // called to hide the loading overlay
        endLoading: function () {
          domStyle.set(this.overlayNode, 'display', 'none');
          fx.fadeOut({
            node: this.indicatorNode,
            onEnd: function (node) {
              domStyle.set(node, 'display', 'none');
            }
          }).play();
          this.fadedout = false;
        }
      });
      app.loading = new Loading();

      setTimeout(function () {
        if (app.loading.fadedout == true) {
          app.loading.endLoading();
        }
      }, 10000);
    }

    //----------------------------------
    // Map and Scene View
    //----------------------------------

    function initializeMapViews() {
      var chinaBasemap = new TileLayer({
        url: "http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer"
      });

      app.mapView = new MapView({
        container: app.mapDiv,
        map: new Map({ layers: [chinaBasemap] }),
        scale: app.scale,
        center: app.lonlat,
        padding: app.padding,
        ui: app.uiPadding,
        popup: new Popup(app.popupOptions),
        visible: true
      })

      app.activeView = app.mapView;

      app.mapView.then(function () {
        var mapImageLayer = new MapImageLayer({
          url: "https://gis.xzdbd.com/arcgis/rest/services/dev/shennongjia/MapServer"
        });
        app.mapView.map.add(mapImageLayer);

        // popup detail content
        app.mapView.popup.on("trigger-action", function (e) {
          if (e.action.id == "detail") {
            showPollutionDeatils();
          }
        });

        // update detail info
        app.mapView.on("click", function (e) {
          console.log("view click")
          var screenPoint = {
            x: e.x,
            y: e.y
          };

          app.mapView.hitTest(screenPoint).then(updateDetailInfo);
        });
      });
    }

    function updateDetailInfo(response) {
      dom.byId("detail-station-name").innerHTML = "监测站名称: " + isNullValue(response.results[0].graphic.getAttribute("name"));
      dom.byId("detail-station-area").innerHTML = "所在城市: " + isNullValue(response.results[0].graphic.getAttribute(["city"]));
      dom.byId("detail-station-time").innerHTML = "数据更新时间： " + isNullValue(formatDate(getLocalTime(response.results[0].graphic.getAttribute(["time"]))));

      dom.byId("detail-detail-quality").innerHTML = "空气质量: " + isNullValue(response.results[0].graphic.getAttribute(["quality"]));
      dom.byId("detail-detail-aqi").innerHTML = "AQI: " + isNullValue(response.results[0].graphic.getAttribute(["aqi"]));
      dom.byId("detail-detail-primary-pollutant").innerHTML = "首要污染物: " + isNullValue(response.results[0].graphic.getAttribute(["primary_pollutant"]));
      dom.byId("detail-detail-pm25").innerHTML = "PM2.5: " + isNullValue(response.results[0].graphic.getAttribute(["pm25"]));
      dom.byId("detail-detail-pm10").innerHTML = "PM10: " + isNullValue(response.results[0].graphic.getAttribute(["pm10"]));
      dom.byId("detail-detail-co").innerHTML = "CO: " + isNullValue(response.results[0].graphic.getAttribute(["co"]));
      dom.byId("detail-detail-no2").innerHTML = "NO2: " + isNullValue(response.results[0].graphic.getAttribute(["no2"]));
      dom.byId("detail-detail-o3").innerHTML = "O3: " + isNullValue(response.results[0].graphic.getAttribute(["o3"]));
      dom.byId("detail-detail-so2").innerHTML = "SO2: " + isNullValue(response.results[0].graphic.getAttribute(["so2"]));

      updateChartInfo(response.results[0].graphic.getAttribute(["id"]));

      function getLocalTime(timestamp) {
        return new Date(parseInt(timestamp));
      }

      function formatDate(date, fmt) {
        return locale.format(date, { datePattern: 'yyyy-MM-d', timePattern: 'HH:mm' });
      };

      function isNullValue(value) {
        if (value == null) {
          return "--"
        }
        return value
      }
    }

    //----------------------------------
    // Views GraphicsLayer
    //----------------------------------

    function initializeViewsLayer() {
      var graphicsLayer = new GraphicsLayer();
      var layer = "https://gis.xzdbd.com/arcgis/rest/services/dev/shennongjia/MapServer/1";
      var viewsSymbol = new PictureMarkerSymbol({
        url: location.pathname.replace(/\/[^/]+$/, "") + "/static/images/view.png",
        width: "48px",
        height: "48px",
      });
      
      var template = {
        title: "<font color='#008000'>保护区：{name}",

        content: [{
          type: "fields",
          fieldInfos: [{
            fieldName: "id",
            visible: true,
            label: "编号",
            format: {
              places: 0,
              digitSeparator: true
            },
          }, {
            fieldName: "name",
            visible: true,
            label: "名称",
          }, {
            fieldName: "category",
            visible: true,
            label: "类别",
          },
          ]
        },],

        actions: [{
          title: "详情",
          id: "detail",
          className: "esri-icon-dashboard",
        }]
      };
      var queryTask = new QueryTask({
        url: layer
      });
      var query = new Query();
      query.returnGeometry = true;
      query.outFields = ["*"];
      query.where = "1=1";

      queryTask.execute(query, { cacheBust: false }).then(function (result) {
        if (result.features.length > 0) {
          result.features.forEach(function (graphic) {
            graphic.symbol = viewsSymbol;
            graphic.popupTemplate = template;
            graphicsLayer.add(graphic);
          });
          app.mapView.map.layers.add(graphicsLayer);
          // remove loading
          app.loading.endLoading();
        }
      });
    }

    //----------------------------------
    // Stations GraphicsLayer
    //----------------------------------

    function initializeStationsLayer() {
      var graphicsLayer = new GraphicsLayer();
      var layer = "https://gis.xzdbd.com/arcgis/rest/services/dev/shennongjia/MapServer/0";
      var viewsSymbol = new PictureMarkerSymbol({
        url: location.pathname.replace(/\/[^/]+$/, "") + "/static/images/station.png",
        width: "35px",
        height: "35px",
      });
      
      var template = {
        title: "<font color='#008000'>站点：{name}",

        content: [{
          type: "fields",
          fieldInfos: [{
            fieldName: "id",
            visible: true,
            label: "编号",
            format: {
              places: 0,
              digitSeparator: true
            },
          }, {
            fieldName: "name",
            visible: true,
            label: "名称",
          }, {
            fieldName: "category",
            visible: true,
            label: "类别",
          },
          ]
        },],

        actions: [{
          title: "详情",
          id: "detail",
          className: "esri-icon-dashboard",
        }]
      };
      var queryTask = new QueryTask({
        url: layer
      });
      var query = new Query();
      query.returnGeometry = true;
      query.outFields = ["*"];
      query.where = "1=1";

      queryTask.execute(query, { cacheBust: false }).then(function (result) {
        if (result.features.length > 0) {
          result.features.forEach(function (graphic) {
            graphic.symbol = viewsSymbol;
            graphic.popupTemplate = template;
            graphicsLayer.add(graphic);
          });
          app.mapView.map.layers.add(graphicsLayer);
          // remove loading
          app.loading.endLoading();
        }
      });
    }

    //----------------------------------
    // Pollution Details Handler
    //----------------------------------

    function showPollutionDeatils() {
      if (domClass.contains(query(".calcite-div-toggle")[0], "calcite-div-toggle-zero-bottom")) {
        zoomOutResultContent()
      }
    }

    //----------------------------------
    // App UI Handlers
    //----------------------------------

    function initializeAppUI() {
      // App UI
      setBasemapEvents();
      setSearchWidgets();
      setPopupPanelEvents();
      setPopupEvents();
      setResultContentEvents();
      setAnalysisEvents();
    }

    //----------------------------------
    // Basemaps
    //----------------------------------

    function setBasemapEvents() {

      // Sync basemaps for map and scene
      query("#selectBasemapPanel").on("change", function (e) {
        app.basemapSelected = e.target.options[e.target.selectedIndex].dataset.vector;
        setBasemaps();
      });

      function setBasemaps() {
        app.mapView.map.basemap = app.basemapSelected;
      }
    }

    //----------------------------------
    // Search Widgets
    //----------------------------------

    function setSearchWidgets() {

      //TODO - Search Nav + Panel (detach/attach)
      app.searchWidgetNav = createSearchWidget("searchNavDiv", true);
      app.searchWidgetPanel = createSearchWidget("searchPanelDiv", true);
      app.searchWidgetSettings = createSearchWidget("settingsSearchDiv", false);

      // Create widget
      function createSearchWidget(parentId, showPopup) {
        var search = new Search({
          viewModel: {
            view: app.activeView,
            popupOpenOnSelect: showPopup,
            highlightEnabled: false,
            maxSuggestions: 4
          },
        }, parentId);
        search.startup();
        return search;
      }
    }

    //----------------------------------
    // Popups and Panels
    //----------------------------------

    function setPopupPanelEvents() {

      // Views - Listen to view size changes to show/hide panels
      app.mapView.watch("size", viewSizeChange);

      function viewSizeChange(screenSize) {
        if (app.screenWidth !== screenSize[0]) {
          app.screenWidth = screenSize[0];
          setPanelVisibility();
        }
      }

      // Popups - Listen to popup changes to show/hide panels
      app.mapView.popup.watch(["visible", "currentDockPosition"], setPanelVisibility);

      // Panels - Show/hide the panel when popup is docked
      function setPanelVisibility() {
        var isMobileScreen = app.activeView.widthBreakpoint === "xsmall" || app.activeView.widthBreakpoint === "small",
          isDockedVisible = app.activeView.popup.visible && app.activeView.popup.currentDockPosition,
          isDockedBottom = app.activeView.popup.currentDockPosition && app.activeView.popup.currentDockPosition.indexOf("bottom") > -1;
        // Mobile (xsmall/small)
        if (isMobileScreen) {
          if (isDockedVisible && isDockedBottom) {
            query(".calcite-panels").addClass("invisible");
          } else {
            query(".calcite-panels").removeClass("invisible");
          }
        } else { // Desktop (medium+)
          if (isDockedVisible) {
            query(".calcite-panels").addClass("invisible");
          } else {
            query(".calcite-panels").removeClass("invisible");
          }
        }
      }

      // Panels - Dock popup when panels show (desktop or mobile)
      query(".calcite-panels .panel").on("show.bs.collapse", function (e) {
        if (app.activeView.popup.currentDockPosition || app.activeView.widthBreakpoint === "xsmall") {
          app.activeView.popup.dockEnabled = false;
        }
      });

      // Panels - Undock popup when panels hide (mobile only)
      query(".calcite-panels .panel").on("hide.bs.collapse", function (e) {
        if (app.activeView.widthBreakpoint === "xsmall") {
          app.activeView.popup.dockEnabled = true;
        }
      });
    }

    //----------------------------------
    // Popup collapse (optional)
    //----------------------------------

    function setPopupEvents() {
      query(".esri-popup__header-title").on("click", function (e) {
        query(".esri-popup__main-container").toggleClass("esri-popup-collapsed");
        app.activeView.popup.reposition();
      }.bind(this));
    }

    //----------------------------------
    // Result Content
    //----------------------------------
    function setResultContentEvents() {
      query(".calcite-div-toggle").on("click", function (e) {
        // open, to close
        if (domClass.contains(e.currentTarget, "calcite-div-toggle-bottom")) {
          zoomInResultContent();
        } else if (domClass.contains(e.currentTarget, "calcite-div-toggle-zero-bottom")) {
          zoomOutResultContent(e);
        }
      });
    }

    function zoomOutResultContent() {
      domClass.replace(query(".calcite-div-toggle")[0], "calcite-div-toggle-bottom", "calcite-div-toggle-zero-bottom");
      domClass.replace(query(".calcite-div-toggle .up-arrow")[0], "down-arrow", "up-arrow");
      domClass.replace(query(".calcite-div-content-info-collapse")[0], "calcite-div-content-info", "calcite-div-content-info-collapse");
      domStyle.set(query(".calcite-div-content-info")[0], 'display', '');
      domClass.add(query(".calcite-legend-box")[0], "calcite-legend-box-up");
    }

    function zoomInResultContent() {
      domClass.replace(query(".calcite-div-toggle")[0], "calcite-div-toggle-zero-bottom", "calcite-div-toggle-bottom");
      domClass.replace(query(".calcite-div-toggle .down-arrow")[0], "up-arrow", "down-arrow");
      domClass.replace(query(".calcite-div-content-info")[0], "calcite-div-content-info-collapse", "calcite-div-content-info");
      domStyle.set(query(".calcite-div-content-info-collapse")[0], 'display', 'none');
      domClass.remove(query(".calcite-legend-box")[0], "calcite-legend-box-up");
    }

    //----------------------------------
    // Legend events
    //----------------------------------
    function setLegendEvents() {
      app.legend.layerInfos[0].layer.then(function () {
        var legendContentNode = domConstruct.create("div", {
          className: "calcite-legend-content"
        }, query(".calcite-legend-container")[0]);

        app.legend.activeLayerInfos.items[0].legendElements.forEach(function (element) {
          if (element.type == "symbol-table") {
            var legendListNode = domConstruct.create("div", {
              className: "calcite-legend-list"
            }, legendContentNode);

            var legendNode = domConstruct.create("div", {
              className: "calcite-legend"
            }, legendListNode);
            var symbolNode = domConstruct.create("img", {
              src: element.infos[0].src,
              style: "width:" + element.infos[0].width + ";" + "height:" + element.infos[0].height
            }, legendNode);

            var labelNode = domConstruct.create("div", {
              className: "calcite-legend-label",
              innerHTML: element.title
            }, legendListNode);
          }
        }, this);
        //var symbolNode = domConstruct.create("img", {
        //    src: app.legend.activeLayerInfos.items[0].legendElements[0].infos[0].src,
        //    style: "width:" + app.legend.activeLayerInfos.items[0].legendElements[0].infos[0].width + ";" + "height:" + app.legend.activeLayerInfos.items[0].legendElements[0].infos[0].height
        //}, legendNode);
      });
    }

    //----------------------------------
    // Analysis events
    //----------------------------------
    function setAnalysisEvents() {
      query("#submitGP").on("click", function (e) {
        var gp = new Geoprocessor("https://gis.xzdbd.com/arcgis/rest/services/dev/PollutionOverlay/GPServer/Overlay");
        var featureSet = new FeatureSet()

        var layer = "https://gis.xzdbd.com/arcgis/rest/services/dev/PollutionStation/MapServer/0";
        var queryTask = new QueryTask({
          url: layer
        });
        var query = new Query();
        query.returnGeometry = true;
        query.outFields = ["*"];
        query.where = "1=1";

        queryTask.execute(query, { cacheBust: false }).then(function (result) {
          console.log(result);
          result.fields.push(new Field(
            {
              alias: "no2",
              name: "view_latest_pollution.no2",
              type: "double"
            })
          );
          result.features.forEach(function (graphic) {
            graphic.setAttribute("view_latest_pollution.no2", graphic.getAttribute("no2"))
          });
          featureSet = result;
          console.log(featureSet);
          var params = {
            "hangzhouPollutionStation": featureSet
          };
          gp.submitJob(params).then(draw, errBack, progTest);

          function draw(result) {
            connsole.log(result)
          }

          function progTest(value) {
            console.log(value.jobStatus);
          }

          function errBack(err) {
            console.log("gp error: ", err);
          }
        });
      });
    }

    //----------------------------------
    // Chart
    //----------------------------------
    function updateChartInfo(stationId) {
      var chartData
      if (stationId != null) {
        request.post("./pollution/chart?id=" + stationId, {
          handleAs: "json"
        }).then(function (data) {
          /*var features = {
            "features": [{ "attributes": { "name": "111", "aqi": 32 } },
            { "attributes": { "name": "222", "aqi": 42 } }]
          };*/
          var features = { "features": [] }
          data.forEach(function (data) {
            features.features.push({ "attributes": { "time_point": getUnixTimestamp(getLocalTime(data.time_point)), "aqi": data.aqi, "full_time": formatFullDate(getLocalTime(data.time_point)) } })
          })
          var chart = new Cedar({ "type": "time" });
          var dataset = {
            "data": features,
            "mappings": {
              "time": { "field": "time_point", "label": "time" },
              "value": { "field": "aqi", "label": "aqi" },
              "sort": "full_time ASC",
            }
          };

          chart.dataset = dataset;

          chart.tooltip = {
            "title": "{full_time}",
            "content": "AQI: {aqi}"
          }

          chart.show({
            elementId: "#chart",
          });
        });
      }

      function getLocalTime(time) {
        return new Date(time);
      }

      function formatSimpleDate(date) {
        return locale.format(date, { selector: "time", timePattern: 'H' });
      };

      function formatFullDate(date) {
        return locale.format(date, { datePattern: 'yyyy-MM-d', timePattern: 'HH:mm' });
      };

      function getUnixTimestamp(date) {
        return date.getTime()
      }

    }
  });