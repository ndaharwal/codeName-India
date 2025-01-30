
/**
 * and here is 5 Canvas functions
 *  canvas.startMasking()    grouping selected objects and activate "masking" mode. In this mode user can select a target object . Grouped objects will be applied to it as a mask
 *  canvas.cancelMasking()   if masking mode is active
 *  canvas.startCrop()       ungroup active MaskGroup and enable "cropping" mode. user can move/resize photo. user can click on another object or empty space to finish cropping
 *  canvas.endCrop()         finish cropping with a button
 *  canvas.ungroupMasking()  ungroup active MaskGroup object.
 */
fabric.util.object.extend(fabric.Canvas.prototype, {
  __createMaskGroup(clipPath,photo){

    let _left = clipPath.left, _top = clipPath.top;
    clipPath.top = -clipPath.height/2;
    clipPath.left = -clipPath.width/2;
    let clipPathGroup =  new fabric.SGroup({
      canvas: this,
      clipPath: clipPath,
      objects: [],
      width: clipPath.width ,
      height: clipPath.height,
      top: _top,
      left: _left
    });
    clipPathGroup.addWithoutUpdate(photo);
    clipPathGroup.on("dblclick",function () {
      this.canvas.startCrop(this);
    });
    this.add(clipPathGroup);
    return clipPathGroup;
  },
  createFrame(clipPath,photo){
    this.remove(clipPath);
    this.remove(photo);

    let shapeObjects;
    if(clipPath.type === "activeSelection") {
      clipPath = clipPath.groupElements();
      shapeObjects = clipPath.storeObject().objects;
    }else{
      shapeObjects = [clipPath.storeObject()];
    }

    let groupProperties = clipPath.getProperties([ 'flipX', 'flipY', "left","top","scaleX","scaleY","angle","width","height","skewX","skewY"]);
    let tempGroup = new fabric.SGroup(groupProperties);
    let size = fabric.Frame.prototype._getPhotoSize(tempGroup,photo._element);



    let position = photo.getPointByOrigin("center","center");
    photo.set({
      left: position.x,
      top: position.y,
      originX: "center",
      originY: "center",
      width: size.width,
      height: size.height,
      scaleX: photo.width * photo.scaleX / size.width,
      scaleY: photo.height * photo.scaleY / size.height
    });
    this.renderAll();


    // photo.group = clipPath;
    tempGroup.addWithoutUpdate(photo,true);

    // delete photo.group;
    let photoObject = photo.storeObject();
    photoObject.element = photo._element;
    delete photoObject.type;
    delete photoObject.width;
    delete photoObject.height;

    tempGroup.remove(photo);

    let frame = new fabric.Frame({
      canvas: this,
      shape: {
        objects: shapeObjects
      },
      width: clipPath.width ,
      height: clipPath.height,
      left: clipPath.left,
      top: clipPath.top,
      photo: photoObject
    });
    this.add(frame);
    this.renderAll();
    return frame;

  },
  maskingOpacity: 0.5,
  startMasking(object){
    if(!object){
      object = this._activeObject;
    }
    this.fire("mode:changed",{mode : "masking", before: this.mode});
    this.mode = "masking";
    // if(object.type === "activeSelection"){
    // this.__maskObjectGroup = object.groupSelectedElements();
    // this.__maskObjectGroup.__wasGroupedBeforeMasking = true;
    // this.add(this.__maskObjectGroup);
    // }else{

    if(object.type === "activeSelection") {
      for(let sub_object of object._objects){
        sub_object.set({
          evented: false,
          opacity: sub_object.opacity * this.maskingOpacity
        });
      }
    }
    object.set({
      opacity: object.opacity * this.maskingOpacity,
      evented: false,
      hasControls: false,
      __hasControls: object.hasControls
    });

    this.renderAll();

    this.__maskObjectGroup = object;
    let app = this.application || this;
    this._endMaskingBinded = this._endMasking.bind(this);
    app.on("target:changed",this._endMaskingBinded);
  },
  ungroupMasking(){
    let obj = this._activeObject;
    let activeSelection = obj.toActiveSelection();
    this._discardActiveObject()
  },
  _endMasking(e){
    let app = this.application || this;
    app.off("target:changed",this._endMaskingBinded);
    delete this._endMaskingBinded;

    this.fire("mode:changed",{mode : "normal", before: this.mode});
    this.mode = "normal";



    let maskObject = this.__maskObjectGroup;

    if(maskObject.type === "activeSelection") {
      for(let sub_object of maskObject._objects){
        sub_object.set({
          evented: true,
          opacity: sub_object.opacity * (1 / this.maskingOpacity)
        });
      }
    }
    maskObject.set({
      opacity: maskObject.opacity * (1 / this.maskingOpacity),
      hasControls: maskObject.hasControls,
      evented: true
    });
    delete maskObject.__hasControls;

    let photo = e.selected;
    let frame = this.createFrame(maskObject,photo);
    this.setActiveObject(frame);
    delete this.__maskObjectGroup;
  },
  cancelMasking(){
    let app = this.application || this;
    app.off("target:changed",this._endMasking);
    this.fire("mode:changed",{mode : "normal", before: this.mode});
    this.mode = "normal";

    this.discardActiveObject();
    delete this.__maskObjectGroup;
  }
});

if(fabric.Editor){
  fabric.util.object.extend(fabric.Editor.prototype, {
    mode: "normal",
    setMode(mode,modeData){
      this.fire("mode:changed",{mode : mode , before: this.mode});
      this.mode = mode;
      if(modeData) {
        this.modeData = modeData;
      }else{
        delete this.modeData;
      }
    }
  });
}


fabric.util.object.extend(fabric.ActiveSelection.prototype, {
  applyMask(){
    let firstImage = null;
    for(let i = this._objects.length;i--; ){
      let object = this._objects[i];
      if(!firstImage && object.type === "image"){
        firstImage = object;
        this.removeWithUpdate(this._objects[i])
      }
      if(object.type === "frame"){
        console.log("cannot use frame for masking");
        return;
      }
    }
    if(firstImage){
      let frame = this.canvas.createFrame(this,firstImage);
      this.canvas.setActiveObject(frame);
      frame.set({isMasked: true});
    }else{
      this.canvas.startMasking(this);
    }
  },
});

fabric.util.object.extend(fabric.Object.prototype, {
  applyMask(){
    this.canvas.startMasking(this);
  },
  actions: fabric._.extend({}, fabric.Object.prototype.actions, {
    applyMask: {
      title: "@object.applyMask",
      className: "fas fa-bookmark"
    }
  })
});

fabric.util.object.extend(fabric.Frame.prototype, {
  setAsBackgroundImage(){
    this._normalizeAngle();
    let _deviation = this.angle % 90;
    this.angle = Math.floor(this.angle / 90) * 90;
    if (_deviation > 45) {
      this.angle += 90;
    }
    let scaleX, scaleY;

    let canvas = this.canvas;
    if (this.angle === 90 || this.angle === 270) {
      scaleX = canvas.width / this.height;
      scaleY = canvas.height / this.width;
    } else {
      scaleX = canvas.width / this.width;
      scaleY = canvas.height / this.height;
    }
    this.set({
      left:0,
      top: 0,
      width: canvas.width,
      height: canvas.height
    });

    let backgroundOptions = this._photo.getProperties(["width","height"].concat(target._photo.storeProperties));
    backgroundOptions.element = this._photo._element;
    backgroundOptions.src = this._photo.src;

    this.application.history.processing = true;
    canvas.setBackgroundImage(backgroundOptions);
    // canvas.backgroundImage._setOriginToCenter();
    // canvas.backgroundImage.set({
    //   scaleX: scaleX,
    //   scaleY: scaleY,
    //   left: canvas.width / 2,
    //   top: canvas.height / 2
    // });
    // canvas.backgroundImage._resetOrigin();

    this.canvas._history_removed_object = this;

    this.removeFromCanvas();
  },
  resolveClipingMask: function(){
    let canvas =this.canvas;

    this._objects.splice(this._objects.indexOf(this._photo),1)[0];
    this._photo.group = this;
    this._restoreObjectState(this._photo);
    delete this._photo.group;
    delete this._photo.clipPath;
    let position = this._photo.getPointByOrigin("left","top");

    let imageOptions = fabric.util.object.extend(this._photo.storeObject(),{
      canvas: canvas,
      application: this.application,
      type: "image",
      element: this._photo._originalElement,
      width:  this._photo.width,
      height: this._photo.height,
      left: position.x,
      top: position.y
    });
    delete imageOptions.src;

    let image = fabric.util.createObject(imageOptions);
    image.src = this._photo.src;
    canvas.add(image);



    this._shapeEl.group = this;
    this._restoreObjectState(this._shapeEl);
    delete this._shapeEl.group;
    this._shapeEl.canvas = canvas;

    //todo check if was grouped on creating frame
    if(this._shapeEl.type === "group"){
      this._shapeEl.ungroup();
    }


    canvas.remove(this);
  },
  cropPhotoStart: function(){
    this.originalState = {
      crop: this._photo.getProperties(["left","top","width","height","scaleX","scaleY","skewX","skewY"])
    };
    this.canvas.stateful = false;

    this.canvas.fire("before:crop",{target: this });
    // this.application.setMode("cropping",{target: this });
    this.inCropMode = true;
    if(!this._shapeEl){
      this._createDefaultImageCropClipPath();
    }
    if(this.useClipPath){
      delete this.clipPath;
      this._photo.clipPath = this._shapeEl;
      this._shapeEl.absolutePositioned = true;
    }
    this._shapeEl.group = this;
    this._restoreObjectState(this._shapeEl);

    this._objects.splice(this._objects.indexOf(this._photo),1)[0];
    this._photo.group = this;
    this._restoreObjectState(this._photo);
    // croppingImage.clipPath = this.clipPath;
    this.canvas.add(this._photo);
    this.canvas.setActiveObject(this._photo);


    if(this._deco){
      this._objects.splice(this._objects.indexOf(this._deco),1)[0];
      this._deco.group = this;
      this._deco.evented = false;
      this._restoreObjectState(this._deco);
      this._deco.parent = this;
      this.canvas.add(this._deco);
    }
    this.dirty = true;

    this.canvas.renderAll();
    this.__cropPhotoEnd_binded = this.cropPhotoEnd.bind(this);

    let app = this.application || this.canvas;
    app.on("target:changed", this.__cropPhotoEnd_binded);
  },
  cropPhotoEnd: function(){
    this.inCropMode = false;
    let app = this.application || this.canvas;
    app.off("target:changed", this.__cropPhotoEnd_binded);
    delete this.__cropPhotoEnd_binded;

    // this._shapeEl.group = this;
    // this._shapeEl.group = this;
    if(this._shapeEl){
      fabric.util.toGroupCoords(this._shapeEl,this);
      delete this._shapeEl.group;
    }
    if(this.useClipPath){
      this.clipPath = this._shapeEl;
      delete this._photo.clipPath;
      this._shapeEl.absolutePositioned = false;
    }
    // delete this.clipPath.absolutePositioned;

    // delete this._photo.parent;
    this.addWithoutUpdate(this._photo,true);
    delete this._photo.group;

    if(this._deco) {
      // delete this._deco.parent;
      this.addWithoutUpdate(this._deco);
      delete this._deco.group;
    }

    this.dirty = true;
    this.canvas.fire("after:crop",{target: this });
    // this.application.setMode("normal");

    this.canvas.stateful = true;
    this.crop = this._photo.getProperties(["left","top","width","height","scaleX","scaleY","skewX","skewY"]);

    this.canvas && this.canvas.fire('object:modified', {target: this});
    this.canvas && this.canvas.renderAll();
    this.fire('modified');
  },
  croppingAvailable: function () {
    return this._objects.length;
  },
  scaleContentElement(scaleX,scaleY){
    this._photo.set({
      scaleX: scaleX,
      scaleY: scaleY,
    });
    this.fire('crop:modified');
    this.dirty = true;
    this.canvas.renderAll();
  },
  cropZoomOut: function () {
    this.scaleContentElement(
      Math.min(this.maxCropZoom,Math.max(this._photo.scaleX *0.9, this.minCropZoom)),
      Math.min(this.maxCropZoom,Math.max(this._photo.scaleY *0.9, this.minCropZoom))
    );
  },
  cropZoomIn: function () {
    Math.sqrt(this.scaleX * this.scaleY);

    this.scaleContentElement(
      Math.min(this.maxCropZoom,this._photo.scaleX * 1.11),
      Math.min(this.maxCropZoom,this._photo.scaleY * 1.11)
    );
  },
  actions: fabric._.extend({},fabric.Object.prototype.actions, {
    filters: fabric.util.object.extend({
      target: function(){
        return this._photo;
      }
    },fabric.Image.prototype.actions && fabric.Image.prototype.actions.filters),
    uploadShape: {
      title: "@image.uploadShape",
      className: "fa fa-shapes broken"
    },
    frame: {
      title: "@image.frames",
      itemClassName: "images-selector",
      className: "far fa-heart",
      type: "select",
      dropdown: {
        previewWidth: 60,
        previewHeight: 60,
        templateSelection: function (state) {
          if (state.any) {
            return state.text;
          }
          return $(`<span><span class="color-span" style="background-color: ${state.text}"></span>${state.text}</span>`);
        },
        templateResult: function (state) {
          let $el = $(`<span title="${state.text}"><span class="filter-preview"></span><span class="filter-name">${state.text}</span></span>`);

          let sourceImage = this.target._originalElement || this.target._element;

          let canvas = fabric.util.createCanvasElement();
          canvas.width = this.dropdown.previewWidth;
          canvas.height = this.dropdown.previewHeight;

          let ctx = canvas.getContext("2d");
          if(sourceImage){
            ctx.drawImage(sourceImage,0,0,this.dropdown.previewWidth,this.dropdown.previewHeight);
          }

          if(state.id && state.id !== "none"){
            let fImage = fabric.util.createObject({
              application:  this.target.application,
              type:         "frame",
              photo:        canvas.toDataURL(),
              width:        60,
              height:       60,
              frame:        state.id
            },() => {
              let canvas2 = fabric.util.createCanvasElement();
              canvas2.width = this.dropdown.previewWidth;
              canvas2.height = this.dropdown.previewHeight;
              let ctx2 = canvas2.getContext("2d");
              ctx2.translate(this.dropdown.previewWidth/2,this.dropdown.previewHeight/2);
              fImage.drawObject(ctx2);
              $el.find(".filter-preview").append($(canvas2));
            });
            // let frame = fabric.util.deepClone(this.target.application.getFrame(state.id),true);
            // if(frame.deco && frame.deco.src && fImage.decoThumbnailSourceRoot){
            //   frame.deco.src = fabric.util.getURL(frame.deco.src,fImage.decoThumbnailSourceRoot);
            // }

          }else{
            $el.find(".filter-preview").append($(canvas));
          }
          return $el;
        },
      },
      set: function (val, framesData) {
        let options = false;
        if (val === "none") {
          val = false;
        } else {
          let _f = fabric._.findWhere(framesData, {id: val});
          _f.enabled = !_f.enabled;
          for (let i in _f.options) {
            if ($.isNumeric(_f.options[i])) {
              _f.options[i] = parseFloat(_f.options[i]);
            }
          }
          if (_f.enabled) {
            options = {};
            for (let i in _f.options) {
              options[i] = _f.options[i].value;
            }
          }
        }
        this.setFrame(val);
      },
      get: function () {
        return this.frame ? this.frame.id || "custom" : "none"
      },
      options: function (target) {
        let list = [{
          id: 'none',
          text: 'original',
          enabled: !target.frame
        }];
        let _frames = target.application.getFramesList && target.application.getFramesList(target);
        if(_frames){
          for (let i in target.frames) {
            let _f = fabric._.findWhere(_frames, {type: fabric.util.string.capitalize(target.frames[i].type)});
            if (_f) {
              _f.enabled = true;
            }
          }
          list = list.concat(_frames);
        }

        return list;
      }
    },
    resolveClipingMask: {
      title: "@image.resolveMask",
      className: "fa fa-crop",
      action: "resolveClipingMask",
      visible: "croppingAvailable",
      observe: "cropping:entered cropping:exited element:modified"
    },
    crop: {
      title: "@image.crop",
      className: "fa fa-crop",
      action: "cropPhotoStart",
      visible: "croppingAvailable",
      observe: "cropping:entered cropping:exited element:modified"
    }
  })
});