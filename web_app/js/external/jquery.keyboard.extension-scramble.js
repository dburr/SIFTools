/*
 * jQuery UI Virtual Keyboard Scramble Extension v1.6.1 for Keyboard v1.18+ (updated 7/7/2015)
 *
 * By Rob Garrison (aka Mottie & Fudgey)
 * Licensed under the MIT License
 *
 * Use this extension with the Virtual Keyboard to scramble the
 * specified keyboard keys
 *
 * Requires:
 *  jQuery v1.4.4+
 *  Keyboard v1.17.14+ - https://github.com/Mottie/Keyboard
 *
 * Setup:
 *  $('.ui-keyboard-input')
 *   .keyboard(options)
 *   .addScramble();
 *
 *  // or if targeting a specific keyboard
 *  $('#keyboard1')
 *   .keyboard(options) // keyboard plugin
 *   .addScramble();    // this keyboard extension
 *
 */
/*jshint browser:true, jquery:true, unused:false */
/*global require:false, define:false, module:false */
;(function(factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = factory(require('jquery'));
	} else {
		factory(jQuery);
	}
}(function($) {
'use strict';
$.keyboard = $.keyboard || {};

	$.fn.addScramble = function(options) {
		//Set the default values, use comma to separate the settings, example:
		var savedLayout,
		defaults = {
			targetKeys    : /[a-z\d]/i, // keys to randomize
			byRow         : true,  // randomize by row, otherwise randomize all keys
			byKeySet      : false, // if true, randomize one keyset & duplicate
			randomizeOnce : true,  // if true, randomize only once on keyboard visible
			sameForAll    : false, // use the same scrambled keyboard for all targetted keyboards - not fully implemented!
			init          : null   // function(keyboard){}
		};
		return this.each(function() {
			// make sure a keyboard is attached
			var o,
				base = $(this).data('keyboard'),
				namespace = base.namespace + 'Scramble',
				opts = base.options;

			if (!base || base.scramble_options) { return; }
			o = base.scramble_options = $.extend({}, defaults, options);
			base.extensionNamespace.push( namespace );

			// save create callback
			o.orig_create = opts.create;

			base.scramble_setup = function($keyboard) {
				var $sets, set, $keys, key, index, tmp,
					rowIndex, keyboardmap, map, keyboard, row;
				$sets = $keyboard.find('.' + $.keyboard.css.keySet);
				if ($keyboard.length) {
					if (o.byKeySet) {
						$sets = $sets.eq(0);
					}
					for (set = 0; set < $sets.length; set++) {
						/*jshint loopfunc:true */
						$keys = $sets.eq(set);
						rowIndex = 0;
						row = [];
						map = [];
						keyboardmap = [];
						keyboard = [];
						$keys.children('button, span, br').each(function() {
							if (this.tagName === 'BR') {
								if (o.byRow) {
									row.push(this);
									map.push(false);
									keyboard[rowIndex] = row;
									keyboardmap[rowIndex] = map;
									row = [];
									map = [];
									rowIndex++;
								} else {
									keyboard[rowIndex] = this;
									keyboardmap[rowIndex] = false;
									rowIndex++;
								}
							} else {
								tmp = $(this).attr('data-value') || '';
								tmp = tmp.length === 1 && o.targetKeys.test(tmp) ? tmp : false;
								if (o.byRow) {
									row.push( this );
									map.push ( tmp );
								} else {
									keyboard[rowIndex] = this;
									keyboardmap[rowIndex] = tmp;
									rowIndex++;
								}
							}
						});
						// remove original <br> elements
						$keys.find('.' + $.keyboard.css.endRow).remove();
						// re-map keys
						if (!o.byRow) {
							row = base.shuffle( keyboard, keyboardmap );
							for (key = 0; key < row.length; key++) {
								$keys.append(row[key]);
							}
						} else {
							for (index = 0; index < keyboard.length; index++) {
								row = base.shuffle( keyboard[index], keyboardmap[index] );
								for (key = 0; key < row.length; key++) {
									$keys.append(row[key]);
								}
							}
						}
					}
					if (o.byKeySet) {
						$keyboard = base.realign($keyboard);
					}
					return $keyboard;
				}
			};

			// modified from Fisher-Yates shuffle ( http://bost.ocks.org/mike/shuffle/ )
			// to allow not shuffling specifically mapped array elements
			base.shuffle = function(array, map) {
				var swap, random,
					index = array.length;
				// While there remain elements to shuffle...
				while (index > 0) {
					// Pick a remaining element...
					random = Math.floor(Math.random() * index);
					if (map[index - 1] === false) {
						index--;
					}
					// skip elements that are mapped to false
					if (map[index - 1] !== false && map[random] !== false) {
						// And swap it with the current element
						index--;
						swap = array[index];
						array[index] = array[random];
						array[random] = swap;
					}
				}
				return array;
			};

			// make other keysets "line-up" with scrambled keyset
			base.realign = function($keyboard) {
				var selector, typ, pos,
					$sets = $keyboard.find('.' + $.keyboard.css.keySet),
					$orig = $sets.eq(0);
				$sets = $sets.filter(':gt(0)');
				$orig.children().each(function(i, cell){
					typ = cell.tagName === 'BR';
					pos = $(cell).attr('data-pos');
					/*jshint loopfunc:true */
					$sets.each(function(j, k){
						selector = typ ? 'br:first' : 'button[data-pos="' + pos + '"]';
						$(k).find(selector).appendTo( k );
					});
				});
				return $keyboard;
			};

			// create scrambled keyboard layout
			opts.create = function() {
				var layout = opts.layout;
				$.keyboard.builtLayouts[layout] = {
					mappedKeys   : {},
					acceptedKeys : [],
					$keyboard: null
				};
				if ( typeof $.keyboard.builtLayouts[base.orig_layout] === 'undefined' ) {
					base.layout = opts.layout = base.orig_layout;
					// build original layout, if not already built, e.g. "qwerty"
					base.buildKeyboard( base.layout, true );
					base.layout = opts.layout = layout;
				}
				// clone, scramble then save layout
				$.keyboard.builtLayouts[layout] = $.extend(true, {}, $.keyboard.builtLayouts[base.orig_layout]);
				if (o.randomizeOnce) {
					$.keyboard.builtLayouts[layout].$keyboard = base.scramble_setup( $.keyboard.builtLayouts[base.orig_layout].$keyboard.clone() );
				}
				base.$keyboard = $.keyboard.builtLayouts[layout].$keyboard;
				if ( !o.randomizeOnce ) {
					base.$el
						.unbind($.keyboard.events.kbBeforeVisible + namespace)
						.bind($.keyboard.events.kbBeforeVisible + namespace, function(e, kb) {
							kb.$keyboard = kb.scramble_setup(kb.$keyboard);
						});
				}
				if ( $.isFunction( o.orig_create ) ) {
					o.orig_create( base );
				}
			};

			// scrambled layout already initialized
			if (!/^scrambled/.test(opts.layout)) {
				base.orig_layout = opts.layout;
				savedLayout = savedLayout || 'scrambled' + Math.round(Math.random() * 10000);
				opts.layout = o.sameForAll ? savedLayout : 'scrambled' + Math.round(Math.random() * 10000);
			}

			// special case when keyboard is set to always be open
			if (opts.alwaysOpen && base.$keyboard.length) {
				setTimeout(function(){
					base.$keyboard = base.scramble_setup(base.$keyboard);
					if ($.isFunction(o.init)) {
						o.init(base);
					}
				}, 0);
			} else {
				if ($.isFunction(o.init)) {
					o.init(base);
				}
			}

		});
	};

}));
