/*
 *
 * SAMPLE USAGE DETAILS :
 * 
 * sliders structure :
 *
 * [
 *  {
 *     color: "COLOR",
 *     offset: "POSITION" //0 to 100 without % symbol
 *  },
 *  {
 *     ....
 *     ....
 *  },
 *  ....
 * ]
 *
 */
//
// //make me jquery UI  independent
// if (typeof jQuery.fn.draggable === "undefined") {
//
//   (function ($) {
//
//     $.fn.draggable = function () {
//       //console.log(this);
//       var ele = document.getElementById(this.attr("id"));
//       ele.style.top = "105px";
//       Drag.init(ele, null, 5, 165, 86, 86);
//       return this;
//     };
//   }(jQuery));
// }
//https://www.cssmatic.com/gradient-generato
//https://www.colorzilla.com/gradient-editor/

// Public methods
$.fn.gradX = function gradX(method, data) {
  var gradientTool = $(this).data("gradx");
  if(!method){
    return gradientTool;
  }
  switch(method) {
    case 'show':
      console.log("show");
      break;
    case 'hide':
      console.log("hide");
      break;
    case 'value':
      gradientTool.setValue(data);
      break;
    // Initializes the control
    case 'create':
    default:
      if( method !== 'create' ) data = method;
      $(this).each( function() {
        new GradientTool(this,data);
      });
  }
  return $(this);
};

function GradientTool(element,options){
  this.rand_RGB = [];
  this.rand_pos = [];
  this.targets = []; //[element selector] -> array
  this.slider_ids = []; //[element selector] -> array
  this.input = $(element);
  this.sliders = [];

  // this.options = options;

  GradientTool.conter++;
  if(!options.id){
    this.id = this.input.attr("id");
    if(!this.id){
      this.id = "gradient-tool-" + GradientTool.conter;
    }
  }
  for (var i in options) {
    this[i] = options[i];
  }

  this.me = $(this.template.format(this));
  $(this.input)
    .data("gradx",this)
    .hide()
    .wrap(this.me)

  var gradx = this;
  this.current_slider_id = false;



  this.anglepicker = $("#anglepicker")
    .anglepicker({
      nullPossible: false,
      start: function(e, ui) {},
      change: function(e, ui) {
        gradx.angle = ui.value;
        gradx.type = 'linear';
        gradx.direction = "angle";
        gradx.apply_style( );
      },
      stop: function(e, ui) {},
      value: false
    })
    .anglepicker("instance");



  //cache divs for fast reference
  this.container = $("#gradx_" + this.id);
  this.panel = $("#gradx_panel_" + this.id);
  this.cp = $("#gradx_slider_content_" + this.id);

  this.add_sliders();

  $("#gradx_add_sliders_" + this.id).click(this.addRandomSlider.bind(this));

  //call the colorpicker plugin
  gradx.colorpicker({
    element: this.cp,
    color: "blue",
    callback: this.colorpickerCallback.bind(this)
  });

  $('#gradx_delete_slider').click(this.removeCurrentSlider.bind(this));

  $("input[name=gradient_grp]").on("click", function () {
    var radioValue = $("input[name=gradient_grp]:checked").val();

    // alert(radioValue);
    var type = radioValue, options, option_str = '';
    if (type !== "linear") {
      $("#anglepicker").hide();
      //$('#gradx_radial_gradient_size').show();
      gradx.generate_radial_options();
    } else {
      $("#anglepicker").show();

      gradx.generate_linear_options();
      $('#gradx_gradient_subtype').val("left");
    }

    gradx.type = type;
    gradx.direction = $('#gradx_gradient_subtype').val();
    gradx.apply_style( );
    setTimeout(function(){
      if (gradx.type === "linear") {
        $("input[name=gradient_grp]")[0].checked = true;
      } else {
        $("input[name=gradient_grp]")[1].checked = true;
      }
    })
  });

  $('#gradx_gradient_subtype').change(function () {
    if (gradx.type === 'linear') {
      gradx.direction = $(this).val();



    } else {
      var h = $(this).val();
      var v = $('#gradx_gradient_subtype2').val();
      gradx.direction = h + " " + v;
    }
    gradx.apply_style( );//(where,style)
  });

  $('#gradx_gradient_subtype2').change(function () {

    var h = $('#gradx_gradient_subtype').val();
    var v = $(this).val();
    gradx.direction = h + " " + v;
    gradx.apply_style( );//(where,style)
  });

  $('#gradx_gradient_type').change(function () {
    var type = $(this).val(), options, option_str = '';
    if (type !== "linear") {
      //$('#gradx_radial_gradient_size').show();
      gradx.generate_radial_options();
      $("#anglepicker").hide();
    } else {
      gradx.generate_linear_options();
      $("#anglepicker").show();
      $('#gradx_gradient_subtype').val("left");
    }
    gradx.type = type;
    gradx.direction = $('#gradx_gradient_subtype').val();
    gradx.apply_style(gradx.panel, );//(where,style)
  });

  $('#gradx_slider_info')
    .mouseout(function () {
      GradientTool.slider_hovered[gradx.id] = false;
    })
    .mouseover(function () {
      GradientTool.slider_hovered[gradx.id] = true;
    });

  $('#gradx_gradient_subtype').change(function () {
    if (gradx.type === 'linear') {
      gradx.direction = $(this).val();
    } else {
      var h = $(this).val();
      var v = $('#gradx_gradient_subtype2').val();
      gradx.direction = h + " " + v;
    }
    gradx.apply_style( );//(where,style)
  });

  $('#gradx_gradient_subtype2').change(function () {
    var h = $('#gradx_gradient_subtype').val();
    var v = $(this).val();
    gradx.direction = h + " " + v;
    gradx.apply_style( );//(where,style)
  });

  $(document).on('click', '.gradx-container', function () {
    if (!GradientTool.slider_hovered[gradx.id]) {
      $("#gradx_slider_info").hide();
      return false;
    }
  });

  this.update_style_array();
  this.apply_style();
}
GradientTool.conter = 0;
GradientTool.slider_hovered = [];


GradientTool.prototype = {
  setType:function(type) {

    this.type =  type;
    //change type onload userdefined
    if (this.type !== "linear") {
      $("#anglepicker").hide();
      $('#gradx_gradient_type').val(this.type);
      this.generate_radial_options();
      var h, v;

      if (this.direction !== 'left') {
        //user has passed his own direction
        var center;
        if (this.direction.indexOf(",") > -1) {
          center = this.direction.split(",");
        } else {
          //tolerate user mistakes
          center = this.direction.split(" ");
        }

        h = center[0];
        v = center[1];

        //update the center points in the corr. select boxes
        $('#gradx_gradient_subtype').val(h);
        $('#gradx_gradient_subtype2').val(v);
      }
      else {
        var h = $('#gradx_gradient_subtype').val();
        var v = $('#gradx_gradient_subtype2').val();
      }

      this.direction = h + " " + v;
      this.apply_style();//(where,style)
    }
    else {
      $("#anglepicker").show();

      //change direction if not left
      if (this.direction !== 'left') {
        $('#gradx_gradient_subtype').val(this.direction);
      }
    }

  },
  setValue: function(initial_value) {
    let value;
    if(initial_value.constructor === String){
      value = {
        type: "linear",
        colorStops: [
          {color: initial_value, offset: 0},
          {color: initial_value, offset: 1}
        ]
      }
    }else{
      value = fabric.util.object.clone(initial_value,true);
    }
    this.sliders = [];
    this.slider_ids = [];
    for(var i in value.colorStops){
      value.colorStops[i].offset *= 100;
    }
    $(".gradx_start_sliders").children().remove()
    this.add_sliders(value.colorStops);
    let coords = value.coords;

    if (!value.type) value.type = "linear";

    if (value.type === "linear"){
      if (coords) {
        if (coords.y1 === coords.y2) {
          this.direction = coords.x2 > coords.x1 ? 'left' : "right";
        }
        else if (coords.x1 === coords.x2) {
          this.direction = coords.y2 > coords.y1 ? 'top' : "bottom";
        }
      } else {
        this.direction = 'left';
      }
    }

    this.setType(value.type);

    this.update_style_array();
    this.apply_style(true);
  },
  container_width: 150,
  slider_index: 0, //global index for sliders
  //direction of gradient or position of centre in case of radial gradients
  direction: 'left',
  //if linear left | top | right | bottom
  //if radial left | center | right , top | center | bottom
  type: 'linear', //linear | radial
  shape: "cover", //radial gradient size
  change: function (sliders, styles) {
    //nothing to do here by default
  },
  template: "<div class='gradx-container'>\
      <div class='gradx panel-body' id='gradientHoder'>\
          <div class='prop_container radio_blk_ttl'>\
          <label>Type</label>\
          <span class='gradient_radio_blk'>\
              <label class='radio_lbl'>\
                  <input type='radio' value='linear' name='gradient_grp' checked>\
                  Linear\
              </label>\
              <label class='radio_lbl'>\
                  <input type='radio' value='radial' name='gradient_grp'>\
                  Radial\
              </label>\
          </span>\
      </div>\
      <div class='gradx_slectboxes'>\
          <select id='gradx_gradient_subtype' class='gradx_gradient_type'>\
              <option id='gradx_gradient_subtype_desc' value='gradient-direction' disabled>gradient direction</option>\
              <option value='left' selected>Left</option>\
              <option value='right'>Right</option>\
              <option value='top'>Top</option>\
              <option value='bottom'>Bottom</option>\
          </select>\
          <select id='gradx_gradient_subtype2' class='gradx_gradient_type gradx_hide'>\
          </select>\
          <span id='anglepicker'>\
          </span>\
          <div class='gradx_container' id='gradx_{id}'>\
              <div id='gradx_stop_sliders_{id}'></div>\
              <div class='gradx_panel' id='gradx_panel_{id}'></div>\
              <div class='gradx_start_sliders' id='gradx_start_sliders_{id}'>\
              </div>\
          </div>\
          <div id='gradx_add_sliders_{id}' class='gradx_add_sliders gradx_btn'><i class='icon icon-add'></i></div>\
      </div>\
      <div class='cp-default' id='gradx_slider_info'>\
          <div id='gradx_slider_controls'>\
              <div id='gradx_delete_slider' class='gradx_btn'><i class='icon icon-remove'></i></div>\
          </div>\
          <input type='color' id='gradx_slider_content_{id}'/>\
      </div>\
  </div>",
  //very lazy to replace this by jQuery

  colorpickerCallback: function (rgba) {
    if (this.current_slider_id !== false) {
      $(this.current_slider_id).css('background-color', rgba);
      this.update_style_array();
      this.apply_style();
    }
  },
  addRandomSlider: function () {
    this.add_sliders([
      {
        color: this.get_random_rgb(),
        offset: this.get_random_position() //no % symbol
      }
    ]);
    this.update_style_array();
    this.apply_style();//(where,style)
  },
  removeCurrentSlider: function (){
    $(this.current_slider_id).remove();
    $("#gradx_slider_info").hide();
    var id = this.current_slider_id.replace("#", "");

    //remove all references from array for current deleted slider

    for (var i = 0; i < this.slider_ids.length; i++) {
      if (this.slider_ids[i] === id) {
        this.slider_ids.splice(i, 1);
      }
    }

    //apply modified style after removing the slider
    this.update_style_array();
    this.apply_style( );

    this.current_slider_id = false; //no slider is selected
  },
  get_random_position: function () {
    var pos;

    do {
      pos = parseInt(Math.random() * 100);
    }
    while (this.rand_pos.indexOf(pos) > -1);

    this.rand_pos.push(pos);
    return pos;

  },
  get_random_rgb: function () {
    var R, G, B, color;
    do {
      R = Math.floor(Math.random() * 255);
      G = Math.floor(Math.random() * 255);
      B = Math.floor(Math.random() * 255);
      color = "rgb(" + R + ", " + G + ", " + B + ")";
    }
    while (this.rand_RGB.indexOf(color) > -1);

    this.rand_RGB.push(color);
    return color;
  },
  //if target element is specified the target's style (background) is updated
  update_target: function (values) {

    if (this.targets.length > 0) {
      //target elements exist

      var i, j, ele, len = this.targets.length, v_len = values.length;
      for (i = 0; i < len; i++) {
        ele = $(this.targets[i]);

        for (j = 0; j < v_len; j++) {
          ele.css("background-image", values[j]);
        }

      }
    }
  },
  getStyle(){
    var value = this.getCssGradientValue();
    var cssStyles;
    if (value.indexOf(this.direction) > -1) {
      let cssValue = "linear-gradient(" + value + ")";
      //add cross-browser compatibility
      cssStyles = [
        "-webkit-" + cssValue,
        "-moz-" + cssValue,
        "-ms-" + cssValue,
        "-o-" + cssValue,
        cssValue
      ];
    } else {
      //normal color
      cssStyles = [value];
    }

    var len = cssStyles.length, css = '';
    while (len > 0) {
      len--;
      this.panel.css("background", cssStyles[len]);
      css += "background: " + cssStyles[len] + ";\n";
    }
    return css;
  },
  notUsedStuff(){
    // code_shown: false, //false | true
    //generates html to select the different gradient sizes
    if(false){
      // *only available for radial gradients
      var gradient_size_val = ["gradient-size disabled", "closest-side selected", "closest-corner", "farthest-side", "farthest-corner", "contain", "cover"];
      $('#gradx_radial_gradient_size').html(gradx.generate_options(gradient_size_val));


      $('#gradx_radial_gradient_size').change(function () {
        gradx.shape = $(this).val();
        gradx.apply_style();//(where,style)
      });
    }

    $('#gradx_code').focus(function () {
      var $this = $(this);
      $this.select();

      // Work around Chrome's little problem
      $this.mouseup(function () {
        // Prevent further mouseup intervention
        $this.unbind("mouseup");
        return false;
      });
    });

    $('#gradx_show_code').click(function () {
      if (gradx.code_shown) {
        //hide it
        gradx.code_shown = false;
        $('#gradx_show_code span').text("show the code");
        $("#gradx_code").hide();
      }
      else {
        //show it

        $('#gradx_show_code span').text("hide the code");
        $("#gradx_code").show();
        gradx.code_shown = true;
      }
    });

    if (gradx.code_shown) {
      //show it
      $('#gradx_show_code span').text("hide the code");
      $("#gradx_code").show();
    }

  },
  //apply styles on fly
  apply_style: function (doNotUpdate) {



    switch(this.direction){
      case "left":
        this.anglepicker.value(180);
        break;
      case "right":
        this.anglepicker.value(0);
        break;
      case "bottom":
        this.anglepicker.value(90);
        break;
      case "top":
        this.anglepicker.value(270);
        break;
    }

    let colorstops = [];
    for(var i in this.sliders) {
      colorstops.push({
        offset: Math.min(Math.max(0,this.sliders[i][1]/100), 1),
        color: this.sliders[i][0]
      })
    }

    var coords;
    if(this.type === "linear") {
      switch(this.direction){
        case "angle":

          let radians = fabric.util.degreesToRadians(this.angle);

          let x = -Math.cos(radians) * 50;
          let y = Math.sin(radians)  * 50;
          coords = {x1: 50 - x, y1: 50 -y, x2:50 + x, y2:50 + y};
          break;
        case "left":
          coords = {x1: 0, y1: 0, x2: 100, y2: 0,}
          break;
        case "right":
          coords = {x1: 100, y1: 0, x2: 0, y2: 0,}
          break;
        case "bottom":
          coords = {x1: 0, y1: 100, x2: 0, y2: 0,}
          break;
        case "top":
          coords = {x1: 0, y1: 0, x2: 0, y2: 100,}
          break;
      }

    }else if(this.type === "radial") {
      var h = $('#gradx_gradient_subtype').val();
      var v = $('#gradx_gradient_subtype2').val();

      let x,y ;
      switch(v){
        case "top":
          y = 0;
          break;
        case "bottom":
          y = 100;
          break;
        case "center":
          y = 50;
          break;
      }
      switch(h){
        case "left":
          x = 0;
          break;
        case "right":
          x = 100;
          break;
        case "center":
          x = 50;
          break;
      }
      coords = {
        r1: 0,
        r2: 100,
        x1: x,
        y1: y,
        x2: x,
        y2: y,
      }
    }

    var value = {
      type: this.type,
      coords: coords,
      colorStops: colorstops
    };

    var cssStyles = this.getStyle();
    //call the userdefined change function

    this.update_target(cssStyles);
    // $('#gradx_code').html(css);

    if(!doNotUpdate){
      this.change(value, cssStyles);
    }

  },
  //update the slider_values[] while dragging
  update_style_array: function () {

    this.sliders = [];

    var len = this.slider_ids.length,
      i, offset, offset, id;

    for (i = 0; i < len; i++) {
      id = "#" + this.slider_ids[i];
      offset = parseInt($(id).css("left"));
      offset = parseInt((offset / this.container_width) * 100);
      offset -= 6; //TODO: find why this is required
      this.sliders.push([$(id).css("background-color"), offset]);

    }

    this.sliders.sort(function (A, B) {
      if (A[1] > B[1])
        return 1;
      else
        return -1;
    });
  },
  //creates the complete css background value to later apply style
  getCssGradientValue: function () {
    var len = this.slider_ids.length;

    if (len === 1) {
      //since only one slider , so simple background

      style_str = this.sliders[0][0];
    } else {
      var style_str = "", suffix = "";
      for (var i = 0; i < len; i++) {
        if (this.sliders[i][1] == "") {
          style_str += suffix + (this.sliders[i][0]);

        } else {
          if (this.sliders[i][1] > 100) {
            this.sliders[i][1] = 100;
          }
          style_str += suffix + (this.sliders[i][0] + " " + this.sliders[i][1] + "%");

        }
        suffix = " , "; //add , from next iteration
      }

      if (this.type == 'linear') {
        //direction, [color stoppers]
        style_str = this.direction + " , " + style_str; //add direction for gradient
      } else {
        //offset, type size, [color stoppers]
        style_str = this.direction + " , " + this.type + " " + this.shape + " , " + style_str;
      }
    }

    return style_str;
  },
  //@input rgb string rgb(<red>,<green>,<blue>)
  //@output rgb object of form { r: <red> , g: <green> , b : <blue>}
  get_rgb_obj: function (rgb) {

    //rgb(r,g,b)
    rgb = rgb.split("(");
    //r,g,b)
    rgb = rgb[1];
    //r g b)
    rgb = rgb.split(",");

    return {
      r: parseInt(rgb[0]),
      g: parseInt(rgb[1]),
      b: parseInt(rgb[2])
    };

  },
  load_info: function (ele) {
    var id = "#" + ele.id;
    this.current_slider_id = id;
    //check if current clicked element is an slider
    if (this.slider_ids.indexOf(ele.id) > -1) { //javascript does not has # in its id

      var color = $(id).css("backgroundColor");
      //but what happens if @color is not in RGB ? :(
      var rgb = this.get_rgb_obj(color);

      var left = $(id).css("left");
      if (parseInt(left) > 5 && parseInt(left) < 165) {
        $("#gradx_slider_info") //info element cached before
          .css("left", left)
          .show();

      }
//call the colorpicker plugin
      this.colorpicker({
        element: this.cp,
        color: rgb,
        callback: this.colorpickerCallback.bind(this)
      });
    }
  },
  //add slider
  add_sliders: function (sliders) {
    var gradx = this;
    var id, slider, k, offset, value, delta;

    if (!sliders) {
      sliders = [//default sliders
        {
          color: '#000',//this.get_random_rgb(),
          offset: 0//this.get_random_position() //x percent of gradient panel(400px)
        },
        {
          color: '#ccc',//this.get_random_rgb(),
          offset: 100 //this.get_random_position()
        }
      ];
    }


    for (k in sliders) {
      if (typeof sliders[k].offset === "undefined")
        break;

      //convert % to px based on containers width
      var delta = 10; //range: 26px tp 426px
      offset = parseInt((sliders[k].offset * this.container_width) / 100) + delta + "px";

      id = "gradx_slider_" + (this.slider_index); //create an id for this slider

      this.sliders.push(
        [
          sliders[k].color,
          sliders[k].offset
        ]
      );

      this.slider_ids.push(id); //for reference wrt to id

      slider = "<div class='gradx_slider' id='" + id + "'><i class='ico'></i></div>";
      $("#gradx_start_sliders_" + this.id).append(slider);

      $('#' + id).css("backgroundColor", sliders[k].color).css("left", offset);
      this.slider_index++;
    }

    for (var i = 0, len = this.slider_ids.length; i < len; i++) {

      $('#' + this.slider_ids[i]).draggable({
        containment: 'parent',
        axis: 'x',
        start: function () {
          gradx.current_slider_id = "#" + $(this).attr("id"); //got full jQuery power here !
        },
        drag: function () {

          gradx.update_style_array();
          gradx.apply_style();
          var left = $(gradx.current_slider_id).css("left");


          if (parseInt(left) > 5 && parseInt(left) < 165) {
            $("#gradx_slider_info") //info element cached before
              .css("left", left)
              .show();

          }
          /*else {
                                  if (parseInt(left) > 120) {
                                  left = "272px";
                                  } else {
                                  left = "120px";
                                  }

                                  $("#gradx_slider_info") //info element cached before
                                  .css("left", left)
                                  .show();

                                  }*/
          var color = $(gradx.current_slider_id).css("backgroundColor");
          //but what happens if @color is not in RGB ? :(
          var rgb = gradx.get_rgb_obj(color);
          gradx.cp.spectrum("set", rgb);
        }
      }).click(function () {
        gradx.load_info(this);
        return false;
      });
    }


  },
  colorpicker: function (options) {
    this.spectrum_colorpicker(options);
  },
  spectrum_colorpicker: function (options) {
    options.element.spectrum({
      move: function(color){
        var rgba = color.toRgbString();
        options.callback(rgba);
      } ,
      change: function () {
        $("#gradx_slider_info").hide();
      },
      flat: true,
      showAlpha: true,
      color: options.color,
      clickoutFiresChange: true,
      showInput: true,
      showButtons: false
    });
  },
  generate_options: function (options) {

    var len = options.length,
      name, state,
      str = '';

    for (var i = 0; i < len; i++) {

      name = options[i].split(" ");

      name = name[0];

      if (i < 2) {
        state = name[1];
      } else {
        state = '';
      }

      name = name.replace("-", " ");

      str += '<option value=' + options[i] + ' ' + state + '>' + name + '</option>';

    }

    return str;
  },

  generate_radial_options: function () {
    var options;
    options = ["horizontal-center disabled", "center selected", "left", "right"];
    $('#gradx_gradient_subtype').html(this.generate_options(options));

    options = ["vertical-center disabled", "center selected", "top", "bottom"];
    $('#gradx_gradient_subtype2').html(this.generate_options(options)).show();
  },
  generate_linear_options: function () {

    var options = ["horizontal-center disabled", "left selected", "right", "top", "bottom"];
    $('#gradx_gradient_subtype').html(this.generate_options(options));

    $('#gradx_gradient_subtype2').hide();

  },
  destroy: function () {}
};