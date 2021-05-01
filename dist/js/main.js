/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/object-fit-images/dist/ofi.common-js.js":
/*!**************************************************************!*\
  !*** ./node_modules/object-fit-images/dist/ofi.common-js.js ***!
  \**************************************************************/
/***/ (function(module) {

"use strict";
/*! npm.im/object-fit-images 3.2.4 */


var OFI = 'bfred-it:object-fit-images';
var propRegex = /(object-fit|object-position)\s*:\s*([-.\w\s%]+)/g;
var testImg = typeof Image === 'undefined' ? {
  style: {
    'object-position': 1
  }
} : new Image();
var supportsObjectFit = ('object-fit' in testImg.style);
var supportsObjectPosition = ('object-position' in testImg.style);
var supportsOFI = ('background-size' in testImg.style);
var supportsCurrentSrc = typeof testImg.currentSrc === 'string';
var nativeGetAttribute = testImg.getAttribute;
var nativeSetAttribute = testImg.setAttribute;
var autoModeEnabled = false;

function createPlaceholder(w, h) {
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='" + w + "' height='" + h + "'%3E%3C/svg%3E";
}

function polyfillCurrentSrc(el) {
  if (el.srcset && !supportsCurrentSrc && window.picturefill) {
    var pf = window.picturefill._; // parse srcset with picturefill where currentSrc isn't available

    if (!el[pf.ns] || !el[pf.ns].evaled) {
      // force synchronous srcset parsing
      pf.fillImg(el, {
        reselect: true
      });
    }

    if (!el[pf.ns].curSrc) {
      // force picturefill to parse srcset
      el[pf.ns].supported = false;
      pf.fillImg(el, {
        reselect: true
      });
    } // retrieve parsed currentSrc, if any


    el.currentSrc = el[pf.ns].curSrc || el.src;
  }
}

function getStyle(el) {
  var style = getComputedStyle(el).fontFamily;
  var parsed;
  var props = {};

  while ((parsed = propRegex.exec(style)) !== null) {
    props[parsed[1]] = parsed[2];
  }

  return props;
}

function setPlaceholder(img, width, height) {
  // Default: fill width, no height
  var placeholder = createPlaceholder(width || 1, height || 0); // Only set placeholder if it's different

  if (nativeGetAttribute.call(img, 'src') !== placeholder) {
    nativeSetAttribute.call(img, 'src', placeholder);
  }
}

function onImageReady(img, callback) {
  // naturalWidth is only available when the image headers are loaded,
  // this loop will poll it every 100ms.
  if (img.naturalWidth) {
    callback(img);
  } else {
    setTimeout(onImageReady, 100, img, callback);
  }
}

function fixOne(el) {
  var style = getStyle(el);
  var ofi = el[OFI];
  style['object-fit'] = style['object-fit'] || 'fill'; // default value
  // Avoid running where unnecessary, unless OFI had already done its deed

  if (!ofi.img) {
    // fill is the default behavior so no action is necessary
    if (style['object-fit'] === 'fill') {
      return;
    } // Where object-fit is supported and object-position isn't (Safari < 10)


    if (!ofi.skipTest && // unless user wants to apply regardless of browser support
    supportsObjectFit && // if browser already supports object-fit
    !style['object-position'] // unless object-position is used
    ) {
        return;
      }
  } // keep a clone in memory while resetting the original to a blank


  if (!ofi.img) {
    ofi.img = new Image(el.width, el.height);
    ofi.img.srcset = nativeGetAttribute.call(el, "data-ofi-srcset") || el.srcset;
    ofi.img.src = nativeGetAttribute.call(el, "data-ofi-src") || el.src; // preserve for any future cloneNode calls
    // https://github.com/bfred-it/object-fit-images/issues/53

    nativeSetAttribute.call(el, "data-ofi-src", el.src);

    if (el.srcset) {
      nativeSetAttribute.call(el, "data-ofi-srcset", el.srcset);
    }

    setPlaceholder(el, el.naturalWidth || el.width, el.naturalHeight || el.height); // remove srcset because it overrides src

    if (el.srcset) {
      el.srcset = '';
    }

    try {
      keepSrcUsable(el);
    } catch (err) {
      if (window.console) {
        console.warn('https://bit.ly/ofi-old-browser');
      }
    }
  }

  polyfillCurrentSrc(ofi.img);
  el.style.backgroundImage = "url(\"" + (ofi.img.currentSrc || ofi.img.src).replace(/"/g, '\\"') + "\")";
  el.style.backgroundPosition = style['object-position'] || 'center';
  el.style.backgroundRepeat = 'no-repeat';
  el.style.backgroundOrigin = 'content-box';

  if (/scale-down/.test(style['object-fit'])) {
    onImageReady(ofi.img, function () {
      if (ofi.img.naturalWidth > el.width || ofi.img.naturalHeight > el.height) {
        el.style.backgroundSize = 'contain';
      } else {
        el.style.backgroundSize = 'auto';
      }
    });
  } else {
    el.style.backgroundSize = style['object-fit'].replace('none', 'auto').replace('fill', '100% 100%');
  }

  onImageReady(ofi.img, function (img) {
    setPlaceholder(el, img.naturalWidth, img.naturalHeight);
  });
}

function keepSrcUsable(el) {
  var descriptors = {
    get: function get(prop) {
      return el[OFI].img[prop ? prop : 'src'];
    },
    set: function set(value, prop) {
      el[OFI].img[prop ? prop : 'src'] = value;
      nativeSetAttribute.call(el, "data-ofi-" + prop, value); // preserve for any future cloneNode

      fixOne(el);
      return value;
    }
  };
  Object.defineProperty(el, 'src', descriptors);
  Object.defineProperty(el, 'currentSrc', {
    get: function get() {
      return descriptors.get('currentSrc');
    }
  });
  Object.defineProperty(el, 'srcset', {
    get: function get() {
      return descriptors.get('srcset');
    },
    set: function set(ss) {
      return descriptors.set(ss, 'srcset');
    }
  });
}

function hijackAttributes() {
  function getOfiImageMaybe(el, name) {
    return el[OFI] && el[OFI].img && (name === 'src' || name === 'srcset') ? el[OFI].img : el;
  }

  if (!supportsObjectPosition) {
    HTMLImageElement.prototype.getAttribute = function (name) {
      return nativeGetAttribute.call(getOfiImageMaybe(this, name), name);
    };

    HTMLImageElement.prototype.setAttribute = function (name, value) {
      return nativeSetAttribute.call(getOfiImageMaybe(this, name), name, String(value));
    };
  }
}

function fix(imgs, opts) {
  var startAutoMode = !autoModeEnabled && !imgs;
  opts = opts || {};
  imgs = imgs || 'img';

  if (supportsObjectPosition && !opts.skipTest || !supportsOFI) {
    return false;
  } // use imgs as a selector or just select all images


  if (imgs === 'img') {
    imgs = document.getElementsByTagName('img');
  } else if (typeof imgs === 'string') {
    imgs = document.querySelectorAll(imgs);
  } else if (!('length' in imgs)) {
    imgs = [imgs];
  } // apply fix to all


  for (var i = 0; i < imgs.length; i++) {
    imgs[i][OFI] = imgs[i][OFI] || {
      skipTest: opts.skipTest
    };
    fixOne(imgs[i]);
  }

  if (startAutoMode) {
    document.body.addEventListener('load', function (e) {
      if (e.target.tagName === 'IMG') {
        fix(e.target, {
          skipTest: opts.skipTest
        });
      }
    }, true);
    autoModeEnabled = true;
    imgs = 'img'; // reset to a generic selector for watchMQ
  } // if requested, watch media queries for object-fit change


  if (opts.watchMQ) {
    window.addEventListener('resize', fix.bind(null, imgs, {
      skipTest: opts.skipTest
    }));
  }
}

fix.supportsObjectFit = supportsObjectFit;
fix.supportsObjectPosition = supportsObjectPosition;
hijackAttributes();
module.exports = fix;

/***/ }),

/***/ "./src/js/lib/backfaceFixed.js":
/*!*************************************!*\
  !*** ./src/js/lib/backfaceFixed.js ***!
  \*************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "backfaceFixed": function() { return /* binding */ backfaceFixed; }
/* harmony export */ });
//https:czenn.dev/tak_dcxi/articles/bbdb6cd9305ba4
var backfaceFixed = function backfaceFixed(fixed) {
  /**
   * 表示されているスクロールバーとの差分を計測し、背面固定時はその差分body要素に余白を生成する
   */
  var scrollbarWidth = window.innerWidth - document.body.clientWidth;
  document.body.style.paddingRight = fixed ? "".concat(scrollbarWidth, "px") : "";
  /**
   * スクロール位置を取得する要素を出力する(`html`or`body`)
   */

  var scrollingElement = function scrollingElement() {
    var browser = window.navigator.userAgent.toLowerCase();
    if ("scrollingElement" in document) return document.scrollingElement;
    if (browser.indexOf("webkit") > 0) return document.body;
    return document.documentElement;
  };
  /**
   * 変数にスクロール量を格納
   */


  var scrollY = fixed ? scrollingElement().scrollTop : parseInt(document.body.style.top || "0");
  /**
   * CSSで背面を固定
   */

  var styles = {
    height: "100vh",
    left: "0",
    overflow: "hidden",
    position: "fixed",
    top: "".concat(scrollY * -1, "px"),
    width: "100vw"
  };
  Object.keys(styles).forEach(function (key) {
    document.body.style[key] = fixed ? styles[key] : "";
  });
  /**
   * 背面固定解除時に元の位置にスクロールする
   */

  if (!fixed) window.scrollTo(0, scrollY * -1);
};



/***/ }),

/***/ "./src/js/lib/viewportFixUnder360.js":
/*!*******************************************!*\
  !*** ./src/js/lib/viewportFixUnder360.js ***!
  \*******************************************/
/***/ (function() {

var vpFixed = function vpFixed() {
  var viewport = document.querySelector('meta[name="viewport"]');

  function switchViewport() {
    var value = window.outerWidth > 360 ? "width=device-width,initial-scale=1" : "width=360";

    if (viewport.getAttribute("content") !== value) {
      viewport.setAttribute("content", value);
    }
  }

  addEventListener("resize", switchViewport, false);
  switchViewport();
};

!function () {
  var viewport = document.querySelector('meta[name="viewport"]');

  function switchViewport() {
    var value = window.outerWidth > 360 ? "width=device-width,initial-scale=1" : "width=360";

    if (viewport.getAttribute("content") !== value) {
      viewport.setAttribute("content", value);
    }
  }

  addEventListener("resize", switchViewport, false);
  switchViewport();
}();

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
!function() {
"use strict";
/*!************************!*\
  !*** ./src/js/main.js ***!
  \************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _lib_backfaceFixed__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lib/backfaceFixed */ "./src/js/lib/backfaceFixed.js");
/* harmony import */ var _lib_viewportFixUnder360__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lib/viewportFixUnder360 */ "./src/js/lib/viewportFixUnder360.js");
/* harmony import */ var _lib_viewportFixUnder360__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_lib_viewportFixUnder360__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var object_fit_images__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! object-fit-images */ "./node_modules/object-fit-images/dist/ofi.common-js.js");
/* harmony import */ var object_fit_images__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(object_fit_images__WEBPACK_IMPORTED_MODULE_2__);
// import 文を使って sub.js ファイルを読み込む。


 //初期化

(0,_lib_viewportFixUnder360__WEBPACK_IMPORTED_MODULE_1__.vpFixed)();
object_fit_images__WEBPACK_IMPORTED_MODULE_2___default()();
}();
/******/ })()
;
//# sourceMappingURL=main.js.map