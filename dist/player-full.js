/*!
 * jQuery UI Core 1.11.1
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/category/ui-core/
 */
(function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}(function( $ ) {

// $.ui might exist from components with no dependencies, e.g., $.ui.position
$.ui = $.ui || {};

$.extend( $.ui, {
	version: "1.11.1",

	keyCode: {
		BACKSPACE: 8,
		COMMA: 188,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		LEFT: 37,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SPACE: 32,
		TAB: 9,
		UP: 38
	}
});

// plugins
$.fn.extend({
	scrollParent: function( includeHidden ) {
		var position = this.css( "position" ),
			excludeStaticParent = position === "absolute",
			overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
			scrollParent = this.parents().filter( function() {
				var parent = $( this );
				if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
					return false;
				}
				return overflowRegex.test( parent.css( "overflow" ) + parent.css( "overflow-y" ) + parent.css( "overflow-x" ) );
			}).eq( 0 );

		return position === "fixed" || !scrollParent.length ? $( this[ 0 ].ownerDocument || document ) : scrollParent;
	},

	uniqueId: (function() {
		var uuid = 0;

		return function() {
			return this.each(function() {
				if ( !this.id ) {
					this.id = "ui-id-" + ( ++uuid );
				}
			});
		};
	})(),

	removeUniqueId: function() {
		return this.each(function() {
			if ( /^ui-id-\d+$/.test( this.id ) ) {
				$( this ).removeAttr( "id" );
			}
		});
	}
});

// selectors
function focusable( element, isTabIndexNotNaN ) {
	var map, mapName, img,
		nodeName = element.nodeName.toLowerCase();
	if ( "area" === nodeName ) {
		map = element.parentNode;
		mapName = map.name;
		if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
			return false;
		}
		img = $( "img[usemap='#" + mapName + "']" )[ 0 ];
		return !!img && visible( img );
	}
	return ( /input|select|textarea|button|object/.test( nodeName ) ?
		!element.disabled :
		"a" === nodeName ?
			element.href || isTabIndexNotNaN :
			isTabIndexNotNaN) &&
		// the element and all of its ancestors must be visible
		visible( element );
}

function visible( element ) {
	return $.expr.filters.visible( element ) &&
		!$( element ).parents().addBack().filter(function() {
			return $.css( this, "visibility" ) === "hidden";
		}).length;
}

$.extend( $.expr[ ":" ], {
	data: $.expr.createPseudo ?
		$.expr.createPseudo(function( dataName ) {
			return function( elem ) {
				return !!$.data( elem, dataName );
			};
		}) :
		// support: jQuery <1.8
		function( elem, i, match ) {
			return !!$.data( elem, match[ 3 ] );
		},

	focusable: function( element ) {
		return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
	},

	tabbable: function( element ) {
		var tabIndex = $.attr( element, "tabindex" ),
			isTabIndexNaN = isNaN( tabIndex );
		return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
	}
});

// support: jQuery <1.8
if ( !$( "<a>" ).outerWidth( 1 ).jquery ) {
	$.each( [ "Width", "Height" ], function( i, name ) {
		var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
			type = name.toLowerCase(),
			orig = {
				innerWidth: $.fn.innerWidth,
				innerHeight: $.fn.innerHeight,
				outerWidth: $.fn.outerWidth,
				outerHeight: $.fn.outerHeight
			};

		function reduce( elem, size, border, margin ) {
			$.each( side, function() {
				size -= parseFloat( $.css( elem, "padding" + this ) ) || 0;
				if ( border ) {
					size -= parseFloat( $.css( elem, "border" + this + "Width" ) ) || 0;
				}
				if ( margin ) {
					size -= parseFloat( $.css( elem, "margin" + this ) ) || 0;
				}
			});
			return size;
		}

		$.fn[ "inner" + name ] = function( size ) {
			if ( size === undefined ) {
				return orig[ "inner" + name ].call( this );
			}

			return this.each(function() {
				$( this ).css( type, reduce( this, size ) + "px" );
			});
		};

		$.fn[ "outer" + name] = function( size, margin ) {
			if ( typeof size !== "number" ) {
				return orig[ "outer" + name ].call( this, size );
			}

			return this.each(function() {
				$( this).css( type, reduce( this, size, true, margin ) + "px" );
			});
		};
	});
}

// support: jQuery <1.8
if ( !$.fn.addBack ) {
	$.fn.addBack = function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	};
}

// support: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
if ( $( "<a>" ).data( "a-b", "a" ).removeData( "a-b" ).data( "a-b" ) ) {
	$.fn.removeData = (function( removeData ) {
		return function( key ) {
			if ( arguments.length ) {
				return removeData.call( this, $.camelCase( key ) );
			} else {
				return removeData.call( this );
			}
		};
	})( $.fn.removeData );
}

// deprecated
$.ui.ie = !!/msie [\w.]+/.exec( navigator.userAgent.toLowerCase() );

$.fn.extend({
	focus: (function( orig ) {
		return function( delay, fn ) {
			return typeof delay === "number" ?
				this.each(function() {
					var elem = this;
					setTimeout(function() {
						$( elem ).focus();
						if ( fn ) {
							fn.call( elem );
						}
					}, delay );
				}) :
				orig.apply( this, arguments );
		};
	})( $.fn.focus ),

	disableSelection: (function() {
		var eventType = "onselectstart" in document.createElement( "div" ) ?
			"selectstart" :
			"mousedown";

		return function() {
			return this.bind( eventType + ".ui-disableSelection", function( event ) {
				event.preventDefault();
			});
		};
	})(),

	enableSelection: function() {
		return this.unbind( ".ui-disableSelection" );
	},

	zIndex: function( zIndex ) {
		if ( zIndex !== undefined ) {
			return this.css( "zIndex", zIndex );
		}

		if ( this.length ) {
			var elem = $( this[ 0 ] ), position, value;
			while ( elem.length && elem[ 0 ] !== document ) {
				// Ignore z-index if position is set to a value where z-index is ignored by the browser
				// This makes behavior of this function consistent across browsers
				// WebKit always returns auto if the element is positioned
				position = elem.css( "position" );
				if ( position === "absolute" || position === "relative" || position === "fixed" ) {
					// IE returns 0 when zIndex is not specified
					// other browsers return a string
					// we ignore the case of nested elements with an explicit value of 0
					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					value = parseInt( elem.css( "zIndex" ), 10 );
					if ( !isNaN( value ) && value !== 0 ) {
						return value;
					}
				}
				elem = elem.parent();
			}
		}

		return 0;
	}
});

// $.ui.plugin is deprecated. Use $.widget() extensions instead.
$.ui.plugin = {
	add: function( module, option, set ) {
		var i,
			proto = $.ui[ module ].prototype;
		for ( i in set ) {
			proto.plugins[ i ] = proto.plugins[ i ] || [];
			proto.plugins[ i ].push( [ option, set[ i ] ] );
		}
	},
	call: function( instance, name, args, allowDisconnected ) {
		var i,
			set = instance.plugins[ name ];

		if ( !set ) {
			return;
		}

		if ( !allowDisconnected && ( !instance.element[ 0 ].parentNode || instance.element[ 0 ].parentNode.nodeType === 11 ) ) {
			return;
		}

		for ( i = 0; i < set.length; i++ ) {
			if ( instance.options[ set[ i ][ 0 ] ] ) {
				set[ i ][ 1 ].apply( instance.element, args );
			}
		}
	}
};

}));

/*!
 * jQuery UI Widget 1.11.1
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/jQuery.widget/
 */
(function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}(function( $ ) {

var widget_uuid = 0,
	widget_slice = Array.prototype.slice;

$.cleanData = (function( orig ) {
	return function( elems ) {
		var events, elem, i;
		for ( i = 0; (elem = elems[i]) != null; i++ ) {
			try {

				// Only trigger remove when necessary to save time
				events = $._data( elem, "events" );
				if ( events && events.remove ) {
					$( elem ).triggerHandler( "remove" );
				}

			// http://bugs.jquery.com/ticket/8235
			} catch( e ) {}
		}
		orig( elems );
	};
})( $.cleanData );

$.widget = function( name, base, prototype ) {
	var fullName, existingConstructor, constructor, basePrototype,
		// proxiedPrototype allows the provided prototype to remain unmodified
		// so that it can be used as a mixin for multiple widgets (#8876)
		proxiedPrototype = {},
		namespace = name.split( "." )[ 0 ];

	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
		return !!$.data( elem, fullName );
	};

	$[ namespace ] = $[ namespace ] || {};
	existingConstructor = $[ namespace ][ name ];
	constructor = $[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without "new" keyword
		if ( !this._createWidget ) {
			return new constructor( options, element );
		}

		// allow instantiation without initializing for simple inheritance
		// must use "new" keyword (the code above always passes args)
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};
	// extend with the existing constructor to carry over any static properties
	$.extend( constructor, existingConstructor, {
		version: prototype.version,
		// copy the object used to create the prototype in case we need to
		// redefine the widget later
		_proto: $.extend( {}, prototype ),
		// track widgets that inherit from this widget in case this widget is
		// redefined after a widget inherits from it
		_childConstructors: []
	});

	basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
	basePrototype.options = $.widget.extend( {}, basePrototype.options );
	$.each( prototype, function( prop, value ) {
		if ( !$.isFunction( value ) ) {
			proxiedPrototype[ prop ] = value;
			return;
		}
		proxiedPrototype[ prop ] = (function() {
			var _super = function() {
					return base.prototype[ prop ].apply( this, arguments );
				},
				_superApply = function( args ) {
					return base.prototype[ prop ].apply( this, args );
				};
			return function() {
				var __super = this._super,
					__superApply = this._superApply,
					returnValue;

				this._super = _super;
				this._superApply = _superApply;

				returnValue = value.apply( this, arguments );

				this._super = __super;
				this._superApply = __superApply;

				return returnValue;
			};
		})();
	});
	constructor.prototype = $.widget.extend( basePrototype, {
		// TODO: remove support for widgetEventPrefix
		// always use the name + a colon as the prefix, e.g., draggable:start
		// don't prefix for widgets that aren't DOM-based
		widgetEventPrefix: existingConstructor ? (basePrototype.widgetEventPrefix || name) : name
	}, proxiedPrototype, {
		constructor: constructor,
		namespace: namespace,
		widgetName: name,
		widgetFullName: fullName
	});

	// If this widget is being redefined then we need to find all widgets that
	// are inheriting from it and redefine all of them so that they inherit from
	// the new version of this widget. We're essentially trying to replace one
	// level in the prototype chain.
	if ( existingConstructor ) {
		$.each( existingConstructor._childConstructors, function( i, child ) {
			var childPrototype = child.prototype;

			// redefine the child widget using the same prototype that was
			// originally used, but inherit from the new version of the base
			$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto );
		});
		// remove the list of existing child constructors from the old constructor
		// so the old child constructors can be garbage collected
		delete existingConstructor._childConstructors;
	} else {
		base._childConstructors.push( constructor );
	}

	$.widget.bridge( name, constructor );

	return constructor;
};

$.widget.extend = function( target ) {
	var input = widget_slice.call( arguments, 1 ),
		inputIndex = 0,
		inputLength = input.length,
		key,
		value;
	for ( ; inputIndex < inputLength; inputIndex++ ) {
		for ( key in input[ inputIndex ] ) {
			value = input[ inputIndex ][ key ];
			if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
				// Clone objects
				if ( $.isPlainObject( value ) ) {
					target[ key ] = $.isPlainObject( target[ key ] ) ?
						$.widget.extend( {}, target[ key ], value ) :
						// Don't extend strings, arrays, etc. with objects
						$.widget.extend( {}, value );
				// Copy everything else by reference
				} else {
					target[ key ] = value;
				}
			}
		}
	}
	return target;
};

$.widget.bridge = function( name, object ) {
	var fullName = object.prototype.widgetFullName || name;
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = widget_slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.widget.extend.apply( null, [ options ].concat(args) ) :
			options;

		if ( isMethodCall ) {
			this.each(function() {
				var methodValue,
					instance = $.data( this, fullName );
				if ( options === "instance" ) {
					returnValue = instance;
					return false;
				}
				if ( !instance ) {
					return $.error( "cannot call methods on " + name + " prior to initialization; " +
						"attempted to call method '" + options + "'" );
				}
				if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
					return $.error( "no such method '" + options + "' for " + name + " widget instance" );
				}
				methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue && methodValue.jquery ?
						returnValue.pushStack( methodValue.get() ) :
						methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, fullName );
				if ( instance ) {
					instance.option( options || {} );
					if ( instance._init ) {
						instance._init();
					}
				} else {
					$.data( this, fullName, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( /* options, element */ ) {};
$.Widget._childConstructors = [];

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	defaultElement: "<div>",
	options: {
		disabled: false,

		// callbacks
		create: null
	},
	_createWidget: function( options, element ) {
		element = $( element || this.defaultElement || this )[ 0 ];
		this.element = $( element );
		this.uuid = widget_uuid++;
		this.eventNamespace = "." + this.widgetName + this.uuid;
		this.options = $.widget.extend( {},
			this.options,
			this._getCreateOptions(),
			options );

		this.bindings = $();
		this.hoverable = $();
		this.focusable = $();

		if ( element !== this ) {
			$.data( element, this.widgetFullName, this );
			this._on( true, this.element, {
				remove: function( event ) {
					if ( event.target === element ) {
						this.destroy();
					}
				}
			});
			this.document = $( element.style ?
				// element within the document
				element.ownerDocument :
				// element is window or document
				element.document || element );
			this.window = $( this.document[0].defaultView || this.document[0].parentWindow );
		}

		this._create();
		this._trigger( "create", null, this._getCreateEventData() );
		this._init();
	},
	_getCreateOptions: $.noop,
	_getCreateEventData: $.noop,
	_create: $.noop,
	_init: $.noop,

	destroy: function() {
		this._destroy();
		// we can probably remove the unbind calls in 2.0
		// all event bindings should go through this._on()
		this.element
			.unbind( this.eventNamespace )
			.removeData( this.widgetFullName )
			// support: jquery <1.6.3
			// http://bugs.jquery.com/ticket/9413
			.removeData( $.camelCase( this.widgetFullName ) );
		this.widget()
			.unbind( this.eventNamespace )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetFullName + "-disabled " +
				"ui-state-disabled" );

		// clean up events and states
		this.bindings.unbind( this.eventNamespace );
		this.hoverable.removeClass( "ui-state-hover" );
		this.focusable.removeClass( "ui-state-focus" );
	},
	_destroy: $.noop,

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key,
			parts,
			curOption,
			i;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.widget.extend( {}, this.options );
		}

		if ( typeof key === "string" ) {
			// handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
			options = {};
			parts = key.split( "." );
			key = parts.shift();
			if ( parts.length ) {
				curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
				for ( i = 0; i < parts.length - 1; i++ ) {
					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
					curOption = curOption[ parts[ i ] ];
				}
				key = parts.pop();
				if ( arguments.length === 1 ) {
					return curOption[ key ] === undefined ? null : curOption[ key ];
				}
				curOption[ key ] = value;
			} else {
				if ( arguments.length === 1 ) {
					return this.options[ key ] === undefined ? null : this.options[ key ];
				}
				options[ key ] = value;
			}
		}

		this._setOptions( options );

		return this;
	},
	_setOptions: function( options ) {
		var key;

		for ( key in options ) {
			this._setOption( key, options[ key ] );
		}

		return this;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				.toggleClass( this.widgetFullName + "-disabled", !!value );

			// If the widget is becoming disabled, then nothing is interactive
			if ( value ) {
				this.hoverable.removeClass( "ui-state-hover" );
				this.focusable.removeClass( "ui-state-focus" );
			}
		}

		return this;
	},

	enable: function() {
		return this._setOptions({ disabled: false });
	},
	disable: function() {
		return this._setOptions({ disabled: true });
	},

	_on: function( suppressDisabledCheck, element, handlers ) {
		var delegateElement,
			instance = this;

		// no suppressDisabledCheck flag, shuffle arguments
		if ( typeof suppressDisabledCheck !== "boolean" ) {
			handlers = element;
			element = suppressDisabledCheck;
			suppressDisabledCheck = false;
		}

		// no element argument, shuffle and use this.element
		if ( !handlers ) {
			handlers = element;
			element = this.element;
			delegateElement = this.widget();
		} else {
			element = delegateElement = $( element );
			this.bindings = this.bindings.add( element );
		}

		$.each( handlers, function( event, handler ) {
			function handlerProxy() {
				// allow widgets to customize the disabled handling
				// - disabled as an array instead of boolean
				// - disabled class as method for disabling individual parts
				if ( !suppressDisabledCheck &&
						( instance.options.disabled === true ||
							$( this ).hasClass( "ui-state-disabled" ) ) ) {
					return;
				}
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}

			// copy the guid so direct unbinding works
			if ( typeof handler !== "string" ) {
				handlerProxy.guid = handler.guid =
					handler.guid || handlerProxy.guid || $.guid++;
			}

			var match = event.match( /^([\w:-]*)\s*(.*)$/ ),
				eventName = match[1] + instance.eventNamespace,
				selector = match[2];
			if ( selector ) {
				delegateElement.delegate( selector, eventName, handlerProxy );
			} else {
				element.bind( eventName, handlerProxy );
			}
		});
	},

	_off: function( element, eventName ) {
		eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) + this.eventNamespace;
		element.unbind( eventName ).undelegate( eventName );
	},

	_delay: function( handler, delay ) {
		function handlerProxy() {
			return ( typeof handler === "string" ? instance[ handler ] : handler )
				.apply( instance, arguments );
		}
		var instance = this;
		return setTimeout( handlerProxy, delay || 0 );
	},

	_hoverable: function( element ) {
		this.hoverable = this.hoverable.add( element );
		this._on( element, {
			mouseenter: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-hover" );
			},
			mouseleave: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-hover" );
			}
		});
	},

	_focusable: function( element ) {
		this.focusable = this.focusable.add( element );
		this._on( element, {
			focusin: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-focus" );
			},
			focusout: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-focus" );
			}
		});
	},

	_trigger: function( type, event, data ) {
		var prop, orig,
			callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		// the original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );
		return !( $.isFunction( callback ) &&
			callback.apply( this.element[0], [ event ].concat( data ) ) === false ||
			event.isDefaultPrevented() );
	}
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
		if ( typeof options === "string" ) {
			options = { effect: options };
		}
		var hasOptions,
			effectName = !options ?
				method :
				options === true || typeof options === "number" ?
					defaultEffect :
					options.effect || defaultEffect;
		options = options || {};
		if ( typeof options === "number" ) {
			options = { duration: options };
		}
		hasOptions = !$.isEmptyObject( options );
		options.complete = callback;
		if ( options.delay ) {
			element.delay( options.delay );
		}
		if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
			element[ method ]( options );
		} else if ( effectName !== method && element[ effectName ] ) {
			element[ effectName ]( options.duration, options.easing, callback );
		} else {
			element.queue(function( next ) {
				$( this )[ method ]();
				if ( callback ) {
					callback.call( element[ 0 ] );
				}
				next();
			});
		}
	};
});

return $.widget;

}));

/*!
 * jQuery UI Mouse 1.11.1
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/mouse/
 */
(function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define([
			"jquery",
			"./widget"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}(function( $ ) {

var mouseHandled = false;
$( document ).mouseup( function() {
	mouseHandled = false;
});

return $.widget("ui.mouse", {
	version: "1.11.1",
	options: {
		cancel: "input,textarea,button,select,option",
		distance: 1,
		delay: 0
	},
	_mouseInit: function() {
		var that = this;

		this.element
			.bind("mousedown." + this.widgetName, function(event) {
				return that._mouseDown(event);
			})
			.bind("click." + this.widgetName, function(event) {
				if (true === $.data(event.target, that.widgetName + ".preventClickEvent")) {
					$.removeData(event.target, that.widgetName + ".preventClickEvent");
					event.stopImmediatePropagation();
					return false;
				}
			});

		this.started = false;
	},

	// TODO: make sure destroying one instance of mouse doesn't mess with
	// other instances of mouse
	_mouseDestroy: function() {
		this.element.unbind("." + this.widgetName);
		if ( this._mouseMoveDelegate ) {
			this.document
				.unbind("mousemove." + this.widgetName, this._mouseMoveDelegate)
				.unbind("mouseup." + this.widgetName, this._mouseUpDelegate);
		}
	},

	_mouseDown: function(event) {
		// don't let more than one widget handle mouseStart
		if ( mouseHandled ) {
			return;
		}

		// we may have missed mouseup (out of window)
		(this._mouseStarted && this._mouseUp(event));

		this._mouseDownEvent = event;

		var that = this,
			btnIsLeft = (event.which === 1),
			// event.target.nodeName works around a bug in IE 8 with
			// disabled inputs (#7620)
			elIsCancel = (typeof this.options.cancel === "string" && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false);
		if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
			return true;
		}

		this.mouseDelayMet = !this.options.delay;
		if (!this.mouseDelayMet) {
			this._mouseDelayTimer = setTimeout(function() {
				that.mouseDelayMet = true;
			}, this.options.delay);
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted = (this._mouseStart(event) !== false);
			if (!this._mouseStarted) {
				event.preventDefault();
				return true;
			}
		}

		// Click event may never have fired (Gecko & Opera)
		if (true === $.data(event.target, this.widgetName + ".preventClickEvent")) {
			$.removeData(event.target, this.widgetName + ".preventClickEvent");
		}

		// these delegates are required to keep context
		this._mouseMoveDelegate = function(event) {
			return that._mouseMove(event);
		};
		this._mouseUpDelegate = function(event) {
			return that._mouseUp(event);
		};

		this.document
			.bind( "mousemove." + this.widgetName, this._mouseMoveDelegate )
			.bind( "mouseup." + this.widgetName, this._mouseUpDelegate );

		event.preventDefault();

		mouseHandled = true;
		return true;
	},

	_mouseMove: function(event) {
		// IE mouseup check - mouseup happened when mouse was out of window
		if ($.ui.ie && ( !document.documentMode || document.documentMode < 9 ) && !event.button) {
			return this._mouseUp(event);

		// Iframe mouseup check - mouseup occurred in another document
		} else if ( !event.which ) {
			return this._mouseUp( event );
		}

		if (this._mouseStarted) {
			this._mouseDrag(event);
			return event.preventDefault();
		}

		if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
			this._mouseStarted =
				(this._mouseStart(this._mouseDownEvent, event) !== false);
			(this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
		}

		return !this._mouseStarted;
	},

	_mouseUp: function(event) {
		this.document
			.unbind( "mousemove." + this.widgetName, this._mouseMoveDelegate )
			.unbind( "mouseup." + this.widgetName, this._mouseUpDelegate );

		if (this._mouseStarted) {
			this._mouseStarted = false;

			if (event.target === this._mouseDownEvent.target) {
				$.data(event.target, this.widgetName + ".preventClickEvent", true);
			}

			this._mouseStop(event);
		}

		mouseHandled = false;
		return false;
	},

	_mouseDistanceMet: function(event) {
		return (Math.max(
				Math.abs(this._mouseDownEvent.pageX - event.pageX),
				Math.abs(this._mouseDownEvent.pageY - event.pageY)
			) >= this.options.distance
		);
	},

	_mouseDelayMet: function(/* event */) {
		return this.mouseDelayMet;
	},

	// These are placeholder methods, to be overriden by extending plugin
	_mouseStart: function(/* event */) {},
	_mouseDrag: function(/* event */) {},
	_mouseStop: function(/* event */) {},
	_mouseCapture: function(/* event */) { return true; }
});

}));

/*!
 * jQuery UI Slider 1.11.1
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/slider/
 */
(function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define([
			"jquery",
			"./core",
			"./mouse",
			"./widget"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}(function( $ ) {

return $.widget( "ui.slider", $.ui.mouse, {
	version: "1.11.1",
	widgetEventPrefix: "slide",

	options: {
		animate: false,
		distance: 0,
		max: 100,
		min: 0,
		orientation: "horizontal",
		range: false,
		step: 1,
		value: 0,
		values: null,

		// callbacks
		change: null,
		slide: null,
		start: null,
		stop: null
	},

	// number of pages in a slider
	// (how many times can you page up/down to go through the whole range)
	numPages: 5,

	_create: function() {
		this._keySliding = false;
		this._mouseSliding = false;
		this._animateOff = true;
		this._handleIndex = null;
		this._detectOrientation();
		this._mouseInit();

		this.element
			.addClass( "ui-slider" +
				" ui-slider-" + this.orientation +
				" ui-widget" +
				" ui-widget-content" +
				" ui-corner-all");

		this._refresh();
		this._setOption( "disabled", this.options.disabled );

		this._animateOff = false;
	},

	_refresh: function() {
		this._createRange();
		this._createHandles();
		this._setupEvents();
		this._refreshValue();
	},

	_createHandles: function() {
		var i, handleCount,
			options = this.options,
			existingHandles = this.element.find( ".ui-slider-handle" ).addClass( "ui-state-default ui-corner-all" ),
			handle = "<span class='ui-slider-handle ui-state-default ui-corner-all' tabindex='0'></span>",
			handles = [];

		handleCount = ( options.values && options.values.length ) || 1;

		if ( existingHandles.length > handleCount ) {
			existingHandles.slice( handleCount ).remove();
			existingHandles = existingHandles.slice( 0, handleCount );
		}

		for ( i = existingHandles.length; i < handleCount; i++ ) {
			handles.push( handle );
		}

		this.handles = existingHandles.add( $( handles.join( "" ) ).appendTo( this.element ) );

		this.handle = this.handles.eq( 0 );

		this.handles.each(function( i ) {
			$( this ).data( "ui-slider-handle-index", i );
		});
	},

	_createRange: function() {
		var options = this.options,
			classes = "";

		if ( options.range ) {
			if ( options.range === true ) {
				if ( !options.values ) {
					options.values = [ this._valueMin(), this._valueMin() ];
				} else if ( options.values.length && options.values.length !== 2 ) {
					options.values = [ options.values[0], options.values[0] ];
				} else if ( $.isArray( options.values ) ) {
					options.values = options.values.slice(0);
				}
			}

			if ( !this.range || !this.range.length ) {
				this.range = $( "<div></div>" )
					.appendTo( this.element );

				classes = "ui-slider-range" +
				// note: this isn't the most fittingly semantic framework class for this element,
				// but worked best visually with a variety of themes
				" ui-widget-header ui-corner-all";
			} else {
				this.range.removeClass( "ui-slider-range-min ui-slider-range-max" )
					// Handle range switching from true to min/max
					.css({
						"left": "",
						"bottom": ""
					});
			}

			this.range.addClass( classes +
				( ( options.range === "min" || options.range === "max" ) ? " ui-slider-range-" + options.range : "" ) );
		} else {
			if ( this.range ) {
				this.range.remove();
			}
			this.range = null;
		}
	},

	_setupEvents: function() {
		this._off( this.handles );
		this._on( this.handles, this._handleEvents );
		this._hoverable( this.handles );
		this._focusable( this.handles );
	},

	_destroy: function() {
		this.handles.remove();
		if ( this.range ) {
			this.range.remove();
		}

		this.element
			.removeClass( "ui-slider" +
				" ui-slider-horizontal" +
				" ui-slider-vertical" +
				" ui-widget" +
				" ui-widget-content" +
				" ui-corner-all" );

		this._mouseDestroy();
	},

	_mouseCapture: function( event ) {
		var position, normValue, distance, closestHandle, index, allowed, offset, mouseOverHandle,
			that = this,
			o = this.options;

		if ( o.disabled ) {
			return false;
		}

		this.elementSize = {
			width: this.element.outerWidth(),
			height: this.element.outerHeight()
		};
		this.elementOffset = this.element.offset();

		position = { x: event.pageX, y: event.pageY };
		normValue = this._normValueFromMouse( position );
		distance = this._valueMax() - this._valueMin() + 1;
		this.handles.each(function( i ) {
			var thisDistance = Math.abs( normValue - that.values(i) );
			if (( distance > thisDistance ) ||
				( distance === thisDistance &&
					(i === that._lastChangedValue || that.values(i) === o.min ))) {
				distance = thisDistance;
				closestHandle = $( this );
				index = i;
			}
		});

		allowed = this._start( event, index );
		if ( allowed === false ) {
			return false;
		}
		this._mouseSliding = true;

		this._handleIndex = index;

		closestHandle
			.addClass( "ui-state-active" )
			.focus();

		offset = closestHandle.offset();
		mouseOverHandle = !$( event.target ).parents().addBack().is( ".ui-slider-handle" );
		this._clickOffset = mouseOverHandle ? { left: 0, top: 0 } : {
			left: event.pageX - offset.left - ( closestHandle.width() / 2 ),
			top: event.pageY - offset.top -
				( closestHandle.height() / 2 ) -
				( parseInt( closestHandle.css("borderTopWidth"), 10 ) || 0 ) -
				( parseInt( closestHandle.css("borderBottomWidth"), 10 ) || 0) +
				( parseInt( closestHandle.css("marginTop"), 10 ) || 0)
		};

		if ( !this.handles.hasClass( "ui-state-hover" ) ) {
			this._slide( event, index, normValue );
		}
		this._animateOff = true;
		return true;
	},

	_mouseStart: function() {
		return true;
	},

	_mouseDrag: function( event ) {
		var position = { x: event.pageX, y: event.pageY },
			normValue = this._normValueFromMouse( position );

		this._slide( event, this._handleIndex, normValue );

		return false;
	},

	_mouseStop: function( event ) {
		this.handles.removeClass( "ui-state-active" );
		this._mouseSliding = false;

		this._stop( event, this._handleIndex );
		this._change( event, this._handleIndex );

		this._handleIndex = null;
		this._clickOffset = null;
		this._animateOff = false;

		return false;
	},

	_detectOrientation: function() {
		this.orientation = ( this.options.orientation === "vertical" ) ? "vertical" : "horizontal";
	},

	_normValueFromMouse: function( position ) {
		var pixelTotal,
			pixelMouse,
			percentMouse,
			valueTotal,
			valueMouse;

		if ( this.orientation === "horizontal" ) {
			pixelTotal = this.elementSize.width;
			pixelMouse = position.x - this.elementOffset.left - ( this._clickOffset ? this._clickOffset.left : 0 );
		} else {
			pixelTotal = this.elementSize.height;
			pixelMouse = position.y - this.elementOffset.top - ( this._clickOffset ? this._clickOffset.top : 0 );
		}

		percentMouse = ( pixelMouse / pixelTotal );
		if ( percentMouse > 1 ) {
			percentMouse = 1;
		}
		if ( percentMouse < 0 ) {
			percentMouse = 0;
		}
		if ( this.orientation === "vertical" ) {
			percentMouse = 1 - percentMouse;
		}

		valueTotal = this._valueMax() - this._valueMin();
		valueMouse = this._valueMin() + percentMouse * valueTotal;

		return this._trimAlignValue( valueMouse );
	},

	_start: function( event, index ) {
		var uiHash = {
			handle: this.handles[ index ],
			value: this.value()
		};
		if ( this.options.values && this.options.values.length ) {
			uiHash.value = this.values( index );
			uiHash.values = this.values();
		}
		return this._trigger( "start", event, uiHash );
	},

	_slide: function( event, index, newVal ) {
		var otherVal,
			newValues,
			allowed;

		if ( this.options.values && this.options.values.length ) {
			otherVal = this.values( index ? 0 : 1 );

			if ( ( this.options.values.length === 2 && this.options.range === true ) &&
					( ( index === 0 && newVal > otherVal) || ( index === 1 && newVal < otherVal ) )
				) {
				newVal = otherVal;
			}

			if ( newVal !== this.values( index ) ) {
				newValues = this.values();
				newValues[ index ] = newVal;
				// A slide can be canceled by returning false from the slide callback
				allowed = this._trigger( "slide", event, {
					handle: this.handles[ index ],
					value: newVal,
					values: newValues
				} );
				otherVal = this.values( index ? 0 : 1 );
				if ( allowed !== false ) {
					this.values( index, newVal );
				}
			}
		} else {
			if ( newVal !== this.value() ) {
				// A slide can be canceled by returning false from the slide callback
				allowed = this._trigger( "slide", event, {
					handle: this.handles[ index ],
					value: newVal
				} );
				if ( allowed !== false ) {
					this.value( newVal );
				}
			}
		}
	},

	_stop: function( event, index ) {
		var uiHash = {
			handle: this.handles[ index ],
			value: this.value()
		};
		if ( this.options.values && this.options.values.length ) {
			uiHash.value = this.values( index );
			uiHash.values = this.values();
		}

		this._trigger( "stop", event, uiHash );
	},

	_change: function( event, index ) {
		if ( !this._keySliding && !this._mouseSliding ) {
			var uiHash = {
				handle: this.handles[ index ],
				value: this.value()
			};
			if ( this.options.values && this.options.values.length ) {
				uiHash.value = this.values( index );
				uiHash.values = this.values();
			}

			//store the last changed value index for reference when handles overlap
			this._lastChangedValue = index;

			this._trigger( "change", event, uiHash );
		}
	},

	value: function( newValue ) {
		if ( arguments.length ) {
			this.options.value = this._trimAlignValue( newValue );
			this._refreshValue();
			this._change( null, 0 );
			return;
		}

		return this._value();
	},

	values: function( index, newValue ) {
		var vals,
			newValues,
			i;

		if ( arguments.length > 1 ) {
			this.options.values[ index ] = this._trimAlignValue( newValue );
			this._refreshValue();
			this._change( null, index );
			return;
		}

		if ( arguments.length ) {
			if ( $.isArray( arguments[ 0 ] ) ) {
				vals = this.options.values;
				newValues = arguments[ 0 ];
				for ( i = 0; i < vals.length; i += 1 ) {
					vals[ i ] = this._trimAlignValue( newValues[ i ] );
					this._change( null, i );
				}
				this._refreshValue();
			} else {
				if ( this.options.values && this.options.values.length ) {
					return this._values( index );
				} else {
					return this.value();
				}
			}
		} else {
			return this._values();
		}
	},

	_setOption: function( key, value ) {
		var i,
			valsLength = 0;

		if ( key === "range" && this.options.range === true ) {
			if ( value === "min" ) {
				this.options.value = this._values( 0 );
				this.options.values = null;
			} else if ( value === "max" ) {
				this.options.value = this._values( this.options.values.length - 1 );
				this.options.values = null;
			}
		}

		if ( $.isArray( this.options.values ) ) {
			valsLength = this.options.values.length;
		}

		if ( key === "disabled" ) {
			this.element.toggleClass( "ui-state-disabled", !!value );
		}

		this._super( key, value );

		switch ( key ) {
			case "orientation":
				this._detectOrientation();
				this.element
					.removeClass( "ui-slider-horizontal ui-slider-vertical" )
					.addClass( "ui-slider-" + this.orientation );
				this._refreshValue();

				// Reset positioning from previous orientation
				this.handles.css( value === "horizontal" ? "bottom" : "left", "" );
				break;
			case "value":
				this._animateOff = true;
				this._refreshValue();
				this._change( null, 0 );
				this._animateOff = false;
				break;
			case "values":
				this._animateOff = true;
				this._refreshValue();
				for ( i = 0; i < valsLength; i += 1 ) {
					this._change( null, i );
				}
				this._animateOff = false;
				break;
			case "min":
			case "max":
				this._animateOff = true;
				this._refreshValue();
				this._animateOff = false;
				break;
			case "range":
				this._animateOff = true;
				this._refresh();
				this._animateOff = false;
				break;
		}
	},

	//internal value getter
	// _value() returns value trimmed by min and max, aligned by step
	_value: function() {
		var val = this.options.value;
		val = this._trimAlignValue( val );

		return val;
	},

	//internal values getter
	// _values() returns array of values trimmed by min and max, aligned by step
	// _values( index ) returns single value trimmed by min and max, aligned by step
	_values: function( index ) {
		var val,
			vals,
			i;

		if ( arguments.length ) {
			val = this.options.values[ index ];
			val = this._trimAlignValue( val );

			return val;
		} else if ( this.options.values && this.options.values.length ) {
			// .slice() creates a copy of the array
			// this copy gets trimmed by min and max and then returned
			vals = this.options.values.slice();
			for ( i = 0; i < vals.length; i+= 1) {
				vals[ i ] = this._trimAlignValue( vals[ i ] );
			}

			return vals;
		} else {
			return [];
		}
	},

	// returns the step-aligned value that val is closest to, between (inclusive) min and max
	_trimAlignValue: function( val ) {
		if ( val <= this._valueMin() ) {
			return this._valueMin();
		}
		if ( val >= this._valueMax() ) {
			return this._valueMax();
		}
		var step = ( this.options.step > 0 ) ? this.options.step : 1,
			valModStep = (val - this._valueMin()) % step,
			alignValue = val - valModStep;

		if ( Math.abs(valModStep) * 2 >= step ) {
			alignValue += ( valModStep > 0 ) ? step : ( -step );
		}

		// Since JavaScript has problems with large floats, round
		// the final value to 5 digits after the decimal point (see #4124)
		return parseFloat( alignValue.toFixed(5) );
	},

	_valueMin: function() {
		return this.options.min;
	},

	_valueMax: function() {
		return this.options.max;
	},

	_refreshValue: function() {
		var lastValPercent, valPercent, value, valueMin, valueMax,
			oRange = this.options.range,
			o = this.options,
			that = this,
			animate = ( !this._animateOff ) ? o.animate : false,
			_set = {};

		if ( this.options.values && this.options.values.length ) {
			this.handles.each(function( i ) {
				valPercent = ( that.values(i) - that._valueMin() ) / ( that._valueMax() - that._valueMin() ) * 100;
				_set[ that.orientation === "horizontal" ? "left" : "bottom" ] = valPercent + "%";
				$( this ).stop( 1, 1 )[ animate ? "animate" : "css" ]( _set, o.animate );
				if ( that.options.range === true ) {
					if ( that.orientation === "horizontal" ) {
						if ( i === 0 ) {
							that.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { left: valPercent + "%" }, o.animate );
						}
						if ( i === 1 ) {
							that.range[ animate ? "animate" : "css" ]( { width: ( valPercent - lastValPercent ) + "%" }, { queue: false, duration: o.animate } );
						}
					} else {
						if ( i === 0 ) {
							that.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { bottom: ( valPercent ) + "%" }, o.animate );
						}
						if ( i === 1 ) {
							that.range[ animate ? "animate" : "css" ]( { height: ( valPercent - lastValPercent ) + "%" }, { queue: false, duration: o.animate } );
						}
					}
				}
				lastValPercent = valPercent;
			});
		} else {
			value = this.value();
			valueMin = this._valueMin();
			valueMax = this._valueMax();
			valPercent = ( valueMax !== valueMin ) ?
					( value - valueMin ) / ( valueMax - valueMin ) * 100 :
					0;
			_set[ this.orientation === "horizontal" ? "left" : "bottom" ] = valPercent + "%";
			this.handle.stop( 1, 1 )[ animate ? "animate" : "css" ]( _set, o.animate );

			if ( oRange === "min" && this.orientation === "horizontal" ) {
				this.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { width: valPercent + "%" }, o.animate );
			}
			if ( oRange === "max" && this.orientation === "horizontal" ) {
				this.range[ animate ? "animate" : "css" ]( { width: ( 100 - valPercent ) + "%" }, { queue: false, duration: o.animate } );
			}
			if ( oRange === "min" && this.orientation === "vertical" ) {
				this.range.stop( 1, 1 )[ animate ? "animate" : "css" ]( { height: valPercent + "%" }, o.animate );
			}
			if ( oRange === "max" && this.orientation === "vertical" ) {
				this.range[ animate ? "animate" : "css" ]( { height: ( 100 - valPercent ) + "%" }, { queue: false, duration: o.animate } );
			}
		}
	},

	_handleEvents: {
		keydown: function( event ) {
			var allowed, curVal, newVal, step,
				index = $( event.target ).data( "ui-slider-handle-index" );

			switch ( event.keyCode ) {
				case $.ui.keyCode.HOME:
				case $.ui.keyCode.END:
				case $.ui.keyCode.PAGE_UP:
				case $.ui.keyCode.PAGE_DOWN:
				case $.ui.keyCode.UP:
				case $.ui.keyCode.RIGHT:
				case $.ui.keyCode.DOWN:
				case $.ui.keyCode.LEFT:
					event.preventDefault();
					if ( !this._keySliding ) {
						this._keySliding = true;
						$( event.target ).addClass( "ui-state-active" );
						allowed = this._start( event, index );
						if ( allowed === false ) {
							return;
						}
					}
					break;
			}

			step = this.options.step;
			if ( this.options.values && this.options.values.length ) {
				curVal = newVal = this.values( index );
			} else {
				curVal = newVal = this.value();
			}

			switch ( event.keyCode ) {
				case $.ui.keyCode.HOME:
					newVal = this._valueMin();
					break;
				case $.ui.keyCode.END:
					newVal = this._valueMax();
					break;
				case $.ui.keyCode.PAGE_UP:
					newVal = this._trimAlignValue(
						curVal + ( ( this._valueMax() - this._valueMin() ) / this.numPages )
					);
					break;
				case $.ui.keyCode.PAGE_DOWN:
					newVal = this._trimAlignValue(
						curVal - ( (this._valueMax() - this._valueMin()) / this.numPages ) );
					break;
				case $.ui.keyCode.UP:
				case $.ui.keyCode.RIGHT:
					if ( curVal === this._valueMax() ) {
						return;
					}
					newVal = this._trimAlignValue( curVal + step );
					break;
				case $.ui.keyCode.DOWN:
				case $.ui.keyCode.LEFT:
					if ( curVal === this._valueMin() ) {
						return;
					}
					newVal = this._trimAlignValue( curVal - step );
					break;
			}

			this._slide( event, index, newVal );
		},
		keyup: function( event ) {
			var index = $( event.target ).data( "ui-slider-handle-index" );

			if ( this._keySliding ) {
				this._keySliding = false;
				this._stop( event, index );
				this._change( event, index );
				$( event.target ).removeClass( "ui-state-active" );
			}
		}
	}
});

}));

(function(module) {
try {
  module = angular.module('Player.Templates');
} catch (e) {
  module = angular.module('Player.Templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('player.html',
    '<div class="b-player"><div class="b-player__controls__info"><div class="b-player__controls__info__artist" ng-bind="player.currentSong.artist"></div><div class="b-player__controls__info__title" ng-bind="player.currentSong.title"></div></div><div class="b-player__controls__navigation"><div class="b-player__controls__navigation__prev"><div class="b-player__controls__navigation__prev-btn" ng-click="player.controls.prev()"></div></div><div class="b-player__controls__navigation__play"><div ng-click="player.controls.togglePause()" ng-show="player.state.paused" class="b-player__controls__navigation__play__play"></div><div ng-click="player.controls.togglePause()" ng-hide="player.state.paused" class="b-player__controls__navigation__play__pause"></div></div><div class="b-player__controls__navigation__next"><div class="b-player__controls__navigation__next-btn" ng-click="player.controls.next()"></div></div></div><div class="clear"></div><div class="b-player__controls__splitter"></div><div class="b-player__controls__playback"><div slider="player.time" slider-update="player.setTime(progress)" slider-max="player.duration" slider-preload="player.downloadProgress" class="slider b-player__controls__playback__progress"><div class="b-player__controls__playback__progress__download" ng-style="player.downloadProgress"></div></div><div ng-class="{\n' +
    '        \'b-player__controls__playback__time--left\': player.state.elapsed\n' +
    '      }" class="b-player__controls__playback__time"><div ng-bind="player.time | duration" ng-click="player.showTimeElapsed(true)" class="b-player__controls__playback__time__elapsed"></div><div ng-bind="(player.time - player.duration) | duration" ng-click="player.showTimeElapsed(false)" class="b-player__controls__playback__time__left"></div></div></div><ul class="b-player__controls__buttons"><li ng-click="player.controls.toggleLoop()" ng-class="{\n' +
    '        \'b-player__controls__buttons__loop--active\': player.state.loop,\n' +
    '        \'b-player__controls__buttons__loop\': !player.state.loop\n' +
    '      }"></li></ul><div class="b-player__controls__volume"><div class="b-player__controls__volume__low"></div><div slider="player.volume" class="b-player__controls__volume__progress slider"></div><div class="b-player__controls__volume__high"></div></div><div class="clear"></div><div class="b-player-search"><input type="search" name="search" class="b-player-search-dialog" autocomplete="off"></div><div class="clear"></div><ul class="b-player-playlist"><li ng-class="{\n' +
    '        \'playing\':  player.isCurrentSong(song),\n' +
    '        \'selected\': player.isSelected($index),\n' +
    '        \'queued\':   player.positionInsideQueue(song)\n' +
    '      }" ng-dblclick="player.playSong(song)" ng-click="player.setSelected($index)" ng-repeat="song in player.songs" class="b-player-playlist-item"><div class="b-player-playlist-item-inner b-state"><span ng-bind="player.positionInsideQueue(song)"></span></div><div class="b-player-playlist-item-inner b-position" ng-bind="$index + 1"></div><div class="b-player-playlist-item-inner b-song" ng-bind="song.artist + \' - \' + song.title"></div><div class="b-player-playlist-item-inner b-duration" ng-if="song.duration" ng-bind="song.duration | duration"></div></li></ul></div>');
}]);
})();

/**
 * Audio element abstraction
 * http://www.w3schools.com/tags/ref_av_dom.asp
 */
angular.module('Player.Audio', [])
  .factory('Audio', ['$rootScope', function ($rootScope) {
    var player = new Audio(),

        props = {
          src:    null,
          time:   0,
          volume: localStorage.getItem('volume'),

          // currently playing song duration
          duration: 0,

          // initial value: "not playing"
          paused: true,
          muted:  false,
          ended:  false,
          loop:   false
        },

        // last progress range
        // see: http://www.sitepoint.com/essential-audio-and-video-events-for-html5
        // `start` and `end` - seconds
        progress = { start: 0, end: 0 },

        floor = Math.floor,

        factory = {
          play:        play,
          time:        time,
          prop:        prop,
          volume:      volume,
          getProgress: getProgress,
          togglePause: togglePause
        };

    // set initial volume
    volume( props.volume ? Number(props.volume) : 100 );

    /**
     * Get / set music source
     * @private
     */
    function _source(src) {
      if (typeof src === 'undefined') {
        return src;
      }

      player.src = props.src = src;

      // reset progress
      progress = { start: 0, end: 0 };
    }

    /**
     * Get / set volume level: [0..100]
     */
    function volume(vol) {
      if (typeof vol === 'undefined') {
        return props.volume;
      }

      props.volume  = vol;
      player.volume = vol / 100;
      localStorage.setItem('volume', vol);
    }

    function play(src) {
      if (typeof src !== 'undefined') {
        _source(src);
      }

      props.paused = props.ended = false;
      player.play();
    }

    function pause() {
      props.paused = true;
      player.pause();
    }

    /**
     * Toggle pause state
     * @param  {Boolean} state Pause or not. If true: pause
     */
    function togglePause(state) {
      if (typeof state === 'undefined') {
        state = !props.paused;
      }

      if (state) {
        pause();
      } else {
        play();
      }
    }

    /**
     * Get / set time
     */
    function time(value) {
      if (typeof value === 'undefined') {
        return props.time;
      }

      // We could not change time if duration is Infinite
      // Notice: it's for online streams
      if ( prop('duration') === Infinity ) {
        return;
      }

      player.currentTime = props.time = value;
    }

    $(player)

      // preload=auto is needed for progress event
      .attr('preload', 'auto')

      // observe events
      .on({
        timeupdate: function () {
          props.time = floor(player.currentTime);
          $rootScope.$apply();
        },

        ended: function () {
          prop('ended', true);
          $rootScope.$apply();
        },

        durationchange: function () {
          prop('duration', player.duration);
          $rootScope.$apply();
        },

        progress: function () {
          var buffered = player.buffered,
              last     = buffered.length - 1;

          // sometimes nothing is loaded at the moment
          if (buffered.length === 0) {
            return;
          }

          progress = {
            start: buffered.start(last),
            end:   buffered.end(last)
          };

          $rootScope.$apply();
        }
      });

    // props getter/setter
    function prop(name, value) {
      if ( !props.hasOwnProperty(name) ) {
        throw new Error('prop `'+ name +'` does not exist');
      }

      // getter
      if (typeof value === 'undefined') {
        return props[name];
      }

      // setter
      props[name] = value;

      switch (name) {
        case 'loop':
          player.loop = Boolean(value);
          break;
      }
    }

    function getProgress() {
      return progress;
    }

    return factory;
  }]);

angular.module('Player.Duration', [])
  .factory('Utils', function() {
    /**
     * Add leading zeros to number until it will have correct length
     * @param {Number/String} value   Any number or stringified number
     * @param {Number}        length  Needed length
     * @param {String}        symbol  Symbol for padding
     * @return {String}               Value with leading zeros
     */

    function pad(value, length, symbol) {
      length = length || 2;
      symbol = symbol || '0';

      value = value.toString();
      while (value.length < length) {
        value = symbol + value;
      }

      return value;
    }

    return {
      pad: pad
    };
  })

  .filter('duration', ['Utils', function (Utils) {
      return function(duration) {
        if (duration === 0) {
          return '00:00';
        }

        if ( duration === -Infinity || duration === Infinity ) {
          return '∞';
        }

        var result = duration < 0 ? '-' : '';
        duration = Math.abs(duration);
        var minutes = Utils.pad(Math.floor(duration / 60));
        var seconds = Utils.pad(duration % 60);

        result = result + minutes + ':' + seconds;

        return result;
      };
    }
  ]);

angular.module('Player.Navigation', ['Player.Playlist'])
  .factory('Navigation', ['Playlist', function (Playlist) {
    var factory  = {
      next:  next,
      prev:  prev,
      set:   set,
      reset: reset,
      index: 0
    };

    /**
     * Set current index
     * @param {Number} index Playlist index
     */
    function set(index) {
      factory.index = index;
    }

    function reset() {
      factory.index = 0;
    }

    function next() {
      factory.index = Playlist.nextIndex(factory.index);
    }

    function prev() {
      factory.index = Playlist.prevIndex(factory.index);
    }

    return factory;
  }]);

/**
 * @example
 *   // Get url before play:
 *   Playlist.beforePlay = function (song) {
 *
 *     // request some remote server for song url
 *     VK.Api.call('audio.search', {q: song.title}, function (response) {
 *       song.url = response[1].url;
 *     });
 *   };
 */
angular.module('Player.Playlist', ['Player.Audio', 'Player.Queue'])
  .factory('Playlist', ['$q', 'Audio', 'Queue',
              function ( $q,   Audio,   Queue ) {

    var _playlists = {};

    // all songs array
    var _songsMap  = [];

    // playlists counter
    var count = 0;

    var current = { songs: [], name: null };

    var factory = {
      add: add,
      use: use,
      has: has,

      // current: {name, songs, length}
      current: current,

      // currently playing song
      currentSong: null,
      getSong: getSong,

      prevIndex: prevIndex,
      nextIndex: nextIndex,

      play: play,
      next: next,
      prev: prev,
      playByPosition: playByPosition
    };

    /**
     * Use playlist
     * @param  {String}  name Playlist name
     */
    function add(name, songs) {
      if ( has(name) ) {
        throw new Error('Playlist with name `' + name + '` exists');
      }

      songs = angular.copy(songs);

      // add index
      songs.forEach(function (song) {
        var length = _songsMap.push(song);

        // save index into song instance
        song._index = length - 1;
      });

      _playlists[name] = songs;
      count += 1;

      // if it's first playlist - use it
      if ( count === 1 ) {
        use(name);
      }

      return factory;
    }

    /**
     * Use playlist
     * @param  {String}  name Playlist name
     * @return {Boolean}      Return result:
     *                        true if playlist exist and could be used, otherwise: false
     */
    function use(name) {
      if ( !has(name) ) {
        return false;
      }

      // playlist is currently in use
      if ( current.name === name ) {
        return;
      }

      current.name = name,
      current.songs = _playlists[name];
      current.length = _playlists[name].length;
      factory.currentSong = getSong(0);

      return true;
    }

    /**
     * Check playlist existance
     * @param  {String}  name Playlist name
     * @return {Boolean}      Result: true if playlist exist, otherwise: false
     */
    function has(name) {
      return _playlists.hasOwnProperty(name);
    }

    //
    // Playing interface
    //

    function getSong(position) {
      return current.songs[position];
    }

    function nextIndex(index) {
      var next;

      if ( typeof index === 'undefined' ) {
        index =  current.songs.indexOf(factory.currentSong);

        if (index === -1) {
          index = 0;
        }
      }

      next = index + 1;
      return next < current.length ? next : 0;
    }

    function prevIndex(index) {
      var prev;

      if ( typeof index === 'undefined' ) {
        index =  current.songs.indexOf(factory.currentSong);
        if (index === -1) {
          index = 0;
        }
      }

      prev = index - 1;
      return prev >= 0 ? prev : current.length - 1;
    }

    // Play song
    function play(song) {

      // @todo: is this really used
      if (typeof song === 'number') {
        song = _songsMap[song];
      }

      if ( typeof factory.beforePlay === 'function' ) {

        // wrap to promise if non-promise value is returned
        $q.when( factory.beforePlay(song) )
          .then(function () {
            factory.currentSong = song;
            Audio.play( song.url );
          });
      } else {
        factory.currentSong = song;
        Audio.play( song.url );
      }
    }

    function playByPosition(position) {
      var song = getSong(position);

      Queue.prev(song._index);
      play( song );
    }

    /**
     * Play next song
     */
    function next() {
      var index = Queue.next(),
          song;

      // next queue is empty
      if (typeof index === 'undefined') {
        song = getSong( nextIndex() );

        // save to prev queue
        Queue.prev(song._index);
        play( song );
        return;
      }

      Queue.prev(index);
      play(index);
    }

    /**
     * Play prev song
     */
    function prev() {
      var index = Queue.prev(),
          song;

      if (typeof index === 'undefined') {
        // prev queue is empty
        song = getSong( prevIndex() );

        play( song );
        return;
      }

      play(index);
    }

    return factory;
  }]);

angular.module('Player.Queue', [])
  .factory('Queue', [function () {
    var _next = [], // FIFO
        _prev = []; // LIFO

    /**
     * Getter setter of next song
     * @param {Number} [index] If provided, index is added to next queue,
     *                         otherwise: retrieve index from next queue
     */
    function next(index) {
      if (typeof index === 'undefined') {
        return _next.shift();
      }

      _next.push(index);
    }

    /**
     * Add to next queue / or remove from it
     * @param  {Number} index Song uniq index
     */
    function toggleNext(index) {
      if ( _isInNextQueue(index) ) {
        removeFromNext(index);
      } else {
        next(index);
      }
    }

    /**
     * Remove from next queue
     * @param   {Number} index  Song uniq index
     */
    function removeFromNext(index) {
      if ( _isInNextQueue(index) ) {
        _next.splice( position(index) , 1);
      }
    }

    /**
     * Position in the next queue
     * @return {Number|null} Position inside the next queue or null, if is not in queue
     */
    function position(index) {
      var _position = _next.indexOf(index);

      return _position === -1 ? null : _position;
    }

    /**
     * Check song presence in next queue
     *
     * @param  {Number}  index Song uniq index
     * @return {Boolean}       Result of check
     */
    function _isInNextQueue(index) {
      return _next.indexOf(index) !== -1;
    }

    /**
     * Get / add to prev queue
     */
    function prev(index) {
      if (typeof index === 'undefined') {
        return _prev.pop();
      }

      _prev.push(index);
    }

    // reset queue
    function reset() {
      _next = [];
      _prev = [];
    }

    return {
      addToNext: next,
      next: next,
      position: position,
      removeFromNext: removeFromNext,
      toggleNext: toggleNext,
      addToPrev: prev,
      prev: prev,
      reset: reset
    };
  }]);

// keyboard shortcuts for the player
angular.module('Player.Shortcuts', [
  'Player.Audio',
  'Player.Navigation',
  'Player.Queue',
  'Player.Playlist'
])
.directive('playerShortcuts', ['$document', 'Audio', 'Navigation', 'Queue', 'Playlist',
                     function ( $document,   Audio,   Navigation,   Queue,   Playlist ) {

  return  {
    restrict: 'A',
    link: function ($scope) {
      function onKeydown(e) {
        var song;

        switch (e.which) {
          case 81:
            // Q - queue
            Queue.toggleNext(
              Playlist.getSong(Navigation.index)._index
            );
            e.preventDefault();
            break;
          case 32:
            // Space - pause/unpause current song
            Audio.togglePause();
            e.preventDefault();
            break;
          case 40:
            // Down - select next item in the list
            Navigation.next();
            e.preventDefault();
            break;
          case 38:
            // Up - select prev item in the list
            Navigation.prev();
            e.preventDefault();
            break;
          case 13:
            // Enter - play currently selected item
            song = Playlist.getSong(Navigation.index);
            Queue.prev(song._index);
            Playlist.play( song );

            e.preventDefault();
            break;
          case 84:
            // T - search box
            break;

            // no defaults
        }

        $scope.$apply();
      }

      $document.on('keydown', onKeydown);
      $scope.$on('$destroy', function () {
        $document.off('keydown', onKeydown);
      });
    }
  };
}]);

/**
 * @author Valerii Vasin (valerii.vasin@gmail.com)
 * @description AngularJS directive that allows to simply create HTML5 audio player
 *
 * Item format:
 *  - artist: String
 *  - title: String
 *  - [duration]: Number (seconds)
 *  - url: String
 *
 * @example
 *   <div player></div>
 */

angular.module('Player', [
  'Player.Slider',
  'Player.Duration',
  'Player.Queue',
  'Player.Navigation',
  'Player.Audio',
  'Player.Playlist',
  'Player.Templates',
  'Player.Shortcuts'
])
.directive('player', ['Queue', 'Audio', 'Playlist', 'Navigation',
            function ( Queue,   Audio,   Playlist,   Navigation ) {

    return {
      restrict: 'A',
      templateUrl: 'player.html',
      scope: true,
      controllerAs: 'player',
      controller: ['$scope', function ($scope) {
        var that = this;

        this.state = {

          // show elapsed time
          elapsed: false,

          paused: Audio.prop('paused'),

          loop: Audio.prop('loop')
        };

        this.showTimeElapsed = function (state) {

          // do not show elapsed time for continuous playing streams
          // like radiostations
          if ( state ) {
            if ( Audio.prop('duration') !== Infinity ) {
              that.state.elapsed = true;
            }

            return;
          }

          that.state.elapsed = false;
        };

        // update time from song progress slider
        that.setTime = function(time) {
          Audio.time(time);
        };

        // watch pause changes
        $scope.$watch(function () {
          return Audio.prop('paused');
        }, function (value) {
          that.state.paused = value;
        });

        // watch playlist change
        $scope.$watchCollection(function () {
          return Playlist.current.songs;
        }, function (songs) {
          that.songs = songs;
        });

        $scope.$watch(function() {
          return Playlist.currentSong;
        }, function(current) {
          // save current song params
          that.currentSong = current;
        });

        // watch loop changes
        $scope.$watch(function () {
          return Audio.prop('loop');
        }, function (value) {
          that.state.loop = value;
        });

        // watch and update current time
        this.time = 0;
        $scope.$watch(function () {
          return Audio.time();
        }, function (value) {
          that.time = value;
        });

        // watch volume changes
        this.volume = Audio.volume();
        $scope.$watch(function () {
          return that.volume;
        }, function(value) {
          Audio.volume(value);
        });

        // watch when ended
        $scope.$watch(function () {
          return Audio.prop('ended');
        }, function (value) {
          if (value) {
            that.controls.next();
            Audio.prop('ended', false);
          }
        });

        this.duration = 0;
        $scope.$watch(function () {
          return Audio.prop('duration');
        }, function (duration) {
          that.duration = duration;
        });

        // watch progress
        this.downloadProgress = { left: 0, width: 0 };
        $scope.$watch(function () {
          return Audio.getProgress();
        }, function (value, oldValue) {
          if (value === oldValue) {
            return;
          }

          // convert progress seconds to width
          var end = Math.floor(
            (value.end / Audio.prop('duration')) * 100
          );

          that.downloadProgress.left = 0;
          that.downloadProgress.width = end + '%';
        });

        // currently selected song
        that.selected = 0;
        $scope.$watch(function () {
          return Navigation.index;
        }, function (value, old) {
          if (value === old) {
            return;
          }

          that.selected = value;
        });

        this.isSelected = function(index) {
          return this.selected === index;
        };

        this.setSelected = function(index) {
          Navigation.set(index);
        };

        /**
         * Queue position to display
         * @param  {Object}        index  Song
         * @return {Number|String}        Position in queue or empty string
         */
        this.positionInsideQueue = function (song) {
          var position = Queue.position(song._index);

          return typeof position === 'number' ? position + 1 : '';
        };

        this.playSong = function(song) {
          Queue.prev(song._index);
          Playlist.play(song);
        };

        this.isCurrentSong = function(song) {
          return this.currentSong === song;
        };

        // controls
        this.controls = {};
        this.controls.togglePause = function () {
          // start playing current song if source
          // has not been set before (initial state)
          if ( !Audio.prop('src') ) {
            that.playSong(that.currentSong);
          } else {
            Audio.togglePause();
          }
        };

        this.controls.toggleLoop = function () {
          Audio.prop('loop', !Audio.prop('loop'));
        };

        this.controls.next = Playlist.next;
        this.controls.prev = Playlist.prev;
      }]
    };
  }
]);

//
// <span slider="mymodel" sliderUpdate="fn(progress)" />
//
angular.module('Player.Slider', [])
  .directive('slider', ['$timeout', function ($timeout) {
      return {
        scope: {
          slider: '=',
          update: '&sliderUpdate',
          max: '=sliderMax'
        },
        link: function(scope, element, attrs) {
          // prevent applying time changes while user sliding
          var preventChanges = false;

          // update model on the fly, without passing value to update func
          var directApply = (typeof attrs.sliderUpdate === 'undefined');

          element.slider({
            range: 'min',
            start: function() {
              preventChanges = true;
            },
            slide: function(event, ui) {
              if (!directApply) {
                return;
              }

              $timeout(function() {
                scope.slider = ui.value;
              });
            },
            stop: function(event, ui) {
              $timeout(function() {
                preventChanges = false;
                if (directApply) {
                  return;
                }
                scope.update({
                  progress: ui.value
                });
              });
            }
          });

          scope.$watch('slider', function(value) {
            if (preventChanges) {
              return;
            }

            element.slider('option', 'value', value);
          });

          scope.$watch('max', function(current, prev) {
            if (current === prev) {
              return;
            }

            if ( current === Infinity ) {
              element.slider('disable');
            } else {
              element.slider('enable');

              // reset slider value to 0 after enabling
              element.slider('option', 'value', 0);
            }

            element.slider('option', 'max', current);
          });
        }
      };
    }
  ]);
