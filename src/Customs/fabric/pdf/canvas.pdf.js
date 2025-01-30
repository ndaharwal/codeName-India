
if(typeof PDFDocument !== "undefined"){
  fabric.PDFDocument = PDFDocument;
}


fabric.pdf = {
  setupSvgExport: function(){
    this.__inlineSVG = fabric.inlineSVG;
    this.__rasterizeSvgShadow = fabric.Object.prototype.rasterizeSvgShadow;
    fabric.inlineSVG = true;
    fabric.Object.prototype.rasterizeSvgShadow = true;
  },
  resolveSvgExport: function(){
    fabric.inlineSVG = this.__inlineSVG;
    fabric.Object.prototype.rasterizeSvgShadow = this.__rasterizeSvgShadow;
  },
  defaultFontFamily: "Helvetica",
  svgOptions: {
    fontCallback(family, weight, style, fontOptions) {
      switch(weight) {
        case "normal":
          weight = 400;break;
        case "bold":
          weight = 700;break;
      }
      if (family.indexOf("'") !== -1) {
        family = family.substr(family.indexOf("'") + 1);
        family = family.substring(0, family.indexOf("'"));
      }
      let familyFull;

      let fv = fabric.fonts.getFontVariation(family, weight, style);

      if(fv){
        familyFull = `${family} ${fv.style} ${fv.weight}`;
        if(!this._registeredFonts[familyFull]){
          fabric.pdf.debug && console.log(`PDF Register font: ${family} ${style} ${weight} `);
          if(fabric.isLikelyNode) {
            let resolve = require("path").resolve;
            this.registerFont(familyFull, resolve(fabric.fonts.fontsSourceRoot + fv.variation.src));
          }
          else{
            this.registerFont(familyFull, fv.variation.buffer);
          }
        }
      }else{
        fabric.pdf.debug && console.warn(`PDF no font registered: ${family} `);
        familyFull = `Times ${style} ${weight}`;
      }
      return familyFull;
    },
    imageCallback(link) {
      return fabric.util.fImageRegistry[link] || link;
    }
    //- width, height [number] = initial viewport, by default it's the page dimensions
    //- preserveAspectRatio [string] = override alignment of the SVG content inside its viewport
    //- useCSS [boolean] = use the CSS styles computed by the browser (for SVGElement only)
    //- documentCallback [function] = same as above for the external SVG documents
    //- colorCallback [function] = function called to get color, making mapping to CMYK possible
    //- warningCallback [function] = function called when there is a warning
    //- assumePt [boolean] = assume that units are PDF points instead of SVG pixels
    //- precision [number] = precision factor for approximative calculations (default = 3)
  },
};



fabric.util.object.extend(fabric.StaticCanvas.prototype,{
  makeDocument(){
    fabric.pdf.setupSvgExport();

    let ptUnit = fabric.util.parseUnit("1pt");
    let w = this.originalWidth || this.width;
    let h = this.originalHeight || this.height;

    const doc = new fabric.PDFDocument({compress: false, size : [
        w / ptUnit,//8.9 * 72,
        h / ptUnit // 12.3 * 72
      ]});
    fabric.pdf.svgOptions.assumePt = ptUnit;


    doc.svg(this.toSVG(), 0, 0,fabric.pdf.svgOptions);

    doc.end();

    fabric.pdf.resolveSvgExport();
    return doc;
  }
});
