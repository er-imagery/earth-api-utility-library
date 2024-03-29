/*
Copyright 2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/** @ignore */
GEarthExtensions.prototype.dom.buildFeature_ = domBuilder_({
  propertySpec: {
    name: AUTO_,
    visibility: AUTO_,
    description: AUTO_,
    snippet: AUTO_,
    
    // allowed properties
    region: ALLOWED_
  },
  constructor: function(featureObj, options) {
    if (options.region) {
      featureObj.setRegion(this.dom.buildRegion(options.region));
    }
  }
});

/**
 * Creates a new placemark with the given parameters.
 * @function
 * @param {Object} options The parameters of the placemark to create.
 * @param {String} [options.name] The name of the feature.
 * @param {Boolean} [options.visibility] Whether or not the feature should
 *     be visible.
 * @param {String} [options.description] An HTML description for the feature;
 *     may be used as balloon text.
 * @param {PointOptions|KmlPoint} [options.point] A point geometry to use in the
 *     placemark.
 * @param {LineStringOptions|KmlLineString} [options.lineString] A line string
 *     geometry to use in the placemark.
 * @param {LinearRingOptions|KmlLinearRing} [options.linearRing] A linear ring
 *     geometry to use in the placemark.
 * @param {PolygonOptions|KmlPolygon} [options.polygon] A polygon geometry to
 *     use in the placemark.
 * @param {ModelOptions|KmlModel} [options.model] A model geometry to use
 *     in the placemark.
 * @param {MultiGeometryOptions|KmlMultiGeometry} [options.multiGeometry] A
 *     multi-geometry to use in the placemark.
 * @param {KmlGeometry[]} [options.geometries] An array of geometries to add
 *     to the placemark.
 * @param {KmlAltitudeModeEnum} [options.altitudeMode] A convenience property
 *     for the placemark geometry's altitude mode.
 * @param {String} [options.stockIcon] A convenience property to set the
 *     point placemark's icon to a stock icon, e.g. 'paddle/wht-blank'.
 *     Stock icons reside under 'http://maps.google.com/mapfiles/kml/...'.
 * @param {StyleOptions|KmlStyleSelector} [options.style] The style to use for
 *     this placemark. See also GEarthExtensions.dom.buildStyle.
 * @param {StyleOptions|KmlStyleSelector} [options.highlightStyle] The
 *     highlight style to use for this placemark. If this option is used, the
 *     style and highlightStyle form a style map.
 * @param {IconStyleOptions} [options.icon] A convenience property to build the
 *     point placemark's icon style from the given options.
 * @param {String} [options.stockIcon] A convenience property to set the
 *     point placemark's icon to a stock icon, e.g. 'paddle/wht-blank'.
 *     Stock icons reside under 'http://maps.google.com/mapfiles/kml/...'.
 * @type KmlPlacemark
 */
GEarthExtensions.prototype.dom.buildPlacemark = domBuilder_({
  apiInterface: 'KmlPlacemark',
  base: GEarthExtensions.prototype.dom.buildFeature_,
  apiFactoryFn: 'createPlacemark',
  propertySpec: {
    // allowed geometries
    point: ALLOWED_,
    lineString: ALLOWED_,
    linearRing: ALLOWED_,
    polygon: ALLOWED_,
    model: ALLOWED_,
    geometries: ALLOWED_,
    
    // convenience (pass through to geometry)
    altitudeMode: ALLOWED_,
    
    // styling
    stockIcon: ALLOWED_,
    icon: ALLOWED_,
    style: ALLOWED_,
    highlightStyle: ALLOWED_
  },
  constructor: function(placemarkObj, options) {
    // geometries
    var geometries = [];
    if (options.point) {
      geometries.push(this.dom.buildPoint(options.point));
    }
    if (options.lineString) {
      geometries.push(this.dom.buildLineString(options.lineString));
    }
    if (options.linearRing) {
      geometries.push(this.dom.buildLinearRing(options.linearRing));
    }
    if (options.polygon) {
      geometries.push(this.dom.buildPolygon(options.polygon));
    }
    if (options.model) {
      geometries.push(this.dom.buildModel(options.model));
    }
    if (options.multiGeometry) {
      geometries.push(this.dom.buildMultiGeometry(options.multiGeometry));
    }
    if (options.geometries) {
      geometries = geometries.concat(options.geometries);
    }
  
    if (geometries.length > 1) {
      placemarkObj.setGeometry(this.dom.buildMultiGeometry(geometries));
    } else if (geometries.length == 1) {
      placemarkObj.setGeometry(geometries[0]);
    }
  
    // set styles
    if (options.stockIcon) {
      options.icon = options.icon || {};
      options.icon.stockIcon = options.stockIcon;
    }
  
    if (options.icon) {
      if (!options.style) {
        options.style = {};
      }
    
      options.style.icon = options.icon;
    }
    
    // convenience
    if ('altitudeMode' in options) {
      placemarkObj.getGeometry().setAltitudeMode(options.altitudeMode);
    }
  
    // NOTE: for this library, allow EITHER a style or a styleUrl, not both..
    // if you want both, you'll have to do it manually
    if (options.style) {
      if (options.highlightStyle) {
        // style map
        var styleMap = this.pluginInstance.createStyleMap('');
      
        // set normal style
        if (typeof options.style == 'string') {
          styleMap.setNormalStyleUrl(options.style);
        } else {
          styleMap.setNormalStyle(this.dom.buildStyle(options.style));
        }
      
        // set highlight style
        if (typeof options.highlightStyle == 'string') {
          styleMap.setHighlightStyleUrl(options.highlightStyle);
        } else {
          styleMap.setHighlightStyle(this.dom.buildStyle(
              options.highlightStyle));
        }
      
        // assign style map
        placemarkObj.setStyleSelector(styleMap);
      } else {
        // single style
        if (typeof options.style == 'string') {
          placemarkObj.setStyleUrl(options.style);
        } else {
          placemarkObj.setStyleSelector(this.dom.buildStyle(options.style));
        }
      }
    }
  }
});
//#BEGIN_TEST
function test_dom_buildPlacemark() {
  // TODO: make this the best unit test it possibly can be!
  var placemark = testext_.dom.buildPlacemark({
    name: 'foo',
    point: [37, -122],
    lineString: [[0, 0], [1, 1]],
    stockIcon: 'paddle/blu-circle',
    style: {
      line: '#00f'
    }
  });
  
  assertEquals('KmlMultiGeometry', placemark.getGeometry().getType());
  assertEquals('foo', placemark.getName());
  
  var geoms = placemark.getGeometry().getGeometries();
  assertEquals('KmlPoint', geoms.getChildNodes().item(0).getType());
  assertEquals('KmlLineString', geoms.getChildNodes().item(1).getType());
  
  assertEquals(37, geoms.getChildNodes().item(0).getLatitude());
  assertEquals(-122, geoms.getChildNodes().item(0).getLongitude());
  
  assertEquals(0, geoms.getChildNodes().item(1).getCoordinates().
      get(0).getLatitude());
  assertEquals(0, geoms.getChildNodes().item(1).getCoordinates().
      get(0).getLongitude());
  assertEquals(1, geoms.getChildNodes().item(1).getCoordinates().
      get(1).getLatitude());
  assertEquals(1, geoms.getChildNodes().item(1).getCoordinates().
      get(1).getLongitude());
}

function test_dom_buildPlacemark_styles() {
  testext_.dom.buildStyle({
      id: 'test1', icon: { stockIcon: 'paddle/wht-blank' }});
  
  testext_.dom.buildStyle({
      id: 'test2', icon: { stockIcon: 'paddle/wht-blank' }});
  
  // test a stylemap with shared style pair values
  var placemark = testext_.dom.buildPointPlacemark([37, -122], {
    style: '#test1',
    highlightStyle: '#test2'
  });
  
  assertEquals('KmlStyleMap', placemark.getStyleSelector().getType());
  assertEquals('#test1', placemark.getStyleSelector().getNormalStyleUrl());
  assertEquals('#test2', placemark.getStyleSelector().getHighlightStyleUrl());
  
  // test stock icons and inline highlight styles
  placemark = testext_.dom.buildPointPlacemark([37, -122], {
    style: { icon: { stockIcon: 'paddle/blu-circle', scale: 2.0 } },
    highlightStyle: { icon: { stockIcon: 'paddle/red-circle', scale: 2.5 } }
  });
  
  assertEquals('KmlStyleMap', placemark.getStyleSelector().getType());
  assertEquals('KmlStyle', placemark.getStyleSelector().
      getNormalStyle().getType());
  assertEquals('KmlStyle', placemark.getStyleSelector().
      getHighlightStyle().getType());
  if (placemark.getStyleSelector().getNormalStyle().getIconStyle().
      getIcon().getHref().indexOf('paddle/blu-circle') < 0) {
    fail('Stock icon was not properly set');
  }
  assertEquals(2.0, placemark.getStyleSelector().getNormalStyle().
      getIconStyle().getScale());
  assertEquals(2.5, placemark.getStyleSelector().getHighlightStyle().
      getIconStyle().getScale());
  
  // test label style
  placemark = testext_.dom.buildPointPlacemark([37, -122], {
    style: { label: { scale: 5 } }
  });

  assertEquals('KmlStyle', placemark.getStyleSelector().getType());
  assertEquals(5.0, placemark.getStyleSelector().getLabelStyle().getScale());
      
  // test poly style
  placemark = testext_.dom.buildPolygonPlacemark([ [0,0], [0,1], [1,1] ], {
    style: { poly: { color: '#06f', fill: true, outline: true } }
  });
  
  assertEquals('KmlStyle', placemark.getStyleSelector().getType());
  assertTrue(placemark.getStyleSelector().getPolyStyle().getFill() ?
             true : false);
  assertTrue(placemark.getStyleSelector().getPolyStyle().getOutline() ?
             true : false);
  assertEquals('ffff6600',
      placemark.getStyleSelector().getPolyStyle().getColor().get());

  // test line style
  placemark = testext_.dom.buildLineStringPlacemark([ [0,0], [0,1], [1,1] ], {
    style: { line: { color: '#fc6', width: 5 } }
  });

  assertEquals('KmlStyle', placemark.getStyleSelector().getType());
  assertEquals(5.0, placemark.getStyleSelector().getLineStyle().getWidth());
  assertEquals('ff66ccff',
      placemark.getStyleSelector().getLineStyle().getColor().get());
}
//#END_TEST

/**
 * Convenience method to build a point placemark.
 * @param {PointOptions|KmlPoint} point The point geometry.
 * @param {Object} options The parameters of the placemark to create.
 * @see GEarthExtensions#dom.buildPlacemark
 * @function
 */
GEarthExtensions.prototype.dom.buildPointPlacemark = domBuilder_({
  base: GEarthExtensions.prototype.dom.buildPlacemark,
  defaultProperty: 'point'
});

/**
 * Convenience method to build a linestring placemark.
 * @param {LineStringOptions|KmlLineString} lineString The line string geometry.
 * @param {Object} options The parameters of the placemark to create.
 * @see GEarthExtensions#dom.buildPlacemark
 * @function
 */
GEarthExtensions.prototype.dom.buildLineStringPlacemark = domBuilder_({
  base: GEarthExtensions.prototype.dom.buildPlacemark,
  defaultProperty: 'lineString'
});

/**
 * Convenience method to build a polygon placemark.
 * @param {PolygonOptions|KmlPolygon} polygon The polygon geometry.
 * @param {Object} options The parameters of the placemark to create.
 * @see GEarthExtensions#dom.buildPlacemark
 * @function
 */
GEarthExtensions.prototype.dom.buildPolygonPlacemark = domBuilder_({
  base: GEarthExtensions.prototype.dom.buildPlacemark,
  defaultProperty: 'polygon'
});


/**
 * Creates a new network link with the given parameters.
 * @function
 * @param {LinkOptions} [link] An object describing the link to use for this
 *     network link.
 * @param {Object} options The parameters of the network link to create.
 * @param {String} [options.name] The name of the feature.
 * @param {Boolean} [options.visibility] Whether or not the feature should
 *     be visible.
 * @param {String} [options.description] An HTML description for the feature;
 *     may be used as balloon text.
 * @param {LinkOptions} [options.link] The link to use.
 * @param {Boolean} [options.flyToView] Whether or not to fly to the default
 *     view of the network link'd content.
 * @param {Boolean} [options.refreshVisibility] Whether or not a refresh should
 *     reset the visibility of child features.
 * @type KmlNetworkLink
 */
GEarthExtensions.prototype.dom.buildNetworkLink = domBuilder_({
  apiInterface: 'KmlNetworkLink',
  base: GEarthExtensions.prototype.dom.buildFeature_,
  apiFactoryFn: 'createNetworkLink',
  defaultProperty: 'link',
  propertySpec: {
    link: ALLOWED_,
    
    // auto properties
    flyToView: AUTO_,
    refreshVisibility: AUTO_
  },
  constructor: function(networkLinkObj, options) {
    if (options.link) {
      networkLinkObj.setLink(this.dom.buildLink(options.link));
    }
  }
});
// TODO: unit tests

/** @ignore */
GEarthExtensions.prototype.dom.buildContainer_ = domBuilder_({
  base: GEarthExtensions.prototype.dom.buildFeature_,
  propertySpec: {
    children: ALLOWED_
  },
  constructor: function(containerObj, options) {
    // children
    if (options.children) {
      for (var i = 0; i < options.children.length; i++) {
        containerObj.getFeatures().appendChild(options.children[i]);
      }
    }  
  }
});

/**
 * Creates a new folder with the given parameters.
 * @function
 * @param {KmlFeature[]} [children] The children of this folder.
 * @param {Object} options The parameters of the folder to create.
 * @param {String} [options.name] The name of the feature.
 * @param {Boolean} [options.visibility] Whether or not the feature should
 *     be visible.
 * @param {String} [options.description] An HTML description for the feature;
 *     may be used as balloon text.
 * @param {KmlFeature[]} [options.children] The children of this folder.
 * @type KmlFolder
 */
GEarthExtensions.prototype.dom.buildFolder = domBuilder_({
  apiInterface: 'KmlFolder',
  base: GEarthExtensions.prototype.dom.buildContainer_,
  apiFactoryFn: 'createFolder',
  defaultProperty: 'children'
});
// TODO: unit tests

/**
 * Creates a new document with the given parameters.
 * @function
 * @param {KmlFeature[]} [children] The children of this document.
 * @param {Object} options The parameters of the document to create.
 * @param {String} [options.name] The name of the feature.
 * @param {Boolean} [options.visibility] Whether or not the feature should
 *     be visible.
 * @param {String} [options.description] An HTML description for the feature;
 *     may be used as balloon text.
 * @param {KmlFeature[]} [options.children] The children of this document.
 * @type KmlDocument
 */
GEarthExtensions.prototype.dom.buildDocument = domBuilder_({
  apiInterface: 'KmlDocument',
  base: GEarthExtensions.prototype.dom.buildContainer_,
  apiFactoryFn: 'createDocument',
  defaultProperty: 'children'
});
// TODO: unit tests

/** @ignore */
GEarthExtensions.prototype.dom.buildOverlay_ = domBuilder_({
  base: GEarthExtensions.prototype.dom.buildFeature_,
  propertySpec: {
    color: ALLOWED_,
    icon: ALLOWED_,
    
    // auto properties
    drawOrder: AUTO_
  },
  constructor: function(overlayObj, options) {
    // color
    if (options.color) {
      overlayObj.getColor().set(this.util.parseColor(options.color));
    }
  
    // icon
    if (options.icon) {
      var icon = this.pluginInstance.createIcon('');
      overlayObj.setIcon(icon);
    
      if (typeof options.icon == 'string') {
        // default just icon href
        icon.setHref(options.icon);
      }
    }
  }
});

/**
 * Creates a new ground overlay with the given parameters.
 * @function
 * @param {String} [icon] The URL of the overlay image.
 * @param {Object} options The parameters of the ground overlay to create.
 * @param {String} [options.name] The name of the feature.
 * @param {Boolean} [options.visibility] Whether or not the feature should
 *     be visible.
 * @param {String} [options.description] An HTML description for the feature.
 * @param {String} [options.color] A color to apply on the overlay.
 * @param {String} [options.icon] The URL of the overlay image.
 * @param {Number} [options.drawOrder] The drawing order of the overlay;
 *     overlays with higher draw orders appear on top of those with lower
 *     draw orders.
 * @param {Number} [options.altitude] The altitude of the ground overlay, in
 *     meters.
 * @param {KmlAltitudeModeEnum} [options.altitudeMode] The altitude mode of the
 *     ground overlay.
 * @param {Object} options.box The bounding box for the overlay.
 * @param {Number} options.box.north The north latitude for the overlay.
 * @param {Number} options.box.east The east longitude for the overlay.
 * @param {Number} options.box.south The south latitude for the overlay.
 * @param {Number} options.box.west The west longitude for the overlay.
 * @param {Number} [options.box.rotation] The rotation, in degrees, of the
 *     overlay.
 * @type KmlGroundOverlay
 */
GEarthExtensions.prototype.dom.buildGroundOverlay = domBuilder_({
  apiInterface: 'KmlGroundOverlay',
  base: GEarthExtensions.prototype.dom.buildOverlay_,
  apiFactoryFn: 'createGroundOverlay',
  defaultProperty: 'icon',
  propertySpec: {
    // required properties
    box: REQUIRED_,
    
    // auto properties
    altitude: AUTO_,
    altitudeMode: AUTO_
  },
  constructor: function(groundOverlayObj, options) {
    if (options.box) {
      // TODO: exception if any of the options are missing
      var box = this.pluginInstance.createLatLonBox('');
      box.setBox(options.box.north, options.box.south,
                 options.box.east, options.box.west,
                 options.box.rotation ? options.box.rotation : 0);
      groundOverlayObj.setLatLonBox(box);
    }
  }
});
//#BEGIN_TEST
function test_dom_buildGroundOverlay() {
  var groundOverlay = testext_.dom.buildGroundOverlay({
    name: 'foo',
    icon: 'http://earth-api-samples.googlecode.com/svn/trunk/examples/' +
          'static/texture0.png',
    drawOrder: 2,
    box: {
      north: 1,
      east: 1,
      south: -1,
      west: -1,
      rotation: 45
    },
    altitudeMode: testplugin_.ALTITUDE_RELATIVE_TO_GROUND,
    altitude: 100000
  });
  
  assertEquals('KmlGroundOverlay', groundOverlay.getType());
  assertEquals('foo', groundOverlay.getName());
  
  if (groundOverlay.getIcon().getHref().indexOf('texture0.png') < 0) {
    fail('Ground overlay was not assigned an image/icon');
  }
  
  assertEquals(2, groundOverlay.getDrawOrder());
  assertEquals(1, groundOverlay.getLatLonBox().getNorth());
  assertEquals(1, groundOverlay.getLatLonBox().getEast());
  assertEquals(-1, groundOverlay.getLatLonBox().getSouth());
  assertEquals(-1, groundOverlay.getLatLonBox().getWest());
  assertEquals(45, groundOverlay.getLatLonBox().getRotation());
        
  assertEquals(testplugin_.ALTITUDE_RELATIVE_TO_GROUND,
      groundOverlay.getAltitudeMode());
  assertEquals(100000, groundOverlay.getAltitude());
}
//#END_TEST



/**
 * Creates a new screen overlay with the given parameters.
 * @function
 * @param {String} [icon] The URL of the overlay image.
 * @param {Object} options The parameters of the screen overlay to create.
 * @param {String} [options.name] The name of the feature.
 * @param {Boolean} [options.visibility] Whether or not the feature should
 *     be visible.
 * @param {String} [options.description] An HTML description for the feature.
 * @param {String} [options.color] A color to apply on the overlay.
 * @param {String} [options.icon] The URL of the overlay image.
 * @param {Number} [options.drawOrder] The drawing order of the overlay;
 *     overlays with higher draw orders appear on top of those with lower
 *     draw orders.
 * @param {Vec2Src} [options.overlayXY] The registration point in the overlay
 *     that will be placed at the given screenXY point and potentially
 *     rotated about. This object will be passed to
 *     GEarthExtensions#dom.setVec2. The default is the top left of the overlay.
 *     Note that the behavior of overlayXY in GEarthExtensions is KML-correct;
 *     whereas in the Earth API overlayXY and screenXY are swapped.
 * @param {Vec2Src} options.screenXY The position in the plugin window
 *     that the screen overlay should appear at. This object will
 *     be passed to GEarthExtensions#dom.setVec2.
 *     Note that the behavior of overlayXY in GEarthExtensions is KML-correct;
 *     whereas in the Earth API overlayXY and screenXY are swapped.
 * @param {Vec2Src} options.size The size of the overlay. This object will
 *     be passed to GEarthExtensions#dom.setVec2.
 * @param {KmlAltitudeModeEnum} [options.altitudeMode] The altitude mode of the
 *     ground overlay.
 * @param {Number} [options.rotation] The rotation of the overlay, in degrees.
 * @type KmlScreenOverlay
 */
GEarthExtensions.prototype.dom.buildScreenOverlay = domBuilder_({
  apiInterface: 'KmlScreenOverlay',
  base: GEarthExtensions.prototype.dom.buildOverlay_,
  apiFactoryFn: 'createScreenOverlay',
  defaultProperty: 'icon',
  propertySpec: {
    // required properties
    screenXY: REQUIRED_,
    size: REQUIRED_,

    // auto properties
    rotation: AUTO_,

    // optional properties
    overlayXY: { left: 0, top: 0 },
    rotationXY: ALLOWED_
  },
  constructor: function(screenOverlayObj, options) {
    // NOTE: un-swapped overlayXY and screenXY.
    this.dom.setVec2(screenOverlayObj.getScreenXY(), options.overlayXY);
    this.dom.setVec2(screenOverlayObj.getOverlayXY(), options.screenXY);
    this.dom.setVec2(screenOverlayObj.getSize(), options.size);

    if ('rotationXY' in options) {
      this.dom.setVec2(screenOverlayObj.getRotationXY(), options.rotationXY);
    }
  }
});
// TODO: unit tests

/**
 * @name GEarthExtensions#dom.addPlacemark
 * Convenience method that calls GEarthExtensions#dom.buildPlacemark and adds
 * the created placemark to the Google Earth Plugin DOM.
 * @function
 */
var autoDomAdd_ = ['Placemark', 'PointPlacemark', 'LineStringPlacemark',
                   'PolygonPlacemark', 'Folder', 'NetworkLink',
                   'GroundOverlay', 'ScreenOverlay', 'Style'];
for (var i = 0; i < autoDomAdd_.length; i++) {
  GEarthExtensions.prototype.dom['add' + autoDomAdd_[i]] =
    function(shortcutBase) {
      return function() {
        var obj = this.dom['build' + shortcutBase].apply(null, arguments);
        this.pluginInstance.getFeatures().appendChild(obj);
        return obj;
      };
  }(autoDomAdd_[i]); // escape closure
}