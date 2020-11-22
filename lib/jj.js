/*
 * jj.js
 * Copyright (c) 2017–20 Jakob Hansbauer
 * MIT license
 */

;(function () {
	
	"use strict"
	
	var j = {
		h: "Jakob Hansbauer", // j.h
		
		// plain functions
		is: {
			def: function (x) {return typeof x !== ""+void+""}, // ""+void+"" === "undefined" // <3
			tru: function (x) {return x === !0}, // true
			fnc: function (x) {return typeof x === "function"}, // function
			obj: function (x) {return typeof x === "object" && !Array.isArray(x) && x !== null}, // object (no array)
			arr: Array.isArray, // array
			num: function (x) {return typeof x === "number" && !isNaN(x)}, // number
			int: Number.isInteger, // integer number
			str: function (x) {return typeof x === "string"}, // string
			sym: function (x) {return typeof x === "symbol"}, // symbol
			elm: function (x) {return x instanceof Element}, // dom element
			svg: function (x) {return x instanceof SVGElement}, // svg element
			ndl: function (x) {return x instanceof NodeList}, // nodelist
			css: function (x) {return this.def(document.body.style[x])}, // css property
			nod: function (x) {return x instanceof Node}, // dom node
			pos: function (x) {return x >= 0}, // positive (number)
			clr: {
				hex: function (x) {return /^#[a-f\d]{3,8}$/i.test(x)}, // #
				rgb: function (x) {return /^rgba?\(\s*\d+(%?),\s*\d+\1,\s*\d+\1,?(?:\s*\d*\.?\d*)?\s*\)/i.test(x)}, // rgb[a]
				hsl: function (x) {return /^hsla?\(\s*\d+,\s*\d+%,\s*\d+%,?(?:\s*\d*\.?\d*)?\s*\)/i.test(x)} // hsl[a]
			}
		},
		has: {
			val: function (x) {return x !== void"" && x !== null}, // neither undefined nor null
			unit: {
				px: function (prop) { return prop.search(/width|padding|margin|top|right|bottom|left|radius|spacing|gap|perspective|((?!line-).{5}|^.{0,4})((?!line).{4}|^.{0,3})height|((?!tab-).{4}|^.{0,3})((?!tab).{3}|^.{0,2})size/i) >= 0; } // returns whether prop may be measured px
			}
		},
		
		// convert
		ndl2arr: function (x) {return [].slice.call(x)}, // converts nodelist to array
		camel2hyphen: function (txt) {return txt.replace(/([a-z])([A-Z])/g, function(m,p1,p2) {return p1+"-"+p2}).toLowerCase()},
		hyphen2camel: function (txt) {return txt.replace(/-\w/g, function(m) {return m[1].toUpperCase()})},
		
		// math
		rnd: {
			float: function (x, y) { // j.rnd.float(x,y)
				if(!j.is.def(x)) {x=y; y=0}
				return Math.random() * (x - y) + y
			},
			int: function (y, x) { // j.rnd.int(x,y)
				if(!j.is.def(x)) {x=y; y=0}
				return Math.floor(Math.random() * (Math.floor(x) - Math.ceil(y) + 1)) + Math.ceil(y) // int between inkl. x and y
			}
		},
		avg: function (arr) { // arguments: <array> | <numbers>
			if (j.is.num(arr)) arr = arguments
			var sum = 0,
				i = arr.length, // iteration variable
				l = i
			while (--i >= 0) sum += arr[i]
			return sum / l;
		},
		
		// arrays
		arr: {
			rnd: function (arr) {return arr[j.rnd.int(arr.length-1)]}, // return random element
			shuffle: function (arr) { // shuffle an array
				var i = arr.length; while (i--) {
					var val = arr[i],
					k = Math.floor(Math.random() * (i+1))
					arr[i] = arr[k]; arr[k] = val
				}
				return arr
			}
		},
	}
	/// inner-scope function: empty
	function _f(){}
	
	
	
	//// j.dom ////
	
	/*: j.el()
	i: "Get <elements> or a single <element> by <selector>."
	#:
		#[0]: var _firstChild = j.el("#id.class > .child")[0] | var _firstChild = document.querySelectorAll("#id.class > .child")[0]
		#[1]: var _inputText = j.el("input[type=\"text\"]") | var _inputText = document.querySelectorAll("input[type=\"text\"]")
		#[2]: var _id = j.el("#id", 1) | var _id = document.querySelector("#id")
		#[3]: var _doc = j.el() | var _doc = document.documentElement
		#[4]:
			// get children
			var _children = j.el(".parents>*")
			// get next sibling
			var _next = j.el("#element", 1).nextSibling | j.el("#element+*")
			// get previous sibling
			var _prev = j.el("#element", 1).previousSibling
		#[5]:
			// get children of dom element by id
			var parent = j.el("#id",1)
				childs = j.el("#" + parent.id + ">*")
			// get children of all dom elements assigned to a specific class
			var parents = j.el(".class")
				childs = j.el("." + parents[0].class + ">*")
			
	@:
		@(0): <string> "<selector>: CSS selector string + parent selector: '<'" {"html"}
		@(1): <integer> 1: "Defines, if the function should return just the first <element>"
	>: <nodeList>
	?: >IE7
	%: /*****/
	/// inner-scope function: convert <element>|<selector>|<array>|<nodeList> to single <element> or <null> (?: >IE7)" {null}
	function _2el (sel) {
		while (j.is.ndl(sel) || j.is.arr(sel)) sel = sel[0]; // get first element of <nodeList>|<array>
		return j.is.elm(sel) ? sel : document.querySelector(j.is.str(sel) ? sel : null)
	}
	/// inner-scope function: returns <element> or document.documentElement
	function _elOrDocEl (el) {
		return j.is.elm(el) ? el : document.documentElement
	}
	j.el = function (sel, single) {
		if (!sel) return null
		return single ? document.querySelector(sel) : document.querySelectorAll(sel)
	}
	
	/*: j.all()
	i: "Invoke a function for each element of a <array>|<nodeList>|<array>."
	#:
		#[0]: j.all( ["#id", "#css.selector, .parent>.child, #anything *", j.el("#id"), j.el(".class"), j.el("tag"), [j.el("#foo"), j.el("#qux")], document.getElementByClassName("class"), document.body, window], function (el, i, a, b, c) {...}, [1, 2, 3] )
		#[1]: j.all( ".class", function (el, i) { el.innerHTML = "Lorem ipsum." + i })
	@:
		@[0]: nl: <string>|<element>|<array>|<nodeList>|window|document
			@[0][<string>]: "<selector>"
			@[0][<array>]: "valid element types: <array>|<nodeList>|<element>|window|document"
		@[1]: f: <function> f(el, arg[1], arg[2], ..., arg[n]) "callback function"
			@[1](0): el: <element> "every <element> of the <nodeList>|<array>"
			@[1](1): i: <integer> "index of the <element>"
			@[1](...arguments): arg: <argument> "arguments of f"
		@(2): arg: <array> "other arguments of f"
	>: <undefined>
	?: >IE7
	%: /***/
	j.all = function (nl, f, arg) {
		
		if (!nl || !f) return // if nl or f is an invalid argument: return undefined
		if (!arg || j.is.tru(arg)) arg = [] // default of arg: []
		var index = 0
		
		;(function invocation (el) {
			if (j.is.str(el)) {
				el = (el == "document") ? document
					: (el == "window") ? window
					: document.querySelectorAll(el) // <selector> (?: >IE7)
			}
			var isElem = j.is.elm(el);
			
			if (isElem || el === document || el === window) { // window|document|<element>
				f.apply(null, [el, index++].concat(arg)) // invoke f only once (?: >ES5: f(nl, ...arg))
			} else if (el && el.length && !isElem) { // valid <nodeList>|<array>of<elements>
				var i = el.length; while (--i >= 0) invocation(el[el.length-1-i]) // <nodeList>|<array>of<elements>
			}
		})(nl)
		
	}
	
	/*: j.inner
	i: "Set or get the HTML markup or text contained within multiple <elements>."
	#:
		#[0]: j.inner.text(".class") // get text of first <element>
		#[1]: j.inner.html(".class", "<p>HTML paragraph</p>", true) // add HTML
		#[2]: j.inner.text(".class", "Just text.", true) // add text
		#[3]: j.inner.html(".class", "<p>HTML paragraph</p>") // replacement
		#[4]: j.inner.text(".class", "<p>HTML paragraph</p>", 1) // insertion position
	@:
		@[0]: el: <string>|<element>|<array>|<nodeList> "elements"
		@(1): html: <string>|<number>|<function> "html text (if the html is a <function>, it returns the html text depending on the <element> iteration index)"
		@(2): add: <boolean>|<number> "a <boolean> indicating that the html will be added and not replaced to html of the <element> or a <number> which indicates the insertion position"
	>: <undefined>|<string>
	?: >IE7
	%: /*****/
	/// inner-scope function: edit .innerHTML|.textContent
	function _insert (type, el, txt, add) {
		if (!j.has.val(txt)) { // get text
			el = _2el(el)
			return j.is.elm(el) ? el[type] : ""
		}
		var isF = j.is.fnc(txt)
		if (j.is.tru(add)) j.all(el, function (element, i) {
			element[type] += isF ? txt(i) : txt
		})
		else if (j.is.num(add)) j.all(el, function (element, i) {
			var inner = element[type]
			element[type] = inner.substr(0, ((add < 0) ? inner.length : 0) + add) + (isF ? txt(i) : txt) + inner.substr(add)
		})
		else j.all(el, function (element, i) {element[type] = isF ? txt(i) : txt})
	}
	j.inner = {
		html: function (el, txt, add) { return _insert("innerHTML", el, txt, add) },
		text: function (el, txt, add) { return _insert("textContent", el, txt, add) }
	}
	
	/*: j.new
	i: "Append a new <element> to another <element>|<elements>."
	#:
		#[0]: j.new.el("div", {id: "bar"} "#parent") | j.el("#parent",1).innerHTML = "<div id="foo"></div>"
		#[1]: j.new.el("div", {}, ".parent")[0].id = "bar" | j.el("#parent",1).innerHTML = "<div id="foo"></div>"
		#[2]: j.new.svg("path", {d: "M0,0", stroke: "#000"} "#parent")
	@:
		@[el]: "create new <svgElements>"
			@[el][0]: el: <string> "tagName of the new element"
			@[el][1]: parents: <string>|<element> "<selector> of the parents or the parent <element>|<nodeList> of the new <element>"
			@[el]>: <array>of<element> "new elements"
		@[svg]: "create new <svgElements>"
			@[svg][0]: el: <string> "tagName of the new element"
			@[svg][1]: parents: <string>|<svgElement>|<element> "<selector> of the parents or the parent <element>|<nodeList> of the new <element>"
			@[svg]>: <array>of<svgElement> "new elements"
	?: >IE7
	%: /****/
	j.new = {
		el: function (el, attrs, parents) {
			var createdElements = []
			j.all(parents, function (parent) {
				var createdEl = document.createElement(el)
				parent.appendChild(createdEl)
				createdElements.push(createdEl)
			})
			j.attr(createdElements, attrs)
			return createdElements
		},
		svg: function (el, attrs, parents) {
			var createdElements = []
			j.all(parents, function (parent) {
				var createdEl = document.createElementNS("http://www.w3.org/2000/svg", el)
				parent.appendChild(createdEl)
				createdElements.push(createdEl)
			})
			j.attr(createdElements, attrs)
			return createdElements
		}
	}
	
	/*: j.class
	i: "Change the class or get information about the class of an <element>."
	#:
		#[0]: j.class.add("tag", "class") // adds .class
		#[1]: j.class.rem("tag", "class1|class2") // removes .class1 and .class2
		#[2]: j.class.tog("tag", "class") // toggles class
		#[3]: j.class.has("#id", "class1|class2") // returns true if element has .class1 or .class2
	@:
		@[add]: "add class"
			@[add][0]: el: <string>|<array>|<element>|<nodeList> "<selector> (<string>, ?: >IE8) or <array>, <element>, etc."
			@[add][1]: cl: <string> "className"
		@[rem]: "remove class"
			@[rem][0]: el: <string>|<array>|<element>|<nodeList> "<selector> (<string>, ?: >IE8) or <array>, <element>, etc."
			@[rem][1]: cl: <string> "className (regex part)"
		@[tog]: "toggle class"
			@[tog][0]: el: <string>|<array>|<element>|<nodeList> "<selector> (<string>, ?: >IE8) or <array>, <element>, etc."
			@[tog][1]: cl: <string> "className"
		@[has]: "check if the <element> has the class"
			@[has][0]: el: <string>|<element> "<selector> (<string>, ?: >IE8) or <element>, etc."
			@[has][1]: cl: <string> "className (regex part)"
			@[has]>: <boolean>
	%: /****/
	j.class = {
		reg: function (cl) {
				return new RegExp("(^|\\s)" + cl + "(\\s|$)", "g")
			},
		add: function (el, cl) {
			j.all(el, function (element) {
				if (!element.className.match(j.class.reg(cl))) element.className += " " + cl
			})
		},
		rem: function (el, cl) {
			j.all(el, function (element) {
				element.className = element.className.replace(j.class.reg(cl), " ").trim()
			})
		},
		tog: function (el, cl) {
			var regex = this.reg(cl)
			j.all(el, function (element) {
				if (element.className.match(regex)) element.className = element.className.replace(regex, " ").trim()
				else element.className += " " + cl
			})
		},
		has: function (el, cl) { // return: <boolean> (whether el has the class or not)
			el = _2el(el)
			if (!j.is.elm(el)) return false
			return !!_2el(el).className.match(this.reg(cl))
		}
	}
	
	
	/// inner-scope function: set something of an <element> via <object> [syntax: j.<method>(el,{prop: val}, el, {prop: value}, ...)]
	function _set (fn, arg) {
		var i = -1; while (++i < arg.length/2) {
			var obj = arg[2*i+1] // objects
			j.all(arg[2*i], function (el, i) { // elements
				for (var prop in obj) {
					var props = prop.split(/\s*,\s*/),
					k = props.length; while (k--) {fn(el, props[k], obj[prop], i)}
				}
			})
		}
	}
	
	/*: j.attr()
	i: "Set or get attributes of an <element>."
	#:
		#[0]:
			j.attr(
				j.el("img"), {
					height: 10,
					alt: "foo"
				},
				"div", {
					"title,aria-label": "qux"
				}
			)
		#[1]:
			j.attr(
				j.el("img"), {
					"height": 10,
					"alt": "foo"
				},
				"div", {
					"title": "qux"
				}
			)
		#[2]: j.attr("#id", "title")
	@:
		@[0]: el: <string>|<element>|<array>|<nodeList> "get attribute: elements or <selector>"
		@[1]: attr: <string> "<string> which represents the attribute name"
			@[1]>: <string> "value of attribute"
		@[2i]: <string>|<element>|<array>|<nodeList> "set attribute: elements or <selector>"
		@[2i+1]: <object> "attribute object which contains all attributes and attribute values of the element"
			@[2i+1][p]: properties: <string>|<property> "attribute or list of attributes (seperator: ',')"
				@[2i+1][p][v]: values: <string>|<number>|<function> "attribute value"
					@[2i+1][p][v][0]: el: <element> "element"
					@[2i+1][p][v][1]: i: <integer> "iteration index"
					@[2i+1][p][v][2]: attr: <string> "attribute"
	?: >IE7
	%: /***/
	j.attr = function (el, attr) {
		if (j.is.str(attr)) { // el is an <string>|<element>, attr is a <string>
			el = _2el(el)
			if (!j.is.elm(el)) return "";
			return _2el(el).getAttribute(attr)
		} else _set(function (element, attribute, value, index) {
			element.setAttribute(attribute, j.is.fnc(value)?value(element,index,attribute):value) // set attribute of the <element> or of each element of the <nodeList>|<array>
		},arguments)
	}
	
	/*: j.data()
	i: "Set or get data-* attributes of <elements>."
	#:
		#[0]:
			j.data(
				j.el("#id",1), {
					index: 10, // data-index
					word: "foo" // data-word
					camelCase: "true", // data-camel-case
					"hy-phen-at-ed": "true" // data-hy-phen-at-ed
				},
				"div", {
					word: "qux" // data-word
				}
			)
		#[1]: j.data("#id", "index")
	@:
		@[0]: el: <string>|<element>|<array>|<nodeList> "get data-* attribute: elements or <selector>"
		@[1]: key: <string> "<string> which represents data-* key"
			@[1]>: <string> "value of data-* key"
		@[2i]: <string>|<element>|<array>|<nodeList> "set data-* attribute: elements or <selector>"
		@[2i+1]: <object> "attribute object which contains all data-* keys and data-* key values of the element"
			@[2i+1][p]: properties: <string>|<property> "data-* key or list of data-* keys (seperator: ',')"
				@[2i+1][p][v]: values: <string>|<number>|<function> f(el, i, key) "data-* key value"
					@[2i+1][p][v][0]: el: <element> "element"
					@[2i+1][p][v][1]: i: <integer> "iteration index"
					@[2i+1][p][v][2]: key: <string> "data key"
	?: >IE10
	%: /*/
	j.data = function (el, attr) {
		if (j.is.str(attr)) { // el is an <string>|<element>, attr is a <string>
			el = _2el(el)
			if (!j.is.elm(el)) return "";
			return _2el(el).dataset[j.hyphen2camel(attr)]
		} else _set(function (element, key, value, index) {
			element.dataset[j.hyphen2camel(key)] = j.is.fnc(value)?value(element,index,key):value // set data-* attribute of the <element> or of each element of the <nodeList>|<array>
		},arguments)
	}
	
	
	
	//// j.style ////
	
	/*: j.css()
	i: "Set the style or get the computed style of an <element>."
	#:
		#[0]:
			j.css(
				j.el("#id"), {
					height: "10px",
					backgroundColor: "#000",
				},
				".class", {
					fontSize: 1 + "em",
				}
			)
		#[1]:
			j.css(
				j.el("#id"), {
					"height|width": "10px",
					"-ms-transform|-webkit-transform|transform": "rotate(90deg)",
					"background-color": "#000",
				},
				".class", {
					"font-size": 1 + "em",
				}
			)
		#[2]: j.css(j.el(".class")[3], "backgroundColor") | j.css(j.el(".class")[3], "background-color")
	@:
		@[0]: el: <string>|<element>|<array>|<nodeList> "get computed style (?: >IE8): elements or <selector>"
		@[1]: css: <string> "<string> which represents the CSS property"
			@[1]>: <string> "value of CSS property"
			@[1]?: >IE8
		@[2i]: <string>|<element>|<array>|<nodeList> "set style: elements or <selector>"
		@[2i+1]: <object> "style object which contains all the style of the element"
			@[2i+1][p]: properties: <string>|<property> "CSS property or list of CSS properties (seperator: ',')"
				@[2i+1][p][v]: values: <string>|<number>|<function> f(el, i, prop) "CSS property value"
					@[2i+1][p][v][0]: el: <element> "element"
					@[2i+1][p][v][1]: i: <integer> "iteration index"
					@[2i+1][p][v][2]: prop: <string> "property"
		@[2i+1]?: >IE7
	%: /****/
	j.css = function (el, css) {
		if (j.is.str(css)) { // el is an <string>|<element>, css is a <string>
			el = _2el(el)
			if (!j.is.elm(el)) return "";
			return getComputedStyle(_2el(el), null).getPropertyValue(j.camel2hyphen(css)) // (?: >IE8)
		} else _set(function (element, property, value, index) {
			if (j.is.fnc(value)) value = value(element,index,property)
			if (j.is.num(value) && j.has.unit.px(property)) value += "px" // add px to numbers if allowed
			element.style[property] = value // set style of the <element> or of each element of the <nodeList>|<array>
		},arguments)
	}
	
	
	
	//// j.events ////
	
	/*: j.on()
	i: "Add and trigger events to <element>|<nodeList>|window|document."
	(:
		([0]: "Use the keyword 'this' in the event function to get the event target element"
	#:
		#[0]:
			j.on(
				window, {
					scroll: scrollFunction, // add event
					_resize: function () { ... } // add & trigger event
				},
				"#id", {
					click: function (ev) { ... }, // use the eventObject
					"click,dblclick": clickFunction, // add events
					"_click,mousedown": clickFunction // add & trigger events
				}
			)
	@:
		@[2i]: <string>|<element>|<array>|<nodeList>|window|document "event target: elements or <selector>"
		@[2i+1]: <object> "eventListener object which contains all events of the element"
			@[2i+1][p]: properties: <string>|<property> "event type or list of event types (seperator: ','); if the event type starts with a '_', the event will be triggered before the event occurs; if it starts with a '$', the event will be removed"
				@[2i+1][p][v]: values: <function> f(e, el, i) "event function"
					@[2i+1][p][v][0]: e: <object> "eventObject (#: var eventTarget = e.target || e.srcElement; e.preventDefault())"
					@[2i+1][p][v][1]: el: <element> "element"
					@[2i+1][p][v][2]: i: <integer> "iteration index"
	?: >IE7
	>: <undefined>
	%: /*****/
	j.on = function () {
		if (window.addEventListener) // (?: >IE8)
			_set(function (target, event, fn, index) {
				if (event[0]==="_") fn({target:target}) // if the first character is "_" -> immediately invokation
				else target.addEventListener(event.replace("_",""), function (e) { fn(e,target,index) }, !1) // add event to the <element> or of each element of the <nodeList>|<array>
			},arguments)
		else if (window.attachEvent) // (?: <IE 9)
			_set(function (target, event, fn, index) {
				if (event[0]==="_") fn({target:target}) // if the first character is "_" -> immediately invokation
				else target.attachEvent("on" + event.replace("_",""), function (e) { fn(e,target,index) }) // add event to the <element> or of each element of the <nodeList>|<array>
			},arguments)
	}
	
	/*: j.trigger()
	i: "Trigger events."
	#:
		#[0]: j.trigger( "#id", "click" )
	@:
		@[0]: <string>|<element>|window|document "event target: element or <selector>"
		@[1]: <string> "event type"
	?: >IE11
	>: <undefined>
	%: /*****/
	j.trigger = function (el, event) {
		el.dispatchEvent(new Event(event));
	}
	
	
	
	//// j.position ////
	
	/*: j.vw() | j.vh()
	i: "Similar to the CSS units <vw>,<vh>,<vmin>,<vmax> times 100"
	#:
		#[0]: j.vw()
		#[1]: j.vh()
		#[2]: j.vmin()
		#[3]: j.vmax()
	>: <number>
	%: /**/
	j.vw = function () { return (document.documentElement.clientWidth || document.body.clientWidth)/100 }
	j.vh = function () { return (document.documentElement.clientHeight || document.body.clientHeight)/100 }
	j.vmin = function () { return j.landscape() ? j.vh() : j.vw() }
	j.vmax = function () { return j.landscape() ? j.vw() : j.vh() }
	
	/*: j.landscape()
	i: "Returns true if the orientation of the viewport is landscape."
	#:
		#[0]: if(j.landscape()) { ... }
	>: <boolean>
	%: /**/
	j.landscape = function () { return j.vw() - j.vh() > 0 }
	
	/*: j.scrollbar()
	i: "Returns the width of the (visible) vertical scrollbar."
	#:
		#[0]: var sb = j.scrollbar()
	>: <number>
	%: /*/
	j.scrollbar = function () { return window.innerWidth - document.documentElement.clientWidth }
	
	/*: j.scroll
	i: "Get or set the number of pixels that the document or an element’s content is scrolled vertically or horizontally."
	#:
		#[0]: j.scroll.top()
		#[1]: j.scroll.top(100) | j.el("html",1).scrollTop = 100 | scrollTo(0, 100)
		#[2]: j.scroll.top(100, true) | j.el("html",1).scrollTop += 100 | scrollBy(0, 100)
		#[3]: j.scroll.top("#id") | j.el("#id",1).scrollTop
		#[4]: j.scroll.top("#id", 100) | j.el("#id",1).scrollTop = 100
		#[5]: j.scroll.top("#id", 100, true) | j.el("#id",1).scrollTop += 100
		#[6]: j.scroll.left()
		#[7]: j.scroll.left(100) | j.el("html",1).scrollLeft = 100 | scrollTo(100, 0)
		#[8]: j.scroll.left(100, true) | j.el("html",1).scrollLeft += 100 | scrollBy(0, 100)
		#[9]: j.scroll.left("#id") | j.el("#id",1).scrollLeft
		#[10]: j.scroll.left("#id", 100) | j.el("#id",1).scrollLeft = 100
		#[11]: j.scroll.left("#id", 100, true) | j.el("#id",1).scrollLeft += 100
	@:
		@(0): el: <string>|<element> "<selector> (<string>, ?: >IE7) or <element>, etc." {"html"}
		@(1): scrollTop|scrollLeft: <number> "set number of px" {0}
	>: <element>|j.scroll
	?: >IE7
	%: /***/
	/// inner-scope function: get or set scroll position (scrollType === "scrollTop"||"scrollLeft")
	function _scroll (el, scrollPos, add, scrollType) {
		var top = scrollType === "scrollTop"
		
		/// document
		// get
		if (!j.has.val(el)) return (top ? pageYOffset : pageXOffset) || document.documentElement[scrollType] || 0
		// set
		else if (j.is.num(el)) { add = scrollPos; scrollPos = el; el = document.documentElement }
		
		/// element
		else {
			el = _2el(el)
			
			// get
			if (!j.has.val(scrollPos)) return j.is.elm(el) ? _2el(el)[scrollType] : 0
		}
		
		if (!j.is.elm(el)) return j.scroll; // return if invalid element was set as parameter
		
		// set
		if (j.is.num(scrollPos)) add ? _2el(el)[scrollType] += scrollPos : _2el(el)[scrollType] = scrollPos
		
		return j.scroll // j.scroll.top(100).left(100) possible
	}
	// global object
	j.scroll = {
		top: function (el, scrollTop, add) { return _scroll(el,scrollTop,add,"scrollTop") },
		left: function (el, scrollLeft, add) { return _scroll(el,scrollLeft,add,"scrollLeft") }
	}
	
	/*: j.offset
	i: "Get the offset of an element to the top / left side from its closest relatively positioned parent element, the top / left side of the document or the top / left side of the viewport in pixels (read-only)."
	#:
		#[0]: j.offset.parent.top("#id") | j.el("#id",1).offsetTop
		#[1]: j.offset.parent.left("#id") | j.el("#id",1).offsetLeft
		#[2]: j.offset.document.top("#id")
		#[3]: j.offset.document.left("#id")
		#[4]: j.offset.viewport.top("#id") | j.el("#id",1).getBoundingClientRect().top
		#[5]: j.offset.viewport.left("#id") | j.el("#id",1).getBoundingClientRect().left
	@:
		@[parent]: "get the offset of an element to the top / left side from its closest relatively positioned parent element"
			@[parent][top]: "offset top"
				@[parent][top][0]: el: <string>|<element>|window|document "<selector> (<string>, ?: >IE7) or <element>, etc."
			@[parent][left]: "offset left"
				@[parent][left][0]: el: <string>|<element>|window|document "<selector> (<string>, ?: >IE7) or <element>, etc."
		@[document]: "get the offset of an element to the top / left side of the document"
			@[document][top]: "offset top"
				@[document][top][0]: el: <string>|<element>|window|document "<selector> (<string>, ?: >IE7) or <element>, etc."
			@[document][left]: "offset left"
				@[document][left][0]: el: <string>|<element>|window|document "<selector> (<string>, ?: >IE7) or <element>, etc."
		@[viewport]: "get the offset of an element to the top / left side of the viewport"
			@[viewport][top]: "offset top"
				@[viewport][top][0]: el: <string>|<element>|window|document "<selector> (<string>, ?: >IE7) or <element>, etc."
			@[viewport][left]: "offset left"
				@[viewport][left][0]: el: <string>|<element>|window|document "<selector> (<string>, ?: >IE7) or <element>, etc."
	>: <number> "offset in px"
	%: /***/
	j.offset = {
		parent: { // relative to the closest relatively positioned parent (excluding the scroll position)
			top: function (el) { return _elOrDocEl(_2el(el)).offsetTop },
			left: function (el) { return _elOrDocEl(_2el(el)).offsetLeft }
		},
		document: { // relative to the document (excluding the scroll position)
			top: function (el) { return _elOrDocEl(_2el(el)).getBoundingClientRect().top + j.scroll.top() - (document.documentElement.clientTop || 0) },
			left: function (el) { return _elOrDocEl(_2el(el)).getBoundingClientRect().left + j.scroll.left() - (document.documentElement.clientLeft || 0) }
		},
		viewport: { // relative to the viewport (including the scroll position)
			top: function (el) { return _elOrDocEl(_2el(el)).getBoundingClientRect().top },
			left: function (el) { return _elOrDocEl(_2el(el)).getBoundingClientRect().left }
		}
	}
	
	
	
	//// j.color ////
	
	/*: j.hex2rgb()
	i: "Convert a hexadecimal color ("#rgb" | "#rgba" | "#rrggbb" | "#rrggbbaa") to a decimal one ("rgb()" | "rgba()")."
	#:
		#[0]: j.hex2rgb("#FFF")
		#[1]: j.hex2rgb("#FFFF")
		#[2]: j.hex2rgb("#FFFFFF")
		#[3]: j.hex2rgb("#FFFFFFFF")
	@:
		@[0]: hex: <string> "Hexadecimal color ("#rgb" | "#rgba" | "#rrggbb" | "#rrggbbaa")"
	>: <string> "Decimal color ("rgb()" | "rgba()")"
	?: >IE8
	%: /*/
	j.hex2rgb = function (hex) {
		if (!j.is.clr.hex(hex)) return; // invalid string
		var rgb = ""
		hex = hex
			.replace(/^#([a-fA-F\d])([a-fA-F\d])([a-fA-F\d])([a-fA-F\d])?$/, function (rgba, r, g, b, a) {
				return "#" + r + r + g + g + b + b + (a ? a + a : "") // #RGB[A]
			})
			.match(/^#([a-fA-F\d]{2})([a-fA-F\d]{2})([a-fA-F\d]{2})([a-fA-F\d]{2})?$/) // #RRGGBB[AA]
			.filter(function (element) {
				return j.has.val(element) // (?: >IE8)
			}) // remove alpha channel if undefined
		var hexLength = hex.length
		
		if (hexLength < 4) return "rgb(0,0,0)" // default
		rgb = hexLength > 4 ? "rgba(" : "rgb(" // alpha channel?
		
		var i = 0; /* iteration variable (skips first element: whole match) */ while (++i < hexLength) {
			rgb += Math.round(parseInt(hex[i], 16)/(i==4?255:1)*1e3)/1e3 + ","
		}
		return (rgb + ")").replace(",)", ")")
	}
	
	/*: j.rgb2arr()
	i: "Convert a hexadecimal decimal color ("rgb()" | "rgba()") to an <array> ([r,g,b] | [r,g,b,a])."
	#:
		#[0]: j.rgb2arr("rgb(255,255,255)")
		#[1]: j.rgb2arr("rgba(255,255,255,1)")
		#[2]: j.rgb2arr("rgb(100%,100%,100%)")
		#[3]: j.rgb2arr("rgba(100%,100%,100%,1)")
	@:
		@[0]: rgb: <string> "Decimal color ("rgb()" | "rgba()")"
	>: <array> "rgba color array ([r,g,b,a])"
	%: /*/
	j.rgb2arr = function (rgb) {
		var percentage = !1
		
		rgb = rgb.match(/^\s*rgba?\(\s*(\d+)(%?),\s*(\d+)\2,\s*(\d+)\2,?(?:\s*(\d*\.?\d*))?\s*\)/i)
		if (!rgb) return; // invalid string
		
		if (!j.has.val(rgb[5])) rgb.pop() // remove alpha channel if undefined
		if (rgb[2] === "%") percentage = !0
		
		rgb.splice(0,1) // remove first element of array (whole match)
		rgb.splice(1,1) // remove percent sign
		
		var i = -1; while (++i < rgb.length) {
			if (percentage && i!=3 /* alpha channel */) rgb[i] = +rgb[i] * 2.55 // percentage
			else rgb[i] = +rgb[i] // to number
		}
		if (rgb[3] === undefined) rgb[3] = 1 // default alpha channel
		return rgb
	}
	
	/*: j.hex2arr()
	i: "Convert a hexadecimal color ("#rgb" | "#rgba" | "#rrggbb" | "#rrggbbaa") to an <array> ([r,g,b] | [r,g,b,a])."
	#:
		#[0]: j.hex2arr("#FFF") | j.rgb2arr(j.hex2rgb("#FFF"))
		#[1]: j.hex2arr("#FFFF") | j.rgb2arr(j.hex2rgb("#FFFF"))
		#[2]: j.hex2arr("#FFFFFF") | j.rgb2arr(j.hex2rgb("#FFFFFF"))
		#[3]: j.hex2arr("#FFFFFFFF") | j.rgb2arr(j.hex2rgb("#FFFFFFFF"))
	@:
		@[0]: hex: <string> "Hexadecimal color ("#rgb" | "#rgba" | "#rrggbb" | "#rrggbbaa")"
	>: <array> "rgba color array ([r,g,b,a])"
	%: /*/
	j.hex2arr = function (hex) { return j.rgb2arr(j.hex2rgb(hex)) }
	
	
	
	//// j.animate ////
	
	/*: j.animate()
	i: "Small animation API"
	#:
		#[0]:
			var dur = 1000;
			j.animate(
				function (t) { j.css( 'body', {top: j.lerp( 0, 50 )( j.ease.inout(t/dur) ) }); },
				function (t) { if (t >= dur) return true; }
			})
		#[1]:
			var dur = 1000;
			j.animate({
				repeat: function (t) {
					j.css( 'body', {
						top: j.lerp( 0, 200 )( j.ease.inout(t/dur) )
					} )
				}, dur
			})
	@:
		@[0]: fn: <function> fn(t) "animation function"
		@(1): stop: <integer>|<function> stop(time) "duration or function that stops the animation when it returns true"
	>: <function> "function which returns the interpolated number"
	%: /***/
	j.animate = function (fn, stop) {
		var start,
			hasFinished = j.is.num(stop) ? function(t) { if (t >= stop) return 1; } : stop || _f;
		
		(function f (now) {
			var t = now - start
			if (!hasFinished(t)) {
				fn(t)
				requestAnimationFrame(f)
			}
		})(start = performance.now())
	}
	
	/*: j.lerp()
	i: "Create a linear interpolation between two numbers and add an easing"
	#:
		#[0]: j.lerp(1, 5.7, j.ease.in())(0.5)
	@:
		@[0]: from: <number>|<string> "interpolation start value"
		@[1]: to: <number>|<string> "interpolation end value",
		@(2): easing: <function> easing(t) "easing function"
	>: <function> "function which returns the interpolated number"
	%: /***/
	j.lerp = function (from, to) {return function (t) {return from * (1 - t) + parseFloat(to) * t;};} // linear interpolation of numbers
	
	
	//// j.easing ////
	
	/*: j.linear()
	i: "Returns a linear timing function."
	#:
		#[0]: var dur = 1000; j.animate( function (t) { j.inner.html("#el", 100 * j.linear()( t/dur ); }, dur)
	>: <function> "linear timing function"
	%: /**/
	j.linear = function () {
		return function (t) { return t }
	}
	
	/*: j.ease
	i: "Returns an ease timing function."
	#:
		#[0]: var dur = 1000; j.animate( function (t) { j.inner.html("#el", 100 * j.ease.in(3)( t/dur ); }, dur)
		#[1]: var dur = 1000; j.animate( function (t) { j.inner.html("#el", 100 * j.ease.out(4)( t/dur ); }, dur)
		#[2]: var dur = 1000; j.animate( function (t) { j.inner.html("#el", 100 * j.ease.inout()( t/dur ); }, dur)
		#[3]: var dur = 1000; j.animate( function (t) { j.inner.html("#el", 100 * j.ease.sin.in()( t/dur ); }, dur)
	@:
		@[in]: "easeIn"
			@[in](0): deg: <number+> "positive degree of polynomial timing function" {2}
		@[out]: "easeOut"
			@[out](0): deg: <number+> "positive degree of polynomial timing function" {2}
		@[inout]: "easeInOut"
			@[inout](0): deg: <number+> "positive degree of polynomial timing function" {2}
		@[sin]: "easeInOut"
			@[sin][in]: "ease in sine"
			@[sin][out]: "ease out sine"
			@[sin][inout]: "ease inout sine"
	>: <function> "ease timing function"
	%: /***/
	j.ease = {

		// easeIn
		in : function (deg) {
			if (!j.has.val(deg)) deg = 2 // default
			return function (t) { return Math.pow(t, deg) }
		},

		// easeOut
		out: function (deg) {
			if (!j.has.val(deg)) deg = 2 // default
			return function (t) { return 1 - Math.pow(1-t, deg) }
		},

		// easeInOut
		inout: function (deg) {
			return j.combine(this.in(deg), this.out(deg))
		},
		
		// easeSin
		sin: {
			in: function() {return function(t) {return Math.sin(Math.PI * (t - 1) / 2) + 1}},
			out: function() {return function(t) {return Math.sin(Math.PI / 2 * t)}},
			inout: function() {return function(t) {return Math.sin(Math.PI * (t - 1 / 2))/2 + .5}}
		}
	}
	
	/*: j.combine()
	i: "Combines multiple timing functions."
	#:
		#[0]: var dur = 1000; j.animate( function (t) { j.inner.html("#el", 100 * j.combine( j.ease.sin.in(), j.ease.out(6) )( t/dur ); }, dur)
	>: <function> "bounceOut timing function"
	%: /***/
	j.combine = function () {
		var timingFn = arguments
		return function(t) {
			var i = -1, l = timingFn.length; while (++i < l) {
				if (t <= (i + 1)/l)
					return (timingFn[i](t * l - i) + i) / l // return calculated function
			}
			return 1 // default
		}
	}
	
	
	
	//// j.req ////
	
	/*: j.get()
	i: "Get a file/json from the server via AJAX."
	#:
		#[0]: j.get.data( "file.txt", function (req) {...}, function (req) {...} )
		#[1]: j.get.json( "file.json", function (req) {...}, function (req) {...} )
	@:
		@[0]: url: <string> "url of the file"
		@(1): suc: <function> suc(responseText) "function on success"
			@(1)[0]: responseText: <string> "response text"
		@(2): er: <function> er(req) "function on error"
			@(2)[0]: req: <object> "XMLHttpRequest"
	>: <object> "XMLHttpRequest"
	?: >IE5
	%: /***/
	/// inner-scope function: get data
	j.get = function _get (url, suc) {
		// defaults
		suc = suc || _f
		er = er || _f
		
		var req = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP")
		req.onreadystatechange = function () {
			if (req.readyState > 3) (200 <= req.status && req.status < 300) ? suc(req.responseText) : er(req) // invoke success|error funktion
		}
		req.open("GET", url, !0)
		req.send()
		
		return req
	}
	
	/*: j.post()
	i: "Post data via AJAX."
	#:
		#[0]: j.post( "http://www.example.com/", "fname=Jakob&lname=Hansbauer" )
		#[1]: j.post( "http://www.example.com/", {fname: 'Jakob', lname: 'Hansbauer'}, function (req) {...}, function (req) {...} )
	@:
		@[0]: url: <string> "url of the file"
		@[1]: data: <string>|<object> "data, which is going to be posted"
		@(2): suc: <function> suc(responseText) "function on success"
			@(2)[0]: responseText: <string> "response text"
		@(3): er: <function> er(req) "function on error"
			@(3)[0]: req: <object> "XMLHttpRequest"
	>: <object> "XMLHttpRequest"
	?: >IE5
	%: /***/
	j.post = function (url, data, suc, er) {
		// defaults
		suc = suc || _f
		er = er || _f
		
		// convert data object to valid string
		if (j.is.obj(data)) {
			var dataStrArray = []
			for (var prop in data) {
				dataStrArray.push(encodeURIComponent(prop) + "=" + encodeURIComponent(data[prop]))
			}
			data = dataStrArray.join("&")
		}
		
		// request
		var req = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP")
		req.open("POST", url)
		req.onreadystatechange = function() {
			if (req.readyState > 3) (200 <= req.status && req.status < 300) ? suc(req.responseText) : er(req) // invoke success|error funktion
		}
		req.setRequestHeader("X-Requested-With", "XMLHttpRequest")
		req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
		req.send(data)
		
		return req
	}
	
	
	//// j.ready ////
	
	/*: j.ready()
	i: "Invoke a function when the DOM content is loaded."
	#:
		#[0]:
			j.ready(function () {
				... 
			})
	@:
		@[0]: f: <function> f()
	>: <undefined>
	%: /*****/
	j.ready = function (f) {
		if (document.readyState != "loading") f()
		else if (document.addEventListener) // (?: >IE8)
			document.addEventListener("DOMContentLoaded", f)
		else // (?: <IE 9)
			document.attachEvent(
				"onreadystatechange",
				function () {
					if (document.readyState == "complete") f()
				}
			)
	}
	
	//// window.j ////
	
	window.j = j

})();
