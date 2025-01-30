function evalInContext (js) {
  let parameters = [js];
  let keys = ["eval_code"];
  for(let i = 2; i< arguments.length; i++){
    for(let key in arguments[i]) {
      parameters.push(arguments[i][key]);
      keys.push(key);
    }
  }
  try {
    return window.eval(`(function e(${keys.join(",")}){
           with(this){ return eval(eval_code);}
       })`).apply(arguments[1],parameters)
  } catch (e) {
    return undefined;
  }
};
String.prototype.format  = function () {
  let str = this.toString();
  if (arguments.length) {
    let type = typeof arguments[0]
      , args = type == 'string' || type == 'number' ? Array.prototype.slice.call(arguments) : arguments[0]
    //
    // for (var arg in args) str = str.replace(new RegExp('\\{' + arg + '\\}', 'gi'), args[arg])

    str = str.replace(/\{([^}]*)\}/g,function(a,b){
      return evalInContext(b,args)
    })
  }

  return str
};