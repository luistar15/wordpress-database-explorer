
// NODE CREATION ---------------------------------------------------------------

var $T = function (text) {
	return document.createTextNode(text);
};

var $E = function (tag, attrs, props) {
	var el = document.createElement(tag), k;

	if (attrs) {
		for (k in attrs) {
			el.setAttribute(k, attrs[k]);
		}
	}

	if (props) {
		for (k in props) {
			el[k] = props[k];
		}
	}

	return el;
};


// SELECTORS -------------------------------------------------------------------

var $ = function (selector) {
	return document.querySelector(selector);
};

var $$ = function (selector) {
	return Array.prototype.slice.call(document.querySelectorAll(selector));
};

Element.prototype.$ = function (selector) {
	return this.querySelector(selector);
};

Element.prototype.$$ = function (selector) {
	return Array.prototype.slice.call(this.querySelectorAll(selector));
};


// CONTENT MANIPULATION --------------------------------------------------------

Element.prototype.$text = function (text) {
	this.appendChild($T(text));
	return this;
};

Element.prototype.$html = function (html) {
	this.innerHTML = html;
	return this;
};

Element.prototype.$empty = function () {
	while (this.firstChild) {
		this.removeChild(this.firstChild);
	}

	return this;
};

Element.prototype.$setAttr = function (k, v) {
	this.setAttribute(k, v);
	return this;
};


// CLASS MANIPULATION ----------------------------------------------------------

Element.prototype.$addClass = function (c) {
	this.classList.add(c);
	return this;
};

Element.prototype.$removeClass = function (c) {
	this.classList.remove(c);
	return this;
};

Element.prototype.$toggleClass = function (c) {
	this.classList.toggle(c);
	return this;
};


// DOM MANIPULATION ------------------------------------------------------------

Element.prototype.$adopt = function () {
	for (var i = 0, l = arguments.length; i < l; i++) {
		this.appendChild(arguments[i]);
	}

	return this;
};

Element.prototype.$inject = function (target, location) {
	switch (location) {
		case 'top':
			target.insertBefore(this, target.firstChild);
			break;

		case 'before':
			target.parentNode.insertBefore(this, target);
			break;

		case 'after':
			target.parentNode.insertBefore(this, target.nextElementSibling);
			break;

		case 'bottom':
		default:
			target.appendChild(this);
	}

	return this;
};

Element.prototype.$dispose = function () {
	if (this.parentNode) {
		this.parentNode.removeChild(this);
	}
};


// EVENT HANDLING  -------------------------------------------------------------

Element.prototype.$addEvent = function (type, listener) {
	this.addEventListener(type, listener);
	return this;
};

Element.prototype.$removeEvent = function (type, listener) {
	this.removeEventListener(type, listener);
	return this;
};


// CUSTOM EVENTS  --------------------------------------------------------------

$EventManager = {

	$addEvent: function (k, fn) {
		if (this.events[k]) {
			this.events[k].push(fn);
		} else {
			this.events[k] = [fn];
		}
	},

	$fireEvent: function (k, arg) {
		(this.events[k] || []).forEach(function (fn) {
			fn(arg);
		});
	}

};
