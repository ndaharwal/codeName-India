
fabric.util.mediaRoot = "";
fabric.util.addNoCache = false;

fabric.util.loadResources = function (resources, callback, context, crossOrigin) {
  let loadedResources = {};
  let loader = fabric.util.loader(Object.keys(resources).length, function () {
    callback(loadedResources);
  });
  for (let i in resources) {
    (function (i) {
      fabric.util.loadImage(resources[i], function (image) {
        loadedResources[i] = image;
        loader();
      }, context, crossOrigin);
    }(i));
  }
};
fabric.media = {};
fabric.media.error = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==";
fabric.util.loadingTime = 0;
fabric.util.fImageRegistry = {};
fabric.util.loadImage = function (originalUrl, callback, context, crossOrigin, force, loadingFallback) {
  fabric.util.timeDebug && console.time(`loading ${originalUrl}`);
  let time = new Date().getTime();

  let url = originalUrl ? fabric.util.getURL(originalUrl) : fabric.media.error;

    if(fabric.isLikelyNode ){
    // if(fabric.util.fImageRegistry[url] ){
    //   callback && callback.call(context, null, true);
    //   return;
    // }

    const { Image } = require('canvas');
    let img = new Image();
    img._src = url;

    img.onload = function () {
      callback && callback.call(context, img, true);
    };

    img.onerror = function () {
      callback && callback.call(context, null, true);
    };

    fabric.util.fImageRegistry[url] = fabric.media.error;

    function createImageAndCallBack(buffer) {
      fabric.util.timeDebug && console.timeEnd(`loading ${originalUrl}`);
      fabric.util.loadingTime += new Date().getTime() - time;
      if(buffer){
        fabric.util.fImageRegistry[url] = buffer;
        img.src = buffer;
      }else{
        img.src = fabric.media.error;
      }
    }

    if (url && url.indexOf('http') !== 0) {
      let fs = require('fs');
      fs.readFile(url, function (err, buffer) {
        if (err) {
          fabric.warn(err);
          return createImageAndCallBack(null);
          // throw err;
        }
        createImageAndCallBack(buffer);
      });
    }
    else if (url) {
      let request = require("request");
      request.get({url: url, encoding: null}, (err, res, buffer) => {
        if (err) {
          fabric.log(err);
          return createImageAndCallBack(null);
        }
        createImageAndCallBack(buffer);
      });
    }
    return;
  }

  if (!force && fabric.debugTimeout) {
    setTimeout(() => {
      fabric.util.loadImage(originalUrl, callback, context, crossOrigin, true)
    }, fabric.debugTimeout);
    return;
  }

  let img = fabric.util.createImage();
  let onLoadCallback = function () {
    if(fabric.isLikelyNode && fabric.pdf){
      fabric.pdf.registerImage(url,callback.bind(context, img))
    }else{
      callback && callback.call(context, img);
    }
    img.onload = img.onerror = null;
  };
  img.onload = onLoadCallback;
  img.onerror = function () {
    //изображение не было загружено
    fabric.log('Error loading ' + img.src);
    fabric.errors.push({type: "image", message: "Image was not loaded"});
    if (!loadingFallback && fabric.media.error) {
      fabric.util.loadImage(fabric.media.error, callback, context, 'Anonymous', true, true);
    } else {
      img.onload = img.onerror = null;
      callback && callback.call(context, null, true);
    }
  };
  if (url.indexOf('data') !== 0 && crossOrigin) {
    img.crossOrigin = crossOrigin;
  }
  if (url.substring(0, 14) === 'data:image/svg') {
    img.onload = null;
    fabric.util.loadImageInDom(img, onLoadCallback);
  }
  img.src = url;
  if (img.naturalHeight) {
    setTimeout(onLoadCallback);
  }
};

fabric.util.trustedDomains = [];
fabric.util.proxyURL = "";
fabric.util.getURL = function (url, sourceRoot) {
  if (fabric.util.proxyURL && /^(http|https)\:\/\//.test(url)) {
    if(fabric.util.trustedDomains.indexOf(new URL(url).hostname) === -1){
      url = fabric.util.proxyURL + url;
    }
  }
  if (url.indexOf('blob') !== 0 && url.indexOf('data') !== 0 && url.indexOf('://') === -1 && !url.startsWith('./')) {
    url = (sourceRoot !== undefined ? sourceRoot : fabric.util.mediaRoot) + url;
  }
  if (fabric.util.addNoCache && /^(http|https)\:\/\//.test(url)) {
    url = '?no-cache=' + new Date().getTime()
  }
  return url;
};


fabric.util.loadVideo = function (sources, callback, context, crossOrigin) {

  function loadIt(url) {
    video.src = fabric.util.getURL(url);
    video.addEventListener("loadeddata", function () {
      callback(video);
    }, true);
    video.load();
  }

  let video = document.createElement('video');

  //trying to find the most suitable source for current browser
  for (let type in sources) {
    if (video.canPlayType(type) === "yes") {
      this.mediaType = type;
      loadIt(sources[type]);
      return;
    }
  }
  for (let type in sources) {
    if (video.canPlayType(type) === "maybe") {
      this.mediaType = type;
      loadIt(sources[type]);
      return;
    }
  }
  console.warn("video sources formats is not supported")
};

fabric.util._loadSVGFromURL_overwritten = fabric.loadSVGFromURL;
fabric.loadSVGFromURL = function (url, callback, reviver) {
  if (url.indexOf('data') !== 0 && url.indexOf('://') === -1) {
    url = fabric.util.mediaRoot + url;
  }
  if (fabric.util.addNoCache && /^(http|https)\:\/\//.test(url)) {
    url += '?no-cache=' + moment().format('x');
  }
  fabric.util._loadSVGFromURL_overwritten(url, function (data) {
    if (data) {
      return callback(data);
    }

    let xml = jQuery.parseXML(atob(fabric.media.error.substr(26)));

    fabric.parseSVGDocument(xml.documentElement, function (results, options) {
      callback && callback(results, options);
    }, reviver);

  }, reviver);
};




/**
 * Loads an image with progress callback.
 * The `onprogress` callback will be called by XMLHttpRequest's onprogress
 * event, and will receive the loading progress ratio as an whole number.
 * However, if it's not possible to compute the progress ratio, `onprogress`
 * will be called only once passing -1 as progress value. This is useful to,
 * for example, change the progress animation to an undefined animation.
 *
 * @param  {string}   imageUrl   The image to load
 * @param  {Function} onprogress
 * @return {Promise}
 */
function loadImageWithProgress(imageUrl, onprogress) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    var notifiedNotComputable = false;

    xhr.open('GET', imageUrl, true);
    xhr.responseType = 'arraybuffer';

    xhr.onprogress = function(ev) {
      if (ev.lengthComputable) {
        onprogress(parseInt((ev.loaded / ev.total) * 100));
      } else {
        if (!notifiedNotComputable) {
          notifiedNotComputable = true;
          onprogress(-1);
        }
      }
    }

    xhr.onloadend = function() {
      if (!xhr.status.toString().match(/^2/)) {
        reject(xhr);
      } else {
        if (!notifiedNotComputable) {
          onprogress(100);
        }

        var options = {}
        var headers = xhr.getAllResponseHeaders();
        var m = headers.match(/^Content-Type\:\s*(.*?)$/mi);

        if (m && m[1]) {
          options.type = m[1];
        }

        var blob = new Blob([this.response], options);

        resolve(window.URL.createObjectURL(blob));
      }
    };
    xhr.send();
  });
}

/*****************
 * Example usage
 *
 *
 var imgContainer = document.getElementById('imgcont');
 var progressBar = document.getElementById('progress');
 var imageUrl = 'https://placekitten.com/g/2000/2000';

 loadImageWithProgress(imageUrl, (ratio) => {
  if (ratio == -1) {
    // Ratio not computable. Let's make this bar an undefined one.
    // Remember that since ratio isn't computable, calling this function
    // makes no further sense, so it won't be called again.
    progressBar.removeAttribute('value');
  } else {
    // We have progress ratio; update the bar.
    progressBar.value = ratio;
  }
})
 .then(imgSrc => {
    // Loading successfuly complete; set the image and probably do other stuff.
    imgContainer.src = imgSrc;
  }, xhr => {
    // An error occured. We have the XHR object to see what happened.
  });
 */



