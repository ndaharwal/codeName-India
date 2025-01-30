$(function(){

  canvas.on('object:modified', function(event) {
    isUpdated = true;
    window.electronAPI.setIsUpdated(true)
    if (event.target) {
      if (event.target.get('type') == 'i-text') {
        if (event.target.styles[0] != undefined) {
          for (var i = 0; event.target.styles[0][i] != undefined; i++) {
            if (event.target.styles[0][i].fontSize != undefined) {
              var newFontSize = event.target.styles[0][i].fontSize * event.target.scaleX;
              event.target.styles[0][i].fontSize = newFontSize.toFixed(0);
            }
          }
        }
        var _width = event.target.width;
        var _height = event.target.height;

        event.target.fontSize *= event.target.scaleX;
        event.target.fontSize = event.target.fontSize.toFixed(0);
        event.target.scaleX = 1;
        event.target.scaleY = 1;
        event.target._clearCache();
        event.target.initDimensions();

        if(event.target.fill && event.target.fill.type){
          var coords = event.target.fill.coords;
          coords.x1 = coords.x1 / _width * event.target.width;
          coords.x2 = coords.x2 / _width * event.target.width;
          coords.y1 = coords.y1 / _height * event.target.height;
          coords.y2 = coords.y2 / _height * event.target.height;
        }

        $("#txtFontSizeVal").val(event.target.fontSize);
      }
      canvas.renderAll();
    }
  });
})