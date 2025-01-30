fabric.Object.prototype.setGradient = function (property, options) {
  options || (options = {});

  var gradient = { colorStops: [] };

  gradient.type =
    options.type || (options.r1 || options.r2 ? "radial" : "linear");

  gradient.coords = options.coords || {
    x1: options.x1,
    y1: options.y1,
    x2: options.x2,
    y2: options.y2,
  };

  if (options.r1 || options.r2) {
    gradient.coords.r1 = options.r1;
    gradient.coords.r2 = options.r2;
  }

  gradient.gradientTransform = options.gradientTransform;

  if (options.colorStops.constructor === Array) {
    gradient.colorStops = options.colorStops;
  } else {
    fabric.Gradient.prototype.addColorStop.call(gradient, options.colorStops);
  }
  return this.set(property, fabric.Gradient.forObject(this, gradient));
};

/**
 * @private
 */
fabric.StaticCanvas.prototype.creatorString = "Created By IndiaFont";

fabric.util.object.extend(fabric.Text.prototype, {
  exportAsPath: true,
});

fabric.util.object.extend(fabric.IText.prototype, {
  exportAsPath: true,
});

var multiplyMatrices = fabric.util.multiplyTransformMatrices;

fabric.util.object.extend(fabric.Object.prototype, {
  cornerSize: 7,
  transparentCorners: false,
  cornerColor: "rgba(0,0,0,0.5)",
  cornerStrokeColor: "rgba(0,0,0,0.5)",
  // objectCaching: false
});

fabric.util.observable(fabric.Observable);
fabric.util.observable(fabric.Object.prototype);
fabric.util.observable(fabric.IText.prototype);
fabric.util.observable(fabric.Textbox.prototype);
fabric.util.observable(fabric.Image.prototype);
fabric.util.observable(fabric.StaticCanvas.prototype);
fabric.util.observable(fabric.Canvas.prototype);
fabric.util.observable(fabric);
fabric.Frame.prototype.toObject = fabric.Frame.prototype.storeObject;

let TEXT_OUTSIDE_CACHE_AREA = 4;
let ALIASING_LIMIT = 2;
fabric.Object.prototype._getCacheCanvasDimensions = function () {
  let zoom = (this.canvas && this.canvas.getZoom()) || 1,
    objectScale = this.getObjectScaling(),
    retina =
      this.canvas && this.canvas._isRetinaScaling()
        ? fabric.devicePixelRatio
        : 1,
    dim = this._getNonTransformedDimensions(),
    zoomX = Math.abs(objectScale.scaleX * zoom * retina),
    zoomY = Math.abs(objectScale.scaleY * zoom * retina),
    width = Math.abs(dim.x * zoomX) * TEXT_OUTSIDE_CACHE_AREA,
    height = Math.abs(dim.y * zoomY) * TEXT_OUTSIDE_CACHE_AREA;
  return {
    // for sure this ALIASING_LIMIT is slightly crating problem
    // in situation in wich the cache canvas gets an upper limit
    width: width + ALIASING_LIMIT,
    height: height + ALIASING_LIMIT,
    zoomX: zoomX,
    zoomY: zoomY,
    x: dim.x,
    y: dim.y,
  };
};
fabric.DPI = 72;
fabric.Object.prototype.rasterizeSvgShadow = true;
fabric.Object.prototype.svgShadowPadding = 0;
fabric.Text.prototype.svgShadowPadding = 200;

$(document).ready(function () {
  canvas._isUniscalePossible = function (e, target) {
    if (target.type == "i-text" || target.type == "activeSelection")
      return (
        (e[this.uniScaleKey] || this.uniScaleTransform) &&
        !target.get("lockUniScaling")
      );
    else
      return !(
        (e[this.uniScaleKey] || this.uniScaleTransform) &&
        !target.get("lockUniScaling")
      );
  };

  canvas.on("object:modified", function (event) {
    if (event.target.type === "photo") return; //do not store cropping modifications
    save();
  });

  canvas.offsets = {
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  };

  canvas.getObjectByID = function (_id) {
    if (this._objects) {
      for (let o of this._objects) {
        if (o.id === _id) {
          return o;
        }
      }
    }
    return null;
  };

  canvas.setSnapping(true);

  canvas.on("before:render", function () {
    if (canvas._shouldBeCleared) {
      this.clearContext(this.contextTop);
      delete canvas._shouldBeCleared;
    }
  });

  canvas.on("before:render", function () {
    if (this.renderSnappingHelperLines && this.snapTo) {
      this.renderSnapping(this.snapTo, "#ffaaaa");
      canvas._shouldBeCleared = true;
    }
  });

  /**
   * Clear char widths cache for a font family.
   * @memberOf fabric.util
   * @param {String} [fontFamily] font family to clear
   */
  fabric.util.clearFabricFontCache = function (fontFamily) {
    var fontfmly = fontFamily.toLowerCase(); //modified
    if (!fontfmly) {
      fabric.charWidthsCache = {};
    } else if (fabric.charWidthsCache[fontfmly]) {
      delete fabric.charWidthsCache[fontfmly];
    }
  };

  canvas.on(fabric.Canvas.prototype.eventListeners);
});
