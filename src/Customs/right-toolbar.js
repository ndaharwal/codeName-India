$(document).ready(function () {
  $(document).delegate(
    "#ImageFiltersItemPanel .filter_row .ico",
    "click",
    function (e) {
      var filterPara = $(this).parent().attr("id");
      var $slider = $(this).siblings(".filter_bar").children();
      var rangeVal = $slider.attr("data-set-val");
      var dynamciRangeVal = $slider.val();
      var index = $(this).parent().attr("data-index");

      $(this).toggleClass("off").toggleClass("on active");

      if ($(this).hasClass("on")) {
        $(this).siblings(".filter_bar").children().attr("disabled", false);

        if (filterPara == "grayscale") {
          applyFilter(index, new fabric.Image.filters.Grayscale());
        } else if (filterPara == "invert") {
          applyFilter(index, new fabric.Image.filters.Invert());
        } else if (filterPara == "sepia") {
          applyFilter(index, new fabric.Image.filters.Sepia());
        } else if (filterPara == "blackwhite") {
          applyFilter(index, new fabric.Image.filters.BlackWhite());
        } else if (filterPara == "brownie") {
          applyFilter(index, new fabric.Image.filters.Brownie());
        } else if (filterPara == "vintage") {
          applyFilter(index, new fabric.Image.filters.Vintage());
        } else if (filterPara == "kodachrome") {
          applyFilter(index, new fabric.Image.filters.Kodachrome());
        } else if (filterPara == "technicolor") {
          applyFilter(index, new fabric.Image.filters.Technicolor());
        } else if (filterPara == "polaroid") {
          applyFilter(index, new fabric.Image.filters.Polaroid());
        } else {
          setImageFilters(index, filterPara, dynamciRangeVal);
        }
      } else {
        if (
          filterPara == "grayscale" ||
          filterPara == "invert" ||
          filterPara == "sepia" ||
          filterPara == "blackwhite" ||
          filterPara == "brownie" ||
          filterPara == "vintage" ||
          filterPara == "kodachrome" ||
          filterPara == "technicolor" ||
          filterPara == "polaroid"
        ) {
          applyFilter(index, 0);
        } else {
          setImageFilters(index, filterPara, rangeVal);
        }
        $(this).siblings(".filter_bar").children().attr("disabled", true);
        //reset slider and set original image
      }
      return false;
    }
  );

  $(document).ready(function () {
    document
      .getElementById("blur-value")
      .addEventListener("input", function (e) {
        var filterPara = "blur";
        ApplyFiltersToImageObjectWithSlider(11, this.value, filterPara);
      });

    document.getElementById("hue-value").addEventListener("input", function () {
      var filterPara = "rotation";
      ApplyFiltersToImageObjectWithSlider(21, this.value, filterPara);
    });

    document
      .getElementById("saturation-value")
      .addEventListener("input", function () {
        var filterPara = "saturation";
        ApplyFiltersToImageObjectWithSlider(7, this.value, filterPara);
      });

    document
      .getElementById("contrast-value")
      .addEventListener("input", function () {
        var filterPara = "contrast";
        ApplyFiltersToImageObjectWithSlider(6, this.value, filterPara);
      });

    document
      .getElementById("brightness-value")
      .addEventListener("input", function () {
        var filterPara = "brightness";
        ApplyFiltersToImageObjectWithSlider(5, this.value, filterPara);
      });
  });

  editor.closeRightMenu = function () {
    editor.panel = "";
    $(".right_menu_strip").find(".button").removeClass("active");
    $(".right_menu_strip").find(".panel.panel-default").removeClass("open");
  };

  editor.toggleRightMenu = function (panel) {
    let activePanel = editor.panel;
    if (panel !== activePanel) {
      if (panel === "Glyphs") {
        loadGlyphs();
      }
      editor.openRightMenu(panel);
    } else {
      editor.closeRightMenu();
    }
  };

  editor.openRightMenu = function (panel) {
    editor.closeRightMenu();
    editor.panel = panel;
    $(`[data-panel=${panel}]`).find(".panel.panel-default").addClass("open");
    $(`[data-panel=${panel}]`).addClass("active");
  };

  $(".right_menu_strip.menu_strip .button").click(function () {
    setAllTools();
    if (showAllTools == true) {
    }
  });

  const loadGlyphs = () => {
    let fontFamily = document.getElementById("selectedFontName").innerText;

    let font = fabric.fontArrayList.find(
      (item) => item.FontName === fontFamily
    );

    let glyphs = font.fObject.glyphs.glyphs;

    let nGlyphs = font.fObject.nGlyphs;

    const glyphsPanel = document.getElementById("glyphs-panel-body");

    glyphsPanel.innerHTML = "";

    for (let i = 0; i < nGlyphs; i++) {
      let div = document.createElement("div");
      div.classList.add("Glyphs");
      div.style.backgroundColor = "#ffffff";
      div.style.borderRadius = "4px";
      div.style.fontFamily = fontFamily;
      div.dataset.value = i;
      div.innerHTML = String.fromCharCode(glyphs[i].unicode);
      div.onclick = () => {
        appendGlyphText(String.fromCharCode(glyphs[i].unicode));
      };

      glyphsPanel.appendChild(div);
    }
  };

  $(document).mouseup(function (e) {
    var container = $(".right_menu_strip.menu_strip");

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target) && container.has(e.target).length === 0) {
    }
  });

  canvas.on("modify:custom target:changed", function () {
    if (activetarget && activetarget.shadow) {
      let shadow = activetarget.shadow;
      var color = new fabric.Color(activetarget.shadow.color);

      //opacity
      $("#dropshadowSelectorVal").val(Math.round(color.getAlpha() * 100));

      $("#x_offsetSelectorVal").val(shadow.offsetX + "px");

      $("#y_offsetSelectorVal").val(shadow.offsetY + "px");

      $("#blur_SelectorVal").val(shadow.blur);

      jQuery("#dropShadowHoder")
        .find(".color_selector")
        .css("background-color", color.toRgb(), "border-radius", "5px");
    } else {
      var allInputs = jQuery("#dropShadowHoder").find("input"); //
      allInputs[0].value = 100;
      allInputs[1].value = 0;
      allInputs[2].value = 0;
      allInputs[3].value = 1;
      jQuery("#dropShadowHoder")
        .find(".color_selector")
        .css("background-color", "rgb(0,0,0)", "border-radius", "5px");
    }

    if (activetarget && activetarget.type == "image") {
      $(".filter_col.first-col .filter_row").each(function (v, e) {
        $(e).find(".ico").attr("class", "ico off");
        $(e).find(".filter_bar").children().attr("disabled", true);
        $(e).find(".filter_bar").children().val(0);
        if (activetarget.filters[$(e).data("index")] != undefined) {
          $(e).find(".ico").attr("class", "ico on active");
          $(e).find(".filter_bar").children().attr("disabled", false);
          $(e)
            .find(".filter_bar")
            .children()
            .val(
              activetarget.filters[$(e).data("index")][`${$(e).attr("id")}`]
            );
        }
      });
      $(".filter_col.second-col .filter_row").each(function (v, e) {
        $(e).find(".ico").attr("class", "ico off");
        if (activetarget.filters[$(e).data("index")] != undefined) {
          $(e).find(".ico").attr("class", "ico on active");
        }
      });
    }
  });

  $("#dropShadowHoder input, #dropShadowHoder select").change(function () {
    applyDropShadow();
  });

  $(".color.color_selector").loads({
    flat: false,
    enableAlpha: false,
    layout: "rgbhex",
    compactLayout: true,
    color: "0000ff",
    onChange: function (ev) {
      $("#dropShadowHoder")
        .find(".color_selector")
        .css("background-color", "#" + ev.hex, "border-radius", "5px");
      applyDropShadow();
    },
  });

  $(".textcolor").click(function () {
    if ($(this).hasClass("picker")) return;
    var color = $(this).css("background-color");
    setFill(color);
  });

  $("i.ico.picker").loads({
    flat: false,
    enableAlpha: false,
    layout: "rgbhex",
    compactLayout: true,
    color: "0000ff",
    backgroundColor: "#666",
    onChange: function (ev) {
      setFill("#" + ev.hex);
    },
  });

  $(".lib_tabs a").click(function () {
    $(".lib_tabs.active_tab").removeClass("active_tab");
    $(this).parent().addClass("active_tab");
    var tbCls = $(this).parent().attr("id");
    $(".lib_tab_content_container").css("display", "none");

    $("." + tbCls).css("display", "block");
    $("#close_box").css("display", "none");
  });

  $(".button.library_items").click(function () {
    var topDivHeight = $("#top").height();
    var fontVariationDivHeight = $("#fontVariationDiv").height();
    var windowsInnerHeight = window.innerHeight;
    var myHght = windowsInnerHeight - fontVariationDivHeight - topDivHeight - 3;
    $("div#LibraryPanel").css("height", "" + myHght);
    $("div.sub_box_container_holder").css("height", `${myHght - 100}px`);
  });

  function createLayersTool() {
    editor.tree = createLayersTree(
      "#layers-container",
      canvas.getObjectsOrder.bind(canvas),
      canvas.setObjectsOrder.bind(canvas)
    );
    //todo global IndiaFont Canvas variable
    canvas.on("modify:custom target:changed", function () {
      editor.tree.updateTree();
    });
  }

  createLayersTool();
  createGradientTool();

  // })

  $("#shapes_btn").click(function () {
    if ($(".shapes_container").is(":visible")) {
      $(".shapes_container").hide();
    } else {
      $(".shapes_container").show();
    }
  });

  $(".shapes_sqr").click(function () {
    ___addTextClicked = false;
    canvas.setFreeDrawingBrush("ShapeBrush.rect");
    $("#shapes_btn").attr("class", "shapes_sqr");
    $(".shapes_container").hide();
  });
  $(".shapes_rsqr").click(function () {
    ___addTextClicked = false;
    canvas.setFreeDrawingBrush("ShapeBrush.roundedRect");
    $("#shapes_btn").attr("class", "shapes_rsqr");
    $(".shapes_container").hide();
  });
  $(".shapes_circl").click(function () {
    ___addTextClicked = false;
    canvas.setFreeDrawingBrush("ShapeBrush.ellipse");
    $("#shapes_btn").attr("class", "shapes_circl");
    $(".shapes_container").hide();
  });
  $(".shapes_str").click(function () {
    ___addTextClicked = false;
    canvas.setFreeDrawingBrush("ShapeBrush.star");
    $("#shapes_btn").attr("class", "shapes_str");
    $(".shapes_container").hide();
  });
  $(".shapes_hex").click(function () {
    ___addTextClicked = false;
    canvas.setFreeDrawingBrush("ShapeBrush.hexagon");
    $("#shapes_btn").attr("class", "shapes_hex");
    $(".shapes_container").hide();
  });
});
