
function createLayersTree(elId, getValue, setValue){

  let showRoot = false;

  var tree = this.tree = $(elId).jstree({
    "core" : {
      "themes": {
        "theme": "default-dark",
        "stripes": false,
        "dots": false,
        "icons": true
      },
      'check_callback': function(operation, node, node_parent, node_position, more) {
        // operation can be 'create_node', 'rename_node', 'delete_node', 'move_node' or 'copy_node'
        // in case of 'rename_node' node_position is filled with the new node name
        if (operation === "move_node") {
          //do not allow to move objects to another root.
          if(node_parent.type === "root" && !node.parents.includes(node_parent.id)){
            return false
          }
          return true; //only allow dropping inside nodes of type 'Parent'
        }
        return true;  //allow all other operations
      },
      'data': getValue()
    },
    "types" : {
      "#" : {
        "valid_children" : showRoot ? ["root","objectsroot"] : ["object"]
      },
      "root" : {
        "valid_children" : []
      },
      "objectsroot" : {
        "icon": "group-icon",
        "valid_children" : ["object","group"]
      },
      "overlay" : {
        "valid_children" : []
      },
      "background" : {
        "valid_children" : []
      },
      "object" : {
        "icon": "object-icon",
        "valid_children" : []
      },
      "group" : {
        "valid_children" : ["object","group"]
      }
    },

    "checkbox" : {
      "tie_selection" : false,
      "whole_node": false
      // "keep_selected_style" : false
    },
    // "conditionalselect" : function (node, event) {
    //   return node.type === "object" || node.type === "group" || node.type === "objectsroot";
    // },
    "dnd" : {
      check_while_dragging: true,
      is_draggable: function(node,event){
        if(node[0].type === "object" || node[0].type === "group"){
          return true;
        }else{
          event.preventDefault();
          return false;
        }
      }
    },
    node_customize: {
      default: function(el, node) {
        if (node.type === "object" || node.type === "group" || node.type === "root") {
          node.inputs = {};

          function updatePropertyButton(node,property) {
            if(!node.inputs)return;
            let value = node.data[property];
            switch(property) {
              case "visible":
                node.inputs[property].find("span").attr("class", value ? "fas fa-eye" : "fas fa-eye-slash");
                break;
              case "locked":
                node.inputs[property].find("span").attr("class", value ? "fas fa-lock" : "fas fa-unlock-alt");
                break;
            }
          }

          function setPropertyRecoursive(node, property, value, modified) {
            if (node.children) {
              for (var child in node.children) {
                setPropertyRecoursive(tree.get_node(node.children[child]) , property, value,modified)
              }
            }
            let old_value = node.data[property];
            if(old_value !== value){
              node.data[property] = value;
              modified.push({node: node, modified: {[property]: value},original: {[property]: old_value}});
              updatePropertyButton(node,property)
            }
          }

          node.inputs.visible = $("<i>").click(function () {
            let modified = [];
            setPropertyRecoursive(node, "visible", !node.data.visible, modified);
            tree.trigger('modify_node', { "modified" : modified});
          }).append($("<span>"));

          node.inputs.locked = $("<i>").click(function () {
            let modified = [];
            setPropertyRecoursive(node, "locked", !node.data.locked, modified);
            tree.trigger('modify_node', { "modified" : modified});
          }).append($("<span>"));

          node.inputs.remove = $("<i>").click(function () {
            tree.delete_node(node);
          }).append($("<span  class='fas fa-delete'>"));


          updatePropertyButton(node,"visible");
          updatePropertyButton(node,"locked");

          let element = this.element;
          $(el).find('> .jstree-anchor').dblclick(function(){
            tree.edit(node);
            tree._open_to(node).find("input")
              .attr('maxlength',20)
              .on("keydown", function(event) {
                event.stopPropagation();
              })
          })
          $(el).find('> .jstree-anchor').after($("<span class='jstree-actions'>").append(node.inputs.visible, node.inputs.locked, node.inputs.remove))
        }
      }
    },
    "contextmenu": {
      "items": function ($node) {
        let menu = {};
        if($node.type === "group" || $node.type === "root"){
          menu["Create"] = {
            "separator_before": false,
            "separator_after": true,
            "label": "Create",
            "action": false,
            "submenu": {
              "Group": {
                "seperator_before": false,
                "seperator_after": false,
                "label": "Group",
                action: function (obj) {
                  var $newNode = tree.create_node($node.id, {
                    text: 'New Group',
                    type: 'group',
                    data: {visible: true, locked: false}
                  }, 'last', function () {
                    console.log('done');
                  });
                  tree.deselect_all();
                  tree.select_node($newNode);
                  tree.edit($newNode);
                }
              }
            }
          }
        }
        if($node.type === "group" || $node.type === "object") {
          menu["Rename"] = {
            "separator_before": false,
            "separator_after": false,
            "label": "Rename",
            "action": function (obj) {
              tree.edit($node);
            }
          }
        }
        if($node.type === "group" || $node.type === "object") {
          menu["Remove"] = {
            "separator_before": false,
            "separator_after": false,
            "label": "Remove",
            "action": function (obj) {
              tree.delete_node($node);
            }
          }
        }
        return menu;
      }
    },
    "state" : { "key" : "layers" },
    "plugins" : [
      "state",
      "checkbox",
      "unique",
      "changed",
      "node_customize",
      "themes",
      // "contextmenu",
      "dnd",
      "types",
      "wholerow",
      "conditionalselect"
    ]
  })
    .on("check_node.jstree uncheck_node.jstree", function(e, data) {
      if(tree.processing)return;

      var checked = [];
      function collectCheckedNodes(node){
        if(node.children){
          for(var i = node.children.length; i--;){
            collectCheckedNodes(tree.get_node(node.children[i]));
          }
        }
        if(node.type = "object" && node.state.checked)
          checked.push(node.id);
      }
      collectCheckedNodes(tree.get_node("#"));

      setValue({
        type: "checked",
        checked: checked
      });

    })
    .on("changed.jstree", function (e, data) {
      /*if(tree.processing)return;
      switch(data.action){
        case "deselect_all":
          // setValue({
          //   type: "selected",
          //   selected: []
          // });
          break;
        case "deselect_node":
        case "select_node":
          let selectedList = [];

          for(var item_id of data.selected){
            let element = tree.get_node(item_id);
            if(element.type === "object"){
              selectedList.push(item_id);
            }
          }

          setValue({
            type: "selected",
            selected: selectedList
          });
          break;
      }
      setValue(data);*/
    })
    .on('rename_node.jstree', function (e, data) {
      setValue({
        type: "modified",
        modified: [{
          modified: {id: data.text},
          node: data.node,
          original: {id: data.old}
        }]
      });
    })
    .on("delete_node.jstree", function (e, data) {
      if(tree.processing)return;
      setValue({
        type: "removed",
        node: data.node
      });
    })
    .on("modify_node.jstree", function (e, data) {
      setValue({
        type: "modified",
        modified: data.modified
      });
    })
    .on("move_node.jstree", function (e, data) {
      if(tree.processing)return;

      //order groups is not operable
      let root = tree.get_node(data.old_parent);
      let modifiedPosition = -1,originalPosition = -1, modifiedPositionCalculated = false,  originalPositionCalculated = false;

      /**
       * calculate original and modified index of the object node inside the root element. including all objects inside group nodes
       * @type {number}
       */
      let counter = 0;
      function addCounterRecoursive(el){
        for(let i = 0; i < el.children.length;i++){

          let ii = el.children.length - 1 - i ;

          if(modifiedPosition === -1 && el.id === data.parent && i >= data.position){
            modifiedPosition = counter;
          }
          if(originalPosition === -1 && el.id === data.old_parent && i >= data.old_position){
            originalPosition = counter;
          }
          let item = el.children[ii];
          if(item.constructor === String){
            item = tree.get_node(item)
          }
          if(item.type === "group"){
            if(addCounterRecoursive(item)){
              return;
            }
          }else{
            counter++;
          }
        }
      }
      addCounterRecoursive(root);
      modifiedPosition = counter - 1 - modifiedPosition;
      originalPosition = counter - 1 - originalPosition;

      setValue({
        type: "modified",
        modified: [{
          node: data.node,
          modified: {zIndex: modifiedPosition},
          original: {zIndex: originalPosition}
        }]
      });
    }).jstree(true);


  tree.updateTree = function() {
    tree.processing = true;
    var items = canvas.getObjectsOrder();

    tree.deselect_all();

    var root = tree.get_node("#");
    function removeNodes(node){
      if(node.children){
        for(var i = node.children.length; i--;){
          removeNodes(tree.get_node(node.children[i]));
        }
      }
      tree.delete_node(node);
    }
    removeNodes(tree.get_node("#"));




    for(var item of items){
      let parent = item.parent;
      delete item.parent;
      tree.create_node(parent,item);

      if(item.type === "objectsroot" || item.type === "group"){
        item.state.opened = true;
      }

      if(item.state.opened){
        tree.open_node(item.id);
      }
      if(item.state.checked){
        tree.check_node(item.id);
      }
    }
    tree.processing = false;
  };
  return tree;
}