function createGradientTool() {
  function _importCssCode(cssCode) {
    var start = ['-moz-linear-gradient', '-o-linear-gradient', '-ms-linear-gradient', '-webkit-linear-gradient',
      '-moz-radial-gradient', '-o-radial-gradient', 'ms-radial-gradient', '-webkit-radial-gradient',
      '-webkit-gradient',
      'linear-gradient', 'radial-gradient',
      'progid:DXImageTransform.Microsoft.gradient'
    ];
    var res = false;
    var exit = false;
    var i = 0;

    if (!cssCode) {
      return false;
    }
    while (!exit && i < start.length) {
      if (cssCode.match(start[i])) {
        cssCode = cssCode.slice(cssCode.search(start[i]) + start[i].length);
        exit = true;
      }
      i++;
    }
    i = i - 1;

    if (!exit) {
      return res;
    }

    res = _importCssCodeW3C(cssCode);

    return res;
  }

  function _importCssCodeGetOrientation(cssCode, regExp) {
    var key, exit = false,
      res = {},
      i = 0,
      allKeys, pattern;

    allKeys = Object.keys(regExp);
    key = cssCode.match('\\([-a-zA-Z0-9%, ]+,');
    if (key) {
      while (!exit && i < allKeys.length) {
        value = cssCode.match(allKeys[i]);
        if (value) {
          res['orientation'] = regExp[allKeys[i]];
          exit = true;
        }
        i++;
      }
    }

    if (!exit) {
      pattern = cssCode.match('\\( *')[0];
      res['orientation'] = null;
    } else {
      pattern = cssCode.match('\\( *' + value + ' *, *')[0];
    }
    res['css'] = cssCode.replace(pattern, ',');
    return res;
  }

  function _importCssCodeW3C(cssCode) {
    var res = {},
      orientation, regExp;

    if (!cssCode.match('\\([a-zA-Z0-9#,\. %\\(\\)]+\\)')) {
      return res;
    }

    regExp = {
      'to +right': 'horizontal',
      'to +bottom': 'vertical',
      '135 *deg': 'diagonal',
      '45 *deg': 'diagonal-bottom',
      'ellipse +at +center': 'radial'
    };

    orientation = _importCssCodeGetOrientation(cssCode, regExp);
    cssCode = orientation['css'];
    res['orientation'] = orientation['orientation'];
    res['points'] = _importCssCodeGetListPoints(cssCode);
    return res;
  }

  function _importCssCodeGetListPoints(cssCode) {
    var listPoints, point, position;
    listPoints = [];

    cssCode = cssCode.replace(/ /gi, '');
    while (true) {
      point = {};
      cssCode = cssCode.replace(/,/, '');
      if (color = cssCode.match('^(rgba|rgb|hsl|hsla)\\([a-zA-Z0-9,%\.]+\\)')) {
        point['color'] = parseColor(color[0]);
      } else if (color = cssCode.match('^#[0-9a-fA-F]{6}')) {
        point['color'] = parseColor(color[0]);
      } else if (color = cssCode.match('transparent')) {
        point['color'] = new UserColor({
          format: 'rgba',
          color: {
            r: 0,
            g: 0,
            b: 0,
            a: 0
          }
        });
      } else {
        break;
      }
      cssCode = cssCode.replace(color[0], '');

      position = cssCode.match('[0-9]+(%|px)');
      if (!position) {
        break;
      }

      point['location'] = parseInt(cssCode.match('[0-9]+'));
      cssCode = cssCode.replace(position[0], '');
      listPoints.push(point);
    }

    if (listPoints.length < 2) {
      return [];
    }

    return listPoints;
  };





  var list = $(".presets-list")

  for (var i = 1; i <= 100; i++) {
    list.append($('<li><div id="load-grad-' + i + '" class="load-gradient"></div></li>'))
  }



  var el = $(".presets-list li div").click(function () {
    var style = $(this).css('background');
    var css = _importCssCode(style);
    console.log(css);
    let colorstops = [];

    for (var i in css.points) {
      colorstops.push({
        offset: css.points[i].location / 100,
        color: css.points[i].color.displayColor("rgb"),
        opacity: css.points[i].color.getAlpha()
      })
    }

    let value = {
      type: "linear",
      coords: {
        x1: 0,
        y1: 0,
        x2: 100,
        y2: 0
      },
      colorStops: colorstops
    };
    $("#gradX").gradX("value", value);

    updateGradient(value);
    let gradx = $("#gradX").gradX();
    // var value2 =
  });

  canvas.on("target:changed", function (e) {
    let obj = e.selected;
    if (obj) {
      let value = e.selected.fill || {};
      if (value.type) {
        value = value.toObject();
        value = fabric.util.object.clone(value, true);
        for (var i in value.coords) {
          value.coords[i] /= obj.width * 100;
        }
        delete value.gradientTransform;
        delete value.offsetX;
        delete value.offsetY;

        for (var i in value.colorStops) {
          let color = new fabric.Color(value.colorStops[i].color)
          color.setAlpha(value.colorStops[i].opacity || 1)
          value.colorStops[i].color = color.toRgba();
          delete value.colorStops[i].opacity;
        }
      } else {
        value = {
          type: "linear",
          coords: {
            x1: 0,
            y1: 0,
            x2: 100,
            y2: 0
          },
          colorStops: [{
              offset: 0,
              color: value
            },
            {
              offset: 1,
              color: value
            }
          ]
        }
      }

      $("#gradX").gradX("value", value);
    }
  });

  function updateGradient(value) {

    var actObj = canvas.getActiveObject();
    if (!actObj) return;
    for (var i in value.coords) {
      value.coords[i] = value.coords[i] / 100 * actObj.width;
    }
    if (value.coords.x1 != undefined) {
      value.coords.x1 = -actObj.width / 2
    }
    if (value.coords.y1 != undefined) {
      value.coords.y1 = -actObj.height / 2
    }
    if (value.coords.x2 != undefined) {
      value.coords.x2 = actObj.width / 2
    }
    if (value.coords.y2 != undefined) {
      value.coords.y2 = actObj.height / 2
    }
    for (var i in value.colorStops) {
      let color = new fabric.Color(value.colorStops[i].color)
      value.colorStops[i].color = color.toRgb();
      value.colorStops[i].opacity = color.getAlpha();
    }

    actObj.setGradient('fill', value);
    canvas.renderAll();
  }

  $("#gradX").gradX({
    //targets: ['#canvas'],
    change: updateGradient
  });
}