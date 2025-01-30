fabric.util.svgMediaRoot = "";

fabric._.extend(fabric.StaticCanvas.prototype, {
  creatorString: `Created with Fabric.js ${fabric.version}`,
  /**
   * @private
   */
  _setSVGHeader: function(markup, options) {
    let width = options.width || this.width,
      height = options.height || this.height,
      vpt, viewBox = 'viewBox="0 0 ' + this.width + ' ' + this.height + '" ',
      NUM_FRACTION_DIGITS = fabric.Object.NUM_FRACTION_DIGITS;

    if (options.viewBox) {
      viewBox = 'viewBox="' +
        options.viewBox.x + ' ' +
        options.viewBox.y + ' ' +
        options.viewBox.width + ' ' +
        options.viewBox.height + '" ';
    }
    else {
      if (this.svgViewportTransformation) {
        vpt = this.viewportTransform;
        viewBox = 'viewBox="' +
          fabric.util.toFixed(-vpt[4] / vpt[0], NUM_FRACTION_DIGITS) + ' ' +
          fabric.util.toFixed(-vpt[5] / vpt[3], NUM_FRACTION_DIGITS) + ' ' +
          fabric.util.toFixed(this.width / vpt[0], NUM_FRACTION_DIGITS) + ' ' +
          fabric.util.toFixed(this.height / vpt[3], NUM_FRACTION_DIGITS) + '" ';
      }
    }

    markup.push(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
            version="1.1" xml:space="preserve" 
            width="${width}" height="${height}" ${viewBox}>
        <desc>${this.creatorString}</desc>
        <defs>
          ${this.createSVGFontFacesMarkup()}
          ${this.createSVGRefElementsMarkup()}
          ${this.createSVGClipPathMarkup(options)}
        </defs>`
    );
  },
  _toSVG_overwritten: fabric.StaticCanvas.prototype.toSVG,
  suppressPreamble: true,
  toSVG: function(options, reviver) {
    let _w = this.width, _h = this.height;
    if(this.originalWidth){
      this.svgViewportTransformation = false;
      this.width = this.originalWidth;
      this.height = this.originalHeight;
    }

    options || (options = { });

    let markup = [];

    if(!this.suppressPreamble){
      this._setSVGPreamble(markup, options);
    }
    this._setSVGHeader(markup, options);
    markup.push(this.getSVGBody(options, reviver));

    markup.push('</svg>');

    if(this.originalWidth){
      this.width = _w;
      this.height = _h;
    }
    return markup.join('');
  },
  _setSVGLayers(markup, reviver){
    let forExport = true;
    for(let layerName of this.renderOrder){
      let l = this.layers[layerName];
      if(!l)continue;
      if(l.visible === false || (forExport && !l.export)){
        continue;
      }
      l.renderSvg(markup, reviver);
    }
  },
  getSVGBody(options,reviver){

    let _w = this.width,
      _h = this.height;

    if(this.originalWidth){
      this.width = this.originalWidth;
      this.height = this.originalHeight;
    }
    options = options || {};

    let scaleX = options.scaleX || (options.width ? options.width / this.width : 1),
      scaleY = options.scaleY || (options.height ? options.height / this.height : 1),
      _l = (options.left || 0),
      _t = (options.top || 0) ,
      angle = (options.angle || 0) ,
      clipPath = "";

    if(options.clipPath){
      clipPath = `clip-path: url(#${options.clipPath});`;
    }

    let transform = "";
    if(angle !== 0){
      transform += `rotate(${angle}) `;

      if(angle == -180 || anglr == 180){
        transform += `translate(-${this.width} -${this.height}) `;

      }
    }
    let transleteTransform = "";
    if(_l !== 0 || _t !== 0){
      transleteTransform += `translate(${_l} ${_t}) `;
    }
    let scaleTransform = "";
    if(scaleX !==1  || scaleY !== 1){
      scaleTransform += `scale(${scaleX} ${scaleY}) `;
    }

    let markup = [`<g transform="${scaleTransform} ${transleteTransform}"><g transform="${transform}" style="${clipPath}" id="${options.clipPath}">`];

    if(this.layers){
      this._setSVGLayers(markup, reviver);
    }else{
      this._setSVGBgOverlayColor(markup, 'background');
      this._setSVGBgOverlayImage(markup, 'backgroundImage', reviver);
      this._setSVGObjects(markup, reviver);
      this._setSVGBgOverlayColor(markup, 'overlay');
      this._setSVGBgOverlayImage(markup, 'overlayImage', reviver);
    }

    markup.push('</g></g>');

    if(this.originalWidth){
      this.width = _w;
      this.height = _h;
    }
    return markup.join("");
  }
});

fabric.inlineSVG = false;

fabric.Object.prototype.rasterizeSvgShadow = false;
fabric.Object.prototype.svgShadowPadding = 0;
/**
 * Returns filter for svg shadow
 * @return {String}
 */
fabric.Object.prototype.getSvgFilter = function() {
  return (this.shadow && !this.rasterizeSvgShadow) ? 'filter: url(#SVGID_' + this.shadow.id + ');' : '';
};


fabric.Shadow.prototype.toSVGRaster = function(target){
  let padding = target.svgShadowPadding;
  let shadowWidth = target.width + this.blur * 2 + padding * 2;
  let shadowHeight = target.height + this.blur * 2 + padding * 2;

  let canvas = fabric.document.createElement("canvas");
  let ctx = canvas.getContext('2d');
  let scaling = target.getObjectScaling();

  canvas.width = shadowWidth * scaling.scaleX;
  canvas.height = shadowHeight * scaling.scaleY;
  ctx.scale(scaling.scaleX,scaling.scaleY);

  //translate to draw only shadow without object
  this.offsetX += canvas.width;
  this.offsetY += canvas.height;

  ctx.translate(
    target.width/2  + this.blur - this.offsetX + padding,
    target.height/2 + this.blur - this.offsetY + padding);

  // this.nonScaling = true;

  target._setShadow(ctx, target);
  target.drawObject(ctx);

  // this.nonScaling = false;

  this.offsetX -= canvas.width;
  this.offsetY -= canvas.height;

  return `<g transform="matrix(1 0 0 1 ${this.offsetX} ${this.offsetY})">
      <image preserveAspectRatio="none" xlink:href="${canvas.toDataURL()}" ${target.getSvgTransform(false)}
          x="${-padding - target.width / 2 - this.blur}" y="${-padding - target.height / 2 - this.blur}"
          width="${shadowWidth}" height="${shadowHeight}">
      </image></g>`
};

fabric.util.object.extend(fabric.Object.prototype, {
  _createBaseSVGMarkup: function (objectMarkup, options) {
    options = options || {};
    let shadowInfo = (options.withShadow && !this.rasterizeSvgShadow) ? 'style="' + this.getSvgFilter() + '" ' : '',
      absoluteClipPath = this.clipPath && this.clipPath.absolutePositioned;

    if (this.clipPath) {
      this.clipPath.clipPathId = 'CLIPPATH_' + fabric.Object.__uid++;
    }

    let commonPieces = [
      options.noStyle ? '' : 'style="' + this.getSvgStyles() + '" ',  //styleInfo
      this.strokeUniform ? 'vector-effect="non-scaling-stroke" ' : '', //vectorEffect
      options.noStyle ? '' : this.addPaintOrder(), ' ',
      options.additionalTransform ? 'transform="' + options.additionalTransform + '" ' : '',
    ].join('');
    // insert commons in the markup, style and svgCommons
    objectMarkup[objectMarkup.indexOf('COMMON_PARTS')] = commonPieces;

    let markup = `
      ${(this.shadow && this.rasterizeSvgShadow) && this.shadow.toSVGRaster(this) || ""}
      <g ${this.getSvgTransform(false)} ${!absoluteClipPath ? shadowInfo + this.getSvgCommons() : ''}>
      
          ${this.fill && this.fill.toLive && this.fill.toSVG(this) || ""}
          ${this.stroke && this.stroke.toLive && this.stroke.toSVG(this) || ""}
          ${(this.shadow && !this.rasterizeSvgShadow) && this.shadow.toSVG(this) || ""}
          ${this.clipPath && `<clipPath id="${this.clipPath.clipPathId}" >${this.clipPath.toClipPathSVG(options.reviver)}</clipPath>` || ""}
          ${objectMarkup.join('')}
      </g>`;

    if (absoluteClipPath) {
      markup = `<g ${shadowInfo} ${this.getSvgCommons()} >${markup}</g>`;
    }

    return options.reviver ? options.reviver(markup) : markup;
  }
});


