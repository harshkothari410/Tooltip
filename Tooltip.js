function tooltip_add (args) {
  var el = document.getElementById(args.id);
  if (!el) return;
  var div = args.div;
  if (! div) {
    var id = args.div_id;
    if (! id) id = 'tooltip_div';
    div = document.getElementById(id);
    if (! div) {
      div = document.createElement('DIV');
      div.style.display = 'none';
      div.setAttribute('id', id);
      document.body.appendChild(div);
    }
  }
  tooltip_event(el, 'mouseover', function (e) { tooltip_mouseover(e, div, args) });
  tooltip_event(el, 'mousemove', function (e) { tooltip_mousemove(e, div, args) });
  tooltip_event(el, 'mouseout',  function (e) { tooltip_mouseout( e, div, args) });
}

function tooltip_event (el, evname, func, capture) {
  if (el.addEventListener) return el.addEventListener(evname, func, capture ? true : false);
  if (el.attachEvent)      return el.attachEvent('on'+evname, func);
  el['on'+evname] = func;
}

function tooltip_mouseover (e, div, args) {
  div.style.display  = 'none';
  div.style.position = 'absolute';

  // look for built in css
  var selector = '#' + div.getAttribute('id');
  var found = 0;
  for (var i = 0; i < document.styleSheets.length; i++) {
    if (args.color || args.border_color) continue;
    var s = document.styleSheets[i];
    var r; try { r = s.cssRules ? s.cssRules : s.rules ? s.rules : [] } catch (e) {}; if (!r) continue;
    for (var j = 0; j < r.length; j++) if (r[j].selectorText == selector) found ++;
  }

  if (typeof(args.width) == 'undefined' && typeof(tooltip_width) != 'undefined') args.width = tooltip_width;
  if (! found) {
    div.style.padding = '0px';
    if (! args.background      ) args.background       = 'white';
    if (! args.border_color    ) args.border_color     = 'blue';
    if (! args.border          ) args.border           = '2px solid '+args.border_color;
    if (! args.color           ) args.color            = 'black';
    if (! args.title_background) args.title_background = args.border_color;
    if (! args.title_color     ) args.title_color      = args.background;
    if (! args.padding         ) args.padding          = '1ex';
    if ((! args.width && args.width != '') || typeof(args.width) == 'undefined') args.width = '50ex';
  }

  div.innerHTML = (args.title ? "<div class=tooltip_title></div>" : "") + "<div class=tooltip_body></div>";
  if (args.title) {
    div.firstChild.innerHTML = args.title;
    if (args.title_background) div.firstChild.style.background = args.title_background;
    if (args.title_color)      div.firstChild.style.color      = args.title_color;
    if (args.title_color)      div.firstChild.style.padding    = '2px';
  }
  div.lastChild.innerHTML = args.html ? args.html : 'No html specified';
  if (args.padding) div.lastChild.style.padding = args.padding;

  if (args.background) div.style.background = args.background;
  if (args.color)      div.style.color      = args.color;
  if (args.border)     div.style.border     = args.border;
  if (args.height) { var h = args.height; if (/^\d+$/.test(h)) h = h+'px';  div.style.height = h }
  if (args.width || args.width == '') { var w = args.width; if (/^\d+$/.test(w)) w = w+'px'; div.style.width = w }

  // move it into place without showing it
  div._x = e.clientX;
  div._y = e.clientY;
  var show = function () {
    div.style.visibility = 'hidden';
    div.style.display = 'block';
    tooltip_mousemove({clientX:div._x , clientY:div._y}, div, args);
    div.style.visibility = 'visible';
  };

  var delay = typeof(args.delay) != 'undefined' ? args.delay : typeof(tooltip_delay) != 'undefined' ? tooltip_delay : 0;
  if (delay) div.timer = setTimeout(show, delay);
  else show();
}

function tooltip_mouseout (e, div, args) {
  if (div.timer) clearTimeout(div.timer);
  div.style.display = 'none';
}

function tooltip_mousemove (e, div, args) {
  if (div.style.display == "none") { div._x = e.clientX, div._y = e.clientY; return }
  var oy = typeof(args.offset_y) != 'undefined' ? args.offset_y : typeof(tooltip_offset_y) != 'undefined' ? tooltip_offset_y : 10;
  var ox = typeof(args.offset_x) != 'undefined' ? args.offset_x : typeof(tooltip_offset_x) != 'undefined' ? tooltip_offset_x : 7;
  var sx = window.pageXOffset || document.body.scrollLeft || document.documentElement.scrollLeft;
  var sy = window.pageYOffset || document.body.scrollTop  || document.documentElement.scrollTop;
  var Y = e.clientY + sy
  var X = e.clientX + sx;
  var y = Y + oy;
  var x = X + ox;
  if (x + div.clientWidth  > document.body.clientWidth) {
    if (x - div.clientWidth  - 2*ox > sx) x = X - div.clientWidth  - ox;
    else x = sx + 2;
  }
  if (y + div.clientHeight > document.body.clientHeight) {
    if (y - div.clientHeight - 2*oy > sy) y = Y - div.clientHeight - oy;
    else y = sy + 2;
  }

  div.style.top  = y +'px';
  div.style.left = x +'px';
}