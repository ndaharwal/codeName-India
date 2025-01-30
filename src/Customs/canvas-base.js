var kitchensink = {};
var openFilePath = null;
let isUpdated = false;
fabric.ActiveSelection.prototype.lockUniScaling = false;
fabric.Object.prototype.centeredRotation = true;
fabric.Canvas.prototype.alignActiveObject = function (align) {
  let activeObject = this.getActiveObject();
  if (!activeObject) return console.info("No active selection");
  let closestPage = {
    centerX: this.width / 2,
    centerY: this.height / 2,
    width: this.width / this.viewportTransform[0],
    height: this.height / this.viewportTransform[3],
  };
  let activeObjectBoundingRect = activeObject.getBoundingRect(),
    activeObjectHeight =
      activeObjectBoundingRect.height / this.viewportTransform[3],
    activeObjectWidth =
      activeObjectBoundingRect.width / this.viewportTransform[0];
  switch (align) {
    case "Top":
      activeObject.setPositionByOrigin(
        new fabric.Point(
          activeObject.getCenterPoint().x,
          activeObjectHeight / 2
        ),
        "center",
        "center"
      );
      break;
    case "Middle":
      activeObject.setPositionByOrigin(
        {
          x: activeObject.getCenterPoint().x,
          y: closestPage.height / 2,
        },
        "center",
        "center"
      );
      break;
    case "Bottom":
      activeObject.setPositionByOrigin(
        new fabric.Point(
          activeObject.getCenterPoint().x,
          closestPage.height - activeObjectHeight / 2
        ),
        "center",
        "center"
      );
      break;
    case "Left":
      activeObject.setPositionByOrigin(
        new fabric.Point(
          activeObjectWidth / 2,
          activeObject.getCenterPoint().y
        ),
        "center",
        "center"
      );
      break;
    case "Center":
      activeObject.setPositionByOrigin(
        {
          x: closestPage.width / 2,
          y: activeObject.getCenterPoint().y,
        },
        "center",
        "center"
      );
      break;
    case "Right":
      activeObject.setPositionByOrigin(
        new fabric.Point(
          closestPage.width - activeObjectWidth / 2,
          activeObject.getCenterPoint().y
        ),
        "center",
        "center"
      );
      break;
  }
  activeObject.setCoords();
  this.requestRenderAll();
};

var canvas = new fabric.Canvas("canvas", {
  preserveObjectTracking: true,
});
var isTrial = true; // chris for debug, need to be true
var isRunning = false;

// current unsaved state
var state;
// past states
var undo = [];
// reverted states
var redo = [];
// font list
var privateFonts = [];

$(function () {
  // chris
  setTimeout(() => {
    // let appObj = JSON.parse(objectCallBack.getRegistrationDetails())
    if (IsActivated) {
      $(".download-li").css("display", "block");
      $(".activation-li").css("display", "none");
    }
  }, 1000);
  setInterval(() => {
    canvas.renderAll();
  }, 250);
  initCustomization();
  initBrushes();
  CheckPressedKey("#transform_w_val", "widthscale");
  CheckPressedKey("#transform_h_val", "heightscale");
  CheckPressedKey("#transform_angle_val", "angle");
  CheckPressedKey("#transform_s_val", "skew");
  $("#transform_w").on("change", function () {
    let activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        scaleX: parseFloat($(this).val()) / 100,
      });
      activeObject.setCoords();
      canvas.requestRenderAll();
    }
  });
  $("#transform_w_val").on("change", function () {
    $(this).val(parseFloat($(this).val()) + "%");
    $("#transform_w").val(parseFloat($(this).val()) + "%");
    let activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        scaleX: parseFloat($(this).val()) / 100,
      });
      activeObject.setCoords();
      canvas.requestRenderAll();
    }
  });
  $("#transform_h").on("change", function () {
    let activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        scaleY: parseFloat($(this).val()) / 100,
      });
      activeObject.setCoords();
      canvas.requestRenderAll();
    }
  });
  $("#transform_h_val").on("change", function () {
    $(this).val(parseFloat($(this).val()) + "%");
    $("#transform_h").val(parseFloat($(this).val()) + "%");
    let activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        scaleY: parseFloat($(this).val()) / 100,
      });
      activeObject.setCoords();
      canvas.requestRenderAll();
    }
  });
  $("#transform_angle").on("change", function () {
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
        angle: parseInt($(this).val()),
      });
      activeObject.setCoords();
      canvas.requestRenderAll();
    }
  });
  $("#transform_angle_val").on("change", function () {
    $("#transform_angle").val($(this).val());
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
        angle: parseInt($(this).val()),
      });
      activeObject.setCoords();
      canvas.requestRenderAll();
    }
  });
  $("#transform_s").on("change", function () {
    let activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        skewX: parseInt($(this).val()),
        //skewY: parseInt($(this).val())
      });
      activeObject.setCoords();
      canvas.requestRenderAll();
    }
  });
  $("#transform_s_val").on("change", function () {
    $("#transform_s").val($(this).val());
    let activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({
        skewX: parseInt($(this).val()),
        //skewY: parseInt($(this).val())
      });
      activeObject.setCoords();
      canvas.requestRenderAll();
    }
  });
  // end chris
});

/**
 * Push the current state into the undo stack and then capture the current state
 */
function save() {
  canvas.fire("modify:custom");
  // clear the redo stack
  redo = [];
  $("#btnRedo").prop("disabled", true);
  // initial call won't have a state
  if (state) {
    undo.push(state);
    $("#btnUndo").prop("disabled", false);
  }
  state = JSON.stringify(
    canvas.toJSON([
      "id",
      "lockScalingFlip",
      "lockMovementX",
      "lockMovementY",
      "lockScalingX",
      "lockScalingY",
      "lockRotation",
      "selectable",
      "editable",
    ])
  );
  isUpdated = true;

  window.electronAPI.setIsUpdated(true);

  var json = getJson();
  var fname = jQuery(".india_font_filename").val() || "untitled";
  window.electronAPI.setFileContent(json, fname);
}

/**
 * Save the current state in the redo stack, reset to a state in the undo stack, and enable the buttons accordingly.
 * Or, do the opposite (redo vs. undo)
 * @param playStack which stack to get the last state from and to then render the canvas as
 * @param saveStack which stack to push current state into
 * @param buttonsOn jQuery selector. Enable these buttons.
 * @param buttonsOff jQuery selector. Disable these buttons.
 */
function replay(playStack, saveStack, buttonsOn, buttonsOff) {
  saveStack.push(state);
  state = playStack.pop();
  var on = $(buttonsOn);
  var off = $(buttonsOff);
  // turn both buttons off for the moment to prevent rapid clicking
  on.prop("disabled", true);
  off.prop("disabled", true);
  canvas.clear();
  canvas.loadFromJSON(state, function () {
    canvas.renderAll();
    // now turn the buttons back on if applicable
    on.prop("disabled", false);
    if (playStack.length) {
      off.prop("disabled", false);
    }
    canvas.fire("modify:custom");
  });
}

function initBrushes() {
  if (!fabric.PatternBrush) return;

  initVLinePatternBrush();
  initHLinePatternBrush();
  initSquarePatternBrush();
  initDiamondPatternBrush();
  initImagePatternBrush();
}

function initCustomization() {
  if (typeof Cufon !== "undefined" && Cufon.fonts.delicious) {
    Cufon.fonts.delicious.offsetLeft = 75;
    Cufon.fonts.delicious.offsetTop = 25;
  }

  if (/(iPhone|iPod|iPad)/i.test(navigator.userAgent)) {
    fabric.Object.prototype.cornerSize = 30;
  }

  fabric.Object.prototype.transparentCorners = false;

  if (document.location.search.indexOf("guidelines") > -1) {
    initCenteringGuidelines(canvas);
    initAligningGuidelines(canvas);
  }
}

function getActiveProp(name) {
  var object = canvas.getActiveObject();
  if (!object) return "";

  return object[name]; // || '';
}

function setActiveProp(name, value) {
  var object = canvas.getActiveObject();
  if (!object) return;
  object.set(name, value).setCoords();
  canvas.renderAll();
  save();
}

function getActiveStyle(styleName, object) {
  object = object || canvas.getActiveObject();
  if (!object) return "";

  if (object.getSelectionStyles && object.isEditing) {
    if (object.getSelectionStyles().length > 0) {
      return object.getSelectionStyles()[0][styleName] || "";
    } else return object.getSelectionStyles()[styleName] || "";
  } else return object[styleName] || "";
}

function setActiveStyle(styleName, value, object) {
  object = object || canvas.getActiveObject();
  if (!object) return;

  if (object.setSelectionStyles && object.isEditing) {
    var style = {};
    style[styleName] = value;
    let startIndex = object.selectionStart;
    let endIndex = object.selectionEnd;

    console.log(style, startIndex, endIndex);

    if ((styleName = "charSpacing")) {
      object.setSelectionStyles(style, startIndex, endIndex);
      object.setCoords();
    } else {
      object.setSelectionStyles(style);
      object.setCoords();
    }

    //canvas.trigger('object:modified', { target: object });
  } else {
    object.set(styleName, value);
    if (object._objects != null && object._objects.length) {
      for (var i = 0; i < object._objects.length; i++) {
        object._objects[i].set(styleName, value);
      }
    }

    if (
      object.styles != null &&
      object.styles[0] != null &&
      object.styles[0][0] != null
    ) {
      for (var i = 0; object.styles[0][i] != null; i++) {
        if (object.styles[0][i][styleName] != null) {
          object.styles[0][i][styleName] = value;
        }
      }
    }

    //canvas.trigger('object:modified', { target: object });
  }

  object.setCoords();
  canvas.renderAll();
  save();
}

function getFontFamilyStyle(styleName) {
  var object = canvas.getActiveObject();
  if (!object) return "";

  if (object.getSelectionStyles && object.isEditing) {
    var family = object.getSelectionStyles()[styleName];
    if (family != undefined && family != "") return family;
    else return getActiveProp(styleName);
  } else return object[styleName] || "";
}

function updateScope() {
  canvas.renderAll();
  save();
}

function clearAllCanvasObjects() {
  openFilePath = null;
  isUpdated = false;
  window.electronAPI.setIsUpdated(false);
  canvas.clear();
  state = null;
  undo = [];
  redo = [];
  $("#btnRedo").prop("disabled", true);
  $("#btnUndo").prop("disabled", true);
}

function setConsoleJSON(value) {
  consoleJSONValue = value;
}

function _getSelectedText() {
  var object = canvas.getActiveObject();
  if (!object) return;
  return object.getSelectedText();
}

function setChartSpacingStyle(value) {
  var object = canvas.getActiveObject();
  if (!object) return;

  var seletedText = object.getSelectedText();
  if (seletedText === "") {
    object.selectAll();
    object.enterEditing();
  }

  if (object.setSelectionStyles && object.isEditing) {
    object.setSelectionStyles({
      letterSpace: value,
    });
  }

  if (seletedText === "") {
    object.exitEditing();
  }

  if (value > 0) {
    var ctx = object.ctx;
    var textLines = object.text.split(object._reNewline);
    var letterSpace =
      object.getSelectionStyles && object.isEditing && object.evented === true
        ? object.getSelectionStyles()["letterSpace"]
        : object["letterSpace"];
    object.width =
      object._getTextWidth(ctx, textLines, object) +
      object.text.length * letterSpace;
    object.height = object._getTextHeight(ctx, textLines, object);
    //object.callSuper('setCoords');
    object.setCoords();
  }

  canvas.renderAll();
  save();
}
