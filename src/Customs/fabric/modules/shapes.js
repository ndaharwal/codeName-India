


fabric.util.shapes = {
  move: function (path, x,y) {

    for (let inst of path) {
      switch (inst[0]) {
        case "M":
        case "L":
          inst[1] += x;
          inst[2] += y;
          break;
        case "C":
          //C x1 y1, x2 y2, x y (or c dx1 dy1, dx2 dy2, dx dy)
          inst[1]  += x;
          inst[3]  += x;
          inst[5]  += x;

          inst[2]  += y;
          inst[4]  += y;
          inst[6]  += y;
          break;
        case "S":
        case "Q":
          //S x2 y2, x y (or s dx2 dy2, dx dy)
          //Q x1 y1, x y (or q dx1 dy1, dx dy)
          inst[1] += x;
          inst[3] += x;
          inst[2] += y;
          inst[4] += y;
          break;
        case "A":
          //A rx ry x-axis-rotation large-arc-flag sweep-flag x y
          inst[1]  += x;
          inst[2] += y;
          inst[6]  += x;
          inst[7] += y;
          break;
        case "H":
          inst[1]  += x;
          break;
        case "V":
          inst[1]  += y;
          break;
      }
    }
    return path;
  },
  stretch: function (shape, options) {
    let _scale = options.width / shape.width;

    let _path = fabric.util.deepClone(shape.path);

    for (let inst of _path) {
      switch (inst[0]) {
        case "M":
        case "L":
        case "l":
          inst[1] *= _scale;
          inst[2] *= _scale;
          break;
        case "c":
        case "C":
          //C x1 y1, x2 y2, x y (or c dx1 dy1, dx2 dy2, dx dy)
          inst[1] *= _scale;
          inst[3] *= _scale;
          inst[5] *= _scale;

          inst[2] *= _scale;
          inst[4] *= _scale;
          inst[6] *= _scale;
          break;
        case "S":
        case "Q":
          //S x2 y2, x y (or s dx2 dy2, dx dy)
          //Q x1 y1, x y (or q dx1 dy1, dx dy)
          inst[1] *= _scale;
          inst[3] *= _scale;
          inst[2] *= _scale;
          inst[4] *= _scale;
          break;
        case "A":
          //A rx ry x-axis-rotation large-arc-flag sweep-flag x y
          inst[1] *= _scale;
          inst[2] *= _scale;
          inst[6] *= _scale;
          inst[7] *= _scale;
          break;
        case "H":
        case "h":
        case "V":
        case "v":
          inst[1] *= _scale;
          break;
      }
    }
    return _path;
  },
  parse(path) {
    return fabric.Path.prototype._parsePath.call({path: path.match(/[mzlhvcsqta][^mzlhvcsqta]*/gi)});
  },
  loadShape: function (shape, callback) {

    if (shape.src && shape.src.endsWith(".svg")) {
      fabric.loadSVGFromURL(shape.src, (paths, svgObjectOptions) => {
        shape.paths = paths;
        callback();
      })
    } else if (shape.src) {
      fabric.Pathfinder.getContours(shape.src, pathData => {
        shape.path = pathData;
        callback();
      });
    } else{
      callback();
    }
  },
  makePath: function (shape) {

    let path;
    if (shape.path) {
      path = shape.path;
    }
    else if (shape.paths) {
      let _fabric_shape = fabric.util.groupSVGElements(shape.paths, shape);
      //todo
      path = _fabric_shape.getCombinedPath();
    }
    if (shape.points) {
      path = fabric.util.shapes.polyline(shape);
    } else if (shape.radius) {
      path = fabric.util.shapes.roundedRect(shape);
    } else {
      path = fabric.util.shapes.rect(shape);
    }
    if (path.constructor === String) {
      return fabric.util.shapes.parse(path);
    } else {
      return path
    }
  },
  // create: function (shape, callback) {
  //   fabric.util.shapes.makePath(shape, (pathStringOrArray) => {
  //     // let stretchedPath = fabric.util.shapes.stretch(shape, options);
  //
  //     // let result = stretchedPath;
  //     callback && callback(shape.path);
  //     return shape.path;
  //   });
  // },

  /**
   * Generate Star-shape SVG Path
   * @param iR
   * @param oR
   * @param rays
   * @param startAngle
   * @param offsetX
   * @param offsetY
   * @returns {Array}
   */
  star: function (iR, oR, rays, startAngle, offsetX, offsetY) {
    let angle = Math.PI;
    let path = [];
    if (startAngle ) {
      angle += startAngle;
    }
    let step = 2 * Math.PI / (rays * 2);
    for (let i = 0; i < rays; i++) {
      path.push(Math.sin(angle) * oR + offsetX, Math.cos(angle) * oR + offsetY);
      angle += step;
      path.push(Math.sin(angle) * iR + offsetX, Math.cos(angle) * iR + offsetY);
      angle += step;
    }
    return path;
  },
  /**
   *
   * @param o {number,number,number,number}- offsets from top.right.bottom and left
   * @returns {string}
   //  */
  // innerRect: function(o) {
  //   return ['M', o[3], o[0], 'L', 100 - o[1], o[0], 'L', 100 - o[1], 100 - o[2], 'L', o[3], 100 - o[2], 'z'].join(" ");
  // },

  /**
   *
   * @param options.radius          [0,0,0,0,0,0,0,0]
   * @param options.radius_units   [1,1,1,1,1,1,1,1];
   * @param options.width
   * @param options.height
   * @returns {string}
   */
  rect: function (options) {
    let o = fabric.util.shapes._getOffsetsData(options);


    if(options.left){
      o.l += options.left;
    }

    if(options.top){
      o.t += options.top;
    }

    return `M ${o.l} ${o.t} h ${o.w} v ${o.h} h ${-o.w} z`;
  },
  _get_point(value, relativeWidth) {
    if (value < 0) {
      value = w - r - value;
    }
    else if (value > 1) {
      value += l;
    }
    else {
      value *= w;
    }
  },
  /**
   *
   * @param x
   * @param o {offsetsData}
   * @private
   */
  _getXPoint(x, o) {
    if(o.u === "mixed"){
      if (x < 0) return o.w - o.r - x; //absolute negative
      if (x > 1) return x + o.l; //absolute
      return x * o.w;
    }
    if(o.u === "absolute"){
      if (x < 0) return o.w - o.r - x;
      return x + o.l; //absolute
    }
    if(o.u === "relative"){
      return x * o.w;
    }
    if(o.u === "percents"){
      return x/100 * o.w;
    }
  },
  /**
   *
   * @param y
   * @param o {offsetsData}
   * @private
   */
  _getYPoint(y, o) {

    if(o.u === "mixed"){
      if (y < 0) return o.h - o.b - y;
      if (y > 1) return y + o.t;
      return y * o.h;
    }
    if(o.u === "absolute"){
      if (y < 0) return o.h - o.b - y;
      return y + o.t;
    }
    if(o.u === "relative"){
      return y * o.h;
    }
    if(o.u === "percents"){
      return y/100 * o.h;
    }
  },
  _getOffsetsData(options) {
    let o = options.offsets;
    let units = options.units || "mixed";
    if(!options.height){options.height = 100}
    if(!options.width){options.width = 100}
    if(!o){
      o = [0, 0, 0, 0];
    }
    else if(o.constructor === Number){
      o = [o, o, o, o]
    }
    else if(o.constructor === Object){
      o = [o.top || 0, o.right || 0, o.bottom || 0, o.left || 0]
    }


    let t, r, b, l;
    if(units === "mixed"){
      t = o[0] < 1 ? o[0] * options.height : o[0];
      r = o[1] < 1 ? o[1] * options.width : o[1];
      b = o[2] < 1 ? o[2] * options.height : o[2];
      l = o[3] < 1 ? o[3] * options.width : o[3];
    }else if(units === "absolute"){
      t = o[0];
      r = o[1];
      b = o[2];
      l = o[3];
    }else if(units === "relative"){
      t = o[0] * options.height;
      r = o[1] * options.width ;
      b = o[2] * options.height;
      l = o[3] * options.width ;
    }else if(units === "percents"){
      t = o[0]/100 * options.height;
      r = o[1]/100 * options.width ;
      b = o[2]/100 * options.height;
      l = o[3]/100 * options.width ;
    }


    let w = options.width - l - r,
        h = options.height - t - b;

    return {t: t, r: r, b: b, l: l, w: w, h: h, u: units}

  },
  /**
   *
   * @param options
   * @param options.offsets {Array<[top,right,bottom,left]>} - массив координат x ,y.   При величине <= 1, величина считается заданной в относительных координатах. todo роблема при оффсет = 1px
   * @param options.points {Array<number>} - массив координат x ,y.   При величине <= 1, величина считается заданной в относительных координатах. todo роблема при оффсет = 1px
   * @param options.height {number} - высота поля, описанного вокруг фигуры
   * @param options.width  {number}  - ширина поля, описанного вокруг фигуры
   * @returns {string}
   */
  polyline: function (options) {
    let offsetsData = fabric.util.shapes._getOffsetsData(options);
    let p = options.points.slice();

    //при 0<=x<=1 - относительные координаты/ >1 , <0 - абсолютные относительно ширины и высоты
    for (let i = 0; i < options.points.length; i += 2) {
      p[i] = fabric.util.shapes._getXPoint(p[i], offsetsData);
      p[i + 1] = fabric.util.shapes._getYPoint(p[i + 1], offsetsData);
    }

    let path = "M " + p[0] + " " + p[1];
    for (let i = 2; i < p.length; i += 2) {
      path += " L " + p[i] + " " + p[i + 1]
    }
    path += "z";
    return path;
  },
  /**
   *
   * @param options
   * @param options.points {Array<number>} - массив координат x ,y.   При величине <= 1, величина считается заданной в относительных координатах. todo роблема при оффсет = 1px
   * @param options.height {number} - высота поля, описанного вокруг фигуры
   * @param options.width  {number}  - ширина поля, описанного вокруг фигуры
   * @returns {string}
   */
  roundedRect: function (options) {
    let o = fabric.util.shapes._getOffsetsData(options);
    let br = options.radius;
    // let bru = options.radius_units || [1,1,1,1,1,1,1,1];
    // let o = options.offsets || [0,0,0,0];

    if (br.constructor === Number) {
      br = [br, br, br, br, br, br, br, br]
    }
    // if(bru.constructor === Number){
    //   bru = [bru,bru,bru,bru,bru,bru,bru,bru]
    // }

    var x1 = o.l, y1 = o.t;
    var x2 = options.width - o.r, y2 = options.height - o.b;
    // let s = {
    //   "top-left-h":     fabric.util.shapes._getYPoint( br[0],o), //br[0] * (bru[0] ? h / 100 : 1) + o[0],
    //   "top-left-w":     fabric.util.shapes._getXPoint( br[1],o) , //br[1] * (bru[1] ? w / 100 : 1) + o[1],
    //   "top-right-h":    fabric.util.shapes._getYPoint( br[2],o), //br[2] * (bru[2] ? h / 100 : 1) + o[0],
    //   "top-right-w":    o.w - fabric.util.shapes._getXPoint(br[3],o), //br[3] * (bru[3] ? w / 100 : 1) + o[1],
    //
    //   "bottom-right-w": o.w - fabric.util.shapes._getXPoint(br[4],o), //br[4] * (bru[4] ? w / 100 : 1) + o[1],
    //   "bottom-right-h": o.h - fabric.util.shapes._getYPoint(br[5],o), //br[5] * (bru[5] ? h / 100 : 1) + o[0],
    //   "bottom-left-w":  fabric.util.shapes._getXPoint( br[6],o), //br[6] * (bru[6] ? w / 100 : 1) + o[1],
    //   "bottom-left-h":  o.h - fabric.util.shapes._getYPoint(br[7],o), //br[7] * (bru[7] ? h / 100 : 1) + o[0]
    // };

    // return [
    //   "M", x1, s["top-left-h"],
    //   "C", x1, s["top-left-h"], x1, y1, s["top-left-w"], y1,
    //   "H", s["top-right-w"],
    //   "C", s["top-right-w"], y1, x2, y1, x2, s["top-right-h"],
    //   "V", s["bottom-right-h"],
    //   "C", x2, s["bottom-right-h"], x2, y2, s["bottom-right-w"], y2,
    //   "H", s["bottom-left-w"],
    //   "C", s["bottom-left-w"], y2, x1, y2, x1, s["bottom-left-h"],
    //   "Z"
    // ].join(" ");
      let height = o.h, width = o.w;
      var s = {
        "top-left-h":     fabric.util.shapes._getYPoint( br[0],o),//* height,
        "top-left-w":     fabric.util.shapes._getXPoint( br[1],o),//* width ,
        "top-right-h":    fabric.util.shapes._getYPoint( br[2],o),//* height,
        "top-right-w":    fabric.util.shapes._getXPoint( br[3],o),//* width ,
        "bottom-right-w": fabric.util.shapes._getXPoint( br[4],o),//* width ,
        "bottom-right-h": fabric.util.shapes._getYPoint( br[5],o),//* height,
        "bottom-left-w":  fabric.util.shapes._getXPoint( br[6],o),//* width ,
        "bottom-left-h":  fabric.util.shapes._getYPoint( br[7],o),// * height
      };

      let path = [
        ["M", 0, s["top-left-h"]],
        ["C", 0, s["top-left-h"], 0, 0,s["top-left-w"], 0],
        ["H", width - s["top-right-w"]],
        ["C", width - s["top-right-w"], 0, width, 0, width, s["top-right-h"]],
        ["V", height - s["bottom-right-h"]],
        ["C", width, height - s["bottom-right-h"], width, height, width - s["bottom-right-w"], height],
        ["H", s["bottom-left-w"]],
        ["C", s["bottom-left-w"], height, 0, height, 0, height - s["bottom-left-h"]],
        ["Z"]
      ];

      fabric.util.shapes.move(path,o.l,o.t);

      if(options.left || options.top){
        fabric.util.shapes.move(path,options.left || 0, options.top || 0);
      }

      return path.join(" ");
  }
}
