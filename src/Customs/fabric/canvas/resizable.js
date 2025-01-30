

fabric._.extend(fabric.Canvas.prototype,{
  _setObjectScaleOverwritten: fabric.Canvas.prototype._setObjectScale,
  _setupCurrentTransformOverwritten: fabric.Canvas.prototype._setupCurrentTransform,
  _setupCurrentTransform: function (e, target,alreadySelected) {
    if (!target)return;
    // if (target.setupCurrentTransform) {
    //   return target.setupCurrentTransform(e);
    // } else {
    this._setupCurrentTransformOverwritten(e, target,alreadySelected);
    if (target.resizable) {
      this._currentTransform.original.height = target.height;
      this._currentTransform.original.width = target.width;
    }
    // }
  },
  _setObjectScale: function (localMouse, transform, lockScalingX, lockScalingY, by, lockScalingFlip, _dim) {

    let t = transform.target;

    if (!_dim) {
      let strokeWidth = t.stroke ? t.strokeWidth : 0;
      _dim = {
        x: (t.width + (strokeWidth / 2)),
        y: (t.height + (strokeWidth / 2))
      }
    }

    if (t.setObjectScale) {
      return t.setObjectScale(localMouse, transform,
        lockScalingX, lockScalingY, by, lockScalingFlip, _dim);
    }
    else {
      if (t.resizable) {
        return this._setObjectSize(localMouse, transform,
          lockScalingX, lockScalingY, by, lockScalingFlip, _dim);
      } else {
        return this._setObjectScaleOverwritten(localMouse, transform,
          lockScalingX, lockScalingY, by, lockScalingFlip, _dim);
      }
    }
  },
  _setObjectSize: function (localMouse, transform, lockScalingX, lockScalingY, by, lockScalingFlip, _dim) {

    let target = transform.target, forbidScalingX = false, forbidScalingY = false;
    let _stroke = transform.target.strokeWidth || 0;
    transform.newWidth = this.width * ((localMouse.x / transform.scaleX) / (this.width + _stroke));
    transform.newHeight = this.height * ((localMouse.y / transform.scaleY) / (this.height + _stroke));

    if(this.wholeCoordinates || target.wholeCoordinates){
      transform.newWidth = Math.round(transform.newWidth);
      transform.newHeight = Math.round(transform.newHeight);
    }
    if(transform.newHeight < 0 ){
      target.top = transform.top - transform.newHeight;
    }
    if (target.minWidth && transform.newWidth <= target.minWidth) {
      transform.newWidth = target.minWidth;
    }
    if (target.minHeight && transform.newHeight <= target.minHeight) {
      transform.newHeight = target.minHeight;
    }
    if (lockScalingFlip && transform.newWidth < target.width) {
      forbidScalingX = true;
    }
    if (lockScalingFlip && transform.newHeight < target.height) {
      forbidScalingY = true;
    }

    if (by === 'equally') {
      forbidScalingX || forbidScalingY || this._resizeObjectEqually(localMouse, target, transform, _dim);
    }
    else if (!by) {
      forbidScalingX || target.setWidth(transform.newWidth);
      forbidScalingY || target.setHeight(transform.newHeight);
    }
    else if (by === 'x' && !target.get('lockUniScaling')) {
      forbidScalingX || target.setWidth(transform.newWidth);
    }
    else if (by === 'y' && !target.get('lockUniScaling')) {
      forbidScalingY || target.setHeight(transform.newHeight);
    }
    return !forbidScalingX && !forbidScalingY;
  },
  _resizeObjectEqually: function (localMouse, target, transform, _dim) {

    let dist = localMouse.y + localMouse.x,
      lastDist = _dim.y * transform.original.height / target.height +
        _dim.x * transform.original.width / target.width;

    transform.newWidth = transform.original.width * dist / lastDist;
    transform.newHeight = transform.original.height * dist / lastDist;

    let ratio = transform.original.height / transform.original.width;
    if (ratio > 1) {
      if (target.minWidth && transform.newWidth <= target.minWidth) {
        transform.newWidth = target.minWidth;
        transform.newHeight = target.minHeight * ratio;
      }
    } else {
      if (target.minHeight && transform.newHeight <= target.minHeight) {
        transform.newHeight = target.minHeight;
        transform.newWidth = target.minWidth / ratio;
      }
    }

    target.setWidth(transform.newWidth);
    target.setHeight(transform.newHeight);
  }
});
