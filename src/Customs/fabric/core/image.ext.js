

fabric.util.object.extend(fabric.Image.prototype, {
  // optionsOrder: fabric.util.a.build(fabric.Image.prototype.optionsOrder)
    // .before("loader","sourceRoot","thumbnailSourceRoot","fitting")
    // .after("crop")
    // .find("*").before("width","height").array,
  // eventListeners: fabric.util.o.clone(fabric.Object.prototype.eventListeners),
  filters: null,
  resizeFilters: null,
  originalSrc: null,
  color: "red",
  setData: function(data){
    // this.fitting = this.__proto__.fitting;
    this.setSrc(data.src);
  },
  loader: null,
  store_originalSrc: function () {
    return this._edited ? (this._original_src || this._originalElement && this._originalElement.src || this._element && this._element.src || this.src) : null;
  },
  setElementFromMenu: function (data) {
    this.setElement(data.image)
  },
  sourceRoot: "",
  thumbnailSourceRoot: "",
  store_filters: function () {
    if(!this.filters || !this.filters.length)return;
    return this.filters.filter(el=>(el.stored !== false)).map( filterObj => filterObj.toObject());
  },
  store_resizeFilters: function () {
    if(!this.resizeFilters || !this.resizeFilters.length)return;
    return this.resizeFilters.map( filterObj => filterObj.toObject());
  },
  // isOnACache: function() {
  //   return true;
  // },
  // _transformDone: true,
  fitting: "manual",
  fitImage: function () {
    if(this.fitting === "manual"){
      return;
    }
    let _w = this.width *this.scaleX;
    let _h = this.height *this.scaleY;

    let props = fabric.util.getProportions(this._element, {width: _w, height: _h}, this.fitting);

    let scaleX = this._element.width / _w * props.scaleX,
        scaleY = this._element.height / _h * props.scaleY;

    function round(value, precision) {
      let multiplier = Math.pow(10, precision || 0);
      return Math.round(value * multiplier) / multiplier;
    }

    if(round(scaleX,2) === 1 && round(scaleY,2) === 1){
      scaleX = 1;
      scaleY = 1;
    }

    this.setCrop({
      scaleX:scaleX,
      scaleY:scaleY
    })
  },
  _renderFill: function (ctx) {
    var elementToDraw = this._element;

    if (!elementToDraw) {return;}

    let sW, sH, sX, sY,
    w = this.width,
      h = this.height,
      x = -w / 2,
      y = -h / 2

    if(false){
      sW = Math.min(elementToDraw.naturalWidth || elementToDraw.width, w * this._filterScalingX);
      sH = Math.min(elementToDraw.naturalHeight || elementToDraw.height, h * this._filterScalingY);
      sX = Math.max(0, this.cropX * this._filterScalingX);
      sY = Math.max(0, this.cropY * this._filterScalingY);
    }else{
      sX = this.cropX * this._filterScalingX;
      sY = this.cropY * this._filterScalingY;
      sW = elementToDraw.width;
      sH = elementToDraw.height;
    }

    ctx.drawImage(elementToDraw, sX, sY, sW, sH, x, y, w, h);
    // if (this.crop) {
    //   this.drawEl.canvas = this.canvas;
    //   this.drawEl._element = this._element;
    //   // this.drawEl.render(ctx);
    //
    //   ctx.save();
    //   this.drawEl.transform(ctx);
    //   this.drawEl.drawObject(ctx);
    //   ctx.restore();
    //
    //
    // } else {
    //
    //   //render SVG as Paths GROUP
    //   if(false && this._objects){
    //     // for (let object of this._objects) {
    //     //   object.render(ctx);
    //     // }
    //   }
    //   else{
    //   }
    // }
  },
  setThumbnail: function (src) {
    if(!src || this.loaded)return;

    if(this.thumbnailSourceRoot) {
      src = fabric.util.getURL(src, this.thumbnailSourceRoot);
    }

    fabric.util.loadImage(src, img => {
      if(this.loaded)return;
      this._setElementOverwritten(img);
      this.fitImage();
      this.canvas && this.canvas.renderAll();
    });
  },
  setOriginalSrc(value) {
    this._edited = true;
    fabric.util.__sourceRoot = this.sourceRoot;
    fabric.util.loadImage(options.originalSrc, function (img) {
      this._originalElement = img;
    }.bind(this), this, this.crossOrigin); //todo
    delete fabric.util.__sourceRoot;
  },
  /**
   * Sets crossOrigin value (on an instance and corresponding image element)
   * @return {fabric.Image} thisArg
   * @chainable
   */
  setCrossOrigin: function (value) {
    this.crossOrigin = value;
    if (this._element) {
      this._element.crossOrigin = value;
    }
    return this;
  },
  _getElementSvgTransform() {
    if(!this.crop) {
      return "";
    }
    let crop = this.crop;

    let drawEl = new fabric.Image(this._element, {
      originX: "center",
      originY: "center",
      skewX: crop.skewX || 0,
      skewY: crop.skewY || 0,
      angle: crop.angle || 0,
      left: crop.left * this.width || 0,
      top: crop.top * this.height || 0,
      width: this.width,
      height: this.height,
      scaleX: crop.scaleX || 1,
      scaleY: crop.scaleY || 1,
    });
    drawEl.group = this;
    return drawEl.getSvgTransform();
  },
  /**
   * Returns SVG representation of an instance
   * @return {String} svg representation of an instance
   */
  _toSVG: function() {
    let x = -this.width / 2, y = -this.height / 2;
    //todo check if this is important
    let styles = this.getSvgStyles();


    let w, h;
    if(false){//use astandart behavior
      // we're essentially moving origin of transformation from top/left corner to the center of the shape
      // by wrapping it in container <g> element with actual transformation, then offsetting object to the top/left
      // so that object's center aligns with container's left/top
      w= this._element.width || this._element.naturalWidth;
      w= this._element.height || this._element.naturalHeight;
    }else{
      w=this.width;
      h=this.height;
    }

    let elementMarkup = `
      <image preserveAspectRatio="none"
        xlink:href="${this.getSvgSrc(true)}" x="${x - this.cropX}" y="${y - this.cropY}" style="${""/*styles*/}"
        width="${this.width}" height="${this.height}">
      </image>`;


    let shapeSvg, clipPathId;
    if(this.hasCrop()){
      shapeSvg = `<rect  x="${x}" y="${y}" width="${this.width}" height="${this.height}"/>`;
      clipPathId = fabric.Object.__uid++;
    }

    let shapeMarkup = "";
    if (this.stroke || this.strokeDashArray) {
      let origFill = this.fill;
      this.fill = null;
      shapeMarkup  = `<rect x="${x}" y="${y}" width="${this.width}" height="${this.height}" style="${this.getSvgStyles()}"/>`;
      this.fill = origFill;
    }

    let markup =`
      <g>
        ${this.paintFirst === 'stroke' ? shapeMarkup: ''}
        <g ${clipPathId ? `clip-path="url(#imageCrop_${ clipPathId })"` : "" }>
          <g COMMON_PARTS ${this._getElementSvgTransform()}>${elementMarkup}</g>
        </g>
        ${this.paintFirst === 'fill' ? shapeMarkup : ''}
        ${clipPathId ? `<clipPath id="imageCrop_${clipPathId}">${shapeSvg}</clipPath>` : ""}
      </g>`;

      return  [markup.substr(0,markup.indexOf("COMMON_PARTS")), "COMMON_PARTS", markup.substr(markup.indexOf("COMMON_PARTS") + 12)]
    }
});
