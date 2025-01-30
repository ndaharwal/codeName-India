
fabric._.extend(fabric.Canvas.prototype,{
  /**
   * ['PencilBrush','RectangleBrush']
   */
  activeDrawingTools: [],
  /**
   *
     {
      BrushClassName: {
        className: 'brush className',
        title: 'brush title'
      }
    }
   */
  drawingTools: {},
  insertDrawingTool: false,
  actions: fabric._.extend(fabric.Canvas.prototype.actions,{
    noBrush: {
      className: 'fa fa-mouse-pointer',
      title: '@canvas.selectionTool',
      value: 'freeDrawingBrush',
      option: 'none'
    },
    pencilBrush: {
      className: 'fa fa-ice-cream',
      title: '@canvas.pencilBrush',
      value: 'freeDrawingBrush',
      option: 'PencilBrush'
    },
    roundedRectShapeBrush: {
      className: 'fa fa-square',
      title: '@canvas.roundedRectangleShapeBrush',
      value: 'freeDrawingBrush',
      option: 'ShapeBrush.roundedRect'
    },
    rectShapeBrush: {
      className: 'fa fa-square-full',
      title: '@canvas.rectangleShapeBrush',
      value: 'freeDrawingBrush',
      option: 'ShapeBrush.rect'
    },
    ellipseShapeBrush: {
      className: 'fa fa-circle',
      title: '@canvas.ellipseShapeBrush',
      value: 'freeDrawingBrush',
      option: 'ShapeBrush.ellipse'
    },
    starShapeBrush: {
      className: 'fa fa-star',
      title: '@canvas.starShapeBrush',
      value: 'freeDrawingBrush',
      option: 'ShapeBrush.star'
    },
    hexShapeBrush: {
      className: 'fa fa-accusoft fa-hexagon',
      title: '@canvas.hexShapeBrush',
      value: 'freeDrawingBrush',
      option: 'ShapeBrush.hexagon'
    },
    circleBrush: {
      className: 'fa fa-circle',
      title: '@canvas.circleBrush',
      value: 'freeDrawingBrush',
      option: 'CircleBrush'
    },
    freeDrawingBrush: {
      title: '@canvas.freeDrawingBrush',
      type: 'options',
      value: 'freeDrawingBrush',
      menu: ["rectShapeBrush","roundedRectShapeBrush","ellipseShapeBrush","starShapeBrush","hexShapeBrush",/*"pencilBrush","circleBrush",*/"noBrush"],
      // dynmicMenu: function(target){
      //   var _tools = {};
      //   for(var i in target.activeDrawingTools){
      //     var _tool = target.activeDrawingTools[i];
      //     _tools[_tool] = fabric._.extend({option: _tool},target.drawingTools[_tool]);
      //   }
      //   return _tools;
      // }
    }
  }),
  freeDrawingBrush: null,
  drawingColor: [0,0,0,255],
  _onMouseDownInDrawingMode: function(e) {
    this._isCurrentlyDrawing = true;
    if(!this.freeDrawingBrush.target){
      this.discardActiveObject(e).renderAll();
    }
    if (this.clipTo) {
      fabric.util.clipContext(this, this.contextTop);
    }
    var pointer = this.getPointer(e);
    this.freeDrawingBrush.onMouseDown(pointer, { e: e, pointer: pointer });
    this._handleEvent(e, 'down');
  },
  _freeDrawingBrush: "none",
  getFreeDrawingBrush: function() {
    return this._freeDrawingBrush;
    // if(!this.freeDrawingBrush){
    //   return "Selection";
    // }
    // // return this.freeDrawingBrush;
    // return  fabric.util.string.capitalize(fabric.util.string.camelize(this.freeDrawingBrush.type),true);
  },
  setFreeDrawingBrush: function(brush) {

    this._freeDrawingBrush = brush;
    if(brush == 'none'){
      // this.isDrawingMode = false;
      this.setInteractiveMode("mixed");
      this.freeDrawingBrush = null;
      return;
    }
    let option;
    if(brush.includes(".")){
      option = brush.substr(brush.indexOf(".")+ 1);
      brush = brush.substr(0,brush.indexOf("."));
    }

    var className = fabric.util.string.capitalize(fabric.util.string.camelize(brush),true);
    if(this["__" + className]){
      this.freeDrawingBrush = this["__" + className] ;
    }else{
      this.freeDrawingBrush = this["__" + className] = new  fabric[className](this);
    }

    if(option){
      this.freeDrawingBrush.setMode(option);
    }

    // this.isDrawingMode = true;
    this.setInteractiveMode("draw");
    this.fire("brush:changed",{brush: this.freeDrawingBrush});
  },
  drawZoomedArea : function(ctx,left, top ,width, height , pointer ) {

    width = width || 90;
    height = height || 90;

    ctx.save();
    ctx.translate(left || 0, top || 0);

    ctx.fillStyle = 'black';
    ctx.strokeStyle = "#fff";
    ctx.strokeWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.drawImage(this.backgroundImage._element,Math.floor(pointer.x) - 4, Math.floor(pointer.y) - 4 , 9 , 9, 0,0 , width, width );
    ctx.strokeRect(0,0 , width, width);
    ctx.strokeRect(40 , 40 , 10, 10);
    ctx.restore();
  }
});
//
// fabric.Canvas.prototype.drawingTools.Selection = {
//   className: 'fa fa-mouse-pointer',
//   title: 'Selection'
// };
// fabric.Canvas.prototype.activeDrawingTools.push("Selection");
