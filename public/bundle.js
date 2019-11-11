
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, changed, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(changed, child_ctx);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    function createStrikeStore() {
        var _a = writable(0), subscribe = _a.subscribe, set = _a.set, update = _a.update;
        return {
            subscribe: subscribe,
            update: update,
            reset: function () { return set(0); }
        };
    }
    function createScoreStore(config) {
        var _a = writable(0), subscribe = _a.subscribe, update = _a.update;
        var strikeStore = createStrikeStore();
        var strikeThreshhold = 5; // config
        var incrementBy = 0; // config
        return {
            subscribe: subscribe,
            subscribeToStrike: strikeStore.subscribe,
            increment: function () {
                return update(function (n) {
                    if (n % strikeThreshhold === 0)
                        ++incrementBy;
                    strikeStore.update(function (n) { return n + 1; });
                    return n + incrementBy;
                });
            },
            resetStrike: function () { return strikeStore.reset(); }
        };
    }
    var scoreStore = createScoreStore();
    //# sourceMappingURL=scoreStore.js.map

    /**
     * Copies the values of `source` to `array`.
     *
     * @private
     * @param {Array} source The array to copy values from.
     * @param {Array} [array=[]] The array to copy values to.
     * @returns {Array} Returns `array`.
     */
    function copyArray(source, array) {
      var index = -1,
          length = source.length;

      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }

    var _copyArray = copyArray;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeFloor = Math.floor,
        nativeRandom = Math.random;

    /**
     * The base implementation of `_.random` without support for returning
     * floating-point numbers.
     *
     * @private
     * @param {number} lower The lower bound.
     * @param {number} upper The upper bound.
     * @returns {number} Returns the random number.
     */
    function baseRandom(lower, upper) {
      return lower + nativeFloor(nativeRandom() * (upper - lower + 1));
    }

    var _baseRandom = baseRandom;

    /**
     * A specialized version of `_.shuffle` which mutates and sets the size of `array`.
     *
     * @private
     * @param {Array} array The array to shuffle.
     * @param {number} [size=array.length] The size of `array`.
     * @returns {Array} Returns `array`.
     */
    function shuffleSelf(array, size) {
      var index = -1,
          length = array.length,
          lastIndex = length - 1;

      size = size === undefined ? length : size;
      while (++index < size) {
        var rand = _baseRandom(index, lastIndex),
            value = array[rand];

        array[rand] = array[index];
        array[index] = value;
      }
      array.length = size;
      return array;
    }

    var _shuffleSelf = shuffleSelf;

    /**
     * A specialized version of `_.shuffle` for arrays.
     *
     * @private
     * @param {Array} array The array to shuffle.
     * @returns {Array} Returns the new shuffled array.
     */
    function arrayShuffle(array) {
      return _shuffleSelf(_copyArray(array));
    }

    var _arrayShuffle = arrayShuffle;

    /**
     * A specialized version of `_.map` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     */
    function arrayMap(array, iteratee) {
      var index = -1,
          length = array == null ? 0 : array.length,
          result = Array(length);

      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }
      return result;
    }

    var _arrayMap = arrayMap;

    /**
     * The base implementation of `_.values` and `_.valuesIn` which creates an
     * array of `object` property values corresponding to the property names
     * of `props`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array} props The property names to get values for.
     * @returns {Object} Returns the array of property values.
     */
    function baseValues(object, props) {
      return _arrayMap(props, function(key) {
        return object[key];
      });
    }

    var _baseValues = baseValues;

    /**
     * The base implementation of `_.times` without support for iteratee shorthands
     * or max array length checks.
     *
     * @private
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     */
    function baseTimes(n, iteratee) {
      var index = -1,
          result = Array(n);

      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }

    var _baseTimes = baseTimes;

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

    var _freeGlobal = freeGlobal;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = _freeGlobal || freeSelf || Function('return this')();

    var _root = root;

    /** Built-in value references. */
    var Symbol = _root.Symbol;

    var _Symbol = Symbol;

    /** Used for built-in method references. */
    var objectProto = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString = objectProto.toString;

    /** Built-in value references. */
    var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

    /**
     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw `toStringTag`.
     */
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag),
          tag = value[symToStringTag];

      try {
        value[symToStringTag] = undefined;
        var unmasked = true;
      } catch (e) {}

      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }

    var _getRawTag = getRawTag;

    /** Used for built-in method references. */
    var objectProto$1 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString$1 = objectProto$1.toString;

    /**
     * Converts `value` to a string using `Object.prototype.toString`.
     *
     * @private
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     */
    function objectToString(value) {
      return nativeObjectToString$1.call(value);
    }

    var _objectToString = objectToString;

    /** `Object#toString` result references. */
    var nullTag = '[object Null]',
        undefinedTag = '[object Undefined]';

    /** Built-in value references. */
    var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

    /**
     * The base implementation of `getTag` without fallbacks for buggy environments.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function baseGetTag(value) {
      if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
      }
      return (symToStringTag$1 && symToStringTag$1 in Object(value))
        ? _getRawTag(value)
        : _objectToString(value);
    }

    var _baseGetTag = baseGetTag;

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return value != null && typeof value == 'object';
    }

    var isObjectLike_1 = isObjectLike;

    /** `Object#toString` result references. */
    var argsTag = '[object Arguments]';

    /**
     * The base implementation of `_.isArguments`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     */
    function baseIsArguments(value) {
      return isObjectLike_1(value) && _baseGetTag(value) == argsTag;
    }

    var _baseIsArguments = baseIsArguments;

    /** Used for built-in method references. */
    var objectProto$2 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

    /** Built-in value references. */
    var propertyIsEnumerable = objectProto$2.propertyIsEnumerable;

    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    var isArguments = _baseIsArguments(function() { return arguments; }()) ? _baseIsArguments : function(value) {
      return isObjectLike_1(value) && hasOwnProperty$1.call(value, 'callee') &&
        !propertyIsEnumerable.call(value, 'callee');
    };

    var isArguments_1 = isArguments;

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array, else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */
    var isArray = Array.isArray;

    var isArray_1 = isArray;

    /**
     * This method returns `false`.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {boolean} Returns `false`.
     * @example
     *
     * _.times(2, _.stubFalse);
     * // => [false, false]
     */
    function stubFalse() {
      return false;
    }

    var stubFalse_1 = stubFalse;

    var isBuffer_1 = createCommonjsModule(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports =  exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Built-in value references. */
    var Buffer = moduleExports ? _root.Buffer : undefined;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

    /**
     * Checks if `value` is a buffer.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
     * @example
     *
     * _.isBuffer(new Buffer(2));
     * // => true
     *
     * _.isBuffer(new Uint8Array(2));
     * // => false
     */
    var isBuffer = nativeIsBuffer || stubFalse_1;

    module.exports = isBuffer;
    });

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER = 9007199254740991;

    /** Used to detect unsigned integer values. */
    var reIsUint = /^(?:0|[1-9]\d*)$/;

    /**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */
    function isIndex(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER : length;

      return !!length &&
        (type == 'number' ||
          (type != 'symbol' && reIsUint.test(value))) &&
            (value > -1 && value % 1 == 0 && value < length);
    }

    var _isIndex = isIndex;

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER$1 = 9007199254740991;

    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This method is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
     * @example
     *
     * _.isLength(3);
     * // => true
     *
     * _.isLength(Number.MIN_VALUE);
     * // => false
     *
     * _.isLength(Infinity);
     * // => false
     *
     * _.isLength('3');
     * // => false
     */
    function isLength(value) {
      return typeof value == 'number' &&
        value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
    }

    var isLength_1 = isLength;

    /** `Object#toString` result references. */
    var argsTag$1 = '[object Arguments]',
        arrayTag = '[object Array]',
        boolTag = '[object Boolean]',
        dateTag = '[object Date]',
        errorTag = '[object Error]',
        funcTag = '[object Function]',
        mapTag = '[object Map]',
        numberTag = '[object Number]',
        objectTag = '[object Object]',
        regexpTag = '[object RegExp]',
        setTag = '[object Set]',
        stringTag = '[object String]',
        weakMapTag = '[object WeakMap]';

    var arrayBufferTag = '[object ArrayBuffer]',
        dataViewTag = '[object DataView]',
        float32Tag = '[object Float32Array]',
        float64Tag = '[object Float64Array]',
        int8Tag = '[object Int8Array]',
        int16Tag = '[object Int16Array]',
        int32Tag = '[object Int32Array]',
        uint8Tag = '[object Uint8Array]',
        uint8ClampedTag = '[object Uint8ClampedArray]',
        uint16Tag = '[object Uint16Array]',
        uint32Tag = '[object Uint32Array]';

    /** Used to identify `toStringTag` values of typed arrays. */
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
    typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
    typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
    typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
    typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
    typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
    typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
    typedArrayTags[errorTag] = typedArrayTags[funcTag] =
    typedArrayTags[mapTag] = typedArrayTags[numberTag] =
    typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
    typedArrayTags[setTag] = typedArrayTags[stringTag] =
    typedArrayTags[weakMapTag] = false;

    /**
     * The base implementation of `_.isTypedArray` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     */
    function baseIsTypedArray(value) {
      return isObjectLike_1(value) &&
        isLength_1(value.length) && !!typedArrayTags[_baseGetTag(value)];
    }

    var _baseIsTypedArray = baseIsTypedArray;

    /**
     * The base implementation of `_.unary` without support for storing metadata.
     *
     * @private
     * @param {Function} func The function to cap arguments for.
     * @returns {Function} Returns the new capped function.
     */
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }

    var _baseUnary = baseUnary;

    var _nodeUtil = createCommonjsModule(function (module, exports) {
    /** Detect free variable `exports`. */
    var freeExports =  exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Detect free variable `process` from Node.js. */
    var freeProcess = moduleExports && _freeGlobal.process;

    /** Used to access faster Node.js helpers. */
    var nodeUtil = (function() {
      try {
        // Use `util.types` for Node.js 10+.
        var types = freeModule && freeModule.require && freeModule.require('util').types;

        if (types) {
          return types;
        }

        // Legacy `process.binding('util')` for Node.js < 10.
        return freeProcess && freeProcess.binding && freeProcess.binding('util');
      } catch (e) {}
    }());

    module.exports = nodeUtil;
    });

    /* Node.js helper references. */
    var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;

    /**
     * Checks if `value` is classified as a typed array.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     * @example
     *
     * _.isTypedArray(new Uint8Array);
     * // => true
     *
     * _.isTypedArray([]);
     * // => false
     */
    var isTypedArray = nodeIsTypedArray ? _baseUnary(nodeIsTypedArray) : _baseIsTypedArray;

    var isTypedArray_1 = isTypedArray;

    /** Used for built-in method references. */
    var objectProto$3 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

    /**
     * Creates an array of the enumerable property names of the array-like `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @param {boolean} inherited Specify returning inherited property names.
     * @returns {Array} Returns the array of property names.
     */
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray_1(value),
          isArg = !isArr && isArguments_1(value),
          isBuff = !isArr && !isArg && isBuffer_1(value),
          isType = !isArr && !isArg && !isBuff && isTypedArray_1(value),
          skipIndexes = isArr || isArg || isBuff || isType,
          result = skipIndexes ? _baseTimes(value.length, String) : [],
          length = result.length;

      for (var key in value) {
        if ((inherited || hasOwnProperty$2.call(value, key)) &&
            !(skipIndexes && (
               // Safari 9 has enumerable `arguments.length` in strict mode.
               key == 'length' ||
               // Node.js 0.10 has enumerable non-index properties on buffers.
               (isBuff && (key == 'offset' || key == 'parent')) ||
               // PhantomJS 2 has enumerable non-index properties on typed arrays.
               (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
               // Skip index properties.
               _isIndex(key, length)
            ))) {
          result.push(key);
        }
      }
      return result;
    }

    var _arrayLikeKeys = arrayLikeKeys;

    /** Used for built-in method references. */
    var objectProto$4 = Object.prototype;

    /**
     * Checks if `value` is likely a prototype object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
     */
    function isPrototype(value) {
      var Ctor = value && value.constructor,
          proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$4;

      return value === proto;
    }

    var _isPrototype = isPrototype;

    /**
     * Creates a unary function that invokes `func` with its argument transformed.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {Function} transform The argument transform.
     * @returns {Function} Returns the new function.
     */
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }

    var _overArg = overArg;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeKeys = _overArg(Object.keys, Object);

    var _nativeKeys = nativeKeys;

    /** Used for built-in method references. */
    var objectProto$5 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$3 = objectProto$5.hasOwnProperty;

    /**
     * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeys(object) {
      if (!_isPrototype(object)) {
        return _nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty$3.call(object, key) && key != 'constructor') {
          result.push(key);
        }
      }
      return result;
    }

    var _baseKeys = baseKeys;

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    var isObject_1 = isObject;

    /** `Object#toString` result references. */
    var asyncTag = '[object AsyncFunction]',
        funcTag$1 = '[object Function]',
        genTag = '[object GeneratorFunction]',
        proxyTag = '[object Proxy]';

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    function isFunction(value) {
      if (!isObject_1(value)) {
        return false;
      }
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 9 which returns 'object' for typed arrays and other constructors.
      var tag = _baseGetTag(value);
      return tag == funcTag$1 || tag == genTag || tag == asyncTag || tag == proxyTag;
    }

    var isFunction_1 = isFunction;

    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * _.isArrayLike([1, 2, 3]);
     * // => true
     *
     * _.isArrayLike(document.body.children);
     * // => true
     *
     * _.isArrayLike('abc');
     * // => true
     *
     * _.isArrayLike(_.noop);
     * // => false
     */
    function isArrayLike(value) {
      return value != null && isLength_1(value.length) && !isFunction_1(value);
    }

    var isArrayLike_1 = isArrayLike;

    /**
     * Creates an array of the own enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects. See the
     * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * for more details.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keys(new Foo);
     * // => ['a', 'b'] (iteration order is not guaranteed)
     *
     * _.keys('hi');
     * // => ['0', '1']
     */
    function keys(object) {
      return isArrayLike_1(object) ? _arrayLikeKeys(object) : _baseKeys(object);
    }

    var keys_1 = keys;

    /**
     * Creates an array of the own enumerable string keyed property values of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property values.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.values(new Foo);
     * // => [1, 2] (iteration order is not guaranteed)
     *
     * _.values('hi');
     * // => ['h', 'i']
     */
    function values(object) {
      return object == null ? [] : _baseValues(object, keys_1(object));
    }

    var values_1 = values;

    /**
     * The base implementation of `_.shuffle`.
     *
     * @private
     * @param {Array|Object} collection The collection to shuffle.
     * @returns {Array} Returns the new shuffled array.
     */
    function baseShuffle(collection) {
      return _shuffleSelf(values_1(collection));
    }

    var _baseShuffle = baseShuffle;

    /**
     * Creates an array of shuffled values, using a version of the
     * [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle).
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object} collection The collection to shuffle.
     * @returns {Array} Returns the new shuffled array.
     * @example
     *
     * _.shuffle([1, 2, 3, 4]);
     * // => [4, 1, 3, 2]
     */
    function shuffle(collection) {
      var func = isArray_1(collection) ? _arrayShuffle : _baseShuffle;
      return func(collection);
    }

    var shuffle_1 = shuffle;

    var Quiz = /** @class */ (function () {
        function Quiz(name, quizQuestions, options) {
            var _this = this;
            this.getName = function () { return _this.name; };
            this.getQuestion = function (nr) { return _this.quizQuestions[nr]; };
            this.getAnsweredQuestions = function () {
                return _this.quizQuestions.filter(function (q) { return q.getLastSubmittedAnswer() != undefined; });
            };
            this.getAllQuestions = function () { return _this.quizQuestions; };
            if (options.shuffled) {
                this.quizQuestions = shuffle_1(quizQuestions);
            }
            else {
                this.quizQuestions = quizQuestions;
            }
            this.name = name;
        }
        return Quiz;
    }());
    //# sourceMappingURL=Quiz.js.map

    var Signs;
    (function (Signs) {
        Signs["Mult"] = "x";
        Signs["Equal"] = "=";
    })(Signs || (Signs = {}));
    var MultiplicationEquation = /** @class */ (function () {
        function MultiplicationEquation(value1, value2) {
            var _this = this;
            this.formatRHEq = function () { return [_this.value1, "x", _this.value2, "=", _this.result]; }; // delete this
            this.getResult = function () { return _this.value1 * _this.value2; }; // delete this
            this.value1 = value1;
            this.value2 = value2;
            this.result = value1 * value2;
        }
        return MultiplicationEquation;
    }());
    var RHSMultiplicationEquation = /** @class */ (function (_super) {
        __extends(RHSMultiplicationEquation, _super);
        function RHSMultiplicationEquation(value1, value2) {
            var _this = _super.call(this, value1, value2) || this;
            _this.getAsArray = function () { return [
                _this.value1,
                Signs.Mult,
                _this.value2,
                Signs.Equal,
                _this.result
            ]; };
            return _this;
        }
        return RHSMultiplicationEquation;
    }(MultiplicationEquation));
    var LHSMultiplicationEquation = /** @class */ (function (_super) {
        __extends(LHSMultiplicationEquation, _super);
        function LHSMultiplicationEquation(value1, value2) {
            var _this = _super.call(this, value1, value2) || this;
            _this.getAsArray = function () { return [
                _this.result,
                Signs.Equal,
                _this.value1,
                Signs.Mult,
                _this.value2
            ]; };
            return _this;
        }
        return LHSMultiplicationEquation;
    }(MultiplicationEquation));
    //# sourceMappingURL=MultiplicationEquation.js.map

    var Range = /** @class */ (function () {
        function Range(range, Element) {
            var _this = this;
            this.get = function () { return _this.range; };
            this.range = buildFlatArrayOfIndexedElements(range, Element);
        }
        return Range;
    }());
    var buildFlatArrayOfIndexedElements = function (range, Element) {
        return __spreadArrays(new Array(range.xMax)).slice(range.xMin, range.xMax)
            .map(function (_, i) { return (range.xMin ? i + range.xMin : i); })
            .map(function (i) {
            return __spreadArrays(new Array(range.yMax)).slice(range.yMin, range.yMax)
                .map(function (_, j) { return (range.yMin ? j + range.yMin : j); })
                .map(function (j) { return new Element(i + 1, j + 1); });
        })
            .flat();
    };
    //# sourceMappingURL=range.js.map

    var EquationShapes;
    (function (EquationShapes) {
        EquationShapes["x*y=_"] = "x*y=_";
        EquationShapes["x*_=z"] = "x*_=z";
        EquationShapes["_*y=z"] = "_*y=z";
        EquationShapes["_=x*y"] = "_=x*y";
        EquationShapes["z=_*y"] = "z=_*y";
        EquationShapes["z=x*_"] = "z=x*_";
    })(EquationShapes || (EquationShapes = {}));
    var buildEquations = function (range, shape) {
        return new Range(range, isEquationLeftHandSide(shape)
            ? LHSMultiplicationEquation
            : RHSMultiplicationEquation).get();
    };
    var buildEquationsAsArrays = function (range, shape) {
        return buildEquations(range, shape).map(function (eq) { return eq.getAsArray(); });
    };
    var isEquationLeftHandSide = function (equationShape) {
        console.log(equationShape);
        return equationShape.indexOf(Signs.Equal) < equationShape.length - 3;
    };
    //# sourceMappingURL=MultiplicationEquationBuilder.js.map

    var QuizQuestion = /** @class */ (function () {
        function QuizQuestion(ID, question, correctAnswers, listeners) {
            if (correctAnswers === void 0) { correctAnswers = []; }
            this.ID = ID;
            this.question = question;
            this.correctAnswers = correctAnswers;
            this.submittedAnswers = [];
            this.correctAnswerCount = 0;
            this.ID = ID;
            this.question = question;
            this.correctAnswers = correctAnswers;
            this.listeners = listeners;
        }
        QuizQuestion.prototype.getAsArray = function () {
            return this.question;
        };
        QuizQuestion.prototype.getLastSubmittedAnswer = function () {
            return this.submittedAnswers[this.submittedAnswers.length - 1];
        };
        QuizQuestion.prototype.submitAnswer = function (submittedAnswer) {
            if (this.correctAnswers.includes(submittedAnswer)) {
                this.correctAnswerCount = this.correctAnswerCount + 1;
                this.listeners.onSubmitCorrectAnswer(this.ID);
            }
            else {
                this.listeners.onSubmitIncorrectAnswer(this.ID);
            }
            this.submittedAnswers.push(submittedAnswer);
            this.listeners.onSubmitAnswer();
        };
        return QuizQuestion;
    }());
    //# sourceMappingURL=QuizQuestion.js.map

    var INPUT_SYMBOL = "_";
    var MULTIPLICATION_TABLE = "multiplication-table";
    //# sourceMappingURL=constants.js.map

    function convertEquationToQuizQuestion(equation, id, listeners) {
        var inputPosition = id.indexOf(INPUT_SYMBOL) > -1 ? id.indexOf(INPUT_SYMBOL) : id.length - 1;
        var question = __spreadArrays(equation.slice(0, inputPosition), [
            INPUT_SYMBOL
        ], equation.slice(inputPosition + 1, equation.length));
        var correctAnswers = [equation[inputPosition].toString()];
        return new QuizQuestion(id, question, correctAnswers, listeners);
    }
    //# sourceMappingURL=convertEquationToQuizQuestion.js.map

    function createEquationQuizzesFromConfig(config, listeners) {
        return config.map(function (_a) {
            var shape = _a.shape, range = _a.range, name = _a.name;
            var isMultiplicationTable = name === MULTIPLICATION_TABLE;
            var equations = buildEquationsAsArrays(range, shape);
            var quizQuestions = equations.map(function (equation, i) {
                return convertEquationToQuizQuestion(equation, shape + "-" + i, listeners);
            });
            return new Quiz(name || shape, quizQuestions, {
                shuffled: !isMultiplicationTable
            });
        });
    }
    var quizConfig = [
        {
            shape: EquationShapes["x*y=_"],
            range: {
                xMin: 1,
                xMax: 10,
                yMin: 1,
                yMax: 10
            }
        },
        {
            shape: EquationShapes["_*y=z"],
            range: {
                xMin: 1,
                xMax: 10,
                yMin: 1,
                yMax: 10
            }
        },
        {
            shape: EquationShapes["z=_*y"],
            range: {
                xMin: 1,
                xMax: 10,
                yMin: 1,
                yMax: 10
            }
        },
        {
            shape: EquationShapes["x*y=_"],
            name: MULTIPLICATION_TABLE,
            range: {
                xMin: 0,
                xMax: 10,
                yMin: 0,
                yMax: 10
            }
        }
    ];
    //# sourceMappingURL=quiz-setup.js.map

    function createQuizStore(quizzes) {
        var quizNames = quizzes.map(function (quiz) { return quiz.getName(); });
        var _a = writable({
            quizName: quizNames[0],
            questionNo: 0
        }), subscribe = _a.subscribe, update = _a.update;
        var currentQuizName;
        var currentQuestionNo;
        subscribe(function (val) {
            currentQuizName = val.quizName;
            currentQuestionNo = val.questionNo;
        });
        var next = function () { return update(function (n) { return (__assign(__assign({}, n), { quizName: n.quizName + 1 })); }); };
        var previous = function () { return update(function (n) { return (__assign(__assign({}, n), { quizName: n.quizName - 1 })); }); };
        var goTo = function (quizName) { return update(function (n) { return (__assign(__assign({}, n), { quizName: quizName })); }); };
        var getAllQuizNames = function () { return quizNames; };
        var getCurrentQuiz = function () { return quizzes[quizNames.indexOf(currentQuizName)]; };
        var getCurrentQuestion = function () {
            return getCurrentQuiz().getQuestion(currentQuestionNo);
        };
        var onSubmitAnswer = function () {
            return update(function (n) { return (__assign(__assign({}, n), { questionNo: n.questionNo + 1 })); });
        };
        return {
            subscribe: subscribe,
            next: next,
            previous: previous,
            goTo: goTo,
            getAllQuizNames: getAllQuizNames,
            getCurrentQuiz: getCurrentQuiz,
            getCurrentQuestion: getCurrentQuestion,
            onSubmitAnswer: onSubmitAnswer
        };
    }
    var listeners = {
        onSubmitAnswer: function () { },
        onSubmitCorrectAnswer: function () { return scoreStore.increment(); },
        onSubmitIncorrectAnswer: function () { return scoreStore.resetStrike(); }
    };
    var quizzes = createEquationQuizzesFromConfig(quizConfig, listeners);
    var quizStore = createQuizStore(quizzes);
    //# sourceMappingURL=quizStore.js.map

    /* src/GenericComponents/NumericDisplay.svelte generated by Svelte v3.12.1 */

    const file = "src/GenericComponents/NumericDisplay.svelte";

    function create_fragment(ctx) {
    	var div1, span0, t0, t1, span1, t2, t3, div0, current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			span0 = element("span");
    			t0 = text(ctx.text);
    			t1 = space();
    			span1 = element("span");
    			t2 = text(ctx.numbers);
    			t3 = space();
    			div0 = element("div");

    			if (default_slot) default_slot.c();
    			attr_dev(span0, "class", "text svelte-ymf6jt");
    			add_location(span0, file, 28, 2, 394);
    			attr_dev(span1, "class", "numbers svelte-ymf6jt");
    			add_location(span1, file, 29, 2, 429);

    			attr_dev(div0, "class", "relative svelte-ymf6jt");
    			add_location(div0, file, 30, 2, 470);
    			attr_dev(div1, "class", "timer-wrapper svelte-ymf6jt");
    			add_location(div1, file, 26, 0, 363);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div0_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span0);
    			append_dev(span0, t0);
    			append_dev(div1, t1);
    			append_dev(div1, span1);
    			append_dev(span1, t2);
    			append_dev(div1, t3);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!current || changed.text) {
    				set_data_dev(t0, ctx.text);
    			}

    			if (!current || changed.numbers) {
    				set_data_dev(t2, ctx.numbers);
    			}

    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div1);
    			}

    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { text, numbers } = $$props;

    	const writable_props = ['text', 'numbers'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<NumericDisplay> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('text' in $$props) $$invalidate('text', text = $$props.text);
    		if ('numbers' in $$props) $$invalidate('numbers', numbers = $$props.numbers);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { text, numbers };
    	};

    	$$self.$inject_state = $$props => {
    		if ('text' in $$props) $$invalidate('text', text = $$props.text);
    		if ('numbers' in $$props) $$invalidate('numbers', numbers = $$props.numbers);
    	};

    	return { text, numbers, $$slots, $$scope };
    }

    class NumericDisplay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["text", "numbers"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "NumericDisplay", options, id: create_fragment.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.text === undefined && !('text' in props)) {
    			console.warn("<NumericDisplay> was created without expected prop 'text'");
    		}
    		if (ctx.numbers === undefined && !('numbers' in props)) {
    			console.warn("<NumericDisplay> was created without expected prop 'numbers'");
    		}
    	}

    	get text() {
    		throw new Error("<NumericDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<NumericDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get numbers() {
    		throw new Error("<NumericDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set numbers(value) {
    		throw new Error("<NumericDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Layout/Header.svelte generated by Svelte v3.12.1 */

    const file$1 = "src/Layout/Header.svelte";

    // (64:2) <NumericDisplay text="score" numbers={score}>
    function create_default_slot(ctx) {
    	var div2, div0, t0, t1, div1, t2;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(ctx.strikeText);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(ctx.strikeLength);
    			attr_dev(div0, "class", "text svelte-1y2uj2o");
    			add_location(div0, file$1, 65, 6, 1172);
    			attr_dev(div1, "class", "number svelte-1y2uj2o");
    			add_location(div1, file$1, 66, 6, 1215);
    			attr_dev(div2, "class", "strike svelte-1y2uj2o");
    			add_location(div2, file$1, 64, 4, 1145);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    		},

    		p: function update(changed, ctx) {
    			if (changed.strikeText) {
    				set_data_dev(t0, ctx.strikeText);
    			}

    			if (changed.strikeLength) {
    				set_data_dev(t2, ctx.strikeLength);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div2);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot.name, type: "slot", source: "(64:2) <NumericDisplay text=\"score\" numbers={score}>", ctx });
    	return block;
    }

    function create_fragment$1(ctx) {
    	var div, t0, h1, t2, current;

    	var numericdisplay0 = new NumericDisplay({
    		props: { text: "timer", numbers: timer },
    		$$inline: true
    	});

    	var numericdisplay1 = new NumericDisplay({
    		props: {
    		text: "score",
    		numbers: ctx.score,
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			numericdisplay0.$$.fragment.c();
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Count Fast!";
    			t2 = space();
    			numericdisplay1.$$.fragment.c();
    			attr_dev(h1, "class", "title svelte-1y2uj2o");
    			add_location(h1, file$1, 61, 2, 1057);
    			attr_dev(div, "class", "wrapper svelte-1y2uj2o");
    			add_location(div, file$1, 57, 0, 981);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(numericdisplay0, div, null);
    			append_dev(div, t0);
    			append_dev(div, h1);
    			append_dev(div, t2);
    			mount_component(numericdisplay1, div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var numericdisplay1_changes = {};
    			if (changed.score) numericdisplay1_changes.numbers = ctx.score;
    			if (changed.$$scope || changed.strikeLength || changed.strikeText) numericdisplay1_changes.$$scope = { changed, ctx };
    			numericdisplay1.$set(numericdisplay1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(numericdisplay0.$$.fragment, local);

    			transition_in(numericdisplay1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(numericdisplay0.$$.fragment, local);
    			transition_out(numericdisplay1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			destroy_component(numericdisplay0);

    			destroy_component(numericdisplay1);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    let timer = "00:00";

    function instance$1($$self, $$props, $$invalidate) {
    	

      let score;
      let strikeLength;
      let strikeText;

      const scoreStore = getContext("scoreStore");

      scoreStore.subscribe(val => {
        $$invalidate('score', score = val);
      });

      scoreStore.subscribeToStrike(val => {
        $$invalidate('strikeLength', strikeLength = val);
        $$invalidate('strikeText', strikeText = "strike");
      });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('score' in $$props) $$invalidate('score', score = $$props.score);
    		if ('strikeLength' in $$props) $$invalidate('strikeLength', strikeLength = $$props.strikeLength);
    		if ('strikeText' in $$props) $$invalidate('strikeText', strikeText = $$props.strikeText);
    		if ('timer' in $$props) $$invalidate('timer', timer = $$props.timer);
    	};

    	return { score, strikeLength, strikeText };
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Header", options, id: create_fragment$1.name });
    	}
    }

    /* src/Layout/QuizIcon.svelte generated by Svelte v3.12.1 */

    const file$2 = "src/Layout/QuizIcon.svelte";

    function create_fragment$2(ctx) {
    	var div, t, dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(ctx.name);
    			attr_dev(div, "class", "wrapper svelte-1hwm0cr");
    			toggle_class(div, "selected", ctx.isSelected);
    			add_location(div, file$2, 41, 0, 667);
    			dispose = listen_dev(div, "click", ctx.handleClick);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},

    		p: function update(changed, ctx) {
    			if (changed.name) {
    				set_data_dev(t, ctx.name);
    			}

    			if (changed.isSelected) {
    				toggle_class(div, "selected", ctx.isSelected);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { name } = $$props;

      const quizStore = getContext("quizStore");

      let selectedQuizName;

      quizStore.subscribe(value => {
        $$invalidate('selectedQuizName', selectedQuizName = value.quizName);
      });

      const handleClick = () => {
        quizStore.goTo(name);
      };

    	const writable_props = ['name'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<QuizIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    	};

    	$$self.$capture_state = () => {
    		return { name, selectedQuizName, isSelected };
    	};

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    		if ('selectedQuizName' in $$props) $$invalidate('selectedQuizName', selectedQuizName = $$props.selectedQuizName);
    		if ('isSelected' in $$props) $$invalidate('isSelected', isSelected = $$props.isSelected);
    	};

    	let isSelected;

    	$$self.$$.update = ($$dirty = { selectedQuizName: 1, name: 1 }) => {
    		if ($$dirty.selectedQuizName || $$dirty.name) { $$invalidate('isSelected', isSelected = selectedQuizName === name); }
    	};

    	return { name, handleClick, isSelected };
    }

    class QuizIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["name"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "QuizIcon", options, id: create_fragment$2.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.name === undefined && !('name' in props)) {
    			console.warn("<QuizIcon> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<QuizIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<QuizIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Layout/ControlBar.svelte generated by Svelte v3.12.1 */
    const { console: console_1 } = globals;

    const file$3 = "src/Layout/ControlBar.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.name = list[i];
    	return child_ctx;
    }

    // (18:2) {#each names as name (name)}
    function create_each_block(key_1, ctx) {
    	var first, current;

    	var quizicon = new QuizIcon({
    		props: { name: ctx.name },
    		$$inline: true
    	});

    	const block = {
    		key: key_1,

    		first: null,

    		c: function create() {
    			first = empty();
    			quizicon.$$.fragment.c();
    			this.first = first;
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(quizicon, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var quizicon_changes = {};
    			if (changed.names) quizicon_changes.name = ctx.name;
    			quizicon.$set(quizicon_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(quizicon.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(quizicon.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(first);
    			}

    			destroy_component(quizicon, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(18:2) {#each names as name (name)}", ctx });
    	return block;
    }

    function create_fragment$3(ctx) {
    	var div, each_blocks = [], each_1_lookup = new Map(), current;

    	let each_value = ctx.names;

    	const get_key = ctx => ctx.name;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div, "class", "wrapper svelte-1awiuh0");
    			add_location(div, file$3, 15, 0, 230);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			const each_value = ctx.names;

    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block, null, get_each_context);
    			check_outros();
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { names } = $$props;
      console.log(names);

    	const writable_props = ['names'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console_1.warn(`<ControlBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('names' in $$props) $$invalidate('names', names = $$props.names);
    	};

    	$$self.$capture_state = () => {
    		return { names };
    	};

    	$$self.$inject_state = $$props => {
    		if ('names' in $$props) $$invalidate('names', names = $$props.names);
    	};

    	return { names };
    }

    class ControlBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["names"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "ControlBar", options, id: create_fragment$3.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.names === undefined && !('names' in props)) {
    			console_1.warn("<ControlBar> was created without expected prop 'names'");
    		}
    	}

    	get names() {
    		throw new Error("<ControlBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set names(value) {
    		throw new Error("<ControlBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/GenericComponents/NumericInput.svelte generated by Svelte v3.12.1 */
    const { console: console_1$1 } = globals;

    const file$4 = "src/GenericComponents/NumericInput.svelte";

    function create_fragment$4(ctx) {
    	var input, dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "maxlength", ctx.maxLength);
    			attr_dev(input, "class", "svelte-1pma0i4");
    			toggle_class(input, "invalid", ctx.isInvalid);
    			add_location(input, file$4, 49, 0, 819);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler),
    				listen_dev(input, "input", ctx.handleInput),
    				listen_dev(input, "change", ctx.handleSubmit),
    				listen_dev(input, "focus", ctx.handleFocus),
    				listen_dev(input, "keydown", ctx.handleKeydown)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			set_input_value(input, ctx.inputValue);

    			ctx.input_binding(input);
    		},

    		p: function update(changed, ctx) {
    			if (changed.inputValue && (input.value !== ctx.inputValue)) set_input_value(input, ctx.inputValue);

    			if (changed.maxLength) {
    				attr_dev(input, "maxlength", ctx.maxLength);
    			}

    			if (changed.isInvalid) {
    				toggle_class(input, "invalid", ctx.isInvalid);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(input);
    			}

    			ctx.input_binding(null);
    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$4.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { onSubmit, onNavigate, onFocus, isFocused, maxLength } = $$props;

      let inputNode;
      let inputValue = "";
      let isInvalid = false;

      function handleSubmit(e) {
        !isInvalid && onSubmit(e.target.value);
      }

      function handleKeydown(e) {
        !isInvalid && onNavigate(e.key);
      }

      function handleInput() {
        isInvalid && console.log("It's invalid!!!");
      }

      function handleFocus() {
        onFocus();
      }

    	const writable_props = ['onSubmit', 'onNavigate', 'onFocus', 'isFocused', 'maxLength'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console_1$1.warn(`<NumericInput> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		inputValue = this.value;
    		$$invalidate('inputValue', inputValue);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('inputNode', inputNode = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ('onSubmit' in $$props) $$invalidate('onSubmit', onSubmit = $$props.onSubmit);
    		if ('onNavigate' in $$props) $$invalidate('onNavigate', onNavigate = $$props.onNavigate);
    		if ('onFocus' in $$props) $$invalidate('onFocus', onFocus = $$props.onFocus);
    		if ('isFocused' in $$props) $$invalidate('isFocused', isFocused = $$props.isFocused);
    		if ('maxLength' in $$props) $$invalidate('maxLength', maxLength = $$props.maxLength);
    	};

    	$$self.$capture_state = () => {
    		return { onSubmit, onNavigate, onFocus, isFocused, maxLength, inputNode, inputValue, isInvalid };
    	};

    	$$self.$inject_state = $$props => {
    		if ('onSubmit' in $$props) $$invalidate('onSubmit', onSubmit = $$props.onSubmit);
    		if ('onNavigate' in $$props) $$invalidate('onNavigate', onNavigate = $$props.onNavigate);
    		if ('onFocus' in $$props) $$invalidate('onFocus', onFocus = $$props.onFocus);
    		if ('isFocused' in $$props) $$invalidate('isFocused', isFocused = $$props.isFocused);
    		if ('maxLength' in $$props) $$invalidate('maxLength', maxLength = $$props.maxLength);
    		if ('inputNode' in $$props) $$invalidate('inputNode', inputNode = $$props.inputNode);
    		if ('inputValue' in $$props) $$invalidate('inputValue', inputValue = $$props.inputValue);
    		if ('isInvalid' in $$props) $$invalidate('isInvalid', isInvalid = $$props.isInvalid);
    	};

    	$$self.$$.update = ($$dirty = { isFocused: 1, inputNode: 1, inputValue: 1 }) => {
    		if ($$dirty.isFocused || $$dirty.inputNode) { isFocused && inputNode && inputNode.focus(); }
    		if ($$dirty.inputValue) { $$invalidate('isInvalid', isInvalid = inputValue && isNaN(parseInt(inputValue))); }
    	};

    	return {
    		onSubmit,
    		onNavigate,
    		onFocus,
    		isFocused,
    		maxLength,
    		inputNode,
    		inputValue,
    		isInvalid,
    		handleSubmit,
    		handleKeydown,
    		handleInput,
    		handleFocus,
    		input_input_handler,
    		input_binding
    	};
    }

    class NumericInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, ["onSubmit", "onNavigate", "onFocus", "isFocused", "maxLength"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "NumericInput", options, id: create_fragment$4.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.onSubmit === undefined && !('onSubmit' in props)) {
    			console_1$1.warn("<NumericInput> was created without expected prop 'onSubmit'");
    		}
    		if (ctx.onNavigate === undefined && !('onNavigate' in props)) {
    			console_1$1.warn("<NumericInput> was created without expected prop 'onNavigate'");
    		}
    		if (ctx.onFocus === undefined && !('onFocus' in props)) {
    			console_1$1.warn("<NumericInput> was created without expected prop 'onFocus'");
    		}
    		if (ctx.isFocused === undefined && !('isFocused' in props)) {
    			console_1$1.warn("<NumericInput> was created without expected prop 'isFocused'");
    		}
    		if (ctx.maxLength === undefined && !('maxLength' in props)) {
    			console_1$1.warn("<NumericInput> was created without expected prop 'maxLength'");
    		}
    	}

    	get onSubmit() {
    		throw new Error("<NumericInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onSubmit(value) {
    		throw new Error("<NumericInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onNavigate() {
    		throw new Error("<NumericInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onNavigate(value) {
    		throw new Error("<NumericInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onFocus() {
    		throw new Error("<NumericInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onFocus(value) {
    		throw new Error("<NumericInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isFocused() {
    		throw new Error("<NumericInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isFocused(value) {
    		throw new Error("<NumericInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxLength() {
    		throw new Error("<NumericInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxLength(value) {
    		throw new Error("<NumericInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var NavigationHandler = /** @class */ (function () {
        function NavigationHandler(config) {
            this.lastFieldIndex = null;
            this.firstFieldIndex = null;
            this.currentFieldIndex = null;
            this.fieldsToSkip = [];
            this.firstFieldIndex = config.firstFieldIndex;
            this.lastFieldIndex = config.lastFieldIndex;
            this.currentFieldIndex = config.firstFieldIndex;
            this.listener = config.listener;
        }
        NavigationHandler.prototype.goRight = function () {
            if (this.currentFieldIndex + 1 === this.lastFieldIndex) {
                this.currentFieldIndex = this.firstFieldIndex - 1;
            }
            if ((this.currentFieldIndex + 1) % 10 === 0) {
                this.currentFieldIndex = this.currentFieldIndex + 2;
            }
            else {
                this.currentFieldIndex = this.currentFieldIndex + 1;
            }
            if (this.fieldsToSkip.includes(this.currentFieldIndex)) {
                this.goRight();
            }
        };
        NavigationHandler.prototype.goLeft = function () {
            if (this.currentFieldIndex === this.firstFieldIndex) {
                this.currentFieldIndex = this.lastFieldIndex;
            }
            if (this.currentFieldIndex % 10 === 1) {
                this.currentFieldIndex = this.currentFieldIndex - 2;
            }
            else {
                this.currentFieldIndex = this.currentFieldIndex - 1;
            }
            if (this.fieldsToSkip.includes(this.currentFieldIndex)) {
                this.goLeft();
            }
        };
        NavigationHandler.prototype.goDown = function () {
            if (this.currentFieldIndex + 10 > this.lastFieldIndex) {
                this.currentFieldIndex = (this.currentFieldIndex % 10) + 10;
            }
            else {
                this.currentFieldIndex = this.currentFieldIndex + 10;
            }
            if (this.fieldsToSkip.includes(this.currentFieldIndex)) {
                this.goDown();
            }
        };
        NavigationHandler.prototype.goUp = function () {
            if (this.currentFieldIndex - 10 < this.firstFieldIndex) {
                this.currentFieldIndex = this.lastFieldIndex + this.currentFieldIndex - 20;
            }
            else {
                this.currentFieldIndex = this.currentFieldIndex - 10;
            }
            if (this.fieldsToSkip.includes(this.currentFieldIndex)) {
                this.goUp();
            }
        };
        NavigationHandler.prototype.handleKey = function (fieldsToSkip) {
            var _this = this;
            this.fieldsToSkip = fieldsToSkip;
            return function (key) {
                switch (key) {
                    case "ArrowUp":
                        _this.goUp();
                        break;
                    case "ArrowLeft":
                        _this.goLeft();
                        break;
                    case "ArrowRight":
                        _this.goRight();
                        break;
                    case "ArrowDown":
                        _this.goDown();
                        break;
                }
                _this.listener(_this.currentFieldIndex);
            };
        };
        NavigationHandler.prototype.set = function (currentField) {
            this.currentFieldIndex = currentField;
            this.listener(this.currentFieldIndex);
        };
        return NavigationHandler;
    }());
    //# sourceMappingURL=NavigationHandler.js.map

    function parseIndex(string) {
        return parseInt(string.match(/\d+/g)[0]);
    }
    function getXCoord(index) {
        return index % 10;
    }
    function getYCoord(index) {
        return Math.floor(index / 10);
    }
    function checkIfRowFieldShouldBeHighlighted(questionIndex, focusedField) {
        return (getYCoord(parseIndex(questionIndex)) === getYCoord(focusedField) &&
            getXCoord(parseIndex(questionIndex)) <= getXCoord(focusedField));
    }
    function checkIfColumnFieldShouldBeHighlighted(questionIndex, focusedField) {
        return (getXCoord(parseIndex(questionIndex)) === getXCoord(focusedField) &&
            getYCoord(parseIndex(questionIndex)) <= getYCoord(focusedField));
    }
    //# sourceMappingURL=helpers.js.map

    /* src/MultiplicationTable/MultiplicationTable.svelte generated by Svelte v3.12.1 */

    const file$5 = "src/MultiplicationTable/MultiplicationTable.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.question = list[i];
    	return child_ctx;
    }

    // (111:6) {:else}
    function create_else_block(ctx) {
    	var current;

    	function func(...args) {
    		return ctx.func(ctx, ...args);
    	}

    	function func_1(...args) {
    		return ctx.func_1(ctx, ...args);
    	}

    	var numericinput = new NumericInput({
    		props: {
    		index: parseIndex(ctx.question.ID),
    		maxLength: ctx.isCellLast(ctx.question.ID) ? 3 : 2,
    		isFocused: parseIndex(ctx.question.ID) == ctx.focusedFieldIndex,
    		onFocus: func,
    		onSubmit: func_1,
    		onNavigate: ctx.func_2
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			numericinput.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(numericinput, target, anchor);
    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			var numericinput_changes = {};
    			if (changed.setup) numericinput_changes.index = parseIndex(ctx.question.ID);
    			if (changed.setup) numericinput_changes.maxLength = ctx.isCellLast(ctx.question.ID) ? 3 : 2;
    			if (changed.setup || changed.focusedFieldIndex) numericinput_changes.isFocused = parseIndex(ctx.question.ID) == ctx.focusedFieldIndex;
    			if (changed.setup) numericinput_changes.onFocus = func;
    			if (changed.setup) numericinput_changes.onSubmit = func_1;
    			if (changed.allAnsweredFieldsIndexes) numericinput_changes.onNavigate = ctx.func_2;
    			numericinput.$set(numericinput_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(numericinput.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(numericinput.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(numericinput, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block.name, type: "else", source: "(111:6) {:else}", ctx });
    	return block;
    }

    // (109:6) {#if parseIndex(question.ID) < 10 || parseIndex(question.ID) % 10 == 0}
    function create_if_block(ctx) {
    	var div, t_value = ctx.question.correctAnswers[0] + "", t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			add_location(div, file$5, 109, 8, 2710);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.setup) && t_value !== (t_value = ctx.question.correctAnswers[0] + "")) {
    				set_data_dev(t, t_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(109:6) {#if parseIndex(question.ID) < 10 || parseIndex(question.ID) % 10 == 0}", ctx });
    	return block;
    }

    // (98:2) {#each setup.getAllQuestions() as question (question.ID)}
    function create_each_block$1(key_1, ctx) {
    	var div, show_if, current_block_type_index, if_block, t, current;

    	var if_block_creators = [
    		create_if_block,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if ((show_if == null) || changed.setup) show_if = !!(parseIndex(ctx.question.ID) < 10 || parseIndex(ctx.question.ID) % 10 == 0);
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		key: key_1,

    		first: null,

    		c: function create() {
    			div = element("div");
    			if_block.c();
    			t = space();
    			attr_dev(div, "class", "" + 'cell' + " svelte-2abusy");
    			toggle_class(div, "title", parseIndex(ctx.question.ID) < 10 || parseIndex(ctx.question.ID) % 10 == 0);
    			toggle_class(div, "correct", ctx.fieldsAnsweredCorrectly.includes(ctx.question.ID));
    			toggle_class(div, "incorrect", ctx.fieldsAnsweredInorrectly.includes(ctx.question.ID));
    			toggle_class(div, "highlighted-column", checkIfColumnFieldShouldBeHighlighted(ctx.question.ID, ctx.focusedFieldIndex));
    			toggle_class(div, "highlighted-row", checkIfRowFieldShouldBeHighlighted(ctx.question.ID, ctx.focusedFieldIndex));
    			toggle_class(div, "focused-field", parseIndex(ctx.question.ID) === ctx.focusedFieldIndex);
    			toggle_class(div, "cell-last", ctx.isCellLast(ctx.question.ID));
    			add_location(div, file$5, 98, 4, 2049);
    			this.first = div;
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			append_dev(div, t);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(div, t);
    			}

    			if ((changed.parseIndex || changed.setup)) {
    				toggle_class(div, "title", parseIndex(ctx.question.ID) < 10 || parseIndex(ctx.question.ID) % 10 == 0);
    			}

    			if ((changed.fieldsAnsweredCorrectly || changed.setup)) {
    				toggle_class(div, "correct", ctx.fieldsAnsweredCorrectly.includes(ctx.question.ID));
    			}

    			if ((changed.fieldsAnsweredInorrectly || changed.setup)) {
    				toggle_class(div, "incorrect", ctx.fieldsAnsweredInorrectly.includes(ctx.question.ID));
    			}

    			if ((changed.checkIfColumnFieldShouldBeHighlighted || changed.setup || changed.focusedFieldIndex)) {
    				toggle_class(div, "highlighted-column", checkIfColumnFieldShouldBeHighlighted(ctx.question.ID, ctx.focusedFieldIndex));
    			}

    			if ((changed.checkIfRowFieldShouldBeHighlighted || changed.setup || changed.focusedFieldIndex)) {
    				toggle_class(div, "highlighted-row", checkIfRowFieldShouldBeHighlighted(ctx.question.ID, ctx.focusedFieldIndex));
    			}

    			if ((changed.parseIndex || changed.setup || changed.focusedFieldIndex)) {
    				toggle_class(div, "focused-field", parseIndex(ctx.question.ID) === ctx.focusedFieldIndex);
    			}

    			if ((changed.isCellLast || changed.setup)) {
    				toggle_class(div, "cell-last", ctx.isCellLast(ctx.question.ID));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			if_blocks[current_block_type_index].d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$1.name, type: "each", source: "(98:2) {#each setup.getAllQuestions() as question (question.ID)}", ctx });
    	return block;
    }

    function create_fragment$5(ctx) {
    	var div, each_blocks = [], each_1_lookup = new Map(), current;

    	let each_value = ctx.setup.getAllQuestions();

    	const get_key = ctx => ctx.question.ID;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div, "class", "table-wrapper svelte-2abusy");
    			add_location(div, file$5, 96, 0, 1957);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			const each_value = ctx.setup.getAllQuestions();

    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    			check_outros();
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$5.name, type: "component", source: "", ctx });
    	return block;
    }

    let firstFieldIndex = 11;

    let lastFieldIndex = 100;

    function instance$5($$self, $$props, $$invalidate) {
    	

      let { setup } = $$props;
      let fieldsAnsweredCorrectly = [];
      let fieldsAnsweredInorrectly = [];

      const navigationHandler = new NavigationHandler({
        firstFieldIndex,
        lastFieldIndex,
        listener: val => {
          $$invalidate('focusedFieldIndex', focusedFieldIndex = val);
        }
      });

      function handleFocus(index) {
        navigationHandler.set(index);
      }

      function isCellLast(questionIndex) {
        return parseIndex(questionIndex) === setup.getAllQuestions().length - 1;
      }

    	const writable_props = ['setup'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<MultiplicationTable> was created with unknown prop '${key}'`);
    	});

    	const func = ({ question }, el) => handleFocus(parseIndex(question.ID));

    	const func_1 = ({ question }, answer) => question.submitAnswer(answer);

    	const func_2 = (key) => navigationHandler.handleKey(allAnsweredFieldsIndexes)(key);

    	$$self.$set = $$props => {
    		if ('setup' in $$props) $$invalidate('setup', setup = $$props.setup);
    	};

    	$$self.$capture_state = () => {
    		return { setup, firstFieldIndex, lastFieldIndex, fieldsAnsweredCorrectly, fieldsAnsweredInorrectly, focusedFieldIndex, allAnsweredFieldsIndexes };
    	};

    	$$self.$inject_state = $$props => {
    		if ('setup' in $$props) $$invalidate('setup', setup = $$props.setup);
    		if ('firstFieldIndex' in $$props) $$invalidate('firstFieldIndex', firstFieldIndex = $$props.firstFieldIndex);
    		if ('lastFieldIndex' in $$props) lastFieldIndex = $$props.lastFieldIndex;
    		if ('fieldsAnsweredCorrectly' in $$props) $$invalidate('fieldsAnsweredCorrectly', fieldsAnsweredCorrectly = $$props.fieldsAnsweredCorrectly);
    		if ('fieldsAnsweredInorrectly' in $$props) $$invalidate('fieldsAnsweredInorrectly', fieldsAnsweredInorrectly = $$props.fieldsAnsweredInorrectly);
    		if ('focusedFieldIndex' in $$props) $$invalidate('focusedFieldIndex', focusedFieldIndex = $$props.focusedFieldIndex);
    		if ('allAnsweredFieldsIndexes' in $$props) $$invalidate('allAnsweredFieldsIndexes', allAnsweredFieldsIndexes = $$props.allAnsweredFieldsIndexes);
    	};

    	let focusedFieldIndex, allAnsweredFieldsIndexes;

    	$$self.$$.update = ($$dirty = { firstFieldIndex: 1, fieldsAnsweredCorrectly: 1, fieldsAnsweredInorrectly: 1 }) => {
    		if ($$dirty.firstFieldIndex) { $$invalidate('focusedFieldIndex', focusedFieldIndex = firstFieldIndex); }
    		if ($$dirty.fieldsAnsweredCorrectly || $$dirty.fieldsAnsweredInorrectly) { $$invalidate('allAnsweredFieldsIndexes', allAnsweredFieldsIndexes = [
            ...fieldsAnsweredCorrectly,
            ...fieldsAnsweredInorrectly
          ].map(parseIndex)); }
    	};

    	return {
    		setup,
    		fieldsAnsweredCorrectly,
    		fieldsAnsweredInorrectly,
    		navigationHandler,
    		handleFocus,
    		isCellLast,
    		focusedFieldIndex,
    		allAnsweredFieldsIndexes,
    		func,
    		func_1,
    		func_2
    	};
    }

    class MultiplicationTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, ["setup"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "MultiplicationTable", options, id: create_fragment$5.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.setup === undefined && !('setup' in props)) {
    			console.warn("<MultiplicationTable> was created without expected prop 'setup'");
    		}
    	}

    	get setup() {
    		throw new Error("<MultiplicationTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set setup(value) {
    		throw new Error("<MultiplicationTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/GenericComponents/NumericInputv2.svelte generated by Svelte v3.12.1 */

    const file$6 = "src/GenericComponents/NumericInputv2.svelte";

    function create_fragment$6(ctx) {
    	var input, dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "maxlength", ctx.maxLength);
    			input.disabled = ctx.submittedValue;
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-tjp536");
    			toggle_class(input, "focused", ctx.isFocused);
    			toggle_class(input, "blurred", !ctx.isFocused);
    			add_location(input, file$6, 60, 0, 1044);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler),
    				listen_dev(input, "focus", ctx.handleFocus),
    				listen_dev(input, "blur", ctx.handleBlur),
    				listen_dev(input, "input", ctx.handleInput),
    				listen_dev(input, "change", ctx.handleSubmit),
    				listen_dev(input, "keydown", ctx.handleKeydown)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			set_input_value(input, ctx.inputValue);

    			ctx.input_binding(input);
    		},

    		p: function update(changed, ctx) {
    			if (changed.inputValue && (input.value !== ctx.inputValue)) set_input_value(input, ctx.inputValue);

    			if (changed.maxLength) {
    				attr_dev(input, "maxlength", ctx.maxLength);
    			}

    			if (changed.submittedValue) {
    				prop_dev(input, "disabled", ctx.submittedValue);
    			}

    			if (changed.isFocused) {
    				toggle_class(input, "focused", ctx.isFocused);
    				toggle_class(input, "blurred", !ctx.isFocused);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(input);
    			}

    			ctx.input_binding(null);
    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$6.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { submittedValue, onSubmit, onNavigate, onFocus, maxLength } = $$props;

      let inputNode;
      let inputValue = submittedValue || "";
      let isFocused;

      const handleFocus = () => {
        $$invalidate('isFocused', isFocused = true);
      };

      const handleBlur = () => {
        $$invalidate('isFocused', isFocused = false);
      };

      const handleInput = e => {
        if (isNaN(parseInt(e.data))) {
          $$invalidate('inputValue', inputValue = inputValue.slice(0, inputValue.length - 1));
        }
      };

      const handleSubmit = () => {
        onSubmit(inputValue);
        $$invalidate('inputValue', inputValue = "");
      };

      const handleKeydown = e => {
        if (typeof onNavigate === "function") onNavigate(e.key);
      };

    	const writable_props = ['submittedValue', 'onSubmit', 'onNavigate', 'onFocus', 'maxLength'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<NumericInputv2> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		inputValue = this.value;
    		$$invalidate('inputValue', inputValue);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('inputNode', inputNode = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ('submittedValue' in $$props) $$invalidate('submittedValue', submittedValue = $$props.submittedValue);
    		if ('onSubmit' in $$props) $$invalidate('onSubmit', onSubmit = $$props.onSubmit);
    		if ('onNavigate' in $$props) $$invalidate('onNavigate', onNavigate = $$props.onNavigate);
    		if ('onFocus' in $$props) $$invalidate('onFocus', onFocus = $$props.onFocus);
    		if ('maxLength' in $$props) $$invalidate('maxLength', maxLength = $$props.maxLength);
    	};

    	$$self.$capture_state = () => {
    		return { submittedValue, onSubmit, onNavigate, onFocus, maxLength, inputNode, inputValue, isFocused };
    	};

    	$$self.$inject_state = $$props => {
    		if ('submittedValue' in $$props) $$invalidate('submittedValue', submittedValue = $$props.submittedValue);
    		if ('onSubmit' in $$props) $$invalidate('onSubmit', onSubmit = $$props.onSubmit);
    		if ('onNavigate' in $$props) $$invalidate('onNavigate', onNavigate = $$props.onNavigate);
    		if ('onFocus' in $$props) $$invalidate('onFocus', onFocus = $$props.onFocus);
    		if ('maxLength' in $$props) $$invalidate('maxLength', maxLength = $$props.maxLength);
    		if ('inputNode' in $$props) $$invalidate('inputNode', inputNode = $$props.inputNode);
    		if ('inputValue' in $$props) $$invalidate('inputValue', inputValue = $$props.inputValue);
    		if ('isFocused' in $$props) $$invalidate('isFocused', isFocused = $$props.isFocused);
    	};

    	$$self.$$.update = ($$dirty = { inputNode: 1, submittedValue: 1 }) => {
    		if ($$dirty.inputNode || $$dirty.submittedValue) { inputNode && !submittedValue && inputNode.focus(); }
    	};

    	return {
    		submittedValue,
    		onSubmit,
    		onNavigate,
    		onFocus,
    		maxLength,
    		inputNode,
    		inputValue,
    		isFocused,
    		handleFocus,
    		handleBlur,
    		handleInput,
    		handleSubmit,
    		handleKeydown,
    		input_input_handler,
    		input_binding
    	};
    }

    class NumericInputv2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, ["submittedValue", "onSubmit", "onNavigate", "onFocus", "maxLength"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "NumericInputv2", options, id: create_fragment$6.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.submittedValue === undefined && !('submittedValue' in props)) {
    			console.warn("<NumericInputv2> was created without expected prop 'submittedValue'");
    		}
    		if (ctx.onSubmit === undefined && !('onSubmit' in props)) {
    			console.warn("<NumericInputv2> was created without expected prop 'onSubmit'");
    		}
    		if (ctx.onNavigate === undefined && !('onNavigate' in props)) {
    			console.warn("<NumericInputv2> was created without expected prop 'onNavigate'");
    		}
    		if (ctx.onFocus === undefined && !('onFocus' in props)) {
    			console.warn("<NumericInputv2> was created without expected prop 'onFocus'");
    		}
    		if (ctx.maxLength === undefined && !('maxLength' in props)) {
    			console.warn("<NumericInputv2> was created without expected prop 'maxLength'");
    		}
    	}

    	get submittedValue() {
    		throw new Error("<NumericInputv2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set submittedValue(value) {
    		throw new Error("<NumericInputv2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onSubmit() {
    		throw new Error("<NumericInputv2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onSubmit(value) {
    		throw new Error("<NumericInputv2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onNavigate() {
    		throw new Error("<NumericInputv2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onNavigate(value) {
    		throw new Error("<NumericInputv2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onFocus() {
    		throw new Error("<NumericInputv2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onFocus(value) {
    		throw new Error("<NumericInputv2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxLength() {
    		throw new Error("<NumericInputv2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxLength(value) {
    		throw new Error("<NumericInputv2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Layout/SingleEquation.svelte generated by Svelte v3.12.1 */

    const file$7 = "src/Layout/SingleEquation.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.element = list[i];
    	return child_ctx;
    }

    // (48:6) {:else}
    function create_else_block$1(ctx) {
    	var div, t_value = ctx.element + "", t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "symbol svelte-1n1izmm");
    			add_location(div, file$7, 48, 8, 986);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.quizQuestion) && t_value !== (t_value = ctx.element + "")) {
    				set_data_dev(t, t_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$1.name, type: "else", source: "(48:6) {:else}", ctx });
    	return block;
    }

    // (41:6) {#if element === INPUT_SYMBOL}
    function create_if_block$1(ctx) {
    	var div, current;

    	var numericinputv2 = new NumericInputv2({
    		props: {
    		maxLength: 3,
    		onSubmit: ctx.onSubmit,
    		submittedValue: ctx.quizQuestion.getLastSubmittedAnswer()
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			numericinputv2.$$.fragment.c();
    			attr_dev(div, "class", "input svelte-1n1izmm");
    			add_location(div, file$7, 41, 8, 784);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(numericinputv2, div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var numericinputv2_changes = {};
    			if (changed.quizQuestion) numericinputv2_changes.submittedValue = ctx.quizQuestion.getLastSubmittedAnswer();
    			numericinputv2.$set(numericinputv2_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(numericinputv2.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(numericinputv2.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			destroy_component(numericinputv2);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$1.name, type: "if", source: "(41:6) {#if element === INPUT_SYMBOL}", ctx });
    	return block;
    }

    // (39:2) {#each quizQuestion.getAsArray() as element}
    function create_each_block$2(ctx) {
    	var div, current_block_type_index, if_block, t, current;

    	var if_block_creators = [
    		create_if_block$1,
    		create_else_block$1
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.element === INPUT_SYMBOL) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			t = space();
    			attr_dev(div, "class", "cell svelte-1n1izmm");
    			add_location(div, file$7, 39, 4, 720);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			append_dev(div, t);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(div, t);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			if_blocks[current_block_type_index].d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$2.name, type: "each", source: "(39:2) {#each quizQuestion.getAsArray() as element}", ctx });
    	return block;
    }

    function create_fragment$7(ctx) {
    	var div, current;

    	let each_value = ctx.quizQuestion.getAsArray();

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div, "class", "wrapper svelte-1n1izmm");
    			add_location(div, file$7, 37, 0, 647);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.quizQuestion || changed.INPUT_SYMBOL || changed.onSubmit) {
    				each_value = ctx.quizQuestion.getAsArray();

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$7.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { quizQuestion, onSubmitAnswer } = $$props;

      const onSubmit = answer => {
        quizQuestion.submitAnswer(answer);
        onSubmitAnswer();
      };

    	const writable_props = ['quizQuestion', 'onSubmitAnswer'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<SingleEquation> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('quizQuestion' in $$props) $$invalidate('quizQuestion', quizQuestion = $$props.quizQuestion);
    		if ('onSubmitAnswer' in $$props) $$invalidate('onSubmitAnswer', onSubmitAnswer = $$props.onSubmitAnswer);
    	};

    	$$self.$capture_state = () => {
    		return { quizQuestion, onSubmitAnswer };
    	};

    	$$self.$inject_state = $$props => {
    		if ('quizQuestion' in $$props) $$invalidate('quizQuestion', quizQuestion = $$props.quizQuestion);
    		if ('onSubmitAnswer' in $$props) $$invalidate('onSubmitAnswer', onSubmitAnswer = $$props.onSubmitAnswer);
    	};

    	return { quizQuestion, onSubmitAnswer, onSubmit };
    }

    class SingleEquation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, ["quizQuestion", "onSubmitAnswer"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "SingleEquation", options, id: create_fragment$7.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.quizQuestion === undefined && !('quizQuestion' in props)) {
    			console.warn("<SingleEquation> was created without expected prop 'quizQuestion'");
    		}
    		if (ctx.onSubmitAnswer === undefined && !('onSubmitAnswer' in props)) {
    			console.warn("<SingleEquation> was created without expected prop 'onSubmitAnswer'");
    		}
    	}

    	get quizQuestion() {
    		throw new Error("<SingleEquation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quizQuestion(value) {
    		throw new Error("<SingleEquation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onSubmitAnswer() {
    		throw new Error("<SingleEquation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onSubmitAnswer(value) {
    		throw new Error("<SingleEquation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Layout/EquationsDisplay.svelte generated by Svelte v3.12.1 */

    const file$8 = "src/Layout/EquationsDisplay.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.answeredEquation = list[i];
    	return child_ctx;
    }

    // (38:4) {#each answeredEquations as answeredEquation (answeredEquation.ID)}
    function create_each_block$3(key_1, ctx) {
    	var first, current;

    	var singleequation = new SingleEquation({
    		props: { quizQuestion: ctx.answeredEquation },
    		$$inline: true
    	});

    	const block = {
    		key: key_1,

    		first: null,

    		c: function create() {
    			first = empty();
    			singleequation.$$.fragment.c();
    			this.first = first;
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(singleequation, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var singleequation_changes = {};
    			if (changed.answeredEquations) singleequation_changes.quizQuestion = ctx.answeredEquation;
    			singleequation.$set(singleequation_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(singleequation.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(singleequation.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(first);
    			}

    			destroy_component(singleequation, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$3.name, type: "each", source: "(38:4) {#each answeredEquations as answeredEquation (answeredEquation.ID)}", ctx });
    	return block;
    }

    function create_fragment$8(ctx) {
    	var div2, div0, each_blocks = [], each_1_lookup = new Map(), t, div1, current;

    	let each_value = ctx.answeredEquations;

    	const get_key = ctx => ctx.answeredEquation.ID;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	var singleequation = new SingleEquation({
    		props: {
    		quizQuestion: ctx.quizQuestion,
    		onSubmitAnswer: ctx.quizStore.onSubmitAnswer
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			div1 = element("div");
    			singleequation.$$.fragment.c();
    			attr_dev(div0, "class", "answered svelte-1h5j0n1");
    			add_location(div0, file$8, 36, 2, 708);
    			attr_dev(div1, "class", "current svelte-1h5j0n1");
    			add_location(div1, file$8, 41, 2, 883);
    			attr_dev(div2, "class", "wrapper svelte-1h5j0n1");
    			add_location(div2, file$8, 35, 0, 684);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div2, t);
    			append_dev(div2, div1);
    			mount_component(singleequation, div1, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			const each_value = ctx.answeredEquations;

    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, div0, outro_and_destroy_block, create_each_block$3, null, get_each_context$3);
    			check_outros();

    			var singleequation_changes = {};
    			if (changed.quizQuestion) singleequation_changes.quizQuestion = ctx.quizQuestion;
    			singleequation.$set(singleequation_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(singleequation.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(singleequation.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div2);
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			destroy_component(singleequation);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$8.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	

      const quizStore = getContext("quizStore");

      let quizQuestion;
      let answeredEquations;

      quizStore.subscribe(val => {
        $$invalidate('quizQuestion', quizQuestion = quizStore.getCurrentQuestion());
        $$invalidate('answeredEquations', answeredEquations = quizStore.getCurrentQuiz().getAnsweredQuestions());
      });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('quizQuestion' in $$props) $$invalidate('quizQuestion', quizQuestion = $$props.quizQuestion);
    		if ('answeredEquations' in $$props) $$invalidate('answeredEquations', answeredEquations = $$props.answeredEquations);
    	};

    	return {
    		quizStore,
    		quizQuestion,
    		answeredEquations
    	};
    }

    class EquationsDisplay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "EquationsDisplay", options, id: create_fragment$8.name });
    	}
    }

    /* src/Layout/QuizDisplay.svelte generated by Svelte v3.12.1 */

    const file$9 = "src/Layout/QuizDisplay.svelte";

    // (28:2) {:else}
    function create_else_block$2(ctx) {
    	var current;

    	var equationsdisplay = new EquationsDisplay({ $$inline: true });

    	const block = {
    		c: function create() {
    			equationsdisplay.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(equationsdisplay, target, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(equationsdisplay.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(equationsdisplay.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(equationsdisplay, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$2.name, type: "else", source: "(28:2) {:else}", ctx });
    	return block;
    }

    // (26:2) {#if isMultiplicationTable}
    function create_if_block$2(ctx) {
    	var current;

    	var multiplicationtable = new MultiplicationTable({
    		props: { setup: ctx.quizStore.getCurrentQuiz() },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			multiplicationtable.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(multiplicationtable, target, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(multiplicationtable.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(multiplicationtable.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(multiplicationtable, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$2.name, type: "if", source: "(26:2) {#if isMultiplicationTable}", ctx });
    	return block;
    }

    function create_fragment$9(ctx) {
    	var div, current_block_type_index, if_block, current;

    	var if_block_creators = [
    		create_if_block$2,
    		create_else_block$2
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.isMultiplicationTable) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "wrapper svelte-1eof4gf");
    			add_location(div, file$9, 24, 0, 577);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			if_blocks[current_block_type_index].d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$9.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	

      const quizStore = getContext("quizStore");

      let isMultiplicationTable;

      quizStore.subscribe(value => {
        $$invalidate('isMultiplicationTable', isMultiplicationTable = value.quizName === MULTIPLICATION_TABLE);
      });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('isMultiplicationTable' in $$props) $$invalidate('isMultiplicationTable', isMultiplicationTable = $$props.isMultiplicationTable);
    	};

    	return { quizStore, isMultiplicationTable };
    }

    class QuizDisplay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "QuizDisplay", options, id: create_fragment$9.name });
    	}
    }

    /* src/App.svelte generated by Svelte v3.12.1 */

    const file$a = "src/App.svelte";

    function create_fragment$a(ctx) {
    	var div, header1, t0, main, t1, footer, current;

    	var header0 = new Header({ $$inline: true });

    	var quizdisplay = new QuizDisplay({ $$inline: true });

    	var controlbar = new ControlBar({
    		props: { names: quizStore.getAllQuizNames() },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			header1 = element("header");
    			header0.$$.fragment.c();
    			t0 = space();
    			main = element("main");
    			quizdisplay.$$.fragment.c();
    			t1 = space();
    			footer = element("footer");
    			controlbar.$$.fragment.c();
    			attr_dev(header1, "class", "header svelte-3wugrf");
    			add_location(header1, file$a, 49, 2, 919);
    			attr_dev(main, "class", "main svelte-3wugrf");
    			add_location(main, file$a, 53, 2, 973);
    			attr_dev(footer, "class", "footer svelte-3wugrf");
    			add_location(footer, file$a, 59, 2, 1028);
    			attr_dev(div, "class", "app svelte-3wugrf");
    			add_location(div, file$a, 47, 0, 898);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, header1);
    			mount_component(header0, header1, null);
    			append_dev(div, t0);
    			append_dev(div, main);
    			mount_component(quizdisplay, main, null);
    			append_dev(div, t1);
    			append_dev(div, footer);
    			mount_component(controlbar, footer, null);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(header0.$$.fragment, local);

    			transition_in(quizdisplay.$$.fragment, local);

    			transition_in(controlbar.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(header0.$$.fragment, local);
    			transition_out(quizdisplay.$$.fragment, local);
    			transition_out(controlbar.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			destroy_component(header0);

    			destroy_component(quizdisplay);

    			destroy_component(controlbar);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$a.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$a($$self) {
    	

      setContext("quizStore", quizStore);
      setContext("scoreStore", scoreStore);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {};

    	return {};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$a.name });
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
