function createListenersKeyboard() {
  document.onkeydown = onKeyDownHandler;
  document.onkeyup = onKeyUpHandler;
  document.onwheel = onWheelHandler;
}
var isEscapePressed = 0;

//hold space key to panning canvas
var hand_holding = 0;

//previous selected tool once user start hold space key
var previous_tool = 0;

//check cursor is in canvas or not
var cursorOnCanvas = false;

$(document).on(
  {
    mouseenter: function () {
      cursorOnCanvas = true;
    },
    mouseleave: function () {
      cursorOnCanvas = false;
    },
  },
  ".canvas_wrapper"
);

function onWheelHandler(event) {
  if (cursorOnCanvas && !jQuery(".context_menu").hasClass("open")) {
    if (event.deltaY > 0) {
      activeObjects = canvas.getActiveObject();
      if (activeObjects == null) zoomOut();
      else if (!activeObjects.isEditing) zoomOut();
    } else if (event.deltaY < 0) {
      activeObjects = canvas.getActiveObject();
      if (activeObjects == null) zoomIn();
      else if (!activeObjects.isEditing) zoomIn();
    }
  }
}

function onKeyUpHandler(event) {
  var key;
  if (window.event) {
    key = window.event.keyCode;
  } else {
    key = event.keyCode;
  }
  switch (key) {
    case 32:
      if (previous_tool != 0) {
        previous_tool.trigger("click", "space");
        previous_tool = 0;
      }
      break;
  }
}

function openTypeConverter() {
  window.electronAPI.openTypeConverterWindow();
}

function isCreatingCanvas() {
  return $(".new-recent-file-block").css("display") != "none";
}

async function onKeyDownHandler(event) {
  var activeObjects;
  //alert("in");
  var key = event.keyCode;

  if (isCreatingCanvas()) return; //project name editing
  if (canvas.getActiveObject() && canvas.getActiveObject().isEditing) return; //i-text content editing
  if ($(".jstree-rename-input").length) return; //layer name editing
  if ($(".select2-search__field").is(":focus")) return; //font search
  if ($("#myActivation").css("display") == "block") return; //activation key inputing

  let fontListOpened = window.localStorage.getItem("fontListOpened");

  if (fontListOpened === "false") {
    switch (key) {
      case 32:
        activeObjects = canvas.getActiveObject();

        if (
          !$(".hand_tool").hasClass("active") &&
          (!activeObjects || !activeObjects.isEditing)
        ) {
          previous_tool = $(".left_menu_strip.menu_strip .button.active");
          jQuery(".hand_tool").trigger("click");
          event.preventDefault();
        }
        break;
      case 78:
        if (event.ctrlKey) {
          // alert('new')
          event.preventDefault();
          newDocument();
        }
        break;
      //chris
      //chris
      case 83:
        if (event.ctrlKey && event.shiftKey) {
          event.preventDefault();
          saveDocumentAs();
        }
        if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
          $(".shapes_str").trigger("click");
        }
        break;
      case 81:
        if (event.shiftKey) {
          event.preventDefault();
          jQuery("#btn_mgnt").trigger("click");
        }
        break;

      case 221:
        if (event.shiftKey && event.ctrlKey) {
          event.preventDefault();
          BringToFront();
        }
        if (event.shiftKey && event.metaKey) {
          event.preventDefault();
          BringToFront();
        }
        break;
      case 219:
        if (event.shiftKey && event.ctrlKey) {
          event.preventDefault();
          SendToBackMethod();
        }
        if (event.shiftKey && event.metaKey) {
          event.preventDefault();
          SendToBackMethod();
        }
        break;
      case 86:
        if (event.ctrlKey) {
          event.preventDefault();
          activeObjects = canvas.getActiveObject() || {};
          if (!activeObjects.isEditing) {
            PasteMethod();
          }
        } else {
          jQuery(".selection_tool").trigger("click");
        }
        break;
      case 84:
        activeObjects = canvas.getActiveObject();
        if (activeObjects == null) {
          jQuery(".text_tool").trigger("click");
          event.preventDefault();
        } else if (!activeObjects.isEditing) {
          jQuery(".text_tool").trigger("click");
          event.preventDefault();
        }
        break;
      case 72:
        if (event.ctrlKey) {
          event.preventDefault();
          KnowledgeBase();
        } else {
          activeObjects = canvas.getActiveObject();
          if (activeObjects == null) {
            jQuery(".hand_tool").trigger("click");
            event.preventDefault();
          } else if (!activeObjects.isEditing) {
            jQuery(".hand_tool").trigger("click");
            event.preventDefault();
          }
        }
        break;
      case 75:
        if (event.shiftKey) {
          if (event.ctrlKey) {
            event.preventDefault();
            $("#fsModal3").modal("show");
          }
        }
        break;
      case 90:
        activeObjects = canvas.getActiveObject();
        if (event.altKey) {
          jQuery(".zoomout_tool").trigger("click");
          zoomOut();
          event.preventDefault();
        } else if (!event.altKey && !event.ctrlKey && !event.shiftKey && !event.metaKey) {
          if (activeObjects == null) {
            jQuery(".zoomin_tool").trigger("click");
            zoomIn();
            event.preventDefault();
          } else if (!activeObjects.isEditing) {
            jQuery(".zoomin_tool").trigger("click");
            zoomIn();
            event.preventDefault();
          }
        }
        if (event.shiftKey && event.ctrlKey) {
          RedoMethod();
        }
        if (event.shiftKey && event.metaKey) {
          RedoMethod();
        }
        break;
      case 187:
        if (event.ctrlKey) {
          event.preventDefault();
          zoomIn();
        }
        break;
      case 107:
        if (event.ctrlKey) {
          event.preventDefault();
          zoomIn();
        }
        break;

      case 189:
        if (event.ctrlKey) {
          event.preventDefault();
          zoomOut();
        }

        break;
      case 109:
        if (event.ctrlKey) {
          event.preventDefault();
          zoomOut();
        }

        break;
      case 48:
        if (event.ctrlKey) {
          event.preventDefault();
          resetZoom();
        }
        if (event.metaKey) {
          event.preventDefault();
          resetZoom();
        }
        break;
      case 45:
        if (event.ctrlKey) {
          event.preventDefault();
          resetZoom();
        }

        break;
      case 96:
        if (event.ctrlKey) {
          event.preventDefault();
          resetZoom();
        }
        break;
      case 65:
        activeObjects = canvas.getActiveObject() || {};
        if (event.ctrlKey && !activeObjects.isEditing) {
          event.preventDefault();
          selectAllObjects();
        } else {
          if (event.shiftKey && !activeObjects.isEditing) {
            event.preventDefault();
            // editor.openRightMenu('layers');
          }
        }
        break;
      case 13:
        if ($(".new-recent-file-block").css("display") == "block") {
          createCanvas();
          event.preventDefault();
        }
        break;
      case 27:
        if (magneticSectionEnabled) {
          jQuery(".btn_mgnt").trigger("click");
        }

        if (canvas.getActiveObject()) {
          if (!canvas.getActiveObject().isEditing) {
            canvas.discardActiveObject();
            canvas.renderAll();
          }
        }

        $(".selection_tool").trigger("click");
        break;
      case 67:
        activeObjects = canvas.getActiveObject() || {};
        if (event.shiftKey && !activeObjects.isEditing) {
          event.preventDefault();
          editor.openRightMenu("color-swatches");
        }
        if (event.ctrlKey && !activeObjects.isEditing) {
          event.preventDefault();
          CopyMethod();
        }
        break;
      case 71:
        if (event.shiftKey && !event.ctrlKey) {
          event.preventDefault();
          editor.openRightMenu("gradient");
        }
        break;
      case 68:
        if (event.shiftKey) {
          event.preventDefault();
          editor.openRightMenu("shadow");
        }
        break;
      case 73:
        if (event.shiftKey) {
          event.preventDefault();
          editor.openRightMenu("filters");
        }
        break;
      case 76:
        if (event.ctrlKey) {
          if (event.shiftKey) {
            unlockObjectNew();
          } else {
            lockObjectNew();
          }
        } else {
          if (event.shiftKey) {
            event.preventDefault();
            // editor.openRightMenu('library');
            editor.openRightMenu("layers");
          } else {
            //openn rectangle brush
            $(".shapes_circl").trigger("click");
          }
        }
        break;
      case 77:
        if (event.ctrlKey) {
        } else {
          if (event.shiftKey) {
            $(".shapes_rsqr").trigger("click");
          } else {
            $(".shapes_sqr").trigger("click");
          }
        }
        break;
      case 88:
        activeObjects = canvas.getActiveObject();
        if (activeObjects && !activeObjects.isEditing) {
        }
        if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
          $(".shapes_hex").trigger("click");
        }
        break;
      case 188:
        activeObjects = canvas.getActiveObject();
        if (event.shiftKey && event.ctrlKey) {
          event.preventDefault();
          if (activeObjects && activeObjects.type === "i-text") {
            var val = parseInt(jQuery("#txtFontSizeVal").val());
            jQuery("#txtFontSizeVal").val(val - 1);
            if (val) {
              setFontSize(val - 1);
            }
          }
        }
        break;
      case 190:
        activeObjects = canvas.getActiveObject();
        if (event.shiftKey && event.ctrlKey) {
          event.preventDefault();
          if (activeObjects && activeObjects.type === "i-text") {
            var val = parseInt(jQuery("#txtFontSizeVal").val());
            jQuery("#txtFontSizeVal").val(val + 1);
            if (val) {
              setFontSize(val + 1);
            }
          }
        }
        break;
      default:
        break;
    }
  }
}

const pasteClipboardData = async () => {
  let clipboardText = await navigator.clipboard.readText();

  let FontValue = document.getElementById("selectedFontName").innerText;
  let FontSize = parseInt(jQuery("#txtFontSizeVal").val());
  let textSample;

  textSample = new fabric.IText(clipboardText, {
    fontFamily: FontValue,
    fontSize: FontSize,
    charSpacing: 0,
    left: 50,
    top: 50,
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
};
