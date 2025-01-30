const CACHE_FONT_SIZE = 200;
fabric.fontArrayList = [];
var fObjects = null;

function BindSystemFonts(
  fontObjects,
  fonts,
  text,
  path,
  activation,
  openCount
) {
  $("#yyy").val(
    JSON.stringify(
      toObject({
        fontObjects: fontObjects,
        fonts: fonts,
        text: text,
        path: path,
        activation: activation,
        openCount: openCount,
      })
    )
  );

  debugger;
  var aParse = JSON.parse(activation);
  if (
    aParse.IsActivated == true ||
    aParse.IsActivated == "True" ||
    aParse.IsActivated == "true" ||
    aParse.TrailRemaingDays > 0
  ) {
    if (
      aParse.IsActivated == true ||
      aParse.IsActivated == "True" ||
      aParse.IsActivated == "true"
    ) {
      // $("#ActivationTagSpan").html("Manage");
      $("#liDownloadFonts").show();
      isTrial = false;
    } else if (aParse.TrailRemaingDays > 0) {
      // $("#ActivationTagSpan").html("Activation");
      $("#liBuyNow").show();
      $("#liActivateNow").show();
      $("#expireday").html(aParse.TrailRemaingDays);
      //$(".liPDFSVG").hide();
    }

    //fObjects = JSON.parse(fontObjects);
    var arr = fonts.split(",");
    privateFonts = arr;
    $("#ddlSystemFontFamily").empty();

    var firstItem = null;
    for (var i = 0; i < arr.length; i++) {
      $("#LoadingContent").append(
        "<span style='font-family:" +
          arr[i] +
          "; font-size:15px;'>" +
          arr[i] +
          "</span></br>"
      );
      //$("#ddlFontFamily1").append("<option style='font-family:" + arr[i] + "; font-size:15px;'>" + arr[i] + "</option>");
      if (i == 0) firstItem = arr[i];
      else if (arr[i] == "India Font") firstItem = arr[i];
      var dt = arr[i].split(".");
      $("#ddlSystemFontFamily").append("<li>" + dt[0] + "</li>");
    }
    jQuery(jQuery("#ddlSystemFontFamily li")[0]).addClass("active");
    jQuery(".ddlSystemFontFamilyVal").val(
      jQuery("#ddlSystemFontFamily li.active").html()
    );

    jQuery("#ddlSystemFontFamily li").hover(function () {
      setFontStyle(jQuery(this).html());
    });
    jQuery("#ddlSystemFontFamily li").click(function () {
      jQuery("#ddlSystemFontFamily li.active").removeClass("active");
      jQuery(this).addClass("active");
      setFontStyle(jQuery(this).html());
      jQuery(this).parent().hide();
      jQuery("#ddlSystemFontFamily")
        .parent()
        .find(".ddlSystemFontFamilyVal")
        .val(jQuery(this).html());
    });
  }
}

function BindFonts(fontObjects, fonts, text, path, activation, openCount) {
  var aParse = JSON.parse(activation);
  if (
    aParse.IsActivated == true ||
    aParse.IsActivated == "True" ||
    aParse.IsActivated == "true" ||
    aParse.TrailRemaingDays > 0
  ) {
    if (
      aParse.IsActivated == true ||
      aParse.IsActivated == "True" ||
      aParse.IsActivated == "true"
    ) {
      // $("#ActivationTagSpan").html("Manage");
      $(".download-li").show();
      isTrial = false;
    } else if (aParse.TrailRemaingDays > 0) {
      // $("#ActivationTagSpan").html("Activation");
      $(".activation-li").show();
      $("#expireday").html(aParse.TrailRemaingDays);
      $("#days_left").html(aParse.TrailRemaingDays);
    }

    fObjects = JSON.parse(fontObjects);
    var arr = fonts.split(",");
    privateFonts = arr;
    $("#ddlFontFamily").empty();

    var htmlContForFont = "<div style='display:none'>";
    //var textSamples=Array();
    for (var i = 0; i < arr.length; i++) {
      htmlContForFont +=
        "<span style=\"font-family:'" + arr[i] + "'\">A</span>";
      $("#LoadingContent").append(
        "<span style='font-family:" +
          arr[i] +
          "; font-size:15px;'>" +
          arr[i] +
          "</span></br>"
      );
      $("#ddlFontFamily").append(
        "<option style='font-family:" +
          arr[i] +
          "; font-size:15px;'>" +
          arr[i] +
          "</option>"
      );
      $("#ddlFontFamily").append(
        "<li onmouseover=\"alert('hi')\">" + arr[i] + "</li>"
      );
    }

    var textSample;
    for (var i = 0; i < arr.length; i++) {
      textSample = new fabric.IText("aaaaa", {
        fontFamily: arr[i],
        fontSize: 10,
        charSpacing: 0,
        left: 10 + i * 10,
        top: 10,
        padding: 7,
        fill: "#000000",
        scaleX: 1,
        scaleY: 1,
        fontWeight: "",
        originX: "left",
        selectionStart: 0,
        hasRotatingPoint: true,
        centerTransform: true,
        lockUniScaling: false,
        strokeWidth: 0,
        editingBorderColor: "transparent",
      });
      canvas.add(textSample);
      canvas.requestRenderAll();
      fabric.charWidthsCache = {};
      if (textSample) canvas.remove(textSample);
    }

    htmlContForFont += "</div>";
    var t = document.createElement("div");
    t.innerHTML = htmlContForFont;
    document.body.appendChild(t);

    $("#LoadingModal").modal("hide");

    // setTimeout(function () {
    //   if (openCount < 3) {
    //     startIntro();
    //   }
    // }, 1000);

    if (text != null && text != "") {
      setTimeout(function () {
        ShowCanvas();
        _loadJSON(text, path);
      }, 300);
    }

    setTimeout(function () {
      LoadSvgPathFonts(0);
    }, 1000);

    // if (isTrial) {
    //   setTimeout(function () {
    //     OpenTrailActivator();
    //   }, 1000);

    //   setTimeout(function () {
    //     ScheduleDemo();
    //   }, 500);
    // }

    setTimeout(function () {
      jQuery("#select2-ddlFontFamily-container").click(function () {
        if (isHoverBind == 0) BindFontPreviewEffect();
      });
    }, 500);
  } else {
    $("#LoadingModal").modal("hide");
    $("#btnActivationClose").hide();
    $("#btnNotNow").hide();
    $("#myActivation").modal("show");
    $("#txttrailPeriod").html(
      "Sorry! Your trial period is over, please buy to continue"
    );
  }
}

function BindWebFonts(fontObjects) {
  // $("#ActivationTagSpan").html("Manage");
  $(".download-li").show();
  isTrial = false;

  fObjects = fontObjects;
  var arr = fontObjects.map((item) => item.FontName);
  privateFonts = arr;
  $("#ddlFontFamily").empty();

  var htmlContForFont = "<div style='display:none'>";

  for (var i = 0; i < arr.length; i++) {
    htmlContForFont += "<span style=\"font-family:'" + arr[i] + "'\">A</span>";
    $("#LoadingContent").append(
      "<span style='font-family:" +
        arr[i] +
        "; font-size:15px;'>" +
        arr[i] +
        "</span></br>"
    );
    $("#ddlFontFamily").append(
      "<option style='font-family:" +
        arr[i] +
        "; font-size:15px;'>" +
        arr[i] +
        "</option>"
    );
    $("#ddlFontFamily").append(
      "<li onmouseover=\"alert('hi')\">" + arr[i] + "</li>"
    );
  }

  htmlContForFont += "</div>";
  var t = document.createElement("div");
  t.innerHTML = htmlContForFont;
  document.body.appendChild(t);

  $("#LoadingModal").modal("hide");

  setTimeout(function () {
    loadSVGFonts(fontObjects);
  }, 1000);

  setTimeout(function () {
    jQuery("#select2-ddlFontFamily-container").click(function () {
      if (isHoverBind == 0) BindFontPreviewEffect();
    });
  }, 500);
}

async function str2ab(str) {
  var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var j = 0, strLen = str.length; j < strLen; j++) {
    bufView[j] = str.charCodeAt(j);
  }
  return buf;

  // return new TextEncoder().encode(str);
}

async function loadSVGFonts(data) {
  for (let i = 0; i < data.length; i++) {
    let fontName = data[i].FontName;
    try {
      let parsedJson = JSON.parse(data[i].fData);

      let newBuff = await str2ab(parsedJson);
      const Ofont = opentype.parse(newBuff);

      let fItem = {
        FontName: fontName,
        fObject: Ofont,
      };

      fabric.fontArrayList.push(fItem);

      let font = new FontFace(data[i].FontName, newBuff);

      font
        .load()
        .then(function () {
          document.fonts.add(font);
        })
        .catch(function (e) {
          console.log(e);
          alert("font loading failed " + font.family);
        });
    } catch (error) {
      // console.log(error)
      // alert(`Failed to load font : ${fontName}`);
      window.electronAPI.openInfoDialog(`Failed to load font : ${fontName}`);
    }
  }
}

function LoadSvgPathFonts(l) {
  var _index = l;
  opentype.load(
    "data:font/opentype;base64," + fObjects[_index].fData + "",
    function (err, font) {
      if (err) {
        console.log(err);
      }

      var fItem = {
        FontName: fObjects[_index].FontName,
        fObject: font,
      };

      fabric.fontArrayList.push(fItem);

      let arrayBuff = font.toArrayBuffer();

      let toaddfont = new FontFace(fObjects[_index].FontName, arrayBuff);

      toaddfont
        .load()
        .then(function () {
          document.fonts.add(toaddfont);
        })
        .catch(function (e) {
          console.log(e);
          alert("font loading failed " + fObjects[_index].FontName);
        });

      _index = _index + 1;
      if (_index < fObjects.length) {
        LoadSvgPathFonts(_index);
      }
    }
  );
}
