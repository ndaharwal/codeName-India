PDFObject.embed("HelpMenu/01_Guideline_of_Use.pdf", "#example1");
PDFObject.embed("HelpMenu/02_IndiaFont_Devanagari_Keyboard.pdf", "#example2");
PDFObject.embed("HelpMenu/07_IndiaFont_Gujarati_Keyboard.pdf", "#example4");
PDFObject.embed("HelpMenu/03_Keybaord_Shortcuts.pdf", "#example3");

jQuery(function () {
  $(document).click(function () {
    if (jQuery(".context_menu").hasClass("open"))
      jQuery(".context_menu").removeClass("open");
  });
});

window.addEventListener(
  "contextmenu",
  function (ev) {
    ev.preventDefault();
    $("#ddlFontFamily").select2("close");
    return false;
  },
  false
);

var editor = {};
var canvas = (this.__canvas = new fabric.Canvas("canvas"));
$(document).ready(function () {
  createListenersKeyboard();

  var topDivHeight = $("#top").height();
  var fontVariationDivHeight = $("#fontVariationDiv").height();
  var windowsInnerHeight = window.innerHeight;
  $(".canvas-layout").height(
    windowsInnerHeight - fontVariationDivHeight - topDivHeight - 25 + "px"
  );
});

$(window).on("resize", function () {
  var topDivHeight = $("#top").height();
  var fontVariationDivHeight = $("#fontVariationDiv").height();
  var windowsInnerHeight = window.innerHeight;
  $(".canvas-layout").height(
    windowsInnerHeight - fontVariationDivHeight - topDivHeight - 25 + "px"
  );
});

$("[data-toggle=popover]").each(function (i, obj) {
  $(this).popover({
    html: true,
    placement: "bottom",
    content: function () {
      var id = $(this).attr("id");
      return $("#popover-content-" + id).html();
    },
  });
});

$("button").on("click", function () {
  $("button").removeClass("target");
  $(this).addClass("target");
});

function toggleIcon(e) {
  $(e.target)
    .prev(".panel-heading")
    .find(".more-less")
    .toggleClass("ico-up ico-down");
}
$(".panel-group").on("hidden.bs.collapse", toggleIcon);
$(".panel-group").on("shown.bs.collapse", toggleIcon);

(function ($) {
  $(document).ready(function () {
    canvas.setSnapping(!canvas.snapping);

    $(".gradient_img").click(function () {
      setAllTools();
      //alert(showAllTools)
      if (showAllTools == true) {
        var obj = canvas.getActiveObject();
        if (!$(this).hasClass("active")) {
        }
      }
    });

    $("ul.dropdown-menu [data-toggle=dropdown]").on("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      $(this).parent().siblings().removeClass("open");
      $(this).parent().toggleClass("open");
    });

    $("#apply_mask_button").click(function () {
      apply_mask();
    });
    $("#modify_mask_button").click(function () {
      modify_mask();
    });
    $("#resolve_mask_button").click(function () {
      resolve_mask();
    });
    $("#snapping_button").click(function () {
      canvas.setSnapping(!canvas.snapping);
    });

    jQuery(".left_menu_strip.menu_strip .button").click(function () {
      setAllTools();
      if (showAllTools == true) {
        var myClass = jQuery(this).attr("class");
        var newClass = myClass.replace("button", "");

        $(".left_menu_strip").find(".button").removeClass("active");
        if ($(this).hasClass("active")) {
        } else {
          jQuery(this).addClass("active");
        }
        if ($(this).attr("id") == "pan_tool") {
          $("#draggable").draggable();
          $("#draggable").draggable("enable");
          $("canvas").css("pointer-events", "none");
          $("#draggable").css("cursor", "move");
        } else {
          if ($("#draggable").is(".ui-draggable")) {
            $("#draggable").draggable({
              disabled: true,
            });
            $("canvas").css("pointer-events", "auto");
          }
        }
        jQuery("div#canvasPanel").addClass("" + newClass);
        if (oldActive != "") jQuery("div#canvasPanel").removeClass(oldActive);
        oldActive = myClass;
      }
    });

    jQuery(".box_blk.new_file_box").click(function () {
      jQuery("div#new_file_popup").css("display", "block");
    });

    jQuery(".popup_ttl span.close").click(function () {
      jQuery("div#new_file_popup").css("display", "none");
    });

    jQuery(".popup_container button.close_btn").click(function () {
      jQuery("div#new_file_popup").css("display", "none");
    });

    jQuery("div#myAbout button.close.target").click(function () {
      jQuery("div#myAbout").hide();
    });
    jQuery("#opacitySelector").select2({
      tags: true,
      containerCssClass: "opctySelectContainer",
      dropdownCssClass: "opctySelectBlk",
    });
    jQuery("#zoomSelector").select2({
      tags: true,
      containerCssClass: "zoomSelectContainer",
      dropdownCssClass: "zoomSelectBlk",
    });
    //Drop Shadow
    jQuery("#dropShadowHoder").find(".txtFontSize.select").select2({
      tags: true,
    });

    //Increase font size on key arrow
    var $fontSizeInput = $("#txtFontSizeVal");
    var curSizeMinus = "";
    var curSizePlus = "";

    //Increase opacity on key arrow
    var $fontOpacityInput = $("#opacitySelectorVal");
    var curSizeMinus = "";
    var curSizePlus = "";
    CheckPressedKey("#txtFontSizeVal", "fontsize");
    CheckPressedKey("#txtTrackingVal", "tracking");
    CheckPressedKey("#opacitySelectorVal", "opacity");
    CheckPressedKey("#dropshadowSelectorVal", "dropshadow_opacity");
    CheckPressedKey("#x_offsetSelectorVal", "dropshadow_x");
    CheckPressedKey("#y_offsetSelectorVal", "dropshadow_y");
    CheckPressedKey("#blur_SelectorVal", "dropshadow_blur");

    OnFocusSelectElement("#dropshadowopacitySelector2", "#x_offsetSelectorVal");
    OnFocusSelectElement("#dropshadowopacitySelector3", "#y_offsetSelectorVal");
    OnFocusSelectElement("#dropshadowopacitySelector4", "#blur_SelectorVal");

    setTimeout(function () {
      jQuery(".background_box .lib_box").click(function () {
        PullBackgroundFromFolders(
          jQuery(this).find(".lib_box_name").html().trim(),
          this
        );
      });
      jQuery(".clip_art_box .lib_box").click(function () {
        PullClipArtsFromFolder(
          jQuery(this).find(".lib_box_name").html().trim(),
          this
        );
      });
      jQuery(".color_art_box .lib_box").click(function () {
        PullColorArtsFromFolder(
          jQuery(this).find(".lib_box_name").html().trim(),
          this
        );
      });
    }, 1000);
  });
})(jQuery);
