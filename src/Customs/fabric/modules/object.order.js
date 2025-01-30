
fabric.util.object.extend(fabric.Canvas.prototype,{
  actions: fabric._.extend(fabric.Canvas.prototype.actions, {
    objectsOrder: {
      className: 'fas fa-layer-group',
      title: "@canvas.objectsOrder",
      value: "objectsOrder",
      type: "tree"
    }
  })
});



fabric.util.object.extend(fabric.StaticCanvas.prototype, {
  orderGroups: [
    {parent: "objects",id: "group-x",text: "group-x",data: {visible: true, "locked": false}}
  ],
  defaultIdPrefix: "Layer ",
  setObjectsOrder(value){
    switch(value.type){
      case "removed": {
        let object = this.getObjectByID(value.node.id);
        this.remove(object);
        //todo IndiaFont global method
        save();
        break;
      }
      case "checked": {
        this.discardActiveObject();
        let objects = [];
        if(value.checked.length){
          for(let id of value.checked){
            objects.push(this.getObjectByID(id));
          }
          let selection = new fabric.ActiveSelection( objects, {canvas: this } );
          this.setActiveObject(selection);
        }
        this.renderAll();
        break;
      }
      case "modified": {
        for(let item of value.modified){
          if(item.node.type === "root"){
            if(this.layers){
              let layer = this.layers[item.node.id];
              for(let property in item.modified){
                layer[property] = item.modified[property];
              }
            }else{

            }
          }
          else{
            let object = this.getObjectByID(item.node.id);
            if(item.modified.zIndex !== undefined){
              object.setZIndex(item.modified.zIndex);
            }
            else{
              for(let property in item.modified){
                let setFoo = "set" + fabric.util.string.capitalize(property);
                if(object[setFoo]){
                  object[setFoo](item.modified[property]);
                }else{
                  object.set(property,item.modified[property]);
                }
              }
            }
          }
        }
      }
        break;
    }
    this.renderAll();
  },
  getObjectsOrder(){
    let showLayers = false;

    let value = [];
    if(this.layers){
      for(let layerName of this.renderOrder){
        if(!this.layers[layerName])continue;

        value.push({
          id : layerName,
          parent : "#",
          text : layerName,
          type: "root",
          data: {visible: this.layers[layerName].visible !== false, "locked": this.layers[layerName].locked !== true}
        });

        let layerObjects = this._chooseObjectsToRender(layerName);

        for(let object of layerObjects){

          if(!object.id){
            object.createID();
          }
          value.push({
            id: object.id,
            parent: object.orderGroup || layerName,
            text: object.id,
            type: "object",
            data: {visible: object.visible, "locked": !object.selectable},
            state : { checked : object.active }
          });
        }
        // if(this._chooseObjectsToRender &&  i === "objects"){
        //   this._renderObjects(ctx, this._chooseObjectsToRender());
        // }else{
        //   this._renderObjects(ctx, this.layers[i].objects);
        // }
      }
    }else{
      let visible = false;
      for(let object of this._objects){
        if(object.visible){
          visible = true;
          break;
        }
      }
      let locked = true;
      for(let object of this._objects){
        if(!object.selectable){
          locked = false;
          break;
        }
      }

      let activesel = this.getActiveObject() || [];

      if(activesel){
        if(activesel.type !== "activeSelection"){
          activesel = [activesel];
        }else{
          activesel = activesel._objects;
        }
      }

      let active = true;
      for(let object of this._objects){
        if(activesel.includes(object)){
        }else{
          active = false;
          break;
        }
      }

      if(showLayers){
        value.push({
          id : "objects",
          parent : "#",
          text : "objects",
          type: "objectsroot",
          data: {visible: visible, "locked": locked},
          state : { checked : active }
        });
      }

      let layerObjects = this._chooseObjectsToRender();

      for(let i = layerObjects.length ; i--;){
        let object = layerObjects[i];
        if (object.watermark) continue;
        if(!object.id){
          object.createID();
        }
        value.push({
          id: object.id,
          parent: showLayers ? "objects" : "#",
          text: object.id,
          type: "object",
          data: {visible: object.visible, "locked": !object.selectable},
          state : { checked : activesel.includes(object) }
        });
      }
    }
    return value;
  },
  getLayerIndex: function (objectLayer){
    let layerIndex = 0;
    for(let layerName of this.renderOrder){
      if(layerName === objectLayer)break;
      for(; layerIndex < this._objects.length ; layerIndex++){
        let anotherObjectLayer = this._objects[layerIndex].layer || "objects";
        if(anotherObjectLayer !== layerName){
          break;
        }
      }
    }
    return layerIndex;
  },
  _toFront(obj){
    if(obj.layer) {
      let layerIndex = this.renderOrder.indexOf(obj.layer);
      let i;
      for (i = 0; i < this._objects.length; i++) {
        if (this._objects[i].layer && this.renderOrder.indexOf(this._objects[i].layer) > layerIndex) {
          break;
        }
      }
      this._objects.splice(i, 0, obj);
    }
    else {
      this._objects.push(obj);
    }
  },
  _toBack(obj){
    if(obj.layer) {
      let layerIndex = this.renderOrder.indexOf(obj.layer);
      for (let i = this._objects.length; i--;) {
        if (this._objects[i].layer && this.renderOrder.indexOf(this._objects[i].layer) < layerIndex) {
          this._objects.splice(i + 1, 0, obj);
          return;
        }
      }
    }
    this._objects.unshift(obj);
  },
  add () {
    for (let obj of [...arguments]) {
      this._toFront(obj);

      if (this._onObjectAdded) {
        this._onObjectAdded(obj);
      }
    }
    this.renderOnAddRemove && this.renderAll();
    return this;
  },

  /**
   * Moves an object or the objects of a multiple selection
   * to the bottom of the stack of drawn objects
   * @param {fabric.Object} object Object to send to back
   * @return {fabric.Canvas} thisArg
   * @chainable
   */
  sendToBack: function (object) {
    if (!object) {
      return this;
    }
    var activeSelection = this._activeObject,
      i, obj, objs;
    if (object === activeSelection && object.type === 'activeSelection') {
      objs = activeSelection._objects;
      for (i = objs.length; i--;) {
        obj = objs[i];
        fabric.util.removeFromArray(this._objects, obj);
        this._objects.unshift(obj);
      }
    }
    else {
      fabric.util.removeFromArray(this._objects, object);
      this._objects.unshift(object);
    }
    this.fire("object:replaced",{target:object });
    this.renderOnAddRemove && this.requestRenderAll();
    return this;
  },

  /**
   * Moves an object or the objects of a multiple selection
   * to the top of the stack of drawn objects
   * @param {fabric.Object} object Object to send
   * @return {fabric.Canvas} thisArg
   * @chainable
   */
  bringToFront: function (object) {
    if (!object) {
      return this;
    }
    var activeSelection = this._activeObject,
      i, obj, objs;
    if (object === activeSelection && object.type === 'activeSelection') {
      objs = activeSelection._objects;
      for (i = 0; i < objs.length; i++) {
        obj = objs[i];
        fabric.util.removeFromArray(this._objects, obj);
        this._objects.push(obj);
      }
    }
    else {
      fabric.util.removeFromArray(this._objects, object);
      this._objects.push(object);
    }
    this.fire("object:replaced",{target:object });
    this.renderOnAddRemove && this.requestRenderAll();
    return this;
  },
});

fabric.util.object.extend(fabric.Object.prototype, {
  actions: fabric._.extend(fabric.Object.prototype.actions, {
    order: {
      title: "@object.order",
      className: 'fa fa-layer-group',
      menu: [
        "bringForward",
        "sendBackwards",
        "bringToFront",
        "sendToBack"
      ]
    },
    bringForward: {
      title: "@object.bringForward",
      className: 'fa fa-level-up-alt',
      enabled: 'not onTop',
      observe: "canvas.object:added canvas.object:removed canvas.object:replaced",
      // observe: function(cb){
      //   this.canvas.on("object:added object:removed object:replaced",cb);
      // },
      // destroy: function(cb){
      //   this.canvas.off("object:added object:removed object:replaced",cb);
      // }
    },
    sendBackwards: {
      title: "@object.sendBackwards",
      className: 'fa fa-level-down-alt',
      enabled: 'not onBottom',
      observe: "canvas.object:added canvas.object:removed canvas.object:replaced",
    },
    bringToFront: {
      title: "@object.bringToFront",
      className: 'fa fa-to-front',
      enabled: 'not onTop',
      observe: "canvas.object:added canvas.object:removed canvas.object:replaced",
    },
    sendToBack: {
      title: "@object.sendToBack",
      className: 'fa fa-to-back',
      enabled: 'not onBottom',
      observe: "canvas.object:added canvas.object:removed canvas.object:replaced"
    },
  }),
  setZIndex(value){
    fabric.util.removeFromArray(this.canvas._objects, this);
    if(this.canvas.layers){
      let layerIndex = this.canvas.getLayerIndex(this.layer || "objects");
      value = layerIndex + value;
    }
    this.canvas._objects.splice(value, 0, this);
  },
  onTop () {
    let objs = this.canvas._objects;
    let index = objs.indexOf(this);
    if(index === objs.length - 1){
      return true;
    }
    else if(this.layer){
      // If above object is on another layer we could not bring our object forward
      if(objs[index + 1].layer && objs[index + 1].layer !== this.layer){
        return true;
      }
    }
    return false;
  },
  onBottom () {
    let objs = this.canvas._objects;
    let index = objs.indexOf(this);
    if(index === 0){
      return true;
    }
    else if(this.layer){
      // If above object is on another layer we could not bring our object forward
      if(objs[index - 1].layer && objs[index - 1].layer != this.layer){
        return true;
      }
    }
    return false;
  },
  /**
   * Moves an object down in stack of drawn objects
   * @param {Boolean} [intersecting] If `true`, send object behind next lower intersecting object
   * @return {fabric.Object} thisArg
   * @chainable
   */
  sendBackwards (intersecting) {
    if (this.group) {
      fabric.StaticCanvas.prototype.sendBackwards.call(this.group, this, intersecting);
    }
    else {
      this.canvas.sendBackwards(this, intersecting);
    }
    this.canvas.fire("object:replaced",{target:this });
    return this;
  },
  /**
   * Moves an object up in stack of drawn objects
   * @param {Boolean} [intersecting] If `true`, send object in front of next upper intersecting object
   * @return {fabric.Object} thisArg
   * @chainable
   */
  bringForward (intersecting) {
    if (this.group) {
      fabric.StaticCanvas.prototype.bringForward.call(this.group, this, intersecting);
    }
    else {
      this.canvas.bringForward(this, intersecting);
    }
    this.canvas.fire("object:replaced",{target:this });
    return this;
  }
});
