fabric.util.object.extend(fabric.Canvas.prototype, {
  handleTargetEvent(){
    let app = this.application || this;
    let deselectedTarget = app.__deselected , selectedTarget = app.__selected;
    if(!deselectedTarget && !selectedTarget)return;
    delete app.__deselected;
    delete app.__selected;
    app.target = selectedTarget ;
    app.fire('target:changed', {selected: selectedTarget, deselected: deselectedTarget});
  },
  eventListeners: fabric.util.extendArraysObject(fabric.Canvas.prototype.eventListeners, {
    'object:modified': function targetModifed(e) {
      let app = this.application || this;
      if(app.target === e.target){
        app.fire('target:modified', {target: e.target, canvas: this})
      }
    },
    'mouse:up': function mouseDownTargetEventHandler() {
      let app = this.application || this;
      this.handleTargetEvent();
    },
    'canvas:cleared': function canvasCleared() {
      let app = this.application || this;
      app.__deselected = this.getActiveObjects();
      this.handleTargetEvent();
    },
    'selection:cleared': function targetClear(event) {
      let app = this.application || this;
      app.__deselected = event.deselected || event.target;
      if(!event.e){
        this.handleTargetEvent();
      }
    },
    'selection:created selection:updated': function targetChanged(event) {
      let app = this.application || this;
      app.__selected = event.target;
      if(event.deselected)app.__deselected = event.deselected;
      if(!event.e){
        this.handleTargetEvent();
      }
    },
    'group:selected': function targetChanged(event) {
      let app = this.application || this;
      app.__selected = event.selected;
      app.__deselected = event.deselected;
      if(!event.e){
        this.handleTargetEvent();
      }
    }
  })
});