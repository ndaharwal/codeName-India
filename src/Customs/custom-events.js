var activetarget = null;
var _clipboard = null;
function ConvertToObject() {
  var activeObj = canvas.getActiveObject(); // getSelected();

  if (activeObj) {
    var data = activeObj.toSVG();

    canvas.discardActiveObject();
    if (activeObj.length) {
      canvas.remove.apply(canvas, activeObj);
      save();
    }
    fabric.loadSVGFromString(data, function (objects, options) {
      var obj = fabric.util.groupSVGElements(objects, options);
      canvas.add(obj).centerObject(obj).renderAll();

      obj.setCoords();
    });
  }
}
var consoleSVGValue =
  '<?xml version="1.0" standalone="no"?>' +
  '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' +
  '<svg width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg">' +
  '<rect width="300" height="100" style="fill:rgb(0,0,255);stroke-width:1;stroke:rgb(0,0,0)"/>' +
  "</svg>";

var consoleValue =
  "// clear canvas\n" +
  "canvas.clear();\n\n" +
  "// remove currently selected object\n" +
  "canvas.remove(canvas.getActiveObject());\n\n" +
  "// add red rectangle\n" +
  "canvas.add(new fabric.Rect({\n" +
  "  width: 50,\n" +
  "  height: 50,\n" +
  "  left: 50,\n" +
  "  top: 50,\n" +
  "  fill: 'rgb(255,0,0)'\n" +
  "}));\n\n" +
  "// add green, half-transparent circle\n" +
  "canvas.add(new fabric.Circle({\n" +
  "  radius: 40,\n" +
  "  left: 50,\n" +
  "  top: 50,\n" +
  "  fill: 'rgb(0,255,0)',\n" +
  "  opacity: 0.5\n" +
  "}));\n";

var consoleJSONValue = null;

var freeDrawingMode = "Pencil";

var vLinePatternBrush = null;
var texturePatternBrush = null;
var diamondPatternBrush = null;
var squarePatternBrush = null;
var hLinePatternBrush = null;

var viewportLeft = 0,
  viewportTop = 0,
  mouseLeft,
  mouseTop,
  _drawSelection,
  isDown = false;

$(function () {
  function updateFontName(fontName) {
    const selectedFontNameElement = document.getElementById("selectedFontName");
    if (selectedFontNameElement) {
      selectedFontNameElement.textContent = fontName;
    }
  }

  canvas.on("object:selected", function (opt) {

    // window.electronAPI.setActiveObj(opt.target)

    if (opt.target) {
      $("#transform_w_val").val(opt.target.scaleX * 100 + "%");
      $("#transform_h_val").val(opt.target.scaleY * 100 + "%");
      $("#transform_angle_val").val(opt.target.angle);
      $("#transform_s_val").val(opt.target.skewX);

      if (opt.target.fill) {
        selectedColor = opt.target.fill;
        $(".clrpicker .color_selector").css("background-color", selectedColor);
      }

      if (opt.target.get("type") === "i-text") {
        $("#txtFontSizeVal").val(opt.target.fontSize);
        $("#select2-ddlFontFamily-container").html(opt.target.fontFamily);
        updateFontName(opt.target.fontFamily);
        $("#txtTrackingVal").val(
          (Number(opt.target.charSpacing) || 0).toFixed(0)
        );
        selectedColor = opt.target.fill;
        $(".clrpicker .color_selector").css("background-color", selectedColor);
      }
      $("#opacitySelectorVal").val(Math.round(opt.target.opacity * 100));
      activetarget = opt.target;

      var selectedStroke = opt.target.stroke;
      if (selectedStroke != null && selectedStroke != "") {
      } else {
      }

      var selectedStrokeWidth = opt.target.strokeWidth;
      if (selectedStrokeWidth != null && selectedStrokeWidth != "") {
      } else {
      }

      var selectedFont = opt.target.fontFamily;
      if (selectedFont != null && selectedFont != "") {
        isRunning = true;
      }
    }
    ClearLetterVariable();
  });

  canvas.on("selection:cleared", function () {
    ClearLetterVariable();
  });

  canvas.on("selection:updated", function (opt) {
    // window.electronAPI.setActiveObj(opt.target)

    if (opt.target) {
      $("#transform_w_val").val(opt.target.scaleX * 100 + "%");
      $("#transform_h_val").val(opt.target.scaleY * 100 + "%");
      $("#transform_angle_val").val(opt.target.angle);
      $("#transform_s_val").val(opt.target.skewX);

      if (opt.target.fill) {
        selectedColor = opt.target.fill;
        $(".clrpicker .color_selector").css("background-color", selectedColor);
      }

      if (opt.target.get("type") === "i-text") {
        $("#txtFontSizeVal").val(opt.target.fontSize);
        $("#select2-ddlFontFamily-container").html(opt.target.fontFamily);
        updateFontName(opt.target.fontFamily);
        $("#txtTrackingVal").val(
          (Number(opt.target.charSpacing) || 0).toFixed(0)
        );
        selectedColor = opt.target.fill;
        $(".clrpicker .color_selector").css("background-color", selectedColor);
      }
      $("#opacitySelectorVal").val(Math.round(opt.target.opacity * 100));

      activetarget = opt.target;
      var selectedStroke = opt.target.stroke;
      if (selectedStroke != null && selectedStroke != "") {
      } else {
      }

      var selectedStrokeWidth = opt.target.strokeWidth;
      if (selectedStrokeWidth != null && selectedStrokeWidth != "") {
      } else {
      }

      var selectedFont = opt.target.fontFamily;
      if (selectedFont != null && selectedFont != "") {
        isRunning = true;
      }
    }
    ClearLetterVariable();
  });

  canvas.on("object:scaling", function (event) {
    if (event.target) {
      if (event.target.get("type") == "i-text") {
        if (event.target.styles[0] == undefined) {
          let val = (event.target.fontSize * event.target.scaleX).toFixed(0);
          $("#txtFontSizeVal").val(val);
        }
      }
    }
  });

  canvas.on("mouse:up", function () {
    canvas._drawSelection = _drawSelection;
    isDown = false;
  });

  //

  canvas.on("text:selection:changed", function (e) {
    GetUnicodeOperation(_getSelectedText());

    if (e.target && e.target.type === "i-text") {
      $("#txtFontSizeVal").val(e.target.fontSize);
      $("#select2-ddlFontFamily-container").html(e.target.fontFamily);
      $("#txtTrackingVal").val((Number(e.target.charSpacing) || 0).toFixed(0));
      selectedColor = e.target.fill;
      $(".clrpicker .color_selector").css("background-color", selectedColor);
    }
  });

  canvas.on("text:editing:entered", async function (e) {
    window.electronAPI.setIsEditing(true);
  });
  canvas.on("text:editing:exited", function (e) {
    window.electronAPI.setIsEditing(false);
  });

  canvas.on("object:moving", function (e) {
    // limit 50
    var obj = e.target;

    // if object is too big ignore
    if (
      obj.currentHeight > obj.canvas.height ||
      obj.currentWidth > obj.canvas.width
    ) {
      return;
    }

    obj.setCoords();
    // top-left  corner

    if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
      obj.top = Math.max(
        obj.top,
        obj.top - obj.getBoundingRect().top - obj.getBoundingRect().height + 50
      );
      obj.left = Math.max(
        obj.left,
        obj.left - obj.getBoundingRect().left - obj.getBoundingRect().width + 50
      );
    }

    // bot-right corner
    if (
      obj.getBoundingRect().top + obj.getBoundingRect().height >
        obj.canvas.height ||
      obj.getBoundingRect().left + obj.getBoundingRect().width >
        obj.canvas.width
    ) {
      obj.top = Math.min(
        obj.top,
        obj.canvas.height - 50 + obj.top - obj.getBoundingRect().top
      );
      obj.left = Math.min(
        obj.left,
        obj.canvas.width - 50 + obj.left - obj.getBoundingRect().left
      );
    }
  });

  _drawSelection = canvas._drawSelection;

  fabric.util.addListener(fabric.window, "load", function () {
    var canvas = this.__canvas || this.canvas,
      canvases = this.__canvases || this.canvases;

    canvas && canvas.calcOffset && canvas.calcOffset();

    if (canvases && canvases.length) {
      for (var i = 0, len = canvases.length; i < len; i++) {
        canvases[i].calcOffset();
      }
    }
  });

  initBrushes();
});

$(function () {
  var mainScriptEl = document.getElementById("main");
  if (!mainScriptEl) return;
  var preEl = document.createElement("pre");
  var codeEl = document.createElement("code");
  codeEl.innerHTML = mainScriptEl.innerHTML;
  codeEl.className = "language-javascript";
  preEl.appendChild(codeEl);
  document.getElementById("bd-wrapper").appendChild(preEl);
});

function ShowNextVariable() {
  $("#btnNextLetter").trigger("click");
}

function ShowPreviousVariable() {
  $("#btnPreviousLetter").trigger("click");
}

function setFlipX() {
  var objects = canvas.getActiveObjects();
  for (var i = 0; i < objects.length; i++) objects[i].toggle("flipX");

  canvas.renderAll();
}

function setFlipY() {
  var objects = canvas.getActiveObjects();
  for (var i = 0; i < objects.length; i++) objects[i].toggle("flipY");

  canvas.renderAll();
}

function ClearButtonSelection() {
  $("button").removeClass("target");
}

function renderVieportBorders() {
  var ctx = canvas.getContext();

  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.1)";

  ctx.fillRect(
    canvas.viewportTransform[4],
    canvas.viewportTransform[5],
    canvas.getWidth() * canvas.getZoom(),
    canvas.getHeight() * canvas.getZoom()
  );

  ctx.setLineDash([5, 5]);

  ctx.strokeRect(
    canvas.viewportTransform[4],
    canvas.viewportTransform[5],
    canvas.getWidth() * canvas.getZoom(),
    canvas.getHeight() * canvas.getZoom()
  );

  ctx.restore();
}

function getOpacity() {
  return getActiveStyle("opacity") * 100;
}

function setOpacity(value) {
  setActiveStyle("opacity", parseInt(value, 10) / 100);
}

function getFill() {
  return getActiveStyle("fill");
}

function setFill(value) {
  selectedColor = value;
  $(".clrpicker .color_selector").css("background-color", selectedColor);

  if (!_isLocked()) setActiveStyle("fill", value);
}

function getTextBgColor() {
  return getActiveStyle("textBackgroundColor");
}

function setTextBgColor(value) {
  if (!_isLocked()) setActiveStyle("textBackgroundColor", value);
}

function isBold() {
  return getActiveStyle("fontWeight") === "bold";
}

function toggleBold() {
  setActiveStyle(
    "fontWeight",
    getActiveStyle("fontWeight") === "bold" ? "" : "bold"
  );
}

function isItalic() {
  return getActiveStyle("fontStyle") === "italic";
}

function toggleItalic() {
  setActiveStyle("fontStyle", isItalic() ? "" : "italic");
}

function getFontStyle() {
  return getFontFamilyStyle("fontFamily");
}

function setFontStyle(value) {
  if (!_isLocked()) setActiveStyle("fontFamily", value);
}

function isUnderline() {
  return (
    getActiveStyle("textDecoration").indexOf("underline") > -1 ||
    getActiveStyle("underline")
  );
}

function toggleUnderline() {
  var value = isUnderline()
    ? getActiveStyle("textDecoration").replace("underline", "")
    : getActiveStyle("textDecoration") + " underline";

  setActiveStyle("textDecoration", value);
  setActiveStyle("underline", !getActiveStyle("underline"));
}

function isLinethrough() {
  return (
    getActiveStyle("textDecoration").indexOf("line-through") > -1 ||
    getActiveStyle("linethrough")
  );
}

function toggleLinethrough() {
  var value = isLinethrough()
    ? getActiveStyle("textDecoration").replace("line-through", "")
    : getActiveStyle("textDecoration") + " line-through";

  setActiveStyle("textDecoration", value);
  setActiveStyle("linethrough", !getActiveStyle("linethrough"));
}

function isOverline() {
  return (
    getActiveStyle("textDecoration").indexOf("overline") > -1 ||
    getActiveStyle("overline")
  );
}

function toggleOverline() {
  var value = isOverline()
    ? getActiveStyle("textDecoration").replace("overline", "")
    : getActiveStyle("textDecoration") + " overline";

  setActiveStyle("textDecoration", value);
  setActiveStyle("overline", !getActiveStyle("overline"));
}

function getText() {
  return getActiveProp("text");
}

function appendText(value) {
  setAllTools();
  //alert(showAllTools)
  if (showAllTools == true) {
    var activeObject = canvas.getActiveObject();

    var caretPositionStart = activeObject.selectionStart;
    var caretPositionEnd = activeObject.selectionEnd;

    activeObject.enterEditing();
    activeObject.insertChars(value, null, caretPositionStart, caretPositionEnd);
    activeObject.selectionStart = caretPositionStart + value.length;
    activeObject.selectionEnd = caretPositionStart + value.length + 1;
    activeObject.exitEditing();
    canvas.renderAll();

    var text = getText();
    setText(text);

    activeObject.selectionStart = caretPositionStart;
    activeObject.selectionEnd = caretPositionEnd;

    canvas.renderAll();
    activeObject.enterEditing();
  }
}

function appendGlyphText(value) {
  setAllTools();
  //alert(showAllTools)
  if (showAllTools == true) {
    var activeObject = canvas.getActiveObject();

    if (!activeObject) {
      return;
    }

    if (activeObject.type !== "i-text") {
      return;
    }

    var caretPositionStart = activeObject.selectionStart;
    var caretPositionEnd = activeObject.selectionEnd;

    activeObject.enterEditing();
    activeObject.insertChars(value, null, caretPositionStart, caretPositionEnd);
    activeObject.selectionStart = caretPositionStart + value.length;
    activeObject.selectionEnd = caretPositionStart + value.length + 1;
    activeObject.exitEditing();
    canvas.renderAll();

    var text = getText();
    setText(text);

    canvas.renderAll();
    activeObject.enterEditing();
  }
}

function setText(value) {
  setActiveProp("text", value);
}

function getTextAlign() {
  return capitalize(getActiveProp("textAlign"));
}

function setTextAlign(value) {
  setActiveProp("textAlign", value);
}

function getFontFamily() {
  return getActiveProp("fontFamily");
}

function setFontFamily(value) {
  var object = canvas.getActiveObject();
  if (object && !_isLocked()) {
    setActiveProp("fontFamily", value);
  }
}

function getBgColor() {
  return getActiveProp("backgroundColor");
}

function setBgColor(value) {
  if (!_isLocked()) setActiveProp("backgroundColor", value);
}

function getStroke() {
  return getActiveStyle("stroke");
}

function setStroke(value) {
  if (!_isLocked()) setActiveStyle("stroke", value);
}

function getStrokeWidth() {
  return getActiveStyle("strokeWidth");
}

function setStrokeWidth(value) {
  setActiveStyle("strokeWidth", parseInt(value, 10));
}

function getFontSize() {
  return getActiveStyle("fontSize");
}

function setFontSize(value) {
  if (!_isLocked()) setActiveStyle("fontSize", parseInt(value, 10));
}

function setWidthScale(value) {
  let activeObject = canvas.getActiveObject();
  if (activeObject) {
    activeObject.set({
      scaleX: parseFloat(value) / 100,
    });
    activeObject.setCoords();
    canvas.requestRenderAll();
  }
}

function setHeightScale(value) {
  let activeObject = canvas.getActiveObject();
  if (activeObject) {
    activeObject.set({
      scaleY: parseFloat(value) / 100,
    });
    activeObject.setCoords();
    canvas.requestRenderAll();
  }
}

function setAngleTransform(value) {
  let activeObject = canvas.getActiveObject();
  if (activeObject) {
    activeObject.setCoords();
    activeObject.setPositionByOrigin(
      activeObject.getCenterPoint(),
      activeObject.originX,
      activeObject.originY
    );
    activeObject.set({
      originX: "center",
      originY: "center",
      angle: parseInt(value),
    });
    activeObject.setCoords();
    canvas.requestRenderAll();
  }
}
function setSkewTransform(value) {
  let activeObject = canvas.getActiveObject();
  if (activeObject) {
    activeObject.set({
      skewX: parseInt(value),
    });
    activeObject.setCoords();
    canvas.requestRenderAll();
  }
}

function setLeading(value) {
  if (!_isLocked()) setActiveStyle("leading", parseInt(value, 10) + "pt");
}

function setTracking(value) {
  if (!_isLocked()) setActiveStyle("charSpacing", value);
}

function increaseFontSize() {
  console.log("WTF?");
  if (!_isLocked()) {
    var current =
      activetarget &&
      activetarget.getCompleteStyle &&
      activetarget.getCompleteStyle("fontSize");

    var newValue = parseInt(current) + 5;
    setActiveStyle("fontSize", newValue);
    $("#txtFontSizeVal").val(newValue);
  }
}

function decreaseFontSize() {
  if (!_isLocked()) {
    var current =
      activetarget &&
      activetarget.getCompleteStyle &&
      activetarget.getCompleteStyle("fontSize");
    var newValue = parseInt(current) - 5;
    setActiveStyle("fontSize", newValue);
    $("#txtFontSizeVal").val(newValue);
  }
}

function increaseTextWidth() {
  if (!_isLocked()) {
    var current = $("#ddlTextWidth").val();
    if (isNaN(current) || current == "") {
      current = 0;
    }

    if (parseInt(current) < 500) {
      var newValue = parseInt(current) + 10;
      setCharSpacing(newValue);
      $("#ddlTextWidth").val(newValue);
    }
  }
}

function descreaseTextWidth() {
  if (!_isLocked()) {
    var current = $("#ddlTextWidth").val();
    if (isNaN(current) || current == "") {
      current = 0;
    }

    if (parseInt(current) > -40) {
      var newValue = parseInt(current) - 10;
      setCharSpacing(newValue);
      $("#ddlTextWidth").val(newValue);
    }
  }
}

function getLineHeight() {
  return getActiveStyle("lineHeight");
}

function setLineHeight(value) {
  if (!_isLocked()) {
    setActiveStyle("lineHeight", parseFloat(value, 10));
  }
}

function getCharSpacing() {
  return getActiveStyle("charSpacing");
}

function setCharSpacing(value) {
  if (!_isLocked()) {
    setActiveStyle("charSpacing", value);
  }
}

function getBold() {
  return getActiveStyle("fontWeight");
}

function setBold(value) {
  if (!_isLocked()) {
    setActiveStyle("fontWeight", value ? "bold" : "");
  }
}

function setCavasBgImage(url) {
  if (!_isLocked()) {
    canvas.setBackgroundColor(0);
    fabric.Image.fromURL(url, function (img) {
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
        scaleX: canvas.width / img.width,
        scaleY: canvas.height / img.height,
      });
    });
    canvas.renderAll();
  }
}

function setCavasBgColor(val) {
  if (!_isLocked()) {
    canvas.backgroundImage = 0;
    canvas.setBackgroundColor(val);
    canvas.renderAll();
  }
}

function removeCavasBgImage() {
  canvas.backgroundImage = 0;
  canvas.setBackgroundColor(0);
  canvas.renderAll();
}

function getCanvasBgColor() {
  return canvas.backgroundColor;
}

function setCanvasBgColor(value) {
  canvas.backgroundColor = value;
  canvas.renderAll();
  save();
}

function addRect(fill) {
  var coord = getRandomLeftTop();

  canvas.add(
    new fabric.Rect({
      left: coord.left,
      top: coord.top,
      fill: fill || "#000000",
      width: 100,
      height: 100,
      opacity: 0.8,
    })
  );
  save();
}

function addCircle() {
  var coord = getRandomLeftTop();

  canvas.add(
    new fabric.Circle({
      left: coord.left,
      top: coord.top,
      fill: "#000000",
      radius: 50,
      opacity: 0.8,
    })
  );
  save();
}

function addTriangle() {
  var coord = getRandomLeftTop();

  canvas.add(
    new fabric.Triangle({
      left: coord.left,
      top: coord.top,
      fill: "#000000",
      width: 50,
      height: 50,
      opacity: 0.8,
    })
  );
}

function addLine() {
  var coord = getRandomLeftTop();

  canvas.add(
    new fabric.Line([50, 100, 200, 200], {
      left: coord.left,
      top: coord.top,
      stroke: "#" + getRandomColor(),
    })
  );
}

function addPolygon() {
  var coord = getRandomLeftTop();

  this.canvas.add(
    new fabric.Polygon(
      [
        {
          x: 185,
          y: 0,
        },
        {
          x: 250,
          y: 100,
        },
        {
          x: 385,
          y: 170,
        },
        {
          x: 0,
          y: 245,
        },
      ],
      {
        left: coord.left,
        top: coord.top,
        fill: "#000000",
      }
    )
  );
  save();
}

function addText() {
  var text =
    "Lorem ipsum dolor sit amet,\nconsectetur adipisicing elit,\nsed do eiusmod tempor incididunt\nut labore et dolore magna aliqua.\n" +
    "Ut enim ad minim veniam,\nquis nostrud exercitation ullamco\nlaboris nisi ut aliquip ex ea commodo consequat.";

  var textSample = new fabric.Text(
    text.slice(0, getRandomInt(0, text.length)),
    {
      left: getRandomInt(350, 400),
      top: getRandomInt(350, 400),
      fontFamily: "helvetica",
      angle: getRandomInt(-10, 10),
      fill: "#" + getRandomColor(),
      scaleX: 0.5,
      scaleY: 0.5,
      fontWeight: "",
      originX: "left",
      hasRotatingPoint: true,
      centerTransform: true,
    }
  );

  canvas.add(textSample);
}

function addTextbox() {
  var text = "Type Here";

  var textSample = new fabric.Textbox(text, {
    fontSize: 80,
    left: getRandomInt(350, 400),
    top: getRandomInt(100, 150),
    fontFamily: "helvetica",
    //angle: getRandomInt(-10, 10),
    fill: "#000000",
    fontWeight: "",
    originX: "left",
    width: 370,
    hasRotatingPoint: true,
    centerTransform: true,
  });

  canvas.add(textSample);
  canvas.setActiveObject(textSample);
  save();
}
var oldText = "";
var MySel = "";

function __addIText(x, y) {
  if (___addTextClicked) {
    if (oldText && oldText.text == "") {
      canvas.remove(oldText);
    }

    var FontValue = document.getElementById("selectedFontName").innerText;
    var FontSize = parseInt(jQuery("#txtFontSizeVal").val());
    var textSample;

    textSample = new fabric.IText("", {
      fontFamily: FontValue,
      fontSize: FontSize,
      charSpacing: 0,
      left: x,
      top: y,
      padding: 7,
      fill: selectedColor,
      scaleX: 1,
      scaleY: 1,
      fontWeight: "",
      originX: "left",
      selectionStart: 0,
      hasRotatingPoint: true,
      centerTransform: true,
      lockUniScaling: false,
      strokeWidth: 0,
    });

    canvas.add(textSample).setActiveObject(textSample);
    textSample.enterEditing();
    save();
    textSample.on("selected", function (options) {
      if (!this.selectable) {
        //console.log("Discarding");
        //canvas._discardActiveObject(options.e,this);
      }
      //MySel=options;console.log();//options.target);
    });
    oldText = textSample;
    setTimeout(function () {
      ClearButtonSelection();
    }, 2000);
  }
}
var ___addTextClicked = false;

function addIText() {
  ___addTextClicked = true;
}

function addWatermark() {
  fabric.Image.fromURL("./shapes/basic/0-01.svgz", function (image) {
    image.selectable = false;
    image.hasRotatingPoint = false;
    image.hasControls = false;
    image.evented = false;
    image.watermark = true;
    canvas.add(image).renderAll();
  });

  setInterval(function () {
    for (var i = 0; i < canvas.getObjects().length; i++) {
      if (
        canvas.getObjects()[i].watermark &&
        i < canvas.getObjects().length - 1
      ) {
        canvas.getObjects()[i].bringToFront();
        canvas.renderAll();
        break;
      }
    }
  }, 1000 / 24);
}

function addImage(imageName) {
  if (imageName.indexOf(".svg") == -1) {
    fabric.Image.fromURL(imageName, function (image) {
      canvas
        .add(image)
        .setActiveObject(image)
        .viewportCenterObject(image)
        .renderAll();
      canvas.sendBackwards(image);
      save();
    });
  } else {
    __loadSVG(imageName);
  }
}

function rasterize() {
  var img = null;
  if (!fabric.Canvas.supports("toDataURL") && false) {
    alert("This browser doesn't provide means to serialize canvas to an image");
  } else {
    var data = canvas.toDataURL({
      multiplier: 1 / canvasScale,
      format: "png",
    });
    img = data;
  }

  return img;
}

function rasterizePDFold() {
  var img = null;
  if (!fabric.Canvas.supports("toDataURL") && false) {
    alert("This browser doesn't provide means to serialize canvas to an image");
  } else {
    var data = canvas.toDataURL({
      multiplier: (1 / canvasScale) * 3,
      format: "png",
      quality: 1,
    });
    img = data;
  }

  return img;
}

function rasterizeSVG() {
  var data = canvas.toSVG({
    width: CanvasWidth,
    height: CanvasHeight,
    viewBox: {
      x: 0,
      y: 0,
      width: CanvasWidth,
      height: CanvasWidth,
    },
    scaleX: 1,
    scaleY: 1,
  });
  return data;
}

function rasterizeJSON() {
  return JSON.stringify(canvas);
}

function getJson() {
  var json_data = canvas.toDatalessJSON();
  json_data.width = CanvasWidth;
  json_data.height = CanvasHeight;
  return JSON.stringify(json_data);
}

function getDatalessJson() {
  var json_data = canvas.toDatalessJSON();
  var jData = JSON.stringify(json_data);
  var path = openFilePath;
  var modal = {
    FileContent: jData,
    Path: path,
  };
  return JSON.stringify(modal);
}

function getSelected() {
  return canvas.getActiveObject();
}

function removeSelected() {
  var activeObjects = canvas.getActiveObjects();
  canvas.discardActiveObject();

  if (activeObjects.length) {
    canvas.remove.apply(canvas, activeObjects);
    save();
  }
}

function deleteSelected() {
  var activeObjects = canvas.getActiveObjects();
  if (activeObjects.length) {
    if (activeObjects.length == 1) {
      if (!activeObjects[0].isEditing) {
        canvas.discardActiveObject();
        canvas.remove.apply(canvas, activeObjects);
        save();
      }
    } else {
      canvas.discardActiveObject();
      canvas.remove.apply(canvas, activeObjects);
      save();
    }
  }
}

fabric.ActiveSelection.prototype.setLocked = function (value) {
  for (var i = 0; i < this._objects.length; i++) {
    this._objects[i].setLocked(value);
  }
};
fabric.Object.prototype.setLocked = function (value) {
  this.selectable = !value;
  this.editable = !value;
  this.evented = !value;

  // this.lockScalingFlip = true;
  // this.lockMovementX = true;
  // this.lockMovementY = true;
  // this.lockScalingX = true;
  // this.lockRotation = true;
};

function lockObjectNew() {
  canvas.getActiveObject().setLocked(true);
  canvas.discardActiveObject();
  canvas.renderAll();
  save();
}

function unlockObjectNew() {
  var allObjects = canvas.getObjects();
  for (var i = 0; i < allObjects.length; i++) {
    if (!allObjects[i].selectable) {
      allObjects[i].setLocked(false);
    }
  }
  canvas.renderAll();
  save();
}

function unlockObject() {
  var val = getActiveProp("lockScalingFlip");
  if (val == true) {
    setLockScalingFlip(false);
    setHorizontalLock(false);
    setVerticalLock(false);
    setScaleLockX(false);
    setRotationLock(false);
  }
}

function undoObject() {
  var activeObjects = canvas.getActiveObject();
  if (
    activeObjects == null ||
    (activeObjects != null && !activeObjects.isEditing)
  ) {
    replay(undo, redo, "#btnRedo", "#btnUndo");
    // }
  }
}

function redoObject() {
  var activeObjects = canvas.getActiveObject();
  if (
    activeObjects == null ||
    (activeObjects != null && !activeObjects.isEditing)
  ) {
    replay(redo, undo, "#btnUndo", "#btnRedo");
  }
}

function getLockScalingFlip() {
  return getActiveProp("lockScalingFlip");
}

function setLockScalingFlip(value) {
  setActiveProp("lockScalingFlip", value);
}

function getHorizontalLock() {
  return getActiveProp("lockMovementX");
}

function setHorizontalLock(value) {
  setActiveProp("lockMovementX", value);
}

function getVerticalLock() {
  return getActiveProp("lockMovementY");
}

function setVerticalLock(value) {
  setActiveProp("lockMovementY", value);
}

function getScaleLockX() {
  return getActiveProp("lockScalingX");
}

function setScaleLockX(value) {
  setActiveProp("lockScalingX", value);
}

function getScaleLockY() {
  return getActiveProp("lockScalingY");
}

function setScaleLockY(value) {
  setActiveProp("lockScalingY", value);
}

function getRotationLock() {
  return getActiveProp("lockRotation");
}

function setRotationLock(value) {
  setActiveProp("lockRotation", value);
}

function getOriginX() {
  return getActiveProp("originX");
}

function setOriginX(value) {
  setActiveProp("originX", value);
}

function getOriginY() {
  return getActiveProp("originY");
}

function setOriginY(value) {
  setActiveProp("originY", value);
}

function getObjectCaching() {
  return getActiveProp("objectCaching");
}

function setObjectCaching(value) {
  return setActiveProp("objectCaching", value);
}

function getNoScaleCache() {
  return getActiveProp("noScaleCache");
}

function setNoScaleCache(value) {
  return setActiveProp("noScaleCache", value);
}

function getTransparentCorners() {
  return getActiveProp("transparentCorners");
}

function setTransparentCorners(value) {
  return setActiveProp("transparentCorners", value);
}

function getHasBorders() {
  return getActiveProp("hasBorders");
}

function setHasBorders(value) {
  return setActiveProp("hasBorders", value);
}

function getHasControls() {
  return getActiveProp("hasControls");
}

function setHasControls(value) {
  return setActiveProp("hasControls", value);
}

function sendBackwards() {
  var activeObject = canvas.getActiveObject();
  if (activeObject) {
    canvas.sendBackwards(activeObject);
    canvas.fire("modify:custom");
  }
}

function sendToBack() {
  var activeObject = canvas.getActiveObject();
  if (activeObject) {
    canvas.sendToBack(activeObject);
    canvas.fire("modify:custom");
  }
}

function bringForward() {
  var activeObject = canvas.getActiveObject();
  if (activeObject) {
    canvas.bringForward(activeObject);
    canvas.fire("modify:custom");
  }
}

function bringToFront() {
  var activeObject = canvas.getActiveObject();
  if (activeObject) {
    canvas.bringToFront(activeObject);
    canvas.fire("modify:custom");
  }
}

var actObje = Array();

function selectAllObjects() {
  var sel;
  var activeObjects = canvas.getActiveObject();
  if (
    activeObjects == null ||
    (activeObjects != null && !activeObjects.isEditing)
  ) {
    canvas.discardActiveObject();
    sel = new fabric.ActiveSelection(canvas.getEnabledObjects(), {
      canvas: canvas,
    });
  } else {
    canvas.getActiveObject().fire("mousedbclick");
  }
  canvas.setActiveObject(sel);
  canvas.requestRenderAll();
}
jQuery(function () {
  fabric.Canvas.prototype.getEnabledObjects = function () {
    var objectList = [],
      objects = this.getObjects();

    for (var i = 0, len = this.size(); i < len; i++) {
      if (objects[i].selectable === true && objects[i].visible === true) {
        objectList.push(objects[i]);
      }
    }

    return objectList;
  };
});

function getCanvasObjects() {
  return canvas.getObjects().length;
}

function getIsUpdated() {
  return isUpdated;
}

function groupObjects() {
  if (!canvas.getActiveObject()) {
    return;
  }

  if (canvas.getActiveObject().type !== "activeSelection") {
    return;
  }
  canvas.getActiveObject().toGroup();
  canvas.requestRenderAll();
}

function ungroupObjects() {
  if (!canvas.getActiveObject()) {
    return;
  }
  if (canvas.getActiveObject().type !== "group") {
    return;
  }
  canvas.getActiveObject().toActiveSelection();
  canvas.requestRenderAll();
  editor.tree.updateTree();
}

function discardSelections() {
  canvas.discardActiveObject();
  canvas.requestRenderAll();
}

function CutObject() {
  var activeObjects = canvas.getActiveObject();
  if (activeObjects && !activeObjects.isEditing) {
    canvas.getActiveObject().clone(function (cloned) {
      _clipboard = cloned;
    });

    setTimeout(function () {
      deleteSelected();
    }, 50);
  }
}

function CopyObject() {
  // clone what are you copying since you
  // may want copy and paste on different moment.
  // and you do not want the changes happened
  // later to reflect on the copy.
  var activeObjects = canvas.getActiveObject();
  if (activeObjects && !activeObjects.isEditing) {
    canvas.getActiveObject().clone(function (cloned) {
      _clipboard = cloned;
      // objectCallBack.copyData(_clipboard.toSVG());
    });
  }
}


function _Paste(clipboard) {
  if ($("#myActivation").css("display") == "block" && clipboard.length == 16) {
    $("#act1").val(clipboard.substring(0, 4));
    $("#act2").val(clipboard.substring(4, 8));
    $("#act3").val(clipboard.substring(8, 12));
    $("#act4").val(clipboard.substring(12, 16));
  }
}

function PasteObject() {
  var activeObjects = canvas.getActiveObject();
  if (
    (activeObjects == null || !activeObjects.isEditing) &&
    _clipboard != null
  ) {
    // clone again, so you can do multiple copies.

    _clipboard.clone(function (clonedObj) {
      console.log(clonedObj);

      canvas.discardActiveObject();
      clonedObj.set({
        left: clonedObj.left + 10,
        top: clonedObj.top + 10,
        evented: true,
      });
      if (clonedObj.type === "activeSelection") {
        // active selection needs a reference to the canvas.
        clonedObj.canvas = canvas;
        clonedObj.forEachObject(function (obj) {
          canvas.add(obj);
        });
        // this should solve the unselectability
        clonedObj.setCoords();
      } else {
        canvas.add(clonedObj);
      }
      // _clipboard.top += 10;
      // _clipboard.left += 10;
      canvas.setActiveObject(clonedObj);
      canvas.viewportCenterObject(clonedObj);
      canvas.requestRenderAll();
      save();
    });
  }
}

function MoveLeft() {
  var activeObjects = canvas.getActiveObject();
  if (activeObjects != null && !activeObjects.isEditing) {
    canvas.getActiveObject().left += 5;
    canvas.renderAll();
  }
}

var pattern = new fabric.Pattern({
  //source: '/Assets/ladybug.png',
  repeat: "repeat",
});

function patternify() {
  var obj = canvas.getActiveObject();

  if (!obj) return;

  if (obj.fill instanceof fabric.Pattern) {
    obj.set("fill", null);
  } else {
    obj.set("fill", pattern);
  }
  canvas.renderAll();
  save();
}

function clip() {
  var obj = canvas.getActiveObject();
  if (!obj) return;

  if (obj.clipTo) {
    obj.clipTo = null;
  } else {
    var radius = obj.width < obj.height ? obj.width / 2 : obj.height / 2;
    obj.clipTo = function (ctx) {
      ctx.arc(0, 0, radius, 0, Math.PI * 2, true);
    };
  }
  canvas.renderAll();
  save();
}

function shadowify() {
  var obj = canvas.getActiveObject();
  if (!obj) return;

  if (obj.shadow) {
    obj.shadow = null;
  } else {
    obj.setShadow({
      color: "rgba(0,0,0,0.3)",
      blur: 10,
      offsetX: 10,
      offsetY: 10,
    });
  }
  canvas.renderAll();
  save();
}

function gradientify() {
  console.log("WTF??");
  var obj = canvas.getActiveObject();
  if (!obj) return;

  obj.setGradient("fill", {
    x1: 0,
    y1: 0,
    x2: getRandomInt(0, 1) ? 0 : obj.width * obj.scaleX,
    y2: getRandomInt(0, 1) ? 0 : obj.height * obj.scaleY,
    colorStops: {
      0: "#" + getRandomColor(),
      1: "#" + getRandomColor(),
    },
  });
  canvas.renderAll();
  save();
}

function execute() {
  if (!/^\s+$/.test(consoleValue)) {
    eval(consoleValue);
  }
}

function getConsoleSVG() {
  return consoleSVGValue;
}

function setConsoleSVG(value) {
  consoleSVGValue = value;
}

function getConsole() {
  return consoleValue;
}

function setConsole(value) {
  consoleValue = value;
}

function LoadSVGFile(svg) {
  alert(svg);
}

function loadSVGWithoutGrouping() {
  _loadSVGWithoutGrouping(consoleSVGValue);
}

function loadSVG() {
  _loadSVG(consoleSVGValue);
}

function _loadSVG(svg) {
  fabric.loadSVGFromString(svg, function (objects, options) {
    alert(JSON.stringify(objects));
    var obj = fabric.util.groupSVGElements(objects, options);
    canvas.add(obj).centerObject(obj).renderAll();
    obj.setCoords();
  });
}

function __loadSVG(path) {
  fabric.loadSVGFromURL(path, function (objects, options) {
    var obj = fabric.util.groupSVGElements(objects, options);
    canvas.add(obj).viewportCenterObject(obj).setActiveObject(obj).renderAll();
    save();
  });
}

function _loadSVGWithoutGrouping(svg) {
  fabric.loadSVGFromString(svg, function (objects) {
    canvas.renderOnAddRemove = false;
    // canvas.add.apply(canvas, objects);
    canvas.add(objects);
    canvas.renderOnAddRemove = true;
    canvas.renderAll();
    save();
  });
}

function __loadSVGWithoutGrouping(path) {
  fabric.loadSVGFromURL(path, function (objects, options) {
    canvas.renderOnAddRemove = false;
    canvas.add.apply(canvas, objects);
    // objects.set({left: 50, top: 50});
    // canvas.add(objects);

    canvas.renderOnAddRemove = true;
    canvas.renderAll();
    save();
  });
}

function saveJSON() {
  _saveJSON(JSON.stringify(canvas));
}

function _saveJSON(json) {
  setConsoleJSON(json);
}

function setZoom(value) {
  var currentzoom = canvas.getZoom();
  var SCALE_FACTOR = (1 / currentzoom) * value;
  canvas.setHeight(canvas.getHeight() * SCALE_FACTOR);
  canvas.setWidth(canvas.getWidth() * SCALE_FACTOR);

  var objects = canvas.getObjects();
  for (var i in objects) {
    var scaleX = objects[i].scaleX;
    var scaleY = objects[i].scaleY;
    var left = objects[i].left;
    var top = objects[i].top;

    var tempScaleX = scaleX * SCALE_FACTOR;
    var tempScaleY = scaleY * SCALE_FACTOR;
    var tempLeft = left * SCALE_FACTOR;
    var tempTop = top * SCALE_FACTOR;

    objects[i].scaleX = tempScaleX;
    objects[i].scaleY = tempScaleY;
    objects[i].left = tempLeft;
    objects[i].top = tempTop;

    objects[i].setCoords();
  }

  canvas.renderAll();
}

function _loadJSON(json, openPath) {
  setTimeout(function () {
    openFilePath = openPath;
    canvas.loadFromDatalessJSON(json, function () {
      //jQuery("canvas#canvas").show();
      //jQuery(".new-recent-file-block").hide();
      //jQuery('div#new_file_popup').css('display', 'none');
      fitCanvas();
      canvas.renderAll();
      //canvas.setDimensions({ width: width, height: height });
    });
  }, 500);
}

function addShape(path) {
  var coord = getRandomLeftTop();
  fabric.loadSVGFromURL(
    "DecorativeItem/General/" + path,
    function (objects, options) {
      var loadedObject = fabric.util.groupSVGElements(objects, options);
      loadedObject
        .set({
          left: 50,
          top: 50,
        })
        .setCoords();

      canvas.add(loadedObject);
      canvas.renderAll();
    }
  );
}

function addCustomShape(path) {
  __loadSVGWithoutGrouping(path);
}

function addDividerShape(path) {
  var coord = getRandomLeftTop();
  fabric.loadSVGFromURL(
    "DecorativeItem/Dividers/" + path,
    function (objects, options) {
      var loadedObject = fabric.util.groupSVGElements(objects, options);
      loadedObject
        .set({
          left: 50,
          top: 50,
        })
        .setCoords();

      canvas.add(loadedObject);
      canvas.renderAll();
    }
  );
}

function addBasicShapes(path) {
  var coord = getRandomLeftTop();
  fabric.loadSVGFromURL("Shapes/Basic/" + path, function (objects, options) {
    var loadedObject = fabric.util.groupSVGElements(objects, options);
    loadedObject
      .set({
        left: 50,
        top: 50,
      })
      .setCoords();

    canvas.add(loadedObject);
    canvas.renderAll();
  });
}

function addAdvancedShapes(path) {
  var coord = getRandomLeftTop();
  fabric.loadSVGFromURL("Shapes/Advanced/" + path, function (objects, options) {
    var loadedObject = fabric.util.groupSVGElements(objects, options);
    loadedObject
      .set({
        left: 50,
        top: 50,
      })
      .setCoords();

    canvas.add(loadedObject);
    canvas.renderAll();
  });
}

function addTexts() {
  var iText = new fabric.IText("lorem ipsum\ndolor\nsit Amet\nconsectetur", {
    left: 100,
    top: 150,
    fontFamily: "Helvetica",
    fill: "#333",
    styles: {
      0: {
        0: {
          fill: "red",
          fontSize: 20,
        },
        1: {
          fill: "red",
          fontSize: 30,
        },
        2: {
          fill: "red",
          fontSize: 40,
        },
        3: {
          fill: "red",
          fontSize: 50,
        },
        4: {
          fill: "red",
          fontSize: 60,
        },

        6: {
          textBackgroundColor: "yellow",
        },
        7: {
          textBackgroundColor: "yellow",
        },
        8: {
          textBackgroundColor: "yellow",
        },
        9: {
          textBackgroundColor: "yellow",
        },
      },
      1: {
        0: {
          textDecoration: "underline",
        },
        1: {
          textDecoration: "underline",
        },
        2: {
          fill: "green",
          fontStyle: "italic",
          textDecoration: "underline",
        },
        3: {
          fill: "green",
          fontStyle: "italic",
          textDecoration: "underline",
        },
        4: {
          fill: "green",
          fontStyle: "italic",
          textDecoration: "underline",
        },
      },
      2: {
        0: {
          fill: "blue",
          fontWeight: "bold",
        },
        1: {
          fill: "blue",
          fontWeight: "bold",
        },
        2: {
          fill: "blue",
          fontWeight: "bold",
        },

        4: {
          fontFamily: "Courier",
          textDecoration: "line-through",
        },
        5: {
          fontFamily: "Courier",
          textDecoration: "line-through",
        },
        6: {
          fontFamily: "Courier",
          textDecoration: "line-through",
        },
        7: {
          fontFamily: "Courier",
          textDecoration: "line-through",
        },
      },
      3: {
        0: {
          fontFamily: "Impact",
          fill: "#666",
          textDecoration: "line-through",
        },
        1: {
          fontFamily: "Impact",
          fill: "#666",
          textDecoration: "line-through",
        },
        2: {
          fontFamily: "Impact",
          fill: "#666",
          textDecoration: "line-through",
        },
        3: {
          fontFamily: "Impact",
          fill: "#666",
          textDecoration: "line-through",
        },
        4: {
          fontFamily: "Impact",
          fill: "#666",
          textDecoration: "line-through",
        },
      },
    },
  });

  canvas.add(iText);
}

function getPreserveObjectStacking() {
  return canvas.preserveObjectStacking;
}

function setPreserveObjectStacking(value) {
  return (canvas.preserveObjectStacking = value);
}

function getEnableRetinaScaling() {
  return canvas.enableRetinaScaling;
}

function setEnableRetinaScaling(value) {
  canvas.enableRetinaScaling = value;
  canvas.setDimensions({
    width: canvas.width,
    height: canvas.height,
  });
  return value;
}

function getSkipOffscreen() {
  return canvas.skipOffscreen;
}

function setSkipOffscreen(value) {
  return (canvas.skipOffscreen = value);
}

function getFreeDrawingMode() {
  return canvas.isDrawingMode;
}

function setFreeDrawingMode(value) {
  canvas.isDrawingMode = value;
}

function getDrawingMode() {
  return freeDrawingMode;
}

function setDrawingMode(type) {
  freeDrawingMode = type;

  if (type === "hline") {
    canvas.freeDrawingBrush = vLinePatternBrush;
  } else if (type === "vline") {
    canvas.freeDrawingBrush = hLinePatternBrush;
  } else if (type === "square") {
    canvas.freeDrawingBrush = squarePatternBrush;
  } else if (type === "diamond") {
    canvas.freeDrawingBrush = diamondPatternBrush;
  } else if (type === "texture") {
    canvas.freeDrawingBrush = texturePatternBrush;
  } else {
    canvas.freeDrawingBrush = new fabric[type + "Brush"](canvas);
  }

  setDrawingLineWidth($("#txtDrawingLineWidth").val());
  setDrawingLineColor(lastFreeDrawingColor);
  setDrawingLineShadowWidth($("#txtDrawingLineShadowWidth").val());
}

function getDrawingLineWidth() {
  if (canvas.freeDrawingBrush) {
    return canvas.freeDrawingBrush.width;
  }
}

function setDrawingLineWidth(value) {
  if (canvas.freeDrawingBrush) {
    canvas.freeDrawingBrush.width = parseInt(value, 10) || 1;
  }
}

function getDrawingLineColor() {
  if (canvas.freeDrawingBrush) {
    return canvas.freeDrawingBrush.color;
  }
}

function setDrawingLineColor(value) {
  if (canvas.freeDrawingBrush) {
    canvas.freeDrawingBrush.color = value;
  }
}

function getDrawingLineShadowWidth() {
  if (canvas.freeDrawingBrush && canvas.freeDrawingBrush.shadow) {
    return canvas.freeDrawingBrush.shadow.blur || 1;
  } else {
    return 0;
  }
}

function setDrawingLineShadowWidth(value) {
  if (canvas.freeDrawingBrush) {
    var blur = parseInt(value, 10);
    if (blur > 0) {
      canvas.freeDrawingBrush.shadow = new fabric.Shadow({
        blur: blur,
        offsetX: 10,
        offsetY: 10,
      });
    } else {
      canvas.freeDrawingBrush.shadow = null;
    }
  }
}

function initImagePatternBrush() {
  var img = new Image();
  //img.src = '/Assets/honey_im_subtle.png';

  texturePatternBrush = new fabric.PatternBrush(canvas);
  texturePatternBrush.source = img;
}

function initBrushes() {
  if (!fabric.PatternBrush) return;

  initVLinePatternBrush();
  initHLinePatternBrush();
  initSquarePatternBrush();
  initDiamondPatternBrush();
  //initImagePatternBrush();
}

function initDiamondPatternBrush() {
  diamondPatternBrush = new fabric.PatternBrush(canvas);
  diamondPatternBrush.getPatternSrc = function () {
    var squareWidth = 10,
      squareDistance = 5;
    var patternCanvas = fabric.document.createElement("canvas");
    var rect = new fabric.Rect({
      width: squareWidth,
      height: squareWidth,
      angle: 45,
      fill: this.color,
    });

    var canvasWidth = rect.getBoundingRect().width;

    patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
    rect.set({
      left: canvasWidth / 2,
      top: canvasWidth / 2,
    });

    var ctx = patternCanvas.getContext("2d");
    rect.render(ctx);

    return patternCanvas;
  };
}

function initSquarePatternBrush() {
  squarePatternBrush = new fabric.PatternBrush(canvas);
  squarePatternBrush.getPatternSrc = function () {
    var squareWidth = 10,
      squareDistance = 2;

    var patternCanvas = fabric.document.createElement("canvas");
    patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
    var ctx = patternCanvas.getContext("2d");

    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, squareWidth, squareWidth);

    return patternCanvas;
  };
}

function initVLinePatternBrush() {
  vLinePatternBrush = new fabric.PatternBrush(canvas);
  vLinePatternBrush.getPatternSrc = function () {
    var patternCanvas = fabric.document.createElement("canvas");
    patternCanvas.width = patternCanvas.height = 10;
    var ctx = patternCanvas.getContext("2d");

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.lineTo(10, 5);
    ctx.closePath();
    ctx.stroke();

    return patternCanvas;
  };
}

function initHLinePatternBrush() {
  hLinePatternBrush = new fabric.PatternBrush(canvas);
  hLinePatternBrush.getPatternSrc = function () {
    var patternCanvas = fabric.document.createElement("canvas");
    patternCanvas.width = patternCanvas.height = 10;
    var ctx = patternCanvas.getContext("2d");

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(5, 0);
    ctx.lineTo(5, 10);
    ctx.closePath();
    ctx.stroke();

    return patternCanvas;
  };
}

function setObjectAlign(align) {
  canvas.alignActiveObject(align);
}
