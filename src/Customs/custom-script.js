﻿function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear(),
    hour = d.getHours();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  if (hour.length < 2) hour = "0" + hour;

  return [year, month, day].join("/") + " " + hour + ":00";
}

var canvasScale = 1;
var SCALE_FACTOR = 1.2;
var oldActive = "";

var cursorX = 0;
var cursorY = 0;

var IsActivated = false;
var IsDemoScheduled = false;

var selectedColor = "#000000";

let currentCanvasHeight;
let currentCanvasWidth;

var setcanvasScale;
$(document).ready(function () {
  isTrial = window.electronAPI.checkIfTrial();
  $("body").addClass("deactive");

  fabric.IText.prototype.selectionColor = "rgba(94,94,94,0.5)";
  fabric.Object.prototype.objectCaching = false;
  canvas.preserveObjectStacking = true;
  canvas.fireRightClick = true;

  $(document).click(function (event) {
    var target = $(event.target);
    if (
      !jQuery(target).is("canvas") &&
      jQuery(target).hasClass("canvas_wrapper")
    ) {
      canvas.discardActiveObject();
      canvas.renderAll();
    }
    if (jQuery(target).is("canvas") && $(".zoomin_tool").hasClass("active")) {
      zoomIn();
    }
    if (jQuery(target).is("canvas") && $(".zoomout_tool").hasClass("active")) {
      zoomOut();
    }
    if (jQuery(target).is("canvas") && $(".zoomin_tool").hasClass("active")) {
      zoomIn();
    }
    if (jQuery(target).is("canvas") && $(".zoomout_tool").hasClass("active")) {
      zoomOut();
    }
  });

  $(".left_menu_strip.menu_strip .button").on("click", function () {
    if (!$(this).hasClass("zoom_shapes")) {
      disableShapeMode();
    }
  });

  //number input
  $("input.number").on("keypress keyup blur", function (event) {
    $(this).val(
      $(this)
        .val()
        .replace(/[^\d].+/, "")
    );
    if (event.which < 48 || event.which > 57) {
      event.preventDefault();
    }
  });

  //Zoom
  $(document).on("mousemove", function (e) {
    cursorX = e.pageX - $(".canvas_wrapper").offset().left;
    cursorY = e.pageY - $(".canvas_wrapper").offset().top;
  });

  //colorpicker
  $(".btn-group.clrpicker .color.color_selector").loads({
    flat: false,
    enableAlpha: false,
    layout: "rgbhex",
    compactLayout: true,
    color: "000000",
    backgroundColor: "#666",
    onLoaded: function (ev) {
      $(".btn-group.clrpicker .wcolpick").css("margin-top", "5px");
    },
    onChange: function (ev) {
      $(".btn-group.clrpicker .color.color_selector").css(
        "background-color",
        "#" + ev.hex
      );
      setFill("#" + ev.hex);
    },
  });

  $(".india_font_canvas_size").on("change", function () {
    var val = $(".india_font_canvas_size").children("option:selected").val();
    if (val == "Custom") {
      $(".pop_row.custom_size").show();
    } else {
      $(".pop_row.custom_size").hide();
    }
  });

  fabric.IText.prototype.onKeyDown = (function (onKeyDown) {
    return function (e) {
      var activeObject = canvas.getActiveObject();

      var val = getActiveProp("lockScalingFlip");
      if (!val) {
        if (e.keyCode == 27) {
          canvas.discardActiveObject();
          canvas.renderAll();
          return;
        }

        if (magneticSectionEnabled) {
          if (activeObject) {
            switch (e.keyCode) {
              case 37:
                moveSelected(Direction.LEFT);
                e.preventDefault();

                break;
              case 39:
                moveSelected(Direction.RIGHT);
                event.preventDefault();

                break;
            }
          }
        } else {
          canvas.getActiveObject().setCoords();
          canvas.renderAll();

          onKeyDown.call(this, e);
        }
      } else {
        onKeyDown.call(this, e);
      }
    };
  })(fabric.IText.prototype.onKeyDown);

  $(".zoomin_tool").click(function (event, holding) {
    if (holding != "space") zoomIn();
  });
  //button Zoom Out
  $(".zoomout_tool").click(function (event, holding) {
    if (holding != "space") zoomOut();
  });
  //button Reset Zoom
  $("#btnResetZoom").click(function () {
    resetZoom();
  });
});

function ShowContextMenuAt(ev) {
  var gCanvasElement = document.getElementById("canvas");
  var x;
  var y;

  x = ev.pageX;
  y = ev.pageY - 80;

  console.log(x, y);

  jQuery(".context_menu").css({
    left: x,
    top: y,
  });
  jQuery(".context_menu").addClass("open");

  if (!canvas.getActiveObject()) {
    $(".context_menu .modifymask").hide();
    $(".context_menu .resolvemask").hide();
    $(".context_menu .clip").hide();
    $(".context_menu .cut").hide();
    $(".context_menu .copy").hide();
    $(".context_menu .zoomin").show();
    $(".context_menu .zoomout").show();
    $(".context_menu .zoom.divider").hide();
    $(".context_menu .lock").hide();
    $(".context_menu .unlock").hide();
    $(".context_menu .lock.divider").hide();
    $(".context_menu .group").hide();
    $(".context_menu .ungroup").hide();
    $(".context_menu .convert").hide();
    $(".context_menu .magnetic").hide();
    $(".context_menu .group.divider").hide();
    $(".context_menu .upward").hide();
    $(".context_menu .backward").hide();
    $(".context_menu .front").hide();
    $(".context_menu .back").hide();
    $(".context_menu .upward.divider").hide();
    $(".context_menu .ruler").hide();
    $(".context_menu .guide").show();
    $(".context_menu .panel").hide();
    $(".context_menu .resetpanel").show();
  } else {
    $(".context_menu .clip").hide();
    $(".context_menu .cut").show();
    $(".context_menu .copy").show();
    $(".context_menu .zoomin").hide();
    $(".context_menu .zoomout").hide();
    $(".context_menu .zoom.divider").hide();
    $(".context_menu .lock").show();
    $(".context_menu .unlock").show();
    $(".context_menu .lock.divider").show();

    $(".context_menu .group").hide();
    $(".context_menu .ungroup").hide();
    $(".context_menu .convert").hide();
    $(".context_menu .magnetic").hide();
    $(".context_menu .group.divider").show();

    $(".context_menu .modifymask").hide();
    $(".context_menu .resolvemask").hide();

    if (canvas.getActiveObject().type == "activeSelection")
      $(".context_menu .group").show();
    if (canvas.getActiveObject().type == "group")
      $(".context_menu .ungroup").show();

    if (canvas.getActiveObject().type == "i-text") {
      $(".context_menu .convert").show();
      $(".context_menu .magnetic").show();
    } else if (
      canvas.getActiveObject().type != "activeSelection" &&
      canvas.getActiveObject().type != "group"
    ) {
      $(".context_menu .group.divider").hide();
    }

    if (canvas.getActiveObject().type == "activeSelection") {
      var nonimage = null;
      var image = null;

      for (var i = 0; i < canvas.getActiveObjects().length++; i++) {
        if (
          canvas.getActiveObjects()[i].type == "image" ||
          canvas.getActiveObjects()[i].type == "texture"
        )
          image = canvas.getActiveObjects()[i];
        else nonimage = canvas.getActiveObjects()[i];
      }
      if (image && nonimage) {
        var io = canvas.getObjects().indexOf(image);
        var no = canvas.getObjects().indexOf(nonimage);
        if (io < no) {
          $(".context_menu .clip").show();
        }
      }
    }

    if (canvas.getActiveObject().isMasked) {
      $(".context_menu .modifymask").show();
      $(".context_menu .resolvemask").show();
    }

    $(".context_menu .upward").show();
    $(".context_menu .backward").show();
    $(".context_menu .front").show();
    $(".context_menu .back").show();
    $(".context_menu .upward.divider").hide();

    $(".context_menu .ruler").hide();
    $(".context_menu .guide").hide();
    $(".context_menu .panel").hide();
    $(".context_menu .resetpanel").hide();
  }

  jQuery(".context_menu").css("display", "none");

  setTimeout(function () {
    var elementHeight = jQuery(".context_menu").height();
    var gCanvasHeight = $(".canvas_wrapper").height();

    if (y + elementHeight > gCanvasHeight) {
      y -= elementHeight;
    }

    jQuery(".context_menu").css({
      left: x,
      top: y,
    });
    jQuery(".context_menu").css("display", "block");
  }, 1);
}

function zoomIn() {
  // TODO limit the max canvas zoom in
  var middle_container_height = $(".canvas-layout").height();

  if (canvas.getHeight() * SCALE_FACTOR > 3 * middle_container_height) {
    return;
  }

  canvasScale = canvasScale * SCALE_FACTOR;

  canvas.setHeight(canvas.getHeight() * SCALE_FACTOR);
  canvas.setWidth(canvas.getWidth() * SCALE_FACTOR);

  var vpt = canvas.viewportTransform.slice(0);
  vpt[0] = canvasScale;
  vpt[3] = canvasScale;
  canvas.setViewportTransform(vpt);

  canvas.renderAll();

  var left =
    (parseInt($("#draggable").css("left")) - cursorX) * SCALE_FACTOR + cursorX;
  var top =
    (parseInt($("#draggable").css("top")) - cursorY) * SCALE_FACTOR + cursorY;
  $("#draggable").css("left", left);
  $("#draggable").css("top", top);
}

// Zoom Out
function zoomOut() {
  // TODO limit max cavas zoom out
  var middle_container_height = $(".canvas-layout").height();

  if (canvas.getHeight() * SCALE_FACTOR < middle_container_height / 5) {
    return;
  }

  canvasScale = canvasScale / SCALE_FACTOR;

  canvas.setHeight(canvas.getHeight() * (1 / SCALE_FACTOR));
  canvas.setWidth(canvas.getWidth() * (1 / SCALE_FACTOR));

  var vpt = canvas.viewportTransform.slice(0);
  vpt[0] = canvasScale;
  vpt[3] = canvasScale;
  canvas.setViewportTransform(vpt);

  canvas.renderAll();

  var left =
    (parseInt($("#draggable").css("left")) - cursorX) / SCALE_FACTOR + cursorX;
  var top =
    (parseInt($("#draggable").css("top")) - cursorY) / SCALE_FACTOR + cursorY;
  $("#draggable").css("left", left);
  $("#draggable").css("top", top);
}

function disableShapeMode() {
  canvas.setFreeDrawingBrush("none");
  $("#shapes_btn").attr("class", "shapes_icon");
  $(".shapes_container").hide();
}

// Reset Zoom
function resetZoom() {
  if ($("#draggable").is(".ui-draggable")) {
    $("#draggable").draggable("destroy");
    $("canvas").css("pointer-events", "auto");
    jQuery(".selection_tool").trigger("click");
    jQuery("div#canvasPanel").addClass("selection_tool");
  }

  fitCanvas();
}

var lastFreeDrawingColor = "#000000";
var isLocked = false;
var fNameList = [];
const STEP = 10;

var Direction = {
  LEFT: 0,
  UP: 1,
  RIGHT: 2,
  DOWN: 3,
};

function SetRecentTemplates(recentTemplates) {
  var allFiles = recentTemplates.split("|");

  var allRecentBlocks = jQuery(".new-recent-file-block").find(".rec_temp");
  for (var i = 0; i < Math.min(12, allFiles.length); i++) {
    var fname = allFiles[i];
    var openFileName = escapePath(allFiles[i]);
    if (jQuery(`[onclick*='${doubleEscapePath(openFileName)}']`).length == 0) {
      jQuery(".templates_menu").append(
        jQuery(`
                <li><a href="javascript:;" onclick="OpenTappedTemplate('${openFileName}')">${fname}</a></li>
            `)
      );
    }
  }
  jQuery(allRecentBlocks).click(function () {
    var openFile = jQuery(this).find("img").attr("tag");
    if (openFile != "") {
      OpenTappedTemplate(openFile);
    }
  });
}

function OpenTappedTemplate(fname) {
  var data = objectCallBack.openTemplateFromPath(fname);

  if (data != null && data != "") {
    ShowCanvas();
    var jData = JSON.parse(data);
    if (
      jData != null &&
      jData != "" &&
      jData.FileContent != null &&
      jData.FileContent != ""
    ) {
      SetCanvasDimension(fdata.width, fdata.height);
      setTimeout(function () {
        isUpdated = false;
        _loadJSON(jData.FileContent, "");
      }, 500);
    }
  }
}

function escapePath(string) {
  return string.replace(/\\/g, "\\\\").replace(/\\\\*/g, "\\\\");
}

function doubleEscapePath(string) {
  return string.replace(/\\/g, "\\\\");
}

function SetRecentFiles(recentFiles) {
  var allFiles = recentFiles.split("~~^^~~");
  var allRecentBlocks = jQuery(".recent-file-blk")
    .find(".box_container")
    .find(".box_blk");
  var recentFileMenu = "";
  for (var i = 0; i < Math.min(10, allFiles.length); i++) {
    if (allFiles[i] != "") {
      var fname = allFiles[i].split("\\");
      var openFileName = escapePath(allFiles[i]);
      if (
        jQuery(`[onclick*='${doubleEscapePath(openFileName)}']`).length == 0
      ) {
        jQuery(".recent_files_menu").append(
          jQuery(`
                    <li><a href="javascript:;" onclick="OpenTappedFile('${openFileName}')">${
            fname[fname.length - 1]
          }</a></li>
                `)
        );
      }
    }
  }
  jQuery(allRecentBlocks).click(function () {
    var openFile = jQuery(this).find("img").attr("tag");
    if (openFile != "") {
      OpenTappedFile(openFile);
    }
  });
}

function resizeScreen() {
  $("body").addClass("deactive");

  $(".canvas-container").hide();
  $(".canvas_wrapper").hide();

  $(".update-canvas-popup").css("display", "block");
  $(".india_font_canvas_width_current").val(CanvasWidth + "px");
  $(".india_font_canvas_height_current").val(CanvasHeight + "px");

  editor.closeRightMenu();

  if (!isTrial) {
    $(".india_font_canvas_size_update").val("Custom");
    $(".pop_row.custom_size_update").show();
    $(".india_font_canvas_width_update").val("");
    $(".india_font_canvas_height_update").val("");
    $('input[name="orientation_update"]')[0].checked = true;
  }
}

function showMainScreen() {
  clearAllCanvasObjects();

  $("body").addClass("deactive");

  $(".canvas-container").hide();
  $(".canvas_wrapper").hide();

  selectedColor = "#000";
  $(".clrpicker .color_selector").css("background-color", selectedColor);

  $(".new-recent-file-block").css("display", "block");

  editor.closeRightMenu();

  if (!isTrial) {
    $(".india_font_canvas_size").val("Custom");
    $(".pop_row.custom_size").show();
    $(".india_font_canvas_width").val("");
    $(".india_font_canvas_height").val("");

    $('input[name="orientation"]')[0].checked = true;
  }
}

async function closeScreen() {
  if (!isTrial) {
    jQuery(".india_font_canvas_width").val("");
    jQuery(".india_font_canvas_height").val("");
    jQuery(".india_font_canvas_size").val("");
  }

  var count = getCanvasObjects();
  if (!isUpdated && count >= 0) {
    showMainScreen();
  }

  if (isUpdated) {
    const userResponse = await window.electronAPI.openConfimSaveDialog();

    if (userResponse === 0) {
      await saveDocument();
      jQuery(".india_font_filename").val("");
      window.electronAPI.clearOpenFilePath();
      showMainScreen();
    } else if (userResponse === 1) {
      jQuery(".india_font_filename").val("");
      window.electronAPI.clearOpenFilePath();
      showMainScreen();
    } else {
      return;
    }
  }
}

function ShowCanvas() {
  jQuery("canvas#canvas").show();
  clearAllCanvasObjects();

  jQuery(".new-recent-file-block").hide();
  $(".canvas-container").show();
  $(".canvas_wrapper").show();
  $("body").removeClass("deactive");

  $("#draggable").hide();
  setTimeout(function () {
    //Initialize canvas to center
    $("#draggable").show();
    $("#draggable").css(
      "left",
      `${$(".canvas_wrapper").width() / 2 - $("#draggable").width() / 2}px`
    );
    $("#draggable").css(
      "top",
      `${$(".canvas_wrapper").height() / 2 - $("#draggable").height() / 2}px`
    );
  }, 300);
}

function fitCanvas() {
  var height = canvas.getHeight();
  var middle_container_height = $(".canvas-layout").height();
  var i;

  if (height / SCALE_FACTOR > middle_container_height * 0.7) {
    for (i = height; i > middle_container_height * 0.7; i--) {
      canvasScale = canvasScale / SCALE_FACTOR;
      canvas.setWidth(canvas.getWidth() * (1 / SCALE_FACTOR));
      canvas.setHeight(canvas.getHeight() * (1 / SCALE_FACTOR));
      i = canvas.getHeight();
    }
  }

  if (height * SCALE_FACTOR < middle_container_height * 0.7) {
    for (i = height; i < middle_container_height * 0.7; i++) {
      canvasScale = canvasScale * SCALE_FACTOR;
      canvas.setWidth(canvas.getWidth() * SCALE_FACTOR);
      canvas.setHeight(canvas.getHeight() * SCALE_FACTOR);
      i = canvas.getHeight();
    }
  }

  var vpt = canvas.viewportTransform.slice(0);
  vpt[0] = canvasScale;
  vpt[3] = canvasScale;
  canvas.setViewportTransform(vpt);

  canvas.renderAll();

  $("#draggable").css(
    "left",
    `${$(".canvas_wrapper").width() / 2 - $("#draggable").width() / 2}px`
  );
  $("#draggable").css(
    "top",
    `${$(".canvas_wrapper").height() / 2 - $("#draggable").height() / 2}px`
  );
}

function SetCanvasDimension(width, height) {
  if (width > 0 && height > 0) {
    CanvasWidth = width;
    CanvasHeight = height;

    canvas.setDimensions({
      width: width,
      height: height,
    });
    canvasScale = 1;
    var vpt = canvas.viewportTransform.slice(0);
    vpt[0] = canvasScale;
    vpt[3] = canvasScale;
    canvas.setViewportTransform(vpt);

    showAllTools = true;
    $(".first_group_drag div").removeClass("active");
    $(".selection_tool").addClass("active");
    jQuery(".new-recent-file-block").hide();
    jQuery("div#new_file_popup").css("display", "none");
  }
}

function OpenTappedFile(path) {
  var count = getCanvasObjects();
  if (!isUpdated && count > 0) {
    _OpenTappedFile(path);
  } else {
    var data = objectCallBack.newDocument(count);
    if (data == 1) {
      setTimeout(function () {
        saveDocument();
        _OpenTappedFile(path);
      }, 2000);
    } else if (data == 0) {
      _OpenTappedFile(path);
    }
  }
}

function _OpenTappedFile(path) {
  var data = objectCallBack.openDocumentFromPath(path);

  if (data != null && data != "") {
    ShowCanvas();

    //alert("Data Found");
    var jData = JSON.parse(data);
    if (
      jData != null &&
      jData != "" &&
      jData.FileContent != null &&
      jData.FileContent != ""
    ) {
      var fdata = JSON.parse(jData.FileContent);
      SetCanvasDimension(fdata.width, fdata.height);

      //alert("Load Data");
      setTimeout(function () {
        isUpdated = false;
        _loadJSON(jData.FileContent, jData.Path);
      }, 500);
    }
  }
}

var useSystemFont = 0;
var isHoverBind = 0;
jQuery(function () {
  jQuery(document).on("click", "#select2-ddlFontFamily-container", function () {
    if (isHoverBind == 0) BindFontPreviewEffect();
  });

  jQuery(document).on("keydown", ".select2-search__field", function () {
    if (isHoverBind == 0) BindFontPreviewEffect();
  });
  // BindFontPreviewEffect();
});

function BindFontPreviewEffect() {
  // console.log("Bind Hover");
  // isHoverBind = 1;
  setTimeout(function () {
    jQuery("#select2-ddlFontFamily-results li").hover(
      function () {
        setFontFamily(jQuery(this).html());
      },
      function () {
        setFontFamily(jQuery("#ddlFontFamily").val());
      }
    );
  }, 80);
}

function PreviewFont(fontvalue) {
  var val = fontvalue;
  setFontStyle(val);
}

function CheckAndLoadFont() {
  setFontStyle($("#ddlFontFamily").val());
}

function getCursorPosition(ev) {
  var gCanvasElement = document.getElementById("canvas");
  var x;
  var y;
  if (ev.pageX || ev.pageY) {
    x = ev.pageX;
    y = ev.pageY;
  } else {
    x =
      ev.clientX +
      document.body.scrollLeft +
      document.documentElement.scrollLeft;
    y =
      ev.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  x -= gCanvasElement.offsetLeft;
  y -= gCanvasElement.offsetTop;
  y -= 80;
  x -= 50;
  if (y > 10) {
    __addIText(x, y);
  }
}

function hexToRgb(hex) {
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function _isLocked() {
  var val = getActiveProp("lockScalingFlip");
  return val;
}

function removeDropShadow() {
  var activeObject = canvas.getActiveObject();
  if (activeObject) {
    activeObject.setShadow({
      color: "transparent",
      blur: "1",
      offsetX: "0",
      offsetY: "0",
    });
    canvas.renderAll();
    save();
    var allInputs = jQuery("#dropShadowHoder").find("input"); //
    allInputs[0].value = 100;
    allInputs[1].value = 0;
    allInputs[2].value = 0;
    allInputs[3].value = 1;
    jQuery("#dropShadowHoder")
      .find(".color_selector")
      .css("background-color", "rgb(0,0,0)");
  }
}

function applyDropShadow() {
  //Get Values
  var allInputs = jQuery("#dropShadowHoder").find("input"); //
  var activeObject = canvas.getActiveObject();
  if (!activeObject) return;

  var x = parseInt(allInputs[1].value);
  var y = parseInt(allInputs[2].value);
  var colorVal = jQuery("#dropShadowHoder")
    .find(".color_selector")
    .css("background-color");
  var a = parseInt(allInputs[0].value);
  var blurVal = parseInt(allInputs[3].value);
  colorVal = colorVal.replace(")", "," + a / 100 + ")");

  activeObject.setShadow({
    color: colorVal,
    blur: blurVal,
    offsetX: x,
    offsetY: y,
  });
  canvas.renderAll();
  save();

  //0 Opacity
  //1 X offset
  //2 Y offset
  //3 blur
  //4 color
}
var magneticSectionEnabled = false;
var selectionStarIndex = -1;
var selectionEndIndex = 0;

function SelectNextIndex() {
  var activeObject = canvas.getActiveObject();
  var strlen = getText().length;
  console.log(strlen + " " + selectionEndIndex);

  if (selectionEndIndex < strlen) {
    selectionStarIndex++;
    selectionEndIndex++;
    SetMagneticSelection();
  }
}

function SetMagneticSelection() {
  var activeObject = canvas.getActiveObject();
  // console.log(activeObject)
  if (activeObject) {
    actObject = activeObject;
    jQuery(".btn_mgnt").addClass("target");
    activeObject.selectionStart = selectionStarIndex;
    activeObject.selectionEnd = selectionEndIndex;
    activeObject.enterEditing();
    canvas.renderAll();
    GetUnicodeOperation(_getSelectedText());
  }
}

function SelectPreviousIndex() {
  if (selectionStarIndex > 0) {
    selectionStarIndex--;
    selectionEndIndex--;
    SetMagneticSelection();
  }
}

function ResizeCanvas() {}

function UseSystemFont(flag) {
  useSystemFont = flag;
  if (flag) {
    jQuery(".ddlAPPFont").hide();
    jQuery(".ddlSystemFont").show();
  } else {
    jQuery(".ddlAPPFont").show();
    jQuery(".ddlSystemFont").hide();
  }
  jQuery(".font_dropdown").hide();
}
var showAllTools = false;

function setAllTools() {
  if ($(".canvas-container").css("display") != "none") {
    showAllTools = true;
    return showAllTools;
    //alert(showAllTools);
  } else {
    showAllTools = false;
    return showAllTools;
    //alert(showAllTools);
  }
}

var filters = [
  "grayscale",
  "invert",
  "remove-color",
  "sepia",
  "brownie",
  "brightness",
  "contrast",
  "saturation",
  "noise",
  "vintage",
  "pixelate",
  "blur",
  "sharpen",
  "emboss",
  "technicolor",
  "polaroid",
  "blend-color",
  "gamma",
  "kodachrome",
  "blackwhite",
  "blend-image",
  "hue",
  "resize",
];

async function PullClipArtsFromFolder(folder, object) {
  jQuery(".sub_box_container_holder").show();
  jQuery(".lib_box_blk #close_box").show();
  jQuery(".lib_tab_content_container").show();
  jQuery(".lib_tab_content_container_parent").hide();
  jQuery(".lib_box_blk #close_box").attr("tag", "clip_art_box");

  var data = await window.electronAPI.pullLibraryFiles(
    `library/ClipArts/${folder}/Small`
  );

  var htmlCont = "";
  if (data.length > 0)
    for (var i = 0; i < data.length; i++) {
      htmlCont +=
        "<div class='sub_box_blk'><img src='../../library/ClipArts/" +
        folder +
        "/Small/" +
        data[i] +
        "' onclick=\"SetCavasBackgroundImage('" +
        data[i] +
        "','../../library/ClipArts/" +
        folder +
        "')\" ></div>";
    }

  jQuery(".sub_box_container_holder")
    .find(".sub_box_container_box")
    .html(htmlCont);
}

async function PullColorArtsFromFolder(folder, object) {
  jQuery(".sub_box_container_holder").show();
  jQuery(".lib_box_blk #close_box").show();
  jQuery(".lib_tab_content_container").show();
  jQuery(".lib_tab_content_container_parent").hide();
  jQuery(".lib_box_blk #close_box").attr("tag", "color_art_box");

  var data = await window.electronAPI.pullLibraryFiles(
    `library/ColorArts/${folder}/Small`
  );

  var htmlCont = "";
  if (data.length > 0)
    for (var i = 0; i < data.length; i++) {
      htmlCont +=
        "<div class='sub_box_blk'><img src='../../library/ColorArts/" +
        folder +
        "/Small/" +
        data[i] +
        "' onclick=\"SetCavasBackgroundImage('" +
        data[i] +
        "','../../library/ColorArts/" +
        folder +
        "')\" ></div>";
    }

  jQuery(".sub_box_container_holder")
    .find(".sub_box_container_box")
    .html(htmlCont);
}

async function PullBackgroundFromFolders(folder, object) {
  jQuery(".sub_box_container_holder").show();
  jQuery(".lib_tab_content_container").show();
  jQuery(".lib_box_blk #close_box").show();
  jQuery(".lib_box_blk #close_box").attr("tag", "background_box");
  jQuery(".lib_tab_content_container_parent").hide();

  var data = await window.electronAPI.pullLibraryFiles(
    `library/Background/${folder}/Small`
  );

  var htmlCont = "";
  if (data.length > 0)
    for (var i = 0; i < data.length; i++) {
      htmlCont +=
        "<div class='sub_box_blk'><img src='../../library/Background/" +
        folder +
        "/Small/" +
        data[i] +
        "' onclick=\"SetCavasBackgroundImage('" +
        data[i] +
        "','../../library/Background/" +
        folder +
        "')\" ></div>";
    }

  jQuery(".sub_box_container_holder")
    .find(".sub_box_container_box")
    .html(htmlCont);
}
$(function () {
  fabric.Canvas.prototype.getUnlocked = function () {
    var objectList = [],
      objects = this.getObjects();

    for (var i = 0, len = this.size(); i < len; i++) {
      if (objects[i].selectable) {
        objectList.push(objects[i]);
      }
    }

    return objectList;
  };
  jQuery(".lib_box_blk #close_box").click(function () {
    jQuery("." + jQuery(this).attr("tag")).show();

    jQuery(".sub_box_container_holder").hide();
    jQuery(".lib_box_blk #close_box").hide();
  });

  $('[data-toggle="tooltip"]').tooltip();
});
$(document).ready(function () {
  jQuery("#ddlTextHeight").change(function () {
    setLineHeight(parseInt(jQuery(this).val()));
  });

  jQuery("#ddlTextHeight1").change(function () {
    setLineHeight(parseInt(jQuery(this).val()));
  });

  jQuery("#ddlTextHeightVal").change(function () {
    setLineHeight(parseInt(jQuery(this).val()));
  });

  jQuery(".ddlAppFontVal").click(function () {
    jQuery("#ddlFontFamily").show();
  });

  jQuery(".ddlSystemFontFamilyVal").click(function () {
    jQuery("#ddlSystemFontFamily").show();
  });
  jQuery(".create_btn").click(function () {
    createCanvas();
  });
  jQuery("#update_canvas .update_btn").click(function () {
    updateCanvas();
  });
  jQuery("#update_canvas .cancel_btn").click(function () {
    jQuery(".update-canvas-popup").hide();

    $("body").removeClass("deactive");

    $(".canvas-container").show();
    $(".canvas_wrapper").show();
    $("canvas#canvas").show();
  });

  jQuery("#btn_mgnt").click(function () {
    var activeObject = canvas.getActiveObject();

    if (
      activeObject &&
      activeObject.type == "i-text" &&
      !magneticSectionEnabled
    ) {
      //alert('in')
      magneticSectionEnabled = true;

      jQuery(this).addClass("btn_mgnt target");
      selectionStarIndex = -1;
      selectionEndIndex = 0;
      SelectNextIndex();
    } else {
      magneticSectionEnabled = false;
      //clear selection
      if (activeObject) {
        activeObject.selectionStart = selectionStarIndex;
        activeObject.selectionEnd = selectionStarIndex;
        activeObject.exitEditing();
      }
      canvas.renderAll();
      jQuery(this).removeClass("btn_mgnt").removeClass("target");
      ClearLetterVariable();
    }
  });

  jQuery("#btnLeft").click(function () {
    if (magneticSectionEnabled) SelectPreviousIndex();
  });

  jQuery("#btnRight").click(function () {
    if (magneticSectionEnabled) SelectNextIndex();
  });

  window.localStorage.setItem("fontListOpened", false);

  document.addEventListener("keydown", function (event) {
    var activeObject = canvas.getActiveObject();

    if (magneticSectionEnabled) {
      activeObject = actObject;
    }

    let fontListOpened = window.localStorage.getItem("fontListOpened");

    if (activeObject) {
      switch (event.keyCode) {
        case 37:
          if (fontListOpened === "false") {
            moveSelected(Direction.LEFT);
          }
          event.preventDefault();

          break;
        case 38:
          console.log(fontListOpened);
          if (fontListOpened === "false") {
            moveSelected(Direction.UP);
          }
          break;
        case 39:
          if (fontListOpened === "false") {
            moveSelected(Direction.RIGHT);
          }
          event.preventDefault();

          break;
        case 40:
          console.log(fontListOpened);
          if (fontListOpened === "false") {
            moveSelected(Direction.DOWN);
          }
          break;
      }
    }
  });

  jQuery("#opacitySelector").change(function () {
    setOpacity(jQuery(this).val());
  });

  jQuery("#opacitySelector1").change(function () {
    setOpacity(jQuery(this).val());
  });

  jQuery("#opacitySelectorVal").change(function () {
    setOpacity(jQuery(this).val());
  });

  document
    .getElementById("canvasPanel")
    .addEventListener("mousedown", function (e) {});

  canvas.on("mouse:down", function (options) {
    if (___addTextClicked) {
      if (
        options.target == null ||
        !(options.target.type == "i-text" && options.target.isEditing)
      ) {
        __addIText(
          options.e.offsetX / canvasScale,
          options.e.offsetY / canvasScale
        );
        // ___addTextClicked = false;
        $(".middle_container.canvas-layout").removeClass("text_tool");
        oldActive = "";
      }
    }

    if (options.button == 3) {
      ShowContextMenuAt(options.e);
    }

    $(".wcolpick").css("display", "none");
  });

  $(".select2").select2();

  $(".backgroundcolor").click(function () {
    var color = $(this).css("background-color");
    setCavasBgColor(color);
  });

  $("#ddlFontFamily").change(function () {
    if (isRunning == false) {
      var val = $("#ddlFontFamily").val();
      setFontStyle(val);
    } else {
      isRunning = false;
    }
  });

  $("#ddlTextHeight").bind("keyup mouseup", function () {
    var val = $("#ddlTextHeight").val();
    if (val != "" && val != null && $.isNumeric(val)) {
      setLineHeight(val);
    }
  });

  $("#ddlTextHeight1").bind("keyup mouseup", function () {
    var val = $("#ddlTextHeight1").val();
    if (val != "" && val != null && $.isNumeric(val)) {
      setLineHeight(val);
    }
  });

  $("#ddlTextWidth").bind("keyup mouseup", function () {
    var val = $("#ddlTextWidth").val();
    if (val != "" && val != null && $.isNumeric(val)) {
      setCharSpacing(val);
    }
  });

  $("#ddlTextWidth1").bind("keyup mouseup", function () {
    var val = $("#ddlTextWidth1").val();
    if (val != "" && val != null && $.isNumeric(val)) {
      setCharSpacing(val);
    }
  });

  jQuery("#txtFontSize")
    .select2({
      tags: true,
    })
    .change(function () {
      var val = parseInt(jQuery(this).val());
      setFontSize(val);
    });

  jQuery("#txtFontSize1").change(function () {
    var val = parseInt(jQuery(this).val());
    setFontSize(val);
  });

  jQuery("#txtFontSizeVal").change(function () {
    var val = parseInt(jQuery(this).val());
    if (val) {
      setFontSize(val);
    }
  });

  jQuery("#txtTracking").change(function () {
    var val = parseInt(jQuery(this).val());
    setTracking(val);
  });

  jQuery("#txtTrackingVal").change(function () {
    var val = parseInt(jQuery(this).val());
    if (val) {
      setTracking(val);
    }
  });

  $("#ddlFontSize").change(function () {
    var val = $("#ddlFontSize").val();
    setFontSize(val);
  });

  // undo and redo buttons
  $("#btnUndo").click(function () {
    replay(undo, redo, "#btnRedo", this);
  });

  $("#btnRedo").click(function () {
    replay(redo, undo, "#btnUndo", this);
  });

  $("#txtFontSize").bind("keyup mouseup", function () {
    var val = $(this).val();
    if (val != "" && val != null && $.isNumeric(val)) {
      setFontSize(val);
    } else {
      WarningToastr("please enter number");
    }
  });

  $("#chkFreeDrawingMode").change(function () {
    var isChecked = $(this).is(":checked");
    if (isChecked) {
      setFreeDrawingMode(isChecked);
      $(".freeDrawingControl").removeAttr("disabled");
    } else {
      setFreeDrawingMode(isChecked);
      $(".freeDrawingControl").attr("disabled", "disabled");
    }
  });

  $("#ddlDrawingMode").change(function () {
    setDrawingMode($("#ddlDrawingMode").val());
  });

  $("#btnActivateNow").click(function () {
    $("#myActivation").modal("show");
  });

  $(".selection_tool").click(function () {
    ___addTextClicked = false;
    canvas.discardActiveObject();
    canvas.renderAll();
  });

  $(".hand_tool").click(function () {
    disableShapeMode();
  });
  $(".text_tool").click(function () {
    disableShapeMode();
    setAllTools();
    //set default size
    jQuery("#txtFontSizeVal").val("40");

    //alert(showAllTools)
    if (showAllTools == true) {
      if (!$(this).hasClass("text_tool")) ___addTextClicked = false;

      if (oldText) {
        if (oldText.text == "") {
          canvas.remove(oldText);
        }
      }
    }
  });
});

var CanvasWidth = 0;
var CanvasHeight = 0;

function createNewCanvas(width, height) {
  //counting objects from zero

  $(".canvas-container").show();
  $(".canvas_wrapper").show();
  $("body").removeClass("deactive");

  CanvasWidth = width;
  CanvasHeight = height;
  canvasScale = 1;

  jQuery("canvas#canvas").show();

  canvas.setDimensions({
    width,
    height,
  });
  fitCanvas();

  showAllTools = true;
  $(".first_group_drag div").removeClass("active");
  $(".selection_tool").addClass("active");
  jQuery(".new-recent-file-block").hide();
  editor.tree.updateTree();
}

function updateNewCanvas(width, height) {
  //counting objects from zero

  $(".canvas-container").show();
  $(".canvas_wrapper").show();
  $("body").removeClass("deactive");

  CanvasWidth = width;
  CanvasHeight = height;
  canvasScale = 1;

  jQuery("canvas#canvas").show();

  canvas.setDimensions({
    width,
    height,
  });
  fitCanvas();

  showAllTools = true;
  $(".first_group_drag div").removeClass("active");
  $(".selection_tool").addClass("active");
  jQuery(".update-canvas-popup").hide();
  editor.tree.updateTree();
}

function updateCanvas() {
  var width = 0;
  var height = 0;

  var val = $(".india_font_canvas_size_update")
    .children("option:selected")
    .val();

  if (val == "Custom") {
    width =
      parseInt(jQuery(".india_font_canvas_width_update").val()) > 0
        ? parseInt(jQuery(".india_font_canvas_width_update").val())
        : 0;
    height =
      parseInt(jQuery(".india_font_canvas_height_update").val()) > 0
        ? parseInt(jQuery(".india_font_canvas_height_update").val())
        : 0;
  } else {
    var extractedWH = val.split("X");
    width = extractedWH[0];
    height = extractedWH[1];
  }

  if (!width || !height) {
    return window.electronAPI.openInfoDialog(
      "Please provide canvas width and height"
    );
  }

  if (
    document.querySelector('input[name="orientation_update"]:checked').value ==
    "landscape"
  ) {
    var tmp_width = width;
    var tmp_height = height;
    width = Math.max(tmp_width, tmp_height);
    height = Math.min(tmp_width, tmp_height);
  } else {
    var tmp_width = width;
    var tmp_height = height;
    width = Math.min(tmp_width, tmp_height);
    height = Math.max(tmp_width, tmp_height);
  }

  if (
    val == "Custom" &&
    (width < 96 || width > 3508 || height < 96 || height > 3508)
  ) {
    window.electronAPI.openInfoDialog(
      "Please provide canvas width and height within 96x96 ~ 3508x3508"
    );
  } else {
    updateNewCanvas(width, height);
  }
}

function createCanvas() {
  var width = 0;
  var height = 0;

  var val = $(".india_font_canvas_size").children("option:selected").val();

  if (val == "Custom") {
    width =
      parseInt(jQuery(".india_font_canvas_width").val()) > 0
        ? parseInt(jQuery(".india_font_canvas_width").val())
        : 0;
    height =
      parseInt(jQuery(".india_font_canvas_height").val()) > 0
        ? parseInt(jQuery(".india_font_canvas_height").val())
        : 0;
  } else {
    var extractedWH = val.split("X");
    width = extractedWH[0];
    height = extractedWH[1];
  }

  if (!width || !height) {
    // alert("Please provide canvas width and height");

    return window.electronAPI.openInfoDialog(
      "Please provide canvas width and height"
    );
  }

  currentCanvasHeight = height;
  currentCanvasWidth = width;

  if (
    document.querySelector('input[name="orientation"]:checked').value ==
    "landscape"
  ) {
    var tmp_width = width;
    var tmp_height = height;
    width = Math.max(tmp_width, tmp_height);
    height = Math.min(tmp_width, tmp_height);
  } else {
    var tmp_width = width;
    var tmp_height = height;
    width = Math.min(tmp_width, tmp_height);
    height = Math.max(tmp_width, tmp_height);
  }

  if (
    val == "Custom" &&
    (width < 96 || width > 3508 || height < 96 || height > 3508)
  ) {
    window.electronAPI.openInfoDialog(
      "Please provide canvas width and height within 96x96 ~ 3508x3508"
    );
  } else {
    createNewCanvas(width, height);
  }
}

function moveSelected(direction) {
  var activeObject = canvas.getActiveObject();
  if (!activeObject.isEditing) {
    switch (direction) {
      case Direction.LEFT:
        if (magneticSectionEnabled) SelectPreviousIndex();
        else activeObject.left = activeObject.left - STEP;
        break;
      case Direction.UP:
        if (!magneticSectionEnabled) activeObject.top = activeObject.top - STEP;

        break;
      case Direction.RIGHT:
        if (magneticSectionEnabled) SelectNextIndex();
        else activeObject.left = activeObject.left + STEP;
        break;
      case Direction.DOWN:
        if (!magneticSectionEnabled) activeObject.top = activeObject.top + STEP;
        break;
    }
  }
  if (!magneticSectionEnabled) {
    activeObject.setCoords();
    canvas.renderAll();
  }
}

function WarningToastr(message) {
  if (!(message != undefined && message != null)) {
    message = "";
  }

  iziToast.destroy();
  iziToast.warning({
    timeout: 3000,
    title: "Warning",
    message: message,
    position: "topLeft",
    transitionIn: "flipInX",
    transitionOut: "flipOutX",
  });
}

function ErrorToastr(message) {
  if (!(message != undefined && message != null)) {
    message = "";
  }

  iziToast.destroy();
  iziToast.error({
    timeout: 3000,
    id: "error",
    title: "Error",
    message: message,
    position: "topLeft",
    transitionIn: "fadeInDown",
  });
}

function SuccessToastr(message) {
  if (!(message != undefined && message != null)) {
    message = "";
  }

  iziToast.destroy();
  iziToast.success({
    timeout: 3000,
    id: "success",
    title: "Success",
    message: message,
    theme: "light", // dark
    position: "topRight",
    transitionIn: "bounceInLeft",
  });
}

function ValidateAndSubmit() {
  var result = objectCallBack.scheduleDemo(
    jQuery("#demo_schedule_datetime").val()
  );

  if (result) $("#scheduleDemo").modal("hide");
}

function CloseThisModalForm(obj) {
  jQuery("#" + obj)
    .find(".close")
    .trigger("click");
  return false;
}

function ScheduleDemo() {
  //debugging parameter
  if (IsDemoScheduled) return;

  $("#scheduleDemo").modal("show", {
    backdrop: "static",
    keyboard: false,
  });
}
var isHoverBind = 0;

function OpenTrailActivator() {
  $("#myActivation").modal("show");
}

function ClearFontCache() {
  for (var i = 0; i < privateFonts.length; i++) {
    fabric.util.clearFabricFontCache(privateFonts[i]);
  }
}

function LoadFontPatterns(text) {
  if (text != null && text != "" && text.trim() != "") {
    if (text.length > 3) {
      text = text.slice(0, 3);
    }

    $(".letterbox-wrapper").html("");
    for (var i = 0; i < privateFonts.length; i++) {
      $(".letterbox-wrapper").append(
        '<div class="letterbox" onclick="showFont(\'' +
          privateFonts[i] +
          '\')" style="font-family:' +
          privateFonts[i] +
          '">' +
          text +
          "</div>"
      );
    }
  } else {
    ClearLetterVariable();
  }
}

function showFont(font) {
  setFontStyle(font);
}

function AddClipImage(fileName) {
  if (fileName != "") {
    addImage(fileName);
  }
}

function LoadBackgroundImages(imgs) {
  var imgArray = imgs.split("|");
  $("#ImagesItemPanel").html("");
  for (var i = 0; i < imgArray.length; i++) {
    $("#ImagesItemPanel").append(
      '<div class="imgwrap" onclick="SetCavasBackgroundImage(\'Background/' +
        imgArray[i] +
        "')\" style=\"background:url('Background/Small/" +
        imgArray[i] +
        "');\"></div>"
    );
  }
}

function SetCavasBackgroundImage(img, folder) {
  if (img == "_1.png") removeCavasBgImage();
  else addImage(folder + "/Big/" + img);
}

function LoadDecorativeItems(items) {
  var itemArray = items.split("|");
  $("#DecorativeItemPanel").html("");
  for (var i = 0; i < itemArray.length; i++) {
    $("#DecorativeItemPanel").append(
      '<div class="imgwrap1" onclick="SetDecorativeItem(\'' +
        itemArray[i] +
        "')\" style=\"background:url('DecorativeItem/General/" +
        itemArray[i] +
        "');\"></div>"
    );
  }
}

function LoadDividerDecorativeItems(items) {
  var itemArray = items.split("|");
  $("#DividerDecorativeItemPanel").html("");
  for (var i = 0; i < itemArray.length; i++) {
    $("#DividerDecorativeItemPanel").append(
      '<div class="imgwrapd1" onclick="SetDividerDecorativeItem(\'' +
        itemArray[i] +
        "')\" style=\"background:url('DecorativeItem/Dividers/" +
        itemArray[i] +
        "');\"></div>"
    );
  }
}

function LoadBasicShapeItems(items) {
  var itemArray = items.split("|");
  $("#ShapesItemPanel").html("");
  for (var i = 0; i < itemArray.length; i++) {
    $("#ShapesItemPanel").append(
      '<div class="imgwrap1" onclick="SetBasicShapeItem(\'' +
        itemArray[i] +
        "')\" style=\"background:url('Shapes/Basic/" +
        itemArray[i] +
        "');\"></div>"
    );
  }
}

function LoadAdvancedShapeItems(items) {
  var itemArray = items.split("|");
  $("#AdvanceShapeItemPanel").html("");
  for (var i = 0; i < itemArray.length; i++) {
    $("#AdvanceShapeItemPanel").append(
      '<div class="imgwrap1" onclick="SetAdvanceShapeItem(\'' +
        itemArray[i] +
        "')\" style=\"background:url('Shapes/Advanced/" +
        itemArray[i] +
        "');\"></div>"
    );
  }
}

function SetDecorativeItem(img) {
  addShape(img);
}

function SetDividerDecorativeItem(img) {
  addDividerShape(img);
}

function SetBasicShapeItem(img) {
  addBasicShapes(img);
}

function SetAdvanceShapeItem(img) {
  addAdvancedShapes(img);
}

function setOpenPathName(path) {
  openFilePath = path;
}

function setIsUpdated(value) {
  if (parseInt(value) == 1) isUpdated = false;
  else isUpdated = true;
}

// Menu Options

async function newDocument() {
  if (!isTrial) {
    $(".india_font_canvas_size").val("");
    $(".india_font_canvas_width").val("");
    $(".india_font_canvas_height").val("");
  }

  if (!isUpdated) {
    $(".india_font_filename").val("");
    window.electronAPI.clearOpenFilePath();
  }

  var count = getCanvasObjects();
  if (!isUpdated && count >= 0) {
    showMainScreen();
  }

  if (isUpdated) {
    const userResponse = await window.electronAPI.openConfimSaveDialog();

    if (userResponse === 0) {
      await saveDocument();
      showMainScreen();
    } else if (userResponse === 1) {
      showMainScreen();
    } else {
      return;
    }
  }
}

function OpenTemplate() {
  var count = getCanvasObjects();
  var data = objectCallBack.openTemplate();
  if (data != null && data != "") {
    var jData = JSON.parse(data);
    if (
      jData != null &&
      jData != "" &&
      jData.FileContent != null &&
      jData.FileContent != ""
    ) {
      if (!isUpdated && count > 0) {
        setTimeout(function () {
          isUpdated = false;
          ShowCanvas();
          _loadJSON(jData.FileContent, "");
        }, 500);
      } else {
        var data = objectCallBack.newDocument(count);

        if (data == 1) {
          saveDocument();
          setTimeout(function () {
            isUpdated = false;
            ShowCanvas();

            _loadJSON(jData.FileContent, "");
          }, 500);
        } else if (data == 0) {
          isUpdated = false;
          ShowCanvas();
          _loadJSON(jData.FileContent, "");
        }
      }
    }
  }
}

async function openDocument() {
  var count = getCanvasObjects();
  if (!isUpdated && count >= 0) {
    showMainScreen();
  }

  let input = document.createElement("input");
  input.type = "file";
  input.onchange = (_) => {
    let files = Array.from(input.files);

    window.electronAPI.updateOpenFilePath(files[0].path);

    files[0].text().then((data) => {
      if (data != null && data != "") {
        var jData = data;

        var fdata = JSON.parse(jData);

        SetCanvasDimension(fdata.width, fdata.height);

        setTimeout(function () {
          isUpdated = false;
          ShowCanvas();
          _loadJSON(jData, jData.Path);
        }, 500);
      }
    });
  };

  if (isUpdated) {
    const userResponse = await window.electronAPI.openConfimSaveDialog();

    if (userResponse === 0) {
      await saveDocument();
      showMainScreen();

      const data = await window.electronAPI.openIFFileDialog();
      openDirectfile(data);
    } else if (userResponse === 1) {
      showMainScreen();
      const data = await window.electronAPI.openIFFileDialog();
      openDirectfile(data);
    } else {
      return;
    }
  } else {
    const data = await window.electronAPI.openIFFileDialog();
    openDirectfile(data);
  }
}

function openDirectfile(data) {
  if (data != null && data != "") {
    var jData = data;

    var fdata = JSON.parse(jData);

    SetCanvasDimension(fdata.width, fdata.height);

    setTimeout(function () {
      isUpdated = false;
      ShowCanvas();
      _loadJSON(jData, jData.Path);
    }, 500);
  }
}

let isFileSaved = false;

async function saveDocument() {
  isUpdated = false;
  var json = getJson();
  var fname = jQuery(".india_font_filename").val() || "untitled";

  const isSaved = await window.electronAPI.openSaveFileDialog(json, fname);
  if (!isSaved) {
    isUpdated = true;
  }
}

async function saveDocumentAs() {
  var json = getJson();
  var fname = jQuery(".india_font_filename").val() || "untitledCopy";

  window.electronAPI.clearOpenFilePath();

  await window.electronAPI.openSaveFileDialog(json, fname);
}

function PrintDocument() {
  var data = rasterize();
  objectCallBack.printPage(data);
}

async function ExportJPG() {
  var fname = jQuery(".india_font_filename").val() || "untitled";

  isTrial = window.electronAPI.checkIfTrial();

  if (!isTrial) {
    // var data = rasterize();

    let width = parseInt(currentCanvasWidth)
    let height = parseInt(currentCanvasHeight)

    canvas.setBackgroundColor("rgba(255, 255, 255, 1)");

    var data = canvas.toDataURL({
      multiplier: 1,
      format: "jpeg",
      quality: 1,
      enableRetinaScaling: true,
    });

    // saveAs(data, fname);
    await window.electronAPI.exportJPGPNG(data, fname, "jpg");
    canvas.setBackgroundColor(0);
  } else {
    const userRes = await window.electronAPI.openPaidDialog();
    if (userRes === 0) {
      openLink("indiafont.com/product/indiafont-v4-pro/?ref=v4");
    } else {
      return;
    }
  }
}

async function ExportPNG() {
  var fname = jQuery(".india_font_filename").val() || "untitled";

  isTrial = window.electronAPI.checkIfTrial();

  if (!isTrial) {
    var data = canvas.toDataURL({
      multiplier: 1,
      format: "png",
      enableRetinaScaling: true,
    });

    await window.electronAPI.exportJPGPNG(data, fname, "png");
  } else {
    const userRes = await window.electronAPI.openPaidDialog();
    if (userRes === 0) {
      openLink("indiafont.com/product/indiafont-v4-pro/?ref=v4");
    } else {
      return;
    }
  }
}

async function ExportPDF() {
  var fname = jQuery(".india_font_filename").val() || "untitled";

  isTrial = window.electronAPI.checkIfTrial();

  if (!isTrial) {
    // get Object from Canvas
    var allObj = canvas.getObjects();

    function blobToBuffer(blob, callback) {
      var reader = new FileReader();

      reader.onload = function (event) {
        var buffer = event.target.result;
        callback(buffer);
      };

      reader.readAsArrayBuffer(blob);
    }

    //Save file in PDF
    canvas.makeDocument().toBlob(async (blob) => {
      // saveAs(blob, fname);
      blobToBuffer(blob, async function (buffer) {
        // Now 'buffer' contains the binary data from the Blob

        await window.electronAPI.exportPDF(buffer, fname);
      });
    });
  } else {
    const userRes = await window.electronAPI.openPaidDialog();
    if (userRes === 0) {
      openLink("indiafont.com/product/indiafont-v4-pro/?ref=v4");
    } else {
      return;
    }
  }
}

async function ExportPDFV1() {
  var fname = jQuery(".india_font_filename").val() || "untitled";

  isTrial = window.electronAPI.checkIfTrial();

  if (!isTrial) {
    let data = rasterizeSVG();

    let width = parseInt(currentCanvasWidth)
    let height = parseInt(currentCanvasHeight)

    await window.electronAPI.exportOldPDF(data, fname, height, width);
  } else {
    const userRes = await window.electronAPI.openPaidDialog();
    if (userRes === 0) {
      openLink("indiafont.com/product/indiafont-v4-pro/?ref=v4");
    } else {
      return;
    }
  }
}

async function ExportSVG() {
  var fname = jQuery(".india_font_filename").val() || "untitled";

  isTrial = window.electronAPI.checkIfTrial();

  if (!isTrial) {
    // get Object from Canvas
    var allObj = canvas.getObjects();

    //Get Vectorised SVG
    var data = rasterizeSVG();

    //Save SVG File
    var blob = new Blob([data]);
    // saveAs(blob, `${fname}.svg`);

    await window.electronAPI.exportSVG(data, fname);
  } else {
    const userRes = await window.electronAPI.openPaidDialog();
    if (userRes === 0) {
      openLink("indiafont.com/product/indiafont-v4-pro/?ref=v4");
    } else {
      return;
    }
  }
}

async function ImportJPGPNG() {
  var _fileName = await window.electronAPI.openImportDialog();

  if (_fileName != null && _fileName != "") {
    addImage("data:image/png;base64," + _fileName);
  }
}

async function ImportSVG() {
  var _fileName = await window.electronAPI.openImportSVGDialog();
  var dt = new Date();
  if (_fileName != null && _fileName != "") __loadSVG(_fileName);
}

async function CloseApplication() {
  window.electronAPI.closeApplication();
}

function MaximizeApplication() {
  var prevWidth = $("body").width();
  var prevHeight = $("body").height();
  objectCallBack.maximizeApplication();
  setTimeout(function () {
    if (prevWidth == $("body").width() && prevHeight == $("body").height()) {
      objectCallBack.maximizeApplication();
    }
  }, 100);
}

function MinimizeApplication() {
  objectCallBack.minimizeApplication();
}

function UndoMethod() {
  undoObject();
}

function RedoMethod() {
  redoObject();
}

function CopyMethod() {
  CopyObject();
}

function CutMethod() {
  CutObject();
}

function PasteMethod() {
  PasteObject();
}

function DeleteMethod() {
  deleteSelected();
}

function GroupMethod() {
  groupObjects();
}

function UngroupMethod() {
  ungroupObjects();
}

function LockMethod() {
  lockObject();
}

function UnlockMethod() {
  unlockObject();
}

function SendBackwordMethod() {
  sendBackwards();
}

function SendToBackMethod() {
  sendToBack();
}

function BringForwardMethod() {
  bringForward();
}

function BringToFront() {
  bringToFront();
}

function formDrag() {}

function ValidateAccount() {
  $("#LoadingContentModal").modal("show");
  $("#LoadingContentSpan").html("Activating account...");

  setTimeout(function () {
    var a1 = $("#act1").val();
    var a2 = $("#act2").val();
    var a3 = $("#act3").val();
    var a4 = $("#act4").val();
    if (a1 != null && a2 != null && a3 != null && a4 != null) {
      if (
        a1.length == 4 &&
        a2.length == 4 &&
        a3.length == 4 &&
        a4.length == 4
      ) {
        var valid = objectCallBack.activeNow(a1, a2, a3, a4);
        if (valid == true || valid == "true" || valid == "True") {
          $("#LoadingContentSpan").html("Account Successfully Activated!");

          $(".india_font_canvas_size").removeAttr("disabled");
          $(".india_font_canvas_size_update").removeAttr("disabled");
          $(".india_font_canvas_width").val("").removeAttr("disabled");
          $(".india_font_canvas_height").val("").removeAttr("disabled");
          $(".india_font_canvas_width_update").val("").removeAttr("disabled");
          $(".india_font_canvas_height_update").val("").removeAttr("disabled");
          $(".orientation").show();
          $("#txtFontSizeVal").val("40").removeAttr("disabled");
          $("#txtFontSize1").removeAttr("disabled");
          $("#txtTracking").removeAttr("disabled");
          $("#txtTrackingVal").removeAttr("disabled");

          setTimeout(function () {
            $("#myActivation").modal("hide");
            $("#LoadingContentModal").modal("hide");
            $("#OptTrialActivator").hide();
            setTimeout(function () {
              DownloadFonts();
            }, 1500);
          }, 2000);
        } else {
          $("#LoadingContentModal").modal("hide");
          $("#ActivationMsg").show();
          $("#ActivationMsg").html("Enter key is invalid!");
        }
      } else {
        $("#LoadingContentModal").modal("hide");
        $("#ActivationMsg").show();
        $("#ActivationMsg").html("Please enter valid key!");
      }
    } else {
      $("#LoadingContentModal").modal("hide");
      $("#ActivationMsg").show();
      $("#ActivationMsg").html("Please enter valid key!");
    }
  }, 700);
}

function KnowledgeBase() {
  objectCallBack.knowledgeBase();
}

function ValidateBuyNow() {
  objectCallBack.buyNow();
}

function DownloadFonts() {
  $("#LoadingContentModal").modal("show");
  $("#LoadingContentSpan").html("Downloading Fonts...");
  setTimeout(function () {
    var lString = objectCallBack.getPackageFontList();
    if (lString != null && lString != "") {
      fNameList = JSON.parse(lString);
      if (fNameList.length > 0) {
        DownloadFontSequence(0);
      }
    } else {
      $("#LoadingContentSpan").html("Not downloaded, Please try again!");
      setTimeout(function () {
        $("#LoadingContentModal").modal("hide");
      }, 2000);
    }
  }, 700);
}

function DownloadFontSequence(l) {
  var _index = l;
  $("#LoadingContentSpan").html(
    "Downloading " + (_index + 1) + " of " + fNameList.length + " Fonts"
  );
  var ft = objectCallBack.downloadFontByID(fNameList[_index]);
  _index = _index + 1;
  if (_index < fNameList.length) {
    setTimeout(function () {
      DownloadFontSequence(_index);
    }, 500);
  } else {
    setTimeout(function () {
      $("#LoadingContentSpan").html("Downloaded, Restart your application!");
      $("#restartapp_btn").css("display", "block");
      $("#LoadingContentModal .modal-body").css("height", "280px");
    }, 500);
  }
}

function AboutSoftware() {
  $("#myAbout").modal("show");
}
$(document).delegate("#zoomSelector", "change", function () {
  var val = $(this).val();
  var scale = 0;
  var scaleTo = scale + val / 100;
  /* alert(scaleTo); */
  $(".canvas-container").css("transform", "scale(" + scaleTo + ")");
  $(".canvas-container").css("height", "auto");
  $(".canvas-container").css("left", "-20%");
  return false;
});

function setImageFilters(index, filterPara, minVal = "") {
  ApplyFiltersToImageObjectWithSlider(index, minVal, filterPara);
}

function ApplyFiltersToImageObjectWithSlider(index, value, filterPara) {
  var filterObj = "";
  if (filterPara == "blur") {
    filterObj = new fabric.Image.filters.Blur({
      value: parseFloat(value),
    });
  } else if (filterPara == "rotation") {
    filterObj = new fabric.Image.filters.HueRotation({
      rotation: value,
    });
  } else if (filterPara == "saturation") {
    filterObj = new fabric.Image.filters.Saturation({
      saturation: parseFloat(value),
    });
  } else if (filterPara == "contrast") {
    filterObj = new fabric.Image.filters.Contrast({
      contrast: parseFloat(value),
    });
  } else if (filterPara == "brightness") {
    filterObj = new fabric.Image.filters.Brightness({
      brightness: parseFloat(value),
    });
  }
  applyFilter(index, filterObj);
  applyFilterValue(index, filterPara, value);
}

function applyFilterValue(index, prop, value) {
  var obj = canvas.getActiveObject();
  if (obj.filters[index]) {
    obj.filters[index][prop] = value;

    obj.applyFilters();
    canvas.renderAll();
  }
}

function isInRange(object, min, max) {
  var val = parseInt(jQuery(object).val(), 10);
  // If it is less than 1000, handle accordingly
  if (val >= min && val <= max) {
    return true;
  } else if (val < min) {
    jQuery(object).val(min);
  } else if (val > max) jQuery(object).val(max);
}

function CheckPressedKey(object, type) {
  jQuery(object).on("keydown", function (event) {
    console.log(type);
    if (event.keyCode == 38 || event.keyCode == 40) {
      event.preventDefault();
      event.stopPropagation();
    }
    //event.preventDefault()
    if (
      type == "dropshadow_opacity" ||
      type == "dropshadow_x" ||
      type == "dropshadow_y" ||
      type == "dropshadow_blur"
    ) {
      if (event.keyCode == 37 || event.keyCode == 39) {
        return false;
      }
    }
    console.log(event.keyCode);
    var value = parseInt(jQuery(object).val());
    var isValid = 0;
    if (event.keyCode == 38) {
      //increase val
      value++;
      isValid = 1;
    } else if (event.keyCode == 40) {
      //decrease
      value--;
      isValid = 1;
    }
    if (event.keyCode == 37 || event.keyCode == 39) {
    }
    if (isValid == 1) {
      if (type == "fontsize") {
        if (value > 0 && value < 999) {
          jQuery(object).val(value);
          setFontSize(value);
        }
      }
      if (type == "widthscale") {
        jQuery(object).val(value);
        setWidthScale(value);
      }
      if (type == "heightscale") {
        jQuery(object).val(value);
        setHeightScale(value);
      }
      if (type == "angle") {
        jQuery(object).val(value);
        setAngleTransform(value);
      }
      if (type == "skew") {
        jQuery(object).val(value);
        setSkewTransform(value);
      }
      if (type == "tracking") {
        console.log(value);
        if (value > -9999 && value < 9999) {
          jQuery(object).val(value);
          setTracking(value);
        }
      } else if (type == "opacity") {
        if ((value) => 0 && value <= 100) {
          jQuery(object).val(value);
          setOpacity(value);
        }
      } else if (type == "dropshadow_opacity") {
        if (value >= 0 && value <= 100) {
          jQuery(object).val(value);
          applyDropShadow();
        }
      } else if (type == "dropshadow_x") {
        if (value >= -100 && value <= 100) {
          jQuery(object).val(value);
          applyDropShadow();
        }
      } else if (type == "dropshadow_y") {
        if (value >= -100 && value <= 100) {
          jQuery(object).val(value);
          applyDropShadow();
        }
      } else if (type == "dropshadow_blur") {
        if (value >= 0 && value <= 100) {
          jQuery(object).val(value);
          applyDropShadow();
        }
      }
    }
  });
}

function OnFocusSelectElement(object, child) {
  jQuery(object).focus(function () {
    jQuery(child).select();
  });
  jQuery(object).on("mouseclick", function () {
    jQuery(child).select();
  });
}

function applyFilter(index, filter) {
  var obj = canvas.getActiveObject();
  obj.filters[index] = filter;
  // var timeStart = +new Date();
  obj.applyFilters();
  canvas.renderAll();
  //return false;
}

function resolve_mask() {
  var obj = canvas.getActiveObject();
  obj.resolveClipingMask();
  save();
}

function modify_mask() {
  var obj = canvas.getActiveObject();
  if (obj.croppingAvailable && obj.croppingAvailable()) {
    obj.cropPhotoStart();
  }
}

function apply_mask() {
  var obj = canvas.getActiveObject();
  if (obj.applyMask) {
    obj.applyMask();
    save();
  }
}

//Start Pan canvas

//End Pan canvas


module.exports = { CopyMethod, PasteMethod };