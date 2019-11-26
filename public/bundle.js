
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
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
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
    var Symbol$1 = _root.Symbol;

    var _Symbol = Symbol$1;

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
        return equationShape.indexOf(Signs.Equal) < equationShape.length - 3;
    };
    //# sourceMappingURL=buildEquations.js.map

    var QuizQuestion = /** @class */ (function () {
        function QuizQuestion(parentQuizName, question, correctAnswers, listeners) {
            var _this = this;
            if (correctAnswers === void 0) { correctAnswers = []; }
            this.parentQuizName = parentQuizName;
            this.question = question;
            this.correctAnswers = correctAnswers;
            this.submittedAnswers = [];
            this.correctAnswersCount = 0;
            this.getParentQuizName = function () { return _this.parentQuizName; };
            this.getAsArray = function () { return _this.question; };
            this.getAsString = function () { return JSON.stringify(_this.question); };
            this.getSubmittedAnswersAsString = function () {
                return JSON.stringify(_this.submittedAnswers);
            };
            this.getCorrectAnswersAsString = function () { return JSON.stringify(_this.correctAnswers); };
            this.getCorrectAnswersCount = function () { return _this.correctAnswersCount; };
            this.getCorrectAnswer = function () { return _this.correctAnswers[0]; };
            this.submitAnswer = function (submittedAnswer) {
                if (_this.correctAnswers.includes(submittedAnswer)) {
                    _this.correctAnswersCount = _this.correctAnswersCount + 1;
                    _this.listeners.onSubmitCorrectAnswer(_this.parentQuizName);
                }
                else {
                    _this.listeners.onSubmitIncorrectAnswer(_this.parentQuizName);
                }
                _this.submittedAnswers.push(submittedAnswer);
                _this.listeners.onSubmitAnswer(_this);
                return _this;
            };
            this.parentQuizName = parentQuizName;
            this.question = question;
            this.correctAnswers = correctAnswers;
            this.listeners = listeners;
        }
        QuizQuestion.prototype.getLastSubmittedAnswer = function () {
            return this.submittedAnswers[this.submittedAnswers.length - 1];
        };
        return QuizQuestion;
    }());
    //# sourceMappingURL=QuizQuestion.js.map

    var INPUT_SYMBOL = "_";
    var MULTIPLICATION_TABLE = "MultiplicationTable";
    var APP_PREFIX = "Math.Basic.Arithmetics.Multiplication";
    //# sourceMappingURL=constants.js.map

    function convertEquationToQuizQuestion(equation, shape, quizName, listeners) {
        var inputPosition = getInputPositionFromShape(shape);
        var question = __spreadArrays(equation.slice(0, inputPosition), [
            INPUT_SYMBOL
        ], equation.slice(inputPosition + 1, equation.length));
        var correctAnswers = [equation[inputPosition].toString()];
        // const quizQuestionId = generateQuizQuestionId(shape, id)
        return new QuizQuestion(quizName, question, correctAnswers, listeners);
    }
    var getInputPositionFromShape = function (shape) {
        return shape.includes(INPUT_SYMBOL) ? shape.indexOf(INPUT_SYMBOL) : shape.length - 1;
    };
    // const generateQuizQuestionId = (shape: EquationShapes, id: number): string =>
    //   JSON.stringify({ shape, id })
    //# sourceMappingURL=convertEquationToQuizQuestion.js.map

    function createEquationQuizzesFromConfig(config, listeners) {
        return config.map(function (_a) {
            var shape = _a.shape, range = _a.range, name = _a.name;
            var isMultiplicationTable = name === MULTIPLICATION_TABLE;
            var equations = buildEquationsAsArrays(range, shape);
            var quizName = generateQuizName(shape, name);
            var quizQuestions = equations.map(function (equation, i) {
                return convertEquationToQuizQuestion(equation, shape, quizName, listeners);
            });
            return new Quiz(quizName, quizQuestions, {
                shuffled: !isMultiplicationTable
            });
        });
    }
    var generateQuizName = function (shape, name) {
        return APP_PREFIX + "." + (name ? name : "SingleEquations") + "." + shape;
    };
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

    /*
     * Dexie.js - a minimalistic wrapper for IndexedDB
     * ===============================================
     *
     * By David Fahlander, david.fahlander@gmail.com
     *
     * Version {version}, {date}
     *
     * http://dexie.org
     *
     * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
     */
     
    var keys$1 = Object.keys;
    var isArray$1 = Array.isArray;
    var _global = typeof self !== 'undefined' ? self :
        typeof window !== 'undefined' ? window :
            global;
    function extend(obj, extension) {
        if (typeof extension !== 'object')
            return obj;
        keys$1(extension).forEach(function (key) {
            obj[key] = extension[key];
        });
        return obj;
    }
    var getProto = Object.getPrototypeOf;
    var _hasOwn = {}.hasOwnProperty;
    function hasOwn(obj, prop) {
        return _hasOwn.call(obj, prop);
    }
    function props(proto, extension) {
        if (typeof extension === 'function')
            extension = extension(getProto(proto));
        keys$1(extension).forEach(function (key) {
            setProp(proto, key, extension[key]);
        });
    }
    var defineProperty = Object.defineProperty;
    function setProp(obj, prop, functionOrGetSet, options) {
        defineProperty(obj, prop, extend(functionOrGetSet && hasOwn(functionOrGetSet, "get") && typeof functionOrGetSet.get === 'function' ?
            { get: functionOrGetSet.get, set: functionOrGetSet.set, configurable: true } :
            { value: functionOrGetSet, configurable: true, writable: true }, options));
    }
    function derive(Child) {
        return {
            from: function (Parent) {
                Child.prototype = Object.create(Parent.prototype);
                setProp(Child.prototype, "constructor", Child);
                return {
                    extend: props.bind(null, Child.prototype)
                };
            }
        };
    }
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    function getPropertyDescriptor(obj, prop) {
        var pd = getOwnPropertyDescriptor(obj, prop), proto;
        return pd || (proto = getProto(obj)) && getPropertyDescriptor(proto, prop);
    }
    var _slice = [].slice;
    function slice(args, start, end) {
        return _slice.call(args, start, end);
    }
    function override(origFunc, overridedFactory) {
        return overridedFactory(origFunc);
    }
    function assert(b) {
        if (!b)
            throw new Error("Assertion Failed");
    }
    function asap(fn) {
        if (_global.setImmediate)
            setImmediate(fn);
        else
            setTimeout(fn, 0);
    }

    /** Generate an object (hash map) based on given array.
     * @param extractor Function taking an array item and its index and returning an array of 2 items ([key, value]) to
     *        instert on the resulting object for each item in the array. If this function returns a falsy value, the
     *        current item wont affect the resulting object.
     */
    function arrayToObject(array, extractor) {
        return array.reduce(function (result, item, i) {
            var nameAndValue = extractor(item, i);
            if (nameAndValue)
                result[nameAndValue[0]] = nameAndValue[1];
            return result;
        }, {});
    }
    function trycatcher(fn, reject) {
        return function () {
            try {
                fn.apply(this, arguments);
            }
            catch (e) {
                reject(e);
            }
        };
    }
    function tryCatch(fn, onerror, args) {
        try {
            fn.apply(null, args);
        }
        catch (ex) {
            onerror && onerror(ex);
        }
    }
    function getByKeyPath(obj, keyPath) {
        // http://www.w3.org/TR/IndexedDB/#steps-for-extracting-a-key-from-a-value-using-a-key-path
        if (hasOwn(obj, keyPath))
            return obj[keyPath]; // This line is moved from last to first for optimization purpose.
        if (!keyPath)
            return obj;
        if (typeof keyPath !== 'string') {
            var rv = [];
            for (var i = 0, l = keyPath.length; i < l; ++i) {
                var val = getByKeyPath(obj, keyPath[i]);
                rv.push(val);
            }
            return rv;
        }
        var period = keyPath.indexOf('.');
        if (period !== -1) {
            var innerObj = obj[keyPath.substr(0, period)];
            return innerObj === undefined ? undefined : getByKeyPath(innerObj, keyPath.substr(period + 1));
        }
        return undefined;
    }
    function setByKeyPath(obj, keyPath, value) {
        if (!obj || keyPath === undefined)
            return;
        if ('isFrozen' in Object && Object.isFrozen(obj))
            return;
        if (typeof keyPath !== 'string' && 'length' in keyPath) {
            assert(typeof value !== 'string' && 'length' in value);
            for (var i = 0, l = keyPath.length; i < l; ++i) {
                setByKeyPath(obj, keyPath[i], value[i]);
            }
        }
        else {
            var period = keyPath.indexOf('.');
            if (period !== -1) {
                var currentKeyPath = keyPath.substr(0, period);
                var remainingKeyPath = keyPath.substr(period + 1);
                if (remainingKeyPath === "")
                    if (value === undefined)
                        delete obj[currentKeyPath];
                    else
                        obj[currentKeyPath] = value;
                else {
                    var innerObj = obj[currentKeyPath];
                    if (!innerObj)
                        innerObj = (obj[currentKeyPath] = {});
                    setByKeyPath(innerObj, remainingKeyPath, value);
                }
            }
            else {
                if (value === undefined)
                    delete obj[keyPath];
                else
                    obj[keyPath] = value;
            }
        }
    }
    function delByKeyPath(obj, keyPath) {
        if (typeof keyPath === 'string')
            setByKeyPath(obj, keyPath, undefined);
        else if ('length' in keyPath)
            [].map.call(keyPath, function (kp) {
                setByKeyPath(obj, kp, undefined);
            });
    }
    function shallowClone(obj) {
        var rv = {};
        for (var m in obj) {
            if (hasOwn(obj, m))
                rv[m] = obj[m];
        }
        return rv;
    }
    var concat = [].concat;
    function flatten(a) {
        return concat.apply([], a);
    }
    //https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
    var intrinsicTypes = "Boolean,String,Date,RegExp,Blob,File,FileList,ArrayBuffer,DataView,Uint8ClampedArray,ImageData,Map,Set"
        .split(',').concat(flatten([8, 16, 32, 64].map(function (num) { return ["Int", "Uint", "Float"].map(function (t) { return t + num + "Array"; }); }))).filter(function (t) { return _global[t]; }).map(function (t) { return _global[t]; });
    function deepClone(any) {
        if (!any || typeof any !== 'object')
            return any;
        var rv;
        if (isArray$1(any)) {
            rv = [];
            for (var i = 0, l = any.length; i < l; ++i) {
                rv.push(deepClone(any[i]));
            }
        }
        else if (intrinsicTypes.indexOf(any.constructor) >= 0) {
            rv = any;
        }
        else {
            rv = any.constructor ? Object.create(any.constructor.prototype) : {};
            for (var prop in any) {
                if (hasOwn(any, prop)) {
                    rv[prop] = deepClone(any[prop]);
                }
            }
        }
        return rv;
    }
    function getObjectDiff(a, b, rv, prfx) {
        // Compares objects a and b and produces a diff object.
        rv = rv || {};
        prfx = prfx || '';
        keys$1(a).forEach(function (prop) {
            if (!hasOwn(b, prop))
                rv[prfx + prop] = undefined; // Property removed
            else {
                var ap = a[prop], bp = b[prop];
                if (typeof ap === 'object' && typeof bp === 'object' &&
                    ap && bp &&
                    // Now compare constructors are same (not equal because wont work in Safari)
                    ('' + ap.constructor) === ('' + bp.constructor))
                    // Same type of object but its properties may have changed
                    getObjectDiff(ap, bp, rv, prfx + prop + ".");
                else if (ap !== bp)
                    rv[prfx + prop] = b[prop]; // Primitive value changed
            }
        });
        keys$1(b).forEach(function (prop) {
            if (!hasOwn(a, prop)) {
                rv[prfx + prop] = b[prop]; // Property added
            }
        });
        return rv;
    }
    // If first argument is iterable or array-like, return it as an array
    var iteratorSymbol = typeof Symbol !== 'undefined' && Symbol.iterator;
    var getIteratorOf = iteratorSymbol ? function (x) {
        var i;
        return x != null && (i = x[iteratorSymbol]) && i.apply(x);
    } : function () { return null; };
    var NO_CHAR_ARRAY = {};
    // Takes one or several arguments and returns an array based on the following criteras:
    // * If several arguments provided, return arguments converted to an array in a way that
    //   still allows javascript engine to optimize the code.
    // * If single argument is an array, return a clone of it.
    // * If this-pointer equals NO_CHAR_ARRAY, don't accept strings as valid iterables as a special
    //   case to the two bullets below.
    // * If single argument is an iterable, convert it to an array and return the resulting array.
    // * If single argument is array-like (has length of type number), convert it to an array.
    function getArrayOf(arrayLike) {
        var i, a, x, it;
        if (arguments.length === 1) {
            if (isArray$1(arrayLike))
                return arrayLike.slice();
            if (this === NO_CHAR_ARRAY && typeof arrayLike === 'string')
                return [arrayLike];
            if ((it = getIteratorOf(arrayLike))) {
                a = [];
                while ((x = it.next()), !x.done)
                    a.push(x.value);
                return a;
            }
            if (arrayLike == null)
                return [arrayLike];
            i = arrayLike.length;
            if (typeof i === 'number') {
                a = new Array(i);
                while (i--)
                    a[i] = arrayLike[i];
                return a;
            }
            return [arrayLike];
        }
        i = arguments.length;
        a = new Array(i);
        while (i--)
            a[i] = arguments[i];
        return a;
    }

    // By default, debug will be true only if platform is a web platform and its page is served from localhost.
    // When debug = true, error's stacks will contain asyncronic long stacks.
    var debug = typeof location !== 'undefined' &&
        // By default, use debug mode if served from localhost.
        /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
    function setDebug(value, filter) {
        debug = value;
        libraryFilter = filter;
    }
    var libraryFilter = function () { return true; };
    var NEEDS_THROW_FOR_STACK = !new Error("").stack;
    function getErrorWithStack() {
        if (NEEDS_THROW_FOR_STACK)
            try {
                // Doing something naughty in strict mode here to trigger a specific error
                // that can be explicitely ignored in debugger's exception settings.
                // If we'd just throw new Error() here, IE's debugger's exception settings
                // will just consider it as "exception thrown by javascript code" which is
                // something you wouldn't want it to ignore.
                getErrorWithStack.arguments;
                throw new Error(); // Fallback if above line don't throw.
            }
            catch (e) {
                return e;
            }
        return new Error();
    }
    function prettyStack(exception, numIgnoredFrames) {
        var stack = exception.stack;
        if (!stack)
            return "";
        numIgnoredFrames = (numIgnoredFrames || 0);
        if (stack.indexOf(exception.name) === 0)
            numIgnoredFrames += (exception.name + exception.message).split('\n').length;
        return stack.split('\n')
            .slice(numIgnoredFrames)
            .filter(libraryFilter)
            .map(function (frame) { return "\n" + frame; })
            .join('');
    }
    function deprecated(what, fn) {
        return function () {
            console.warn(what + " is deprecated. See https://github.com/dfahlander/Dexie.js/wiki/Deprecations. " + prettyStack(getErrorWithStack(), 1));
            return fn.apply(this, arguments);
        };
    }

    var dexieErrorNames = [
        'Modify',
        'Bulk',
        'OpenFailed',
        'VersionChange',
        'Schema',
        'Upgrade',
        'InvalidTable',
        'MissingAPI',
        'NoSuchDatabase',
        'InvalidArgument',
        'SubTransaction',
        'Unsupported',
        'Internal',
        'DatabaseClosed',
        'PrematureCommit',
        'ForeignAwait'
    ];
    var idbDomErrorNames = [
        'Unknown',
        'Constraint',
        'Data',
        'TransactionInactive',
        'ReadOnly',
        'Version',
        'NotFound',
        'InvalidState',
        'InvalidAccess',
        'Abort',
        'Timeout',
        'QuotaExceeded',
        'Syntax',
        'DataClone'
    ];
    var errorList = dexieErrorNames.concat(idbDomErrorNames);
    var defaultTexts = {
        VersionChanged: "Database version changed by other database connection",
        DatabaseClosed: "Database has been closed",
        Abort: "Transaction aborted",
        TransactionInactive: "Transaction has already completed or failed"
    };
    //
    // DexieError - base class of all out exceptions.
    //
    function DexieError(name, msg) {
        // Reason we don't use ES6 classes is because:
        // 1. It bloats transpiled code and increases size of minified code.
        // 2. It doesn't give us much in this case.
        // 3. It would require sub classes to call super(), which
        //    is not needed when deriving from Error.
        this._e = getErrorWithStack();
        this.name = name;
        this.message = msg;
    }
    derive(DexieError).from(Error).extend({
        stack: {
            get: function () {
                return this._stack ||
                    (this._stack = this.name + ": " + this.message + prettyStack(this._e, 2));
            }
        },
        toString: function () { return this.name + ": " + this.message; }
    });
    function getMultiErrorMessage(msg, failures) {
        return msg + ". Errors: " + failures
            .map(function (f) { return f.toString(); })
            .filter(function (v, i, s) { return s.indexOf(v) === i; }) // Only unique error strings
            .join('\n');
    }
    //
    // ModifyError - thrown in Collection.modify()
    // Specific constructor because it contains members failures and failedKeys.
    //
    function ModifyError(msg, failures, successCount, failedKeys) {
        this._e = getErrorWithStack();
        this.failures = failures;
        this.failedKeys = failedKeys;
        this.successCount = successCount;
    }
    derive(ModifyError).from(DexieError);
    function BulkError(msg, failures) {
        this._e = getErrorWithStack();
        this.name = "BulkError";
        this.failures = failures;
        this.message = getMultiErrorMessage(msg, failures);
    }
    derive(BulkError).from(DexieError);
    //
    //
    // Dynamically generate error names and exception classes based
    // on the names in errorList.
    //
    //
    // Map of {ErrorName -> ErrorName + "Error"}
    var errnames = errorList.reduce(function (obj, name) { return (obj[name] = name + "Error", obj); }, {});
    // Need an alias for DexieError because we're gonna create subclasses with the same name.
    var BaseException = DexieError;
    // Map of {ErrorName -> exception constructor}
    var exceptions = errorList.reduce(function (obj, name) {
        // Let the name be "DexieError" because this name may
        // be shown in call stack and when debugging. DexieError is
        // the most true name because it derives from DexieError,
        // and we cannot change Function.name programatically without
        // dynamically create a Function object, which would be considered
        // 'eval-evil'.
        var fullName = name + "Error";
        function DexieError(msgOrInner, inner) {
            this._e = getErrorWithStack();
            this.name = fullName;
            if (!msgOrInner) {
                this.message = defaultTexts[name] || fullName;
                this.inner = null;
            }
            else if (typeof msgOrInner === 'string') {
                this.message = msgOrInner;
                this.inner = inner || null;
            }
            else if (typeof msgOrInner === 'object') {
                this.message = msgOrInner.name + " " + msgOrInner.message;
                this.inner = msgOrInner;
            }
        }
        derive(DexieError).from(BaseException);
        obj[name] = DexieError;
        return obj;
    }, {});
    // Use ECMASCRIPT standard exceptions where applicable:
    exceptions.Syntax = SyntaxError;
    exceptions.Type = TypeError;
    exceptions.Range = RangeError;
    var exceptionMap = idbDomErrorNames.reduce(function (obj, name) {
        obj[name + "Error"] = exceptions[name];
        return obj;
    }, {});
    function mapError(domError, message) {
        if (!domError || domError instanceof DexieError || domError instanceof TypeError || domError instanceof SyntaxError || !domError.name || !exceptionMap[domError.name])
            return domError;
        var rv = new exceptionMap[domError.name](message || domError.message, domError);
        if ("stack" in domError) {
            // Derive stack from inner exception if it has a stack
            setProp(rv, "stack", { get: function () {
                    return this.inner.stack;
                } });
        }
        return rv;
    }
    var fullNameExceptions = errorList.reduce(function (obj, name) {
        if (["Syntax", "Type", "Range"].indexOf(name) === -1)
            obj[name + "Error"] = exceptions[name];
        return obj;
    }, {});
    fullNameExceptions.ModifyError = ModifyError;
    fullNameExceptions.DexieError = DexieError;
    fullNameExceptions.BulkError = BulkError;

    function nop() { }
    function mirror(val) { return val; }
    function pureFunctionChain(f1, f2) {
        // Enables chained events that takes ONE argument and returns it to the next function in chain.
        // This pattern is used in the hook("reading") event.
        if (f1 == null || f1 === mirror)
            return f2;
        return function (val) {
            return f2(f1(val));
        };
    }
    function callBoth(on1, on2) {
        return function () {
            on1.apply(this, arguments);
            on2.apply(this, arguments);
        };
    }
    function hookCreatingChain(f1, f2) {
        // Enables chained events that takes several arguments and may modify first argument by making a modification and then returning the same instance.
        // This pattern is used in the hook("creating") event.
        if (f1 === nop)
            return f2;
        return function () {
            var res = f1.apply(this, arguments);
            if (res !== undefined)
                arguments[0] = res;
            var onsuccess = this.onsuccess, // In case event listener has set this.onsuccess
            onerror = this.onerror; // In case event listener has set this.onerror
            this.onsuccess = null;
            this.onerror = null;
            var res2 = f2.apply(this, arguments);
            if (onsuccess)
                this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
            if (onerror)
                this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
            return res2 !== undefined ? res2 : res;
        };
    }
    function hookDeletingChain(f1, f2) {
        if (f1 === nop)
            return f2;
        return function () {
            f1.apply(this, arguments);
            var onsuccess = this.onsuccess, // In case event listener has set this.onsuccess
            onerror = this.onerror; // In case event listener has set this.onerror
            this.onsuccess = this.onerror = null;
            f2.apply(this, arguments);
            if (onsuccess)
                this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
            if (onerror)
                this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
        };
    }
    function hookUpdatingChain(f1, f2) {
        if (f1 === nop)
            return f2;
        return function (modifications) {
            var res = f1.apply(this, arguments);
            extend(modifications, res); // If f1 returns new modifications, extend caller's modifications with the result before calling next in chain.
            var onsuccess = this.onsuccess, // In case event listener has set this.onsuccess
            onerror = this.onerror; // In case event listener has set this.onerror
            this.onsuccess = null;
            this.onerror = null;
            var res2 = f2.apply(this, arguments);
            if (onsuccess)
                this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
            if (onerror)
                this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
            return res === undefined ?
                (res2 === undefined ? undefined : res2) :
                (extend(res, res2));
        };
    }
    function reverseStoppableEventChain(f1, f2) {
        if (f1 === nop)
            return f2;
        return function () {
            if (f2.apply(this, arguments) === false)
                return false;
            return f1.apply(this, arguments);
        };
    }

    function promisableChain(f1, f2) {
        if (f1 === nop)
            return f2;
        return function () {
            var res = f1.apply(this, arguments);
            if (res && typeof res.then === 'function') {
                var thiz = this, i = arguments.length, args = new Array(i);
                while (i--)
                    args[i] = arguments[i];
                return res.then(function () {
                    return f2.apply(thiz, args);
                });
            }
            return f2.apply(this, arguments);
        };
    }

    /*
     * Copyright (c) 2014-2017 David Fahlander
     * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/LICENSE-2.0
     */
    //
    // Promise and Zone (PSD) for Dexie library
    //
    // I started out writing this Promise class by copying promise-light (https://github.com/taylorhakes/promise-light) by
    // https://github.com/taylorhakes - an A+ and ECMASCRIPT 6 compliant Promise implementation.
    //
    // In previous versions this was fixed by not calling setTimeout when knowing that the resolve() or reject() came from another
    // tick. In Dexie v1.4.0, I've rewritten the Promise class entirely. Just some fragments of promise-light is left. I use
    // another strategy now that simplifies everything a lot: to always execute callbacks in a new micro-task, but have an own micro-task
    // engine that is indexedDB compliant across all browsers.
    // Promise class has also been optimized a lot with inspiration from bluebird - to avoid closures as much as possible.
    // Also with inspiration from bluebird, asyncronic stacks in debug mode.
    //
    // Specific non-standard features of this Promise class:
    // * Custom zone support (a.k.a. PSD) with ability to keep zones also when using native promises as well as
    //   native async / await.
    // * Promise.follow() method built upon the custom zone engine, that allows user to track all promises created from current stack frame
    //   and below + all promises that those promises creates or awaits.
    // * Detect any unhandled promise in a PSD-scope (PSD.onunhandled). 
    //
    // David Fahlander, https://github.com/dfahlander
    //
    // Just a pointer that only this module knows about.
    // Used in Promise constructor to emulate a private constructor.
    var INTERNAL = {};
    // Async stacks (long stacks) must not grow infinitely.
    var LONG_STACKS_CLIP_LIMIT = 100;
    var MAX_LONG_STACKS = 20;
    var ZONE_ECHO_LIMIT = 7;
    var nativePromiseInstanceAndProto = (function () {
        try {
            // Be able to patch native async functions
            return new Function("let F=async ()=>{},p=F();return [p,Object.getPrototypeOf(p),Promise.resolve(),F.constructor];")();
        }
        catch (e) {
            var P = _global.Promise;
            return P ?
                [P.resolve(), P.prototype, P.resolve()] :
                [];
        }
    })();
    var resolvedNativePromise = nativePromiseInstanceAndProto[0];
    var nativePromiseProto = nativePromiseInstanceAndProto[1];
    var resolvedGlobalPromise = nativePromiseInstanceAndProto[2];
    var nativePromiseThen = nativePromiseProto && nativePromiseProto.then;
    var NativePromise = resolvedNativePromise && resolvedNativePromise.constructor;
    var AsyncFunction = nativePromiseInstanceAndProto[3];
    var patchGlobalPromise = !!resolvedGlobalPromise;
    var stack_being_generated = false;
    /* The default function used only for the very first promise in a promise chain.
       As soon as then promise is resolved or rejected, all next tasks will be executed in micro ticks
       emulated in this module. For indexedDB compatibility, this means that every method needs to
       execute at least one promise before doing an indexedDB operation. Dexie will always call
       db.ready().then() for every operation to make sure the indexedDB event is started in an
       indexedDB-compatible emulated micro task loop.
    */
    var schedulePhysicalTick = resolvedGlobalPromise ?
        function () { resolvedGlobalPromise.then(physicalTick); }
        :
            _global.setImmediate ?
                // setImmediate supported. Those modern platforms also supports Function.bind().
                setImmediate.bind(null, physicalTick) :
                _global.MutationObserver ?
                    // MutationObserver supported
                    function () {
                        var hiddenDiv = document.createElement("div");
                        (new MutationObserver(function () {
                            physicalTick();
                            hiddenDiv = null;
                        })).observe(hiddenDiv, { attributes: true });
                        hiddenDiv.setAttribute('i', '1');
                    } :
                    // No support for setImmediate or MutationObserver. No worry, setTimeout is only called
                    // once time. Every tick that follows will be our emulated micro tick.
                    // Could have uses setTimeout.bind(null, 0, physicalTick) if it wasnt for that FF13 and below has a bug 
                    function () { setTimeout(physicalTick, 0); };
    // Configurable through Promise.scheduler.
    // Don't export because it would be unsafe to let unknown
    // code call it unless they do try..catch within their callback.
    // This function can be retrieved through getter of Promise.scheduler though,
    // but users must not do Promise.scheduler = myFuncThatThrowsException
    var asap$1 = function (callback, args) {
        microtickQueue.push([callback, args]);
        if (needsNewPhysicalTick) {
            schedulePhysicalTick();
            needsNewPhysicalTick = false;
        }
    };
    var isOutsideMicroTick = true;
    var needsNewPhysicalTick = true;
    var unhandledErrors = [];
    var rejectingErrors = [];
    var currentFulfiller = null;
    var rejectionMapper = mirror; // Remove in next major when removing error mapping of DOMErrors and DOMExceptions
    var globalPSD = {
        id: 'global',
        global: true,
        ref: 0,
        unhandleds: [],
        onunhandled: globalError,
        pgp: false,
        env: {},
        finalize: function () {
            this.unhandleds.forEach(function (uh) {
                try {
                    globalError(uh[0], uh[1]);
                }
                catch (e) { }
            });
        }
    };
    var PSD = globalPSD;
    var microtickQueue = []; // Callbacks to call in this or next physical tick.
    var numScheduledCalls = 0; // Number of listener-calls left to do in this physical tick.
    var tickFinalizers = []; // Finalizers to call when there are no more async calls scheduled within current physical tick.
    function Promise$1(fn) {
        if (typeof this !== 'object')
            throw new TypeError('Promises must be constructed via new');
        this._listeners = [];
        this.onuncatched = nop; // Deprecate in next major. Not needed. Better to use global error handler.
        // A library may set `promise._lib = true;` after promise is created to make resolve() or reject()
        // execute the microtask engine implicitely within the call to resolve() or reject().
        // To remain A+ compliant, a library must only set `_lib=true` if it can guarantee that the stack
        // only contains library code when calling resolve() or reject().
        // RULE OF THUMB: ONLY set _lib = true for promises explicitely resolving/rejecting directly from
        // global scope (event handler, timer etc)!
        this._lib = false;
        // Current async scope
        var psd = (this._PSD = PSD);
        if (debug) {
            this._stackHolder = getErrorWithStack();
            this._prev = null;
            this._numPrev = 0; // Number of previous promises (for long stacks)
        }
        if (typeof fn !== 'function') {
            if (fn !== INTERNAL)
                throw new TypeError('Not a function');
            // Private constructor (INTERNAL, state, value).
            // Used internally by Promise.resolve() and Promise.reject().
            this._state = arguments[1];
            this._value = arguments[2];
            if (this._state === false)
                handleRejection(this, this._value); // Map error, set stack and addPossiblyUnhandledError().
            return;
        }
        this._state = null; // null (=pending), false (=rejected) or true (=resolved)
        this._value = null; // error or result
        ++psd.ref; // Refcounting current scope
        executePromiseTask(this, fn);
    }
    // Prepare a property descriptor to put onto Promise.prototype.then
    var thenProp = {
        get: function () {
            var psd = PSD, microTaskId = totalEchoes;
            function then(onFulfilled, onRejected) {
                var _this = this;
                var possibleAwait = !psd.global && (psd !== PSD || microTaskId !== totalEchoes);
                if (possibleAwait)
                    decrementExpectedAwaits();
                var rv = new Promise$1(function (resolve, reject) {
                    propagateToListener(_this, new Listener(nativeAwaitCompatibleWrap(onFulfilled, psd, possibleAwait), nativeAwaitCompatibleWrap(onRejected, psd, possibleAwait), resolve, reject, psd));
                });
                debug && linkToPreviousPromise(rv, this);
                return rv;
            }
            then.prototype = INTERNAL; // For idempotense, see setter below.
            return then;
        },
        // Be idempotent and allow another framework (such as zone.js or another instance of a Dexie.Promise module) to replace Promise.prototype.then
        // and when that framework wants to restore the original property, we must identify that and restore the original property descriptor.
        set: function (value) {
            setProp(this, 'then', value && value.prototype === INTERNAL ?
                thenProp : // Restore to original property descriptor.
                {
                    get: function () {
                        return value; // Getter returning provided value (behaves like value is just changed)
                    },
                    set: thenProp.set // Keep a setter that is prepared to restore original.
                });
        }
    };
    props(Promise$1.prototype, {
        then: thenProp,
        _then: function (onFulfilled, onRejected) {
            // A little tinier version of then() that don't have to create a resulting promise.
            propagateToListener(this, new Listener(null, null, onFulfilled, onRejected, PSD));
        },
        catch: function (onRejected) {
            if (arguments.length === 1)
                return this.then(null, onRejected);
            // First argument is the Error type to catch
            var type = arguments[0], handler = arguments[1];
            return typeof type === 'function' ? this.then(null, function (err) {
                // Catching errors by its constructor type (similar to java / c++ / c#)
                // Sample: promise.catch(TypeError, function (e) { ... });
                return err instanceof type ? handler(err) : PromiseReject(err);
            })
                : this.then(null, function (err) {
                    // Catching errors by the error.name property. Makes sense for indexedDB where error type
                    // is always DOMError but where e.name tells the actual error type.
                    // Sample: promise.catch('ConstraintError', function (e) { ... });
                    return err && err.name === type ? handler(err) : PromiseReject(err);
                });
        },
        finally: function (onFinally) {
            return this.then(function (value) {
                onFinally();
                return value;
            }, function (err) {
                onFinally();
                return PromiseReject(err);
            });
        },
        stack: {
            get: function () {
                if (this._stack)
                    return this._stack;
                try {
                    stack_being_generated = true;
                    var stacks = getStack(this, [], MAX_LONG_STACKS);
                    var stack = stacks.join("\nFrom previous: ");
                    if (this._state !== null)
                        this._stack = stack; // Stack may be updated on reject.
                    return stack;
                }
                finally {
                    stack_being_generated = false;
                }
            }
        },
        timeout: function (ms, msg) {
            var _this = this;
            return ms < Infinity ?
                new Promise$1(function (resolve, reject) {
                    var handle = setTimeout(function () { return reject(new exceptions.Timeout(msg)); }, ms);
                    _this.then(resolve, reject).finally(clearTimeout.bind(null, handle));
                }) : this;
        }
    });
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag)
        setProp(Promise$1.prototype, Symbol.toStringTag, 'Promise');
    // Now that Promise.prototype is defined, we have all it takes to set globalPSD.env.
    // Environment globals snapshotted on leaving global zone
    globalPSD.env = snapShot();
    function Listener(onFulfilled, onRejected, resolve, reject, zone) {
        this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
        this.onRejected = typeof onRejected === 'function' ? onRejected : null;
        this.resolve = resolve;
        this.reject = reject;
        this.psd = zone;
    }
    // Promise Static Properties
    props(Promise$1, {
        all: function () {
            var values = getArrayOf.apply(null, arguments) // Supports iterables, implicit arguments and array-like.
                .map(onPossibleParallellAsync); // Handle parallell async/awaits 
            return new Promise$1(function (resolve, reject) {
                if (values.length === 0)
                    resolve([]);
                var remaining = values.length;
                values.forEach(function (a, i) { return Promise$1.resolve(a).then(function (x) {
                    values[i] = x;
                    if (!--remaining)
                        resolve(values);
                }, reject); });
            });
        },
        resolve: function (value) {
            if (value instanceof Promise$1)
                return value;
            if (value && typeof value.then === 'function')
                return new Promise$1(function (resolve, reject) {
                    value.then(resolve, reject);
                });
            var rv = new Promise$1(INTERNAL, true, value);
            linkToPreviousPromise(rv, currentFulfiller);
            return rv;
        },
        reject: PromiseReject,
        race: function () {
            var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
            return new Promise$1(function (resolve, reject) {
                values.map(function (value) { return Promise$1.resolve(value).then(resolve, reject); });
            });
        },
        PSD: {
            get: function () { return PSD; },
            set: function (value) { return PSD = value; }
        },
        //totalEchoes: {get: ()=>totalEchoes},
        //task: {get: ()=>task},
        newPSD: newScope,
        usePSD: usePSD,
        scheduler: {
            get: function () { return asap$1; },
            set: function (value) { asap$1 = value; }
        },
        rejectionMapper: {
            get: function () { return rejectionMapper; },
            set: function (value) { rejectionMapper = value; } // Map reject failures
        },
        follow: function (fn, zoneProps) {
            return new Promise$1(function (resolve, reject) {
                return newScope(function (resolve, reject) {
                    var psd = PSD;
                    psd.unhandleds = []; // For unhandled standard- or 3rd party Promises. Checked at psd.finalize()
                    psd.onunhandled = reject; // Triggered directly on unhandled promises of this library.
                    psd.finalize = callBoth(function () {
                        var _this = this;
                        // Unhandled standard or 3rd part promises are put in PSD.unhandleds and
                        // examined upon scope completion while unhandled rejections in this Promise
                        // will trigger directly through psd.onunhandled
                        run_at_end_of_this_or_next_physical_tick(function () {
                            _this.unhandleds.length === 0 ? resolve() : reject(_this.unhandleds[0]);
                        });
                    }, psd.finalize);
                    fn();
                }, zoneProps, resolve, reject);
            });
        }
    });
    /**
    * Take a potentially misbehaving resolver function and make sure
    * onFulfilled and onRejected are only called once.
    *
    * Makes no guarantees about asynchrony.
    */
    function executePromiseTask(promise, fn) {
        // Promise Resolution Procedure:
        // https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
        try {
            fn(function (value) {
                if (promise._state !== null)
                    return; // Already settled
                if (value === promise)
                    throw new TypeError('A promise cannot be resolved with itself.');
                var shouldExecuteTick = promise._lib && beginMicroTickScope();
                if (value && typeof value.then === 'function') {
                    executePromiseTask(promise, function (resolve, reject) {
                        value instanceof Promise$1 ?
                            value._then(resolve, reject) :
                            value.then(resolve, reject);
                    });
                }
                else {
                    promise._state = true;
                    promise._value = value;
                    propagateAllListeners(promise);
                }
                if (shouldExecuteTick)
                    endMicroTickScope();
            }, handleRejection.bind(null, promise)); // If Function.bind is not supported. Exception is handled in catch below
        }
        catch (ex) {
            handleRejection(promise, ex);
        }
    }
    function handleRejection(promise, reason) {
        rejectingErrors.push(reason);
        if (promise._state !== null)
            return;
        var shouldExecuteTick = promise._lib && beginMicroTickScope();
        reason = rejectionMapper(reason);
        promise._state = false;
        promise._value = reason;
        debug && reason !== null && typeof reason === 'object' && !reason._promise && tryCatch(function () {
            var origProp = getPropertyDescriptor(reason, "stack");
            reason._promise = promise;
            setProp(reason, "stack", {
                get: function () {
                    return stack_being_generated ?
                        origProp && (origProp.get ?
                            origProp.get.apply(reason) :
                            origProp.value) :
                        promise.stack;
                }
            });
        });
        // Add the failure to a list of possibly uncaught errors
        addPossiblyUnhandledError(promise);
        propagateAllListeners(promise);
        if (shouldExecuteTick)
            endMicroTickScope();
    }
    function propagateAllListeners(promise) {
        //debug && linkToPreviousPromise(promise);
        var listeners = promise._listeners;
        promise._listeners = [];
        for (var i = 0, len = listeners.length; i < len; ++i) {
            propagateToListener(promise, listeners[i]);
        }
        var psd = promise._PSD;
        --psd.ref || psd.finalize(); // if psd.ref reaches zero, call psd.finalize();
        if (numScheduledCalls === 0) {
            // If numScheduledCalls is 0, it means that our stack is not in a callback of a scheduled call,
            // and that no deferreds where listening to this rejection or success.
            // Since there is a risk that our stack can contain application code that may
            // do stuff after this code is finished that may generate new calls, we cannot
            // call finalizers here.
            ++numScheduledCalls;
            asap$1(function () {
                if (--numScheduledCalls === 0)
                    finalizePhysicalTick(); // Will detect unhandled errors
            }, []);
        }
    }
    function propagateToListener(promise, listener) {
        if (promise._state === null) {
            promise._listeners.push(listener);
            return;
        }
        var cb = promise._state ? listener.onFulfilled : listener.onRejected;
        if (cb === null) {
            // This Listener doesnt have a listener for the event being triggered (onFulfilled or onReject) so lets forward the event to any eventual listeners on the Promise instance returned by then() or catch()
            return (promise._state ? listener.resolve : listener.reject)(promise._value);
        }
        ++listener.psd.ref;
        ++numScheduledCalls;
        asap$1(callListener, [cb, promise, listener]);
    }
    function callListener(cb, promise, listener) {
        try {
            // Set static variable currentFulfiller to the promise that is being fullfilled,
            // so that we connect the chain of promises (for long stacks support)
            currentFulfiller = promise;
            // Call callback and resolve our listener with it's return value.
            var ret, value = promise._value;
            if (promise._state) {
                // cb is onResolved
                ret = cb(value);
            }
            else {
                // cb is onRejected
                if (rejectingErrors.length)
                    rejectingErrors = [];
                ret = cb(value);
                if (rejectingErrors.indexOf(value) === -1)
                    markErrorAsHandled(promise); // Callback didnt do Promise.reject(err) nor reject(err) onto another promise.
            }
            listener.resolve(ret);
        }
        catch (e) {
            // Exception thrown in callback. Reject our listener.
            listener.reject(e);
        }
        finally {
            // Restore env and currentFulfiller.
            currentFulfiller = null;
            if (--numScheduledCalls === 0)
                finalizePhysicalTick();
            --listener.psd.ref || listener.psd.finalize();
        }
    }
    function getStack(promise, stacks, limit) {
        if (stacks.length === limit)
            return stacks;
        var stack = "";
        if (promise._state === false) {
            var failure = promise._value, errorName, message;
            if (failure != null) {
                errorName = failure.name || "Error";
                message = failure.message || failure;
                stack = prettyStack(failure, 0);
            }
            else {
                errorName = failure; // If error is undefined or null, show that.
                message = "";
            }
            stacks.push(errorName + (message ? ": " + message : "") + stack);
        }
        if (debug) {
            stack = prettyStack(promise._stackHolder, 2);
            if (stack && stacks.indexOf(stack) === -1)
                stacks.push(stack);
            if (promise._prev)
                getStack(promise._prev, stacks, limit);
        }
        return stacks;
    }
    function linkToPreviousPromise(promise, prev) {
        // Support long stacks by linking to previous completed promise.
        var numPrev = prev ? prev._numPrev + 1 : 0;
        if (numPrev < LONG_STACKS_CLIP_LIMIT) {
            promise._prev = prev;
            promise._numPrev = numPrev;
        }
    }
    /* The callback to schedule with setImmediate() or setTimeout().
       It runs a virtual microtick and executes any callback registered in microtickQueue.
     */
    function physicalTick() {
        beginMicroTickScope() && endMicroTickScope();
    }
    function beginMicroTickScope() {
        var wasRootExec = isOutsideMicroTick;
        isOutsideMicroTick = false;
        needsNewPhysicalTick = false;
        return wasRootExec;
    }
    /* Executes micro-ticks without doing try..catch.
       This can be possible because we only use this internally and
       the registered functions are exception-safe (they do try..catch
       internally before calling any external method). If registering
       functions in the microtickQueue that are not exception-safe, this
       would destroy the framework and make it instable. So we don't export
       our asap method.
    */
    function endMicroTickScope() {
        var callbacks, i, l;
        do {
            while (microtickQueue.length > 0) {
                callbacks = microtickQueue;
                microtickQueue = [];
                l = callbacks.length;
                for (i = 0; i < l; ++i) {
                    var item = callbacks[i];
                    item[0].apply(null, item[1]);
                }
            }
        } while (microtickQueue.length > 0);
        isOutsideMicroTick = true;
        needsNewPhysicalTick = true;
    }
    function finalizePhysicalTick() {
        var unhandledErrs = unhandledErrors;
        unhandledErrors = [];
        unhandledErrs.forEach(function (p) {
            p._PSD.onunhandled.call(null, p._value, p);
        });
        var finalizers = tickFinalizers.slice(0); // Clone first because finalizer may remove itself from list.
        var i = finalizers.length;
        while (i)
            finalizers[--i]();
    }
    function run_at_end_of_this_or_next_physical_tick(fn) {
        function finalizer() {
            fn();
            tickFinalizers.splice(tickFinalizers.indexOf(finalizer), 1);
        }
        tickFinalizers.push(finalizer);
        ++numScheduledCalls;
        asap$1(function () {
            if (--numScheduledCalls === 0)
                finalizePhysicalTick();
        }, []);
    }
    function addPossiblyUnhandledError(promise) {
        // Only add to unhandledErrors if not already there. The first one to add to this list
        // will be upon the first rejection so that the root cause (first promise in the
        // rejection chain) is the one listed.
        if (!unhandledErrors.some(function (p) { return p._value === promise._value; }))
            unhandledErrors.push(promise);
    }
    function markErrorAsHandled(promise) {
        // Called when a reject handled is actually being called.
        // Search in unhandledErrors for any promise whos _value is this promise_value (list
        // contains only rejected promises, and only one item per error)
        var i = unhandledErrors.length;
        while (i)
            if (unhandledErrors[--i]._value === promise._value) {
                // Found a promise that failed with this same error object pointer,
                // Remove that since there is a listener that actually takes care of it.
                unhandledErrors.splice(i, 1);
                return;
            }
    }
    function PromiseReject(reason) {
        return new Promise$1(INTERNAL, false, reason);
    }
    function wrap(fn, errorCatcher) {
        var psd = PSD;
        return function () {
            var wasRootExec = beginMicroTickScope(), outerScope = PSD;
            try {
                switchToZone(psd, true);
                return fn.apply(this, arguments);
            }
            catch (e) {
                errorCatcher && errorCatcher(e);
            }
            finally {
                switchToZone(outerScope, false);
                if (wasRootExec)
                    endMicroTickScope();
            }
        };
    }
    //
    // variables used for native await support
    //
    var task = { awaits: 0, echoes: 0, id: 0 }; // The ongoing macro-task when using zone-echoing.
    var taskCounter = 0; // ID counter for macro tasks.
    var zoneStack = []; // Stack of left zones to restore asynchronically.
    var zoneEchoes = 0; // zoneEchoes is a must in order to persist zones between native await expressions.
    var totalEchoes = 0; // ID counter for micro-tasks. Used to detect possible native await in our Promise.prototype.then.
    var zone_id_counter = 0;
    function newScope(fn, props$$1, a1, a2) {
        var parent = PSD, psd = Object.create(parent);
        psd.parent = parent;
        psd.ref = 0;
        psd.global = false;
        psd.id = ++zone_id_counter;
        // Prepare for promise patching (done in usePSD):
        var globalEnv = globalPSD.env;
        psd.env = patchGlobalPromise ? {
            Promise: Promise$1,
            PromiseProp: { value: Promise$1, configurable: true, writable: true },
            all: Promise$1.all,
            race: Promise$1.race,
            resolve: Promise$1.resolve,
            reject: Promise$1.reject,
            nthen: getPatchedPromiseThen(globalEnv.nthen, psd),
            gthen: getPatchedPromiseThen(globalEnv.gthen, psd) // global then
        } : {};
        if (props$$1)
            extend(psd, props$$1);
        // unhandleds and onunhandled should not be specifically set here.
        // Leave them on parent prototype.
        // unhandleds.push(err) will push to parent's prototype
        // onunhandled() will call parents onunhandled (with this scope's this-pointer though!)
        ++parent.ref;
        psd.finalize = function () {
            --this.parent.ref || this.parent.finalize();
        };
        var rv = usePSD(psd, fn, a1, a2);
        if (psd.ref === 0)
            psd.finalize();
        return rv;
    }
    // Function to call if scopeFunc returns NativePromise
    // Also for each NativePromise in the arguments to Promise.all()
    function incrementExpectedAwaits() {
        if (!task.id)
            task.id = ++taskCounter;
        ++task.awaits;
        task.echoes += ZONE_ECHO_LIMIT;
        return task.id;
    }
    // Function to call when 'then' calls back on a native promise where onAwaitExpected() had been called.
    // Also call this when a native await calls then method on a promise. In that case, don't supply
    // sourceTaskId because we already know it refers to current task.
    function decrementExpectedAwaits(sourceTaskId) {
        if (!task.awaits || (sourceTaskId && sourceTaskId !== task.id))
            return;
        if (--task.awaits === 0)
            task.id = 0;
        task.echoes = task.awaits * ZONE_ECHO_LIMIT; // Will reset echoes to 0 if awaits is 0.
    }
    // Call from Promise.all() and Promise.race()
    function onPossibleParallellAsync(possiblePromise) {
        if (task.echoes && possiblePromise && possiblePromise.constructor === NativePromise) {
            incrementExpectedAwaits();
            return possiblePromise.then(function (x) {
                decrementExpectedAwaits();
                return x;
            }, function (e) {
                decrementExpectedAwaits();
                return rejection(e);
            });
        }
        return possiblePromise;
    }
    function zoneEnterEcho(targetZone) {
        ++totalEchoes;
        if (!task.echoes || --task.echoes === 0) {
            task.echoes = task.id = 0; // Cancel zone echoing.
        }
        zoneStack.push(PSD);
        switchToZone(targetZone, true);
    }
    function zoneLeaveEcho() {
        var zone = zoneStack[zoneStack.length - 1];
        zoneStack.pop();
        switchToZone(zone, false);
    }
    function switchToZone(targetZone, bEnteringZone) {
        var currentZone = PSD;
        if (bEnteringZone ? task.echoes && (!zoneEchoes++ || targetZone !== PSD) : zoneEchoes && (!--zoneEchoes || targetZone !== PSD)) {
            // Enter or leave zone asynchronically as well, so that tasks initiated during current tick
            // will be surrounded by the zone when they are invoked.
            enqueueNativeMicroTask(bEnteringZone ? zoneEnterEcho.bind(null, targetZone) : zoneLeaveEcho);
        }
        if (targetZone === PSD)
            return;
        PSD = targetZone; // The actual zone switch occurs at this line.
        // Snapshot on every leave from global zone.
        if (currentZone === globalPSD)
            globalPSD.env = snapShot();
        if (patchGlobalPromise) {
            // Let's patch the global and native Promises (may be same or may be different)
            var GlobalPromise = globalPSD.env.Promise;
            // Swich environments (may be PSD-zone or the global zone. Both apply.)
            var targetEnv = targetZone.env;
            // Change Promise.prototype.then for native and global Promise (they MAY differ on polyfilled environments, but both can be accessed)
            // Must be done on each zone change because the patched method contains targetZone in its closure.
            nativePromiseProto.then = targetEnv.nthen;
            GlobalPromise.prototype.then = targetEnv.gthen;
            if (currentZone.global || targetZone.global) {
                // Leaving or entering global zone. It's time to patch / restore global Promise.
                // Set this Promise to window.Promise so that transiled async functions will work on Firefox, Safari and IE, as well as with Zonejs and angular.
                Object.defineProperty(_global, 'Promise', targetEnv.PromiseProp);
                // Support Promise.all() etc to work indexedDB-safe also when people are including es6-promise as a module (they might
                // not be accessing global.Promise but a local reference to it)
                GlobalPromise.all = targetEnv.all;
                GlobalPromise.race = targetEnv.race;
                GlobalPromise.resolve = targetEnv.resolve;
                GlobalPromise.reject = targetEnv.reject;
            }
        }
    }
    function snapShot() {
        var GlobalPromise = _global.Promise;
        return patchGlobalPromise ? {
            Promise: GlobalPromise,
            PromiseProp: Object.getOwnPropertyDescriptor(_global, "Promise"),
            all: GlobalPromise.all,
            race: GlobalPromise.race,
            resolve: GlobalPromise.resolve,
            reject: GlobalPromise.reject,
            nthen: nativePromiseProto.then,
            gthen: GlobalPromise.prototype.then
        } : {};
    }
    function usePSD(psd, fn, a1, a2, a3) {
        var outerScope = PSD;
        try {
            switchToZone(psd, true);
            return fn(a1, a2, a3);
        }
        finally {
            switchToZone(outerScope, false);
        }
    }
    function enqueueNativeMicroTask(job) {
        //
        // Precondition: nativePromiseThen !== undefined
        //
        nativePromiseThen.call(resolvedNativePromise, job);
    }
    function nativeAwaitCompatibleWrap(fn, zone, possibleAwait) {
        return typeof fn !== 'function' ? fn : function () {
            var outerZone = PSD;
            if (possibleAwait)
                incrementExpectedAwaits();
            switchToZone(zone, true);
            try {
                return fn.apply(this, arguments);
            }
            finally {
                switchToZone(outerZone, false);
            }
        };
    }
    function getPatchedPromiseThen(origThen, zone) {
        return function (onResolved, onRejected) {
            return origThen.call(this, nativeAwaitCompatibleWrap(onResolved, zone, false), nativeAwaitCompatibleWrap(onRejected, zone, false));
        };
    }
    var UNHANDLEDREJECTION = "unhandledrejection";
    function globalError(err, promise) {
        var rv;
        try {
            rv = promise.onuncatched(err);
        }
        catch (e) { }
        if (rv !== false)
            try {
                var event, eventData = { promise: promise, reason: err };
                if (_global.document && document.createEvent) {
                    event = document.createEvent('Event');
                    event.initEvent(UNHANDLEDREJECTION, true, true);
                    extend(event, eventData);
                }
                else if (_global.CustomEvent) {
                    event = new CustomEvent(UNHANDLEDREJECTION, { detail: eventData });
                    extend(event, eventData);
                }
                if (event && _global.dispatchEvent) {
                    dispatchEvent(event);
                    if (!_global.PromiseRejectionEvent && _global.onunhandledrejection)
                        // No native support for PromiseRejectionEvent but user has set window.onunhandledrejection. Manually call it.
                        try {
                            _global.onunhandledrejection(event);
                        }
                        catch (_) { }
                }
                if (!event.defaultPrevented) {
                    console.warn("Unhandled rejection: " + (err.stack || err));
                }
            }
            catch (e) { }
    }
    var rejection = Promise$1.reject;

    function Events(ctx) {
        var evs = {};
        var rv = function (eventName, subscriber) {
            if (subscriber) {
                // Subscribe. If additional arguments than just the subscriber was provided, forward them as well.
                var i = arguments.length, args = new Array(i - 1);
                while (--i)
                    args[i - 1] = arguments[i];
                evs[eventName].subscribe.apply(null, args);
                return ctx;
            }
            else if (typeof (eventName) === 'string') {
                // Return interface allowing to fire or unsubscribe from event
                return evs[eventName];
            }
        };
        rv.addEventType = add;
        for (var i = 1, l = arguments.length; i < l; ++i) {
            add(arguments[i]);
        }
        return rv;
        function add(eventName, chainFunction, defaultFunction) {
            if (typeof eventName === 'object')
                return addConfiguredEvents(eventName);
            if (!chainFunction)
                chainFunction = reverseStoppableEventChain;
            if (!defaultFunction)
                defaultFunction = nop;
            var context = {
                subscribers: [],
                fire: defaultFunction,
                subscribe: function (cb) {
                    if (context.subscribers.indexOf(cb) === -1) {
                        context.subscribers.push(cb);
                        context.fire = chainFunction(context.fire, cb);
                    }
                },
                unsubscribe: function (cb) {
                    context.subscribers = context.subscribers.filter(function (fn) { return fn !== cb; });
                    context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
                }
            };
            evs[eventName] = rv[eventName] = context;
            return context;
        }
        function addConfiguredEvents(cfg) {
            // events(this, {reading: [functionChain, nop]});
            keys$1(cfg).forEach(function (eventName) {
                var args = cfg[eventName];
                if (isArray$1(args)) {
                    add(eventName, cfg[eventName][0], cfg[eventName][1]);
                }
                else if (args === 'asap') {
                    // Rather than approaching event subscription using a functional approach, we here do it in a for-loop where subscriber is executed in its own stack
                    // enabling that any exception that occur wont disturb the initiator and also not nescessary be catched and forgotten.
                    var context = add(eventName, mirror, function fire() {
                        // Optimazation-safe cloning of arguments into args.
                        var i = arguments.length, args = new Array(i);
                        while (i--)
                            args[i] = arguments[i];
                        // All each subscriber:
                        context.subscribers.forEach(function (fn) {
                            asap(function fireEvent() {
                                fn.apply(null, args);
                            });
                        });
                    });
                }
                else
                    throw new exceptions.InvalidArgument("Invalid event config");
            });
        }
    }

    /*
     * Dexie.js - a minimalistic wrapper for IndexedDB
     * ===============================================
     *
     * Copyright (c) 2014-2017 David Fahlander
     *
     * Version {version}, {date}
     *
     * http://dexie.org
     *
     * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/LICENSE-2.0
     *
     */
    var DEXIE_VERSION = '{version}';
    var maxString = String.fromCharCode(65535);
    var maxKey = (function () { try {
        IDBKeyRange.only([[]]);
        return [[]];
    }
    catch (e) {
        return maxString;
    } })();
    var minKey = -Infinity;
    var INVALID_KEY_ARGUMENT = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.";
    var STRING_EXPECTED = "String expected.";
    var connections = [];
    var isIEOrEdge = typeof navigator !== 'undefined' && /(MSIE|Trident|Edge)/.test(navigator.userAgent);
    var hasIEDeleteObjectStoreBug = isIEOrEdge;
    var hangsOnDeleteLargeKeyRange = isIEOrEdge;
    var dexieStackFrameFilter = function (frame) { return !/(dexie\.js|dexie\.min\.js)/.test(frame); };
    var dbNamesDB; // Global database for backing Dexie.getDatabaseNames() on browser without indexedDB.webkitGetDatabaseNames() 
    // Init debug
    setDebug(debug, dexieStackFrameFilter);
    function Dexie(dbName, options) {
        /// <param name="options" type="Object" optional="true">Specify only if you wich to control which addons that should run on this instance</param>
        var deps = Dexie.dependencies;
        var opts = extend({
            // Default Options
            addons: Dexie.addons,
            autoOpen: true,
            indexedDB: deps.indexedDB,
            IDBKeyRange: deps.IDBKeyRange // Backend IDBKeyRange api. Default to browser env.
        }, options);
        var addons = opts.addons, autoOpen = opts.autoOpen, indexedDB = opts.indexedDB, IDBKeyRange = opts.IDBKeyRange;
        var globalSchema = this._dbSchema = {};
        var versions = [];
        var dbStoreNames = [];
        var allTables = {};
        ///<var type="IDBDatabase" />
        var idbdb = null; // Instance of IDBDatabase
        var dbOpenError = null;
        var isBeingOpened = false;
        var onReadyBeingFired = null;
        var openComplete = false;
        var READONLY = "readonly", READWRITE = "readwrite";
        var db = this;
        var dbReadyResolve, dbReadyPromise = new Promise$1(function (resolve) {
            dbReadyResolve = resolve;
        }), cancelOpen, openCanceller = new Promise$1(function (_, reject) {
            cancelOpen = reject;
        });
        var autoSchema = true;
        var hasNativeGetDatabaseNames = !!getNativeGetDatabaseNamesFn(indexedDB), hasGetAll;
        function init() {
            // Default subscribers to "versionchange" and "blocked".
            // Can be overridden by custom handlers. If custom handlers return false, these default
            // behaviours will be prevented.
            db.on("versionchange", function (ev) {
                // Default behavior for versionchange event is to close database connection.
                // Caller can override this behavior by doing db.on("versionchange", function(){ return false; });
                // Let's not block the other window from making it's delete() or open() call.
                // NOTE! This event is never fired in IE,Edge or Safari.
                if (ev.newVersion > 0)
                    console.warn("Another connection wants to upgrade database '" + db.name + "'. Closing db now to resume the upgrade.");
                else
                    console.warn("Another connection wants to delete database '" + db.name + "'. Closing db now to resume the delete request.");
                db.close();
                // In many web applications, it would be recommended to force window.reload()
                // when this event occurs. To do that, subscribe to the versionchange event
                // and call window.location.reload(true) if ev.newVersion > 0 (not a deletion)
                // The reason for this is that your current web app obviously has old schema code that needs
                // to be updated. Another window got a newer version of the app and needs to upgrade DB but
                // your window is blocking it unless we close it here.
            });
            db.on("blocked", function (ev) {
                if (!ev.newVersion || ev.newVersion < ev.oldVersion)
                    console.warn("Dexie.delete('" + db.name + "') was blocked");
                else
                    console.warn("Upgrade '" + db.name + "' blocked by other connection holding version " + ev.oldVersion / 10);
            });
        }
        //
        //
        //
        // ------------------------- Versioning Framework---------------------------
        //
        //
        //
        this.version = function (versionNumber) {
            /// <param name="versionNumber" type="Number"></param>
            /// <returns type="Version"></returns>
            if (idbdb || isBeingOpened)
                throw new exceptions.Schema("Cannot add version when database is open");
            this.verno = Math.max(this.verno, versionNumber);
            var versionInstance = versions.filter(function (v) { return v._cfg.version === versionNumber; })[0];
            if (versionInstance)
                return versionInstance;
            versionInstance = new Version(versionNumber);
            versions.push(versionInstance);
            versions.sort(lowerVersionFirst);
            // Disable autoschema mode, as at least one version is specified.
            autoSchema = false;
            return versionInstance;
        };
        function Version(versionNumber) {
            this._cfg = {
                version: versionNumber,
                storesSource: null,
                dbschema: {},
                tables: {},
                contentUpgrade: null
            };
            this.stores({}); // Derive earlier schemas by default.
        }
        extend(Version.prototype, {
            stores: function (stores) {
                /// <summary>
                ///   Defines the schema for a particular version
                /// </summary>
                /// <param name="stores" type="Object">
                /// Example: <br/>
                ///   {users: "id++,first,last,&amp;username,*email", <br/>
                ///   passwords: "id++,&amp;username"}<br/>
                /// <br/>
                /// Syntax: {Table: "[primaryKey][++],[&amp;][*]index1,[&amp;][*]index2,..."}<br/><br/>
                /// Special characters:<br/>
                ///  "&amp;"  means unique key, <br/>
                ///  "*"  means value is multiEntry, <br/>
                ///  "++" means auto-increment and only applicable for primary key <br/>
                /// </param>
                this._cfg.storesSource = this._cfg.storesSource ? extend(this._cfg.storesSource, stores) : stores;
                // Derive stores from earlier versions if they are not explicitely specified as null or a new syntax.
                var storesSpec = {};
                versions.forEach(function (version) {
                    extend(storesSpec, version._cfg.storesSource);
                });
                var dbschema = (this._cfg.dbschema = {});
                this._parseStoresSpec(storesSpec, dbschema);
                // Update the latest schema to this version
                // Update API
                globalSchema = db._dbSchema = dbschema;
                removeTablesApi([allTables, db, Transaction.prototype]); // Keep Transaction.prototype even though it should be depr.
                setApiOnPlace([allTables, db, Transaction.prototype, this._cfg.tables], keys$1(dbschema), dbschema);
                dbStoreNames = keys$1(dbschema);
                return this;
            },
            upgrade: function (upgradeFunction) {
                this._cfg.contentUpgrade = upgradeFunction;
                return this;
            },
            _parseStoresSpec: function (stores, outSchema) {
                keys$1(stores).forEach(function (tableName) {
                    if (stores[tableName] !== null) {
                        var instanceTemplate = {};
                        var indexes = parseIndexSyntax(stores[tableName]);
                        var primKey = indexes.shift();
                        if (primKey.multi)
                            throw new exceptions.Schema("Primary key cannot be multi-valued");
                        if (primKey.keyPath)
                            setByKeyPath(instanceTemplate, primKey.keyPath, primKey.auto ? 0 : primKey.keyPath);
                        indexes.forEach(function (idx) {
                            if (idx.auto)
                                throw new exceptions.Schema("Only primary key can be marked as autoIncrement (++)");
                            if (!idx.keyPath)
                                throw new exceptions.Schema("Index must have a name and cannot be an empty string");
                            setByKeyPath(instanceTemplate, idx.keyPath, idx.compound ? idx.keyPath.map(function () { return ""; }) : "");
                        });
                        outSchema[tableName] = new TableSchema(tableName, primKey, indexes, instanceTemplate);
                    }
                });
            }
        });
        function runUpgraders(oldVersion, idbtrans, reject) {
            var trans = db._createTransaction(READWRITE, dbStoreNames, globalSchema);
            trans.create(idbtrans);
            trans._completion.catch(reject);
            var rejectTransaction = trans._reject.bind(trans);
            newScope(function () {
                PSD.trans = trans;
                if (oldVersion === 0) {
                    // Create tables:
                    keys$1(globalSchema).forEach(function (tableName) {
                        createTable(idbtrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
                    });
                    Promise$1.follow(function () { return db.on.populate.fire(trans); }).catch(rejectTransaction);
                }
                else
                    updateTablesAndIndexes(oldVersion, trans, idbtrans).catch(rejectTransaction);
            });
        }
        function updateTablesAndIndexes(oldVersion, trans, idbtrans) {
            // Upgrade version to version, step-by-step from oldest to newest version.
            // Each transaction object will contain the table set that was current in that version (but also not-yet-deleted tables from its previous version)
            var queue = [];
            var oldVersionStruct = versions.filter(function (version) { return version._cfg.version === oldVersion; })[0];
            if (!oldVersionStruct)
                throw new exceptions.Upgrade("Dexie specification of currently installed DB version is missing");
            globalSchema = db._dbSchema = oldVersionStruct._cfg.dbschema;
            var anyContentUpgraderHasRun = false;
            var versToRun = versions.filter(function (v) { return v._cfg.version > oldVersion; });
            versToRun.forEach(function (version) {
                /// <param name="version" type="Version"></param>
                queue.push(function () {
                    var oldSchema = globalSchema;
                    var newSchema = version._cfg.dbschema;
                    adjustToExistingIndexNames(oldSchema, idbtrans);
                    adjustToExistingIndexNames(newSchema, idbtrans);
                    globalSchema = db._dbSchema = newSchema;
                    var diff = getSchemaDiff(oldSchema, newSchema);
                    // Add tables           
                    diff.add.forEach(function (tuple) {
                        createTable(idbtrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
                    });
                    // Change tables
                    diff.change.forEach(function (change) {
                        if (change.recreate) {
                            throw new exceptions.Upgrade("Not yet support for changing primary key");
                        }
                        else {
                            var store = idbtrans.objectStore(change.name);
                            // Add indexes
                            change.add.forEach(function (idx) {
                                addIndex(store, idx);
                            });
                            // Update indexes
                            change.change.forEach(function (idx) {
                                store.deleteIndex(idx.name);
                                addIndex(store, idx);
                            });
                            // Delete indexes
                            change.del.forEach(function (idxName) {
                                store.deleteIndex(idxName);
                            });
                        }
                    });
                    if (version._cfg.contentUpgrade) {
                        anyContentUpgraderHasRun = true;
                        return Promise$1.follow(function () {
                            version._cfg.contentUpgrade(trans);
                        });
                    }
                });
                queue.push(function (idbtrans) {
                    if (!anyContentUpgraderHasRun || !hasIEDeleteObjectStoreBug) {
                        var newSchema = version._cfg.dbschema;
                        // Delete old tables
                        deleteRemovedTables(newSchema, idbtrans);
                    }
                });
            });
            // Now, create a queue execution engine
            function runQueue() {
                return queue.length ? Promise$1.resolve(queue.shift()(trans.idbtrans)).then(runQueue) :
                    Promise$1.resolve();
            }
            return runQueue().then(function () {
                createMissingTables(globalSchema, idbtrans); // At last, make sure to create any missing tables. (Needed by addons that add stores to DB without specifying version)
            });
        }
        function getSchemaDiff(oldSchema, newSchema) {
            var diff = {
                del: [],
                add: [],
                change: [] // Array of {name: tableName, recreate: newDefinition, del: delIndexNames, add: newIndexDefs, change: changedIndexDefs}
            };
            for (var table in oldSchema) {
                if (!newSchema[table])
                    diff.del.push(table);
            }
            for (table in newSchema) {
                var oldDef = oldSchema[table], newDef = newSchema[table];
                if (!oldDef) {
                    diff.add.push([table, newDef]);
                }
                else {
                    var change = {
                        name: table,
                        def: newDef,
                        recreate: false,
                        del: [],
                        add: [],
                        change: []
                    };
                    if (oldDef.primKey.src !== newDef.primKey.src) {
                        // Primary key has changed. Remove and re-add table.
                        change.recreate = true;
                        diff.change.push(change);
                    }
                    else {
                        // Same primary key. Just find out what differs:
                        var oldIndexes = oldDef.idxByName;
                        var newIndexes = newDef.idxByName;
                        for (var idxName in oldIndexes) {
                            if (!newIndexes[idxName])
                                change.del.push(idxName);
                        }
                        for (idxName in newIndexes) {
                            var oldIdx = oldIndexes[idxName], newIdx = newIndexes[idxName];
                            if (!oldIdx)
                                change.add.push(newIdx);
                            else if (oldIdx.src !== newIdx.src)
                                change.change.push(newIdx);
                        }
                        if (change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
                            diff.change.push(change);
                        }
                    }
                }
            }
            return diff;
        }
        function createTable(idbtrans, tableName, primKey, indexes) {
            /// <param name="idbtrans" type="IDBTransaction"></param>
            var store = idbtrans.db.createObjectStore(tableName, primKey.keyPath ? { keyPath: primKey.keyPath, autoIncrement: primKey.auto } : { autoIncrement: primKey.auto });
            indexes.forEach(function (idx) { addIndex(store, idx); });
            return store;
        }
        function createMissingTables(newSchema, idbtrans) {
            keys$1(newSchema).forEach(function (tableName) {
                if (!idbtrans.db.objectStoreNames.contains(tableName)) {
                    createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
                }
            });
        }
        function deleteRemovedTables(newSchema, idbtrans) {
            for (var i = 0; i < idbtrans.db.objectStoreNames.length; ++i) {
                var storeName = idbtrans.db.objectStoreNames[i];
                if (newSchema[storeName] == null) {
                    idbtrans.db.deleteObjectStore(storeName);
                }
            }
        }
        function addIndex(store, idx) {
            store.createIndex(idx.name, idx.keyPath, { unique: idx.unique, multiEntry: idx.multi });
        }
        //
        //
        //      Dexie Protected API
        //
        //
        this._allTables = allTables;
        this._createTransaction = function (mode, storeNames, dbschema, parentTransaction) {
            return new Transaction(mode, storeNames, dbschema, parentTransaction);
        };
        /* Generate a temporary transaction when db operations are done outside a transaction scope.
        */
        function tempTransaction(mode, storeNames, fn) {
            if (!openComplete && (!PSD.letThrough)) {
                if (!isBeingOpened) {
                    if (!autoOpen)
                        return rejection(new exceptions.DatabaseClosed());
                    db.open().catch(nop); // Open in background. If if fails, it will be catched by the final promise anyway.
                }
                return dbReadyPromise.then(function () { return tempTransaction(mode, storeNames, fn); });
            }
            else {
                var trans = db._createTransaction(mode, storeNames, globalSchema);
                try {
                    trans.create();
                }
                catch (ex) {
                    return rejection(ex);
                }
                return trans._promise(mode, function (resolve, reject) {
                    return newScope(function () {
                        PSD.trans = trans;
                        return fn(resolve, reject, trans);
                    });
                }).then(function (result) {
                    // Instead of resolving value directly, wait with resolving it until transaction has completed.
                    // Otherwise the data would not be in the DB if requesting it in the then() operation.
                    // Specifically, to ensure that the following expression will work:
                    //
                    //   db.friends.put({name: "Arne"}).then(function () {
                    //       db.friends.where("name").equals("Arne").count(function(count) {
                    //           assert (count === 1);
                    //       });
                    //   });
                    //
                    return trans._completion.then(function () { return result; });
                }); /*.catch(err => { // Don't do this as of now. If would affect bulk- and modify methods in a way that could be more intuitive. But wait! Maybe change in next major.
                    trans._reject(err);
                    return rejection(err);
                });*/
            }
        }
        this._whenReady = function (fn) {
            return openComplete || PSD.letThrough ? fn() : new Promise$1(function (resolve, reject) {
                if (!isBeingOpened) {
                    if (!autoOpen) {
                        reject(new exceptions.DatabaseClosed());
                        return;
                    }
                    db.open().catch(nop); // Open in background. If if fails, it will be catched by the final promise anyway.
                }
                dbReadyPromise.then(resolve, reject);
            }).then(fn);
        };
        //
        //
        //
        //
        //      Dexie API
        //
        //
        //
        this.verno = 0;
        this.open = function () {
            if (isBeingOpened || idbdb)
                return dbReadyPromise.then(function () { return dbOpenError ? rejection(dbOpenError) : db; });
            debug && (openCanceller._stackHolder = getErrorWithStack()); // Let stacks point to when open() was called rather than where new Dexie() was called.
            isBeingOpened = true;
            dbOpenError = null;
            openComplete = false;
            // Function pointers to call when the core opening process completes.
            var resolveDbReady = dbReadyResolve, 
            // upgradeTransaction to abort on failure.
            upgradeTransaction = null;
            return Promise$1.race([openCanceller, new Promise$1(function (resolve, reject) {
                    // Multiply db.verno with 10 will be needed to workaround upgrading bug in IE:
                    // IE fails when deleting objectStore after reading from it.
                    // A future version of Dexie.js will stopover an intermediate version to workaround this.
                    // At that point, we want to be backward compatible. Could have been multiplied with 2, but by using 10, it is easier to map the number to the real version number.
                    // If no API, throw!
                    if (!indexedDB)
                        throw new exceptions.MissingAPI("indexedDB API not found. If using IE10+, make sure to run your code on a server URL " +
                            "(not locally). If using old Safari versions, make sure to include indexedDB polyfill.");
                    var req = autoSchema ? indexedDB.open(dbName) : indexedDB.open(dbName, Math.round(db.verno * 10));
                    if (!req)
                        throw new exceptions.MissingAPI("IndexedDB API not available"); // May happen in Safari private mode, see https://github.com/dfahlander/Dexie.js/issues/134
                    req.onerror = eventRejectHandler(reject);
                    req.onblocked = wrap(fireOnBlocked);
                    req.onupgradeneeded = wrap(function (e) {
                        upgradeTransaction = req.transaction;
                        if (autoSchema && !db._allowEmptyDB) {
                            // Caller did not specify a version or schema. Doing that is only acceptable for opening alread existing databases.
                            // If onupgradeneeded is called it means database did not exist. Reject the open() promise and make sure that we
                            // do not create a new database by accident here.
                            req.onerror = preventDefault; // Prohibit onabort error from firing before we're done!
                            upgradeTransaction.abort(); // Abort transaction (would hope that this would make DB disappear but it doesnt.)
                            // Close database and delete it.
                            req.result.close();
                            var delreq = indexedDB.deleteDatabase(dbName); // The upgrade transaction is atomic, and javascript is single threaded - meaning that there is no risk that we delete someone elses database here!
                            delreq.onsuccess = delreq.onerror = wrap(function () {
                                reject(new exceptions.NoSuchDatabase("Database " + dbName + " doesnt exist"));
                            });
                        }
                        else {
                            upgradeTransaction.onerror = eventRejectHandler(reject);
                            var oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion; // Safari 8 fix.
                            runUpgraders(oldVer / 10, upgradeTransaction, reject);
                        }
                    }, reject);
                    req.onsuccess = wrap(function () {
                        // Core opening procedure complete. Now let's just record some stuff.
                        upgradeTransaction = null;
                        idbdb = req.result;
                        connections.push(db); // Used for emulating versionchange event on IE/Edge/Safari.
                        if (autoSchema)
                            readGlobalSchema();
                        else if (idbdb.objectStoreNames.length > 0) {
                            try {
                                adjustToExistingIndexNames(globalSchema, idbdb.transaction(safariMultiStoreFix(idbdb.objectStoreNames), READONLY));
                            }
                            catch (e) {
                                // Safari may bail out if > 1 store names. However, this shouldnt be a showstopper. Issue #120.
                            }
                        }
                        idbdb.onversionchange = wrap(function (ev) {
                            db._vcFired = true; // detect implementations that not support versionchange (IE/Edge/Safari)
                            db.on("versionchange").fire(ev);
                        });
                        if (!hasNativeGetDatabaseNames && dbName !== '__dbnames') {
                            dbNamesDB.dbnames.put({ name: dbName }).catch(nop);
                        }
                        resolve();
                    }, reject);
                })]).then(function () {
                // Before finally resolving the dbReadyPromise and this promise,
                // call and await all on('ready') subscribers:
                // Dexie.vip() makes subscribers able to use the database while being opened.
                // This is a must since these subscribers take part of the opening procedure.
                onReadyBeingFired = [];
                return Promise$1.resolve(Dexie.vip(db.on.ready.fire)).then(function fireRemainders() {
                    if (onReadyBeingFired.length > 0) {
                        // In case additional subscribers to db.on('ready') were added during the time db.on.ready.fire was executed.
                        var remainders = onReadyBeingFired.reduce(promisableChain, nop);
                        onReadyBeingFired = [];
                        return Promise$1.resolve(Dexie.vip(remainders)).then(fireRemainders);
                    }
                });
            }).finally(function () {
                onReadyBeingFired = null;
            }).then(function () {
                // Resolve the db.open() with the db instance.
                isBeingOpened = false;
                return db;
            }).catch(function (err) {
                try {
                    // Did we fail within onupgradeneeded? Make sure to abort the upgrade transaction so it doesnt commit.
                    upgradeTransaction && upgradeTransaction.abort();
                }
                catch (e) { }
                isBeingOpened = false; // Set before calling db.close() so that it doesnt reject openCanceller again (leads to unhandled rejection event).
                db.close(); // Closes and resets idbdb, removes connections, resets dbReadyPromise and openCanceller so that a later db.open() is fresh.
                // A call to db.close() may have made on-ready subscribers fail. Use dbOpenError if set, since err could be a follow-up error on that.
                dbOpenError = err; // Record the error. It will be used to reject further promises of db operations.
                return rejection(dbOpenError);
            }).finally(function () {
                openComplete = true;
                resolveDbReady(); // dbReadyPromise is resolved no matter if open() rejects or resolved. It's just to wake up waiters.
            });
        };
        this.close = function () {
            var idx = connections.indexOf(db);
            if (idx >= 0)
                connections.splice(idx, 1);
            if (idbdb) {
                try {
                    idbdb.close();
                }
                catch (e) { }
                idbdb = null;
            }
            autoOpen = false;
            dbOpenError = new exceptions.DatabaseClosed();
            if (isBeingOpened)
                cancelOpen(dbOpenError);
            // Reset dbReadyPromise promise:
            dbReadyPromise = new Promise$1(function (resolve) {
                dbReadyResolve = resolve;
            });
            openCanceller = new Promise$1(function (_, reject) {
                cancelOpen = reject;
            });
        };
        this.delete = function () {
            var hasArguments = arguments.length > 0;
            return new Promise$1(function (resolve, reject) {
                if (hasArguments)
                    throw new exceptions.InvalidArgument("Arguments not allowed in db.delete()");
                if (isBeingOpened) {
                    dbReadyPromise.then(doDelete);
                }
                else {
                    doDelete();
                }
                function doDelete() {
                    db.close();
                    var req = indexedDB.deleteDatabase(dbName);
                    req.onsuccess = wrap(function () {
                        if (!hasNativeGetDatabaseNames) {
                            dbNamesDB.dbnames.delete(dbName).catch(nop);
                        }
                        resolve();
                    });
                    req.onerror = eventRejectHandler(reject);
                    req.onblocked = fireOnBlocked;
                }
            });
        };
        this.backendDB = function () {
            return idbdb;
        };
        this.isOpen = function () {
            return idbdb !== null;
        };
        this.hasBeenClosed = function () {
            return dbOpenError && (dbOpenError instanceof exceptions.DatabaseClosed);
        };
        this.hasFailed = function () {
            return dbOpenError !== null;
        };
        this.dynamicallyOpened = function () {
            return autoSchema;
        };
        //
        // Properties
        //
        this.name = dbName;
        // db.tables - an array of all Table instances.
        props(this, {
            tables: {
                get: function () {
                    /// <returns type="Array" elementType="Table" />
                    return keys$1(allTables).map(function (name) { return allTables[name]; });
                }
            }
        });
        //
        // Events
        //
        this.on = Events(this, "populate", "blocked", "versionchange", { ready: [promisableChain, nop] });
        this.on.ready.subscribe = override(this.on.ready.subscribe, function (subscribe) {
            return function (subscriber, bSticky) {
                Dexie.vip(function () {
                    if (openComplete) {
                        // Database already open. Call subscriber asap.
                        if (!dbOpenError)
                            Promise$1.resolve().then(subscriber);
                        // bSticky: Also subscribe to future open sucesses (after close / reopen) 
                        if (bSticky)
                            subscribe(subscriber);
                    }
                    else if (onReadyBeingFired) {
                        // db.on('ready') subscribers are currently being executed and have not yet resolved or rejected
                        onReadyBeingFired.push(subscriber);
                        if (bSticky)
                            subscribe(subscriber);
                    }
                    else {
                        // Database not yet open. Subscribe to it.
                        subscribe(subscriber);
                        // If bSticky is falsy, make sure to unsubscribe subscriber when fired once.
                        if (!bSticky)
                            subscribe(function unsubscribe() {
                                db.on.ready.unsubscribe(subscriber);
                                db.on.ready.unsubscribe(unsubscribe);
                            });
                    }
                });
            };
        });
        this.transaction = function () {
            /// <summary>
            ///
            /// </summary>
            /// <param name="mode" type="String">"r" for readonly, or "rw" for readwrite</param>
            /// <param name="tableInstances">Table instance, Array of Table instances, String or String Array of object stores to include in the transaction</param>
            /// <param name="scopeFunc" type="Function">Function to execute with transaction</param>
            var args = extractTransactionArgs.apply(this, arguments);
            return this._transaction.apply(this, args);
        };
        function extractTransactionArgs(mode, _tableArgs_, scopeFunc) {
            // Let table arguments be all arguments between mode and last argument.
            var i = arguments.length;
            if (i < 2)
                throw new exceptions.InvalidArgument("Too few arguments");
            // Prevent optimzation killer (https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments)
            // and clone arguments except the first one into local var 'args'.
            var args = new Array(i - 1);
            while (--i)
                args[i - 1] = arguments[i];
            // Let scopeFunc be the last argument and pop it so that args now only contain the table arguments.
            scopeFunc = args.pop();
            var tables = flatten(args); // Support using array as middle argument, or a mix of arrays and non-arrays.
            return [mode, tables, scopeFunc];
        }
        this._transaction = function (mode, tables, scopeFunc) {
            var parentTransaction = PSD.trans;
            // Check if parent transactions is bound to this db instance, and if caller wants to reuse it
            if (!parentTransaction || parentTransaction.db !== db || mode.indexOf('!') !== -1)
                parentTransaction = null;
            var onlyIfCompatible = mode.indexOf('?') !== -1;
            mode = mode.replace('!', '').replace('?', ''); // Ok. Will change arguments[0] as well but we wont touch arguments henceforth.
            try {
                //
                // Get storeNames from arguments. Either through given table instances, or through given table names.
                //
                var storeNames = tables.map(function (table) {
                    var storeName = table instanceof Table ? table.name : table;
                    if (typeof storeName !== 'string')
                        throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
                    return storeName;
                });
                //
                // Resolve mode. Allow shortcuts "r" and "rw".
                //
                if (mode == "r" || mode == READONLY)
                    mode = READONLY;
                else if (mode == "rw" || mode == READWRITE)
                    mode = READWRITE;
                else
                    throw new exceptions.InvalidArgument("Invalid transaction mode: " + mode);
                if (parentTransaction) {
                    // Basic checks
                    if (parentTransaction.mode === READONLY && mode === READWRITE) {
                        if (onlyIfCompatible) {
                            // Spawn new transaction instead.
                            parentTransaction = null;
                        }
                        else
                            throw new exceptions.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
                    }
                    if (parentTransaction) {
                        storeNames.forEach(function (storeName) {
                            if (parentTransaction && parentTransaction.storeNames.indexOf(storeName) === -1) {
                                if (onlyIfCompatible) {
                                    // Spawn new transaction instead.
                                    parentTransaction = null;
                                }
                                else
                                    throw new exceptions.SubTransaction("Table " + storeName +
                                        " not included in parent transaction.");
                            }
                        });
                    }
                    if (onlyIfCompatible && parentTransaction && !parentTransaction.active) {
                        // '?' mode should not keep using an inactive transaction.
                        parentTransaction = null;
                    }
                }
            }
            catch (e) {
                return parentTransaction ?
                    parentTransaction._promise(null, function (_, reject) { reject(e); }) :
                    rejection(e);
            }
            // If this is a sub-transaction, lock the parent and then launch the sub-transaction.
            return (parentTransaction ?
                parentTransaction._promise(mode, enterTransactionScope, "lock") :
                PSD.trans ?
                    // no parent transaction despite PSD.trans exists. Make sure also
                    // that the zone we create is not a sub-zone of current, because
                    // Promise.follow() should not wait for it if so.
                    usePSD(PSD.transless, function () { return db._whenReady(enterTransactionScope); }) :
                    db._whenReady(enterTransactionScope));
            function enterTransactionScope() {
                return Promise$1.resolve().then(function () {
                    // Keep a pointer to last non-transactional PSD to use if someone calls Dexie.ignoreTransaction().
                    var transless = PSD.transless || PSD;
                    // Our transaction.
                    //return new Promise((resolve, reject) => {
                    var trans = db._createTransaction(mode, storeNames, globalSchema, parentTransaction);
                    // Let the transaction instance be part of a Promise-specific data (PSD) value.
                    var zoneProps = {
                        trans: trans,
                        transless: transless
                    };
                    if (parentTransaction) {
                        // Emulate transaction commit awareness for inner transaction (must 'commit' when the inner transaction has no more operations ongoing)
                        trans.idbtrans = parentTransaction.idbtrans;
                    }
                    else {
                        trans.create(); // Create the backend transaction so that complete() or error() will trigger even if no operation is made upon it.
                    }
                    // Support for native async await.
                    if (scopeFunc.constructor === AsyncFunction) {
                        incrementExpectedAwaits();
                    }
                    var returnValue;
                    var promiseFollowed = Promise$1.follow(function () {
                        // Finally, call the scope function with our table and transaction arguments.
                        returnValue = scopeFunc.call(trans, trans);
                        if (returnValue) {
                            if (returnValue.constructor === NativePromise) {
                                var decrementor = decrementExpectedAwaits.bind(null, null);
                                returnValue.then(decrementor, decrementor);
                            }
                            else if (typeof returnValue.next === 'function' && typeof returnValue.throw === 'function') {
                                // scopeFunc returned an iterator with throw-support. Handle yield as await.
                                returnValue = awaitIterator(returnValue);
                            }
                        }
                    }, zoneProps);
                    return (returnValue && typeof returnValue.then === 'function' ?
                        // Promise returned. User uses promise-style transactions.
                        Promise$1.resolve(returnValue).then(function (x) { return trans.active ?
                            x // Transaction still active. Continue.
                            : rejection(new exceptions.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn")); })
                        // No promise returned. Wait for all outstanding promises before continuing. 
                        : promiseFollowed.then(function () { return returnValue; })).then(function (x) {
                        // sub transactions don't react to idbtrans.oncomplete. We must trigger a completion:
                        if (parentTransaction)
                            trans._resolve();
                        // wait for trans._completion
                        // (if root transaction, this means 'complete' event. If sub-transaction, we've just fired it ourselves)
                        return trans._completion.then(function () { return x; });
                    }).catch(function (e) {
                        trans._reject(e); // Yes, above then-handler were maybe not called because of an unhandled rejection in scopeFunc!
                        return rejection(e);
                    });
                });
            }
        };
        this.table = function (tableName) {
            /// <returns type="Table"></returns>
            if (!hasOwn(allTables, tableName)) {
                throw new exceptions.InvalidTable("Table " + tableName + " does not exist");
            }
            return allTables[tableName];
        };
        //
        //
        //
        // Table Class
        //
        //
        //
        function Table(name, tableSchema, optionalTrans) {
            /// <param name="name" type="String"></param>
            this.name = name;
            this.schema = tableSchema;
            this._tx = optionalTrans;
            this.hook = allTables[name] ? allTables[name].hook : Events(null, {
                "creating": [hookCreatingChain, nop],
                "reading": [pureFunctionChain, mirror],
                "updating": [hookUpdatingChain, nop],
                "deleting": [hookDeletingChain, nop]
            });
        }
        function BulkErrorHandlerCatchAll(errorList, done, supportHooks) {
            return (supportHooks ? hookedEventRejectHandler : eventRejectHandler)(function (e) {
                errorList.push(e);
                done && done();
            });
        }
        function bulkDelete(idbstore, trans, keysOrTuples, hasDeleteHook, deletingHook) {
            // If hasDeleteHook, keysOrTuples must be an array of tuples: [[key1, value2],[key2,value2],...],
            // else keysOrTuples must be just an array of keys: [key1, key2, ...].
            return new Promise$1(function (resolve, reject) {
                var len = keysOrTuples.length, lastItem = len - 1;
                if (len === 0)
                    return resolve();
                if (!hasDeleteHook) {
                    for (var i = 0; i < len; ++i) {
                        var req = idbstore.delete(keysOrTuples[i]);
                        req.onerror = eventRejectHandler(reject);
                        if (i === lastItem)
                            req.onsuccess = wrap(function () { return resolve(); });
                    }
                }
                else {
                    var hookCtx, errorHandler = hookedEventRejectHandler(reject), successHandler = hookedEventSuccessHandler(null);
                    tryCatch(function () {
                        for (var i = 0; i < len; ++i) {
                            hookCtx = { onsuccess: null, onerror: null };
                            var tuple = keysOrTuples[i];
                            deletingHook.call(hookCtx, tuple[0], tuple[1], trans);
                            var req = idbstore.delete(tuple[0]);
                            req._hookCtx = hookCtx;
                            req.onerror = errorHandler;
                            if (i === lastItem)
                                req.onsuccess = hookedEventSuccessHandler(resolve);
                            else
                                req.onsuccess = successHandler;
                        }
                    }, function (err) {
                        hookCtx.onerror && hookCtx.onerror(err);
                        throw err;
                    });
                }
            });
        }
        props(Table.prototype, {
            //
            // Table Protected Methods
            //
            _trans: function getTransaction(mode, fn, writeLocked) {
                var trans = this._tx || PSD.trans;
                return trans && trans.db === db ?
                    trans === PSD.trans ?
                        trans._promise(mode, fn, writeLocked) :
                        newScope(function () { return trans._promise(mode, fn, writeLocked); }, { trans: trans, transless: PSD.transless || PSD }) :
                    tempTransaction(mode, [this.name], fn);
            },
            _idbstore: function getIDBObjectStore(mode, fn, writeLocked) {
                var tableName = this.name;
                function supplyIdbStore(resolve, reject, trans) {
                    if (trans.storeNames.indexOf(tableName) === -1)
                        throw new exceptions.NotFound("Table" + tableName + " not part of transaction");
                    return fn(resolve, reject, trans.idbtrans.objectStore(tableName), trans);
                }
                return this._trans(mode, supplyIdbStore, writeLocked);
            },
            //
            // Table Public Methods
            //
            get: function (keyOrCrit, cb) {
                if (keyOrCrit && keyOrCrit.constructor === Object)
                    return this.where(keyOrCrit).first(cb);
                var self = this;
                return this._idbstore(READONLY, function (resolve, reject, idbstore) {
                    var req = idbstore.get(keyOrCrit);
                    req.onerror = eventRejectHandler(reject);
                    req.onsuccess = wrap(function () {
                        resolve(self.hook.reading.fire(req.result));
                    }, reject);
                }).then(cb);
            },
            where: function (indexOrCrit) {
                if (typeof indexOrCrit === 'string')
                    return new WhereClause(this, indexOrCrit);
                if (isArray$1(indexOrCrit))
                    return new WhereClause(this, "[" + indexOrCrit.join('+') + "]");
                // indexOrCrit is an object map of {[keyPath]:value} 
                var keyPaths = keys$1(indexOrCrit);
                if (keyPaths.length === 1)
                    // Only one critera. This was the easy case:
                    return this
                        .where(keyPaths[0])
                        .equals(indexOrCrit[keyPaths[0]]);
                // Multiple criterias.
                // Let's try finding a compound index that matches all keyPaths in
                // arbritary order:
                var compoundIndex = this.schema.indexes.concat(this.schema.primKey).filter(function (ix) {
                    return ix.compound &&
                        keyPaths.every(function (keyPath) { return ix.keyPath.indexOf(keyPath) >= 0; }) &&
                        ix.keyPath.every(function (keyPath) { return keyPaths.indexOf(keyPath) >= 0; });
                })[0];
                if (compoundIndex && maxKey !== maxString)
                    // Cool! We found such compound index
                    // and this browser supports compound indexes (maxKey !== maxString)!
                    return this
                        .where(compoundIndex.name)
                        .equals(compoundIndex.keyPath.map(function (kp) { return indexOrCrit[kp]; }));
                if (!compoundIndex)
                    console.warn("The query " + JSON.stringify(indexOrCrit) + " on " + this.name + " would benefit of a " +
                        ("compound index [" + keyPaths.join('+') + "]"));
                // Ok, now let's fallback to finding at least one matching index
                // and filter the rest.
                var idxByName = this.schema.idxByName;
                var simpleIndex = keyPaths.reduce(function (r, keyPath) { return [
                    r[0] || idxByName[keyPath],
                    r[0] || !idxByName[keyPath] ?
                        combine(r[1], function (x) { return '' + getByKeyPath(x, keyPath) ==
                            '' + indexOrCrit[keyPath]; })
                        : r[1]
                ]; }, [null, null]);
                var idx = simpleIndex[0];
                return idx ?
                    this.where(idx.name).equals(indexOrCrit[idx.keyPath])
                        .filter(simpleIndex[1]) :
                    compoundIndex ?
                        this.filter(simpleIndex[1]) : // Has compound but browser bad. Allow filter.
                        this.where(keyPaths).equals(''); // No index at all. Fail lazily.
            },
            count: function (cb) {
                return this.toCollection().count(cb);
            },
            offset: function (offset) {
                return this.toCollection().offset(offset);
            },
            limit: function (numRows) {
                return this.toCollection().limit(numRows);
            },
            reverse: function () {
                return this.toCollection().reverse();
            },
            filter: function (filterFunction) {
                return this.toCollection().and(filterFunction);
            },
            each: function (fn) {
                return this.toCollection().each(fn);
            },
            toArray: function (cb) {
                return this.toCollection().toArray(cb);
            },
            orderBy: function (index) {
                return new Collection(new WhereClause(this, isArray$1(index) ?
                    "[" + index.join('+') + "]" :
                    index));
            },
            toCollection: function () {
                return new Collection(new WhereClause(this));
            },
            mapToClass: function (constructor, structure) {
                /// <summary>
                ///     Map table to a javascript constructor function. Objects returned from the database will be instances of this class, making
                ///     it possible to the instanceOf operator as well as extending the class using constructor.prototype.method = function(){...}.
                /// </summary>
                /// <param name="constructor">Constructor function representing the class.</param>
                /// <param name="structure" optional="true">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
                /// know what type each member has. Example: {name: String, emailAddresses: [String], password}</param>
                this.schema.mappedClass = constructor;
                var instanceTemplate = Object.create(constructor.prototype);
                if (structure) {
                    // structure and instanceTemplate is for IDE code competion only while constructor.prototype is for actual inheritance.
                    applyStructure(instanceTemplate, structure);
                }
                this.schema.instanceTemplate = instanceTemplate;
                // Now, subscribe to the when("reading") event to make all objects that come out from this table inherit from given class
                // no matter which method to use for reading (Table.get() or Table.where(...)... )
                var readHook = function (obj) {
                    if (!obj)
                        return obj; // No valid object. (Value is null). Return as is.
                    // Create a new object that derives from constructor:
                    var res = Object.create(constructor.prototype);
                    // Clone members:
                    for (var m in obj)
                        if (hasOwn(obj, m))
                            try {
                                res[m] = obj[m];
                            }
                            catch (_) { }
                    return res;
                };
                if (this.schema.readHook) {
                    this.hook.reading.unsubscribe(this.schema.readHook);
                }
                this.schema.readHook = readHook;
                this.hook("reading", readHook);
                return constructor;
            },
            defineClass: function (structure) {
                /// <summary>
                ///     Define all members of the class that represents the table. This will help code completion of when objects are read from the database
                ///     as well as making it possible to extend the prototype of the returned constructor function.
                /// </summary>
                /// <param name="structure">Helps IDE code completion by knowing the members that objects contain and not just the indexes. Also
                /// know what type each member has. Example: {name: String, emailAddresses: [String], properties: {shoeSize: Number}}</param>
                return this.mapToClass(Dexie.defineClass(structure), structure);
            },
            bulkDelete: function (keys$$1) {
                if (this.hook.deleting.fire === nop) {
                    return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
                        resolve(bulkDelete(idbstore, trans, keys$$1, false, nop));
                    });
                }
                else {
                    return this
                        .where(':id')
                        .anyOf(keys$$1)
                        .delete()
                        .then(function () { }); // Resolve with undefined.
                }
            },
            bulkPut: function (objects, keys$$1) {
                var _this = this;
                return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                    if (!idbstore.keyPath && !_this.schema.primKey.auto && !keys$$1)
                        throw new exceptions.InvalidArgument("bulkPut() with non-inbound keys requires keys array in second argument");
                    if (idbstore.keyPath && keys$$1)
                        throw new exceptions.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
                    if (keys$$1 && keys$$1.length !== objects.length)
                        throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
                    if (objects.length === 0)
                        return resolve(); // Caller provided empty list.
                    var done = function (result) {
                        if (errorList.length === 0)
                            resolve(result);
                        else
                            reject(new BulkError(_this.name + ".bulkPut(): " + errorList.length + " of " + numObjs + " operations failed", errorList));
                    };
                    var req, errorList = [], errorHandler, numObjs = objects.length, table = _this;
                    if (_this.hook.creating.fire === nop && _this.hook.updating.fire === nop) {
                        //
                        // Standard Bulk (no 'creating' or 'updating' hooks to care about)
                        //
                        errorHandler = BulkErrorHandlerCatchAll(errorList);
                        for (var i = 0, l = objects.length; i < l; ++i) {
                            req = keys$$1 ? idbstore.put(objects[i], keys$$1[i]) : idbstore.put(objects[i]);
                            req.onerror = errorHandler;
                        }
                        // Only need to catch success or error on the last operation
                        // according to the IDB spec.
                        req.onerror = BulkErrorHandlerCatchAll(errorList, done);
                        req.onsuccess = eventSuccessHandler(done);
                    }
                    else {
                        var effectiveKeys = keys$$1 || idbstore.keyPath && objects.map(function (o) { return getByKeyPath(o, idbstore.keyPath); });
                        // Generate map of {[key]: object}
                        var objectLookup = effectiveKeys && arrayToObject(effectiveKeys, function (key, i) { return key != null && [key, objects[i]]; });
                        var promise = !effectiveKeys ?
                            // Auto-incremented key-less objects only without any keys argument.
                            table.bulkAdd(objects) :
                            // Keys provided. Either as inbound in provided objects, or as a keys argument.
                            // Begin with updating those that exists in DB:
                            table.where(':id').anyOf(effectiveKeys.filter(function (key) { return key != null; })).modify(function () {
                                this.value = objectLookup[this.primKey];
                                objectLookup[this.primKey] = null; // Mark as "don't add this"
                            }).catch(ModifyError, function (e) {
                                errorList = e.failures; // No need to concat here. These are the first errors added.
                            }).then(function () {
                                // Now, let's examine which items didnt exist so we can add them:
                                var objsToAdd = [], keysToAdd = keys$$1 && [];
                                // Iterate backwards. Why? Because if same key was used twice, just add the last one.
                                for (var i = effectiveKeys.length - 1; i >= 0; --i) {
                                    var key = effectiveKeys[i];
                                    if (key == null || objectLookup[key]) {
                                        objsToAdd.push(objects[i]);
                                        keys$$1 && keysToAdd.push(key);
                                        if (key != null)
                                            objectLookup[key] = null; // Mark as "dont add again"
                                    }
                                }
                                // The items are in reverse order so reverse them before adding.
                                // Could be important in order to get auto-incremented keys the way the caller
                                // would expect. Could have used unshift instead of push()/reverse(),
                                // but: http://jsperf.com/unshift-vs-reverse
                                objsToAdd.reverse();
                                keys$$1 && keysToAdd.reverse();
                                return table.bulkAdd(objsToAdd, keysToAdd);
                            }).then(function (lastAddedKey) {
                                // Resolve with key of the last object in given arguments to bulkPut():
                                var lastEffectiveKey = effectiveKeys[effectiveKeys.length - 1]; // Key was provided.
                                return lastEffectiveKey != null ? lastEffectiveKey : lastAddedKey;
                            });
                        promise.then(done).catch(BulkError, function (e) {
                            // Concat failure from ModifyError and reject using our 'done' method.
                            errorList = errorList.concat(e.failures);
                            done();
                        }).catch(reject);
                    }
                }, "locked"); // If called from transaction scope, lock transaction til all steps are done.
            },
            bulkAdd: function (objects, keys$$1) {
                var self = this, creatingHook = this.hook.creating.fire;
                return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
                    if (!idbstore.keyPath && !self.schema.primKey.auto && !keys$$1)
                        throw new exceptions.InvalidArgument("bulkAdd() with non-inbound keys requires keys array in second argument");
                    if (idbstore.keyPath && keys$$1)
                        throw new exceptions.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
                    if (keys$$1 && keys$$1.length !== objects.length)
                        throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
                    if (objects.length === 0)
                        return resolve(); // Caller provided empty list.
                    function done(result) {
                        if (errorList.length === 0)
                            resolve(result);
                        else
                            reject(new BulkError(self.name + ".bulkAdd(): " + errorList.length + " of " + numObjs + " operations failed", errorList));
                    }
                    var req, errorList = [], errorHandler, successHandler, numObjs = objects.length;
                    if (creatingHook !== nop) {
                        //
                        // There are subscribers to hook('creating')
                        // Must behave as documented.
                        //
                        var keyPath = idbstore.keyPath, hookCtx;
                        errorHandler = BulkErrorHandlerCatchAll(errorList, null, true);
                        successHandler = hookedEventSuccessHandler(null);
                        tryCatch(function () {
                            for (var i = 0, l = objects.length; i < l; ++i) {
                                hookCtx = { onerror: null, onsuccess: null };
                                var key = keys$$1 && keys$$1[i];
                                var obj = objects[i], effectiveKey = keys$$1 ? key : keyPath ? getByKeyPath(obj, keyPath) : undefined, keyToUse = creatingHook.call(hookCtx, effectiveKey, obj, trans);
                                if (effectiveKey == null && keyToUse != null) {
                                    if (keyPath) {
                                        obj = deepClone(obj);
                                        setByKeyPath(obj, keyPath, keyToUse);
                                    }
                                    else {
                                        key = keyToUse;
                                    }
                                }
                                req = key != null ? idbstore.add(obj, key) : idbstore.add(obj);
                                req._hookCtx = hookCtx;
                                if (i < l - 1) {
                                    req.onerror = errorHandler;
                                    if (hookCtx.onsuccess)
                                        req.onsuccess = successHandler;
                                }
                            }
                        }, function (err) {
                            hookCtx.onerror && hookCtx.onerror(err);
                            throw err;
                        });
                        req.onerror = BulkErrorHandlerCatchAll(errorList, done, true);
                        req.onsuccess = hookedEventSuccessHandler(done);
                    }
                    else {
                        //
                        // Standard Bulk (no 'creating' hook to care about)
                        //
                        errorHandler = BulkErrorHandlerCatchAll(errorList);
                        for (var i = 0, l = objects.length; i < l; ++i) {
                            req = keys$$1 ? idbstore.add(objects[i], keys$$1[i]) : idbstore.add(objects[i]);
                            req.onerror = errorHandler;
                        }
                        // Only need to catch success or error on the last operation
                        // according to the IDB spec.
                        req.onerror = BulkErrorHandlerCatchAll(errorList, done);
                        req.onsuccess = eventSuccessHandler(done);
                    }
                });
            },
            add: function (obj, key) {
                /// <summary>
                ///   Add an object to the database. In case an object with same primary key already exists, the object will not be added.
                /// </summary>
                /// <param name="obj" type="Object">A javascript object to insert</param>
                /// <param name="key" optional="true">Primary key</param>
                var creatingHook = this.hook.creating.fire;
                return this._idbstore(READWRITE, function (resolve, reject, idbstore, trans) {
                    var hookCtx = { onsuccess: null, onerror: null };
                    if (creatingHook !== nop) {
                        var effectiveKey = (key != null) ? key : (idbstore.keyPath ? getByKeyPath(obj, idbstore.keyPath) : undefined);
                        var keyToUse = creatingHook.call(hookCtx, effectiveKey, obj, trans); // Allow subscribers to when("creating") to generate the key.
                        if (effectiveKey == null && keyToUse != null) {
                            if (idbstore.keyPath)
                                setByKeyPath(obj, idbstore.keyPath, keyToUse);
                            else
                                key = keyToUse;
                        }
                    }
                    try {
                        var req = key != null ? idbstore.add(obj, key) : idbstore.add(obj);
                        req._hookCtx = hookCtx;
                        req.onerror = hookedEventRejectHandler(reject);
                        req.onsuccess = hookedEventSuccessHandler(function (result) {
                            // TODO: Remove these two lines in next major release (2.0?)
                            // It's no good practice to have side effects on provided parameters
                            var keyPath = idbstore.keyPath;
                            if (keyPath)
                                setByKeyPath(obj, keyPath, result);
                            resolve(result);
                        });
                    }
                    catch (e) {
                        if (hookCtx.onerror)
                            hookCtx.onerror(e);
                        throw e;
                    }
                });
            },
            put: function (obj, key) {
                var _this = this;
                /// <summary>
                ///   Add an object to the database but in case an object with same primary key alread exists, the existing one will get updated.
                /// </summary>
                /// <param name="obj" type="Object">A javascript object to insert or update</param>
                /// <param name="key" optional="true">Primary key</param>
                var creatingHook = this.hook.creating.fire, updatingHook = this.hook.updating.fire;
                if (creatingHook !== nop || updatingHook !== nop) {
                    //
                    // People listens to when("creating") or when("updating") events!
                    // We must know whether the put operation results in an CREATE or UPDATE.
                    //
                    var keyPath = this.schema.primKey.keyPath;
                    var effectiveKey = (key !== undefined) ? key : (keyPath && getByKeyPath(obj, keyPath));
                    if (effectiveKey == null)
                        return this.add(obj);
                    // Since key is optional, make sure we get it from obj if not provided
                    // Primary key exist. Lock transaction and try modifying existing. If nothing modified, call add().
                    // clone obj before this async call. If caller modifies obj the line after put(), the IDB spec requires that it should not affect operation.
                    obj = deepClone(obj);
                    return this._trans(READWRITE, function () {
                        return _this.where(":id").equals(effectiveKey).modify(function () {
                            // Replace extisting value with our object
                            // CRUD event firing handled in Collection.modify()
                            this.value = obj;
                        }).then(function (count) { return count === 0 ? _this.add(obj, key) : effectiveKey; });
                    }, "locked"); // Lock needed because operation is splitted into modify() and add().
                }
                else {
                    // Use the standard IDB put() method.
                    return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                        var req = key !== undefined ? idbstore.put(obj, key) : idbstore.put(obj);
                        req.onerror = eventRejectHandler(reject);
                        req.onsuccess = wrap(function (ev) {
                            var keyPath = idbstore.keyPath;
                            if (keyPath)
                                setByKeyPath(obj, keyPath, ev.target.result);
                            resolve(req.result);
                        });
                    });
                }
            },
            'delete': function (key) {
                /// <param name="key">Primary key of the object to delete</param>
                if (this.hook.deleting.subscribers.length) {
                    // People listens to when("deleting") event. Must implement delete using Collection.delete() that will
                    // call the CRUD event. Only Collection.delete() will know whether an object was actually deleted.
                    return this.where(":id").equals(key).delete();
                }
                else {
                    // No one listens. Use standard IDB delete() method.
                    return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                        var req = idbstore.delete(key);
                        req.onerror = eventRejectHandler(reject);
                        req.onsuccess = wrap(function () {
                            resolve(req.result);
                        });
                    });
                }
            },
            clear: function () {
                if (this.hook.deleting.subscribers.length) {
                    // People listens to when("deleting") event. Must implement delete using Collection.delete() that will
                    // call the CRUD event. Only Collection.delete() will knows which objects that are actually deleted.
                    return this.toCollection().delete();
                }
                else {
                    return this._idbstore(READWRITE, function (resolve, reject, idbstore) {
                        var req = idbstore.clear();
                        req.onerror = eventRejectHandler(reject);
                        req.onsuccess = wrap(function () {
                            resolve(req.result);
                        });
                    });
                }
            },
            update: function (keyOrObject, modifications) {
                if (typeof modifications !== 'object' || isArray$1(modifications))
                    throw new exceptions.InvalidArgument("Modifications must be an object.");
                if (typeof keyOrObject === 'object' && !isArray$1(keyOrObject)) {
                    // object to modify. Also modify given object with the modifications:
                    keys$1(modifications).forEach(function (keyPath) {
                        setByKeyPath(keyOrObject, keyPath, modifications[keyPath]);
                    });
                    var key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
                    if (key === undefined)
                        return rejection(new exceptions.InvalidArgument("Given object does not contain its primary key"));
                    return this.where(":id").equals(key).modify(modifications);
                }
                else {
                    // key to modify
                    return this.where(":id").equals(keyOrObject).modify(modifications);
                }
            }
        });
        //
        //
        //
        // Transaction Class
        //
        //
        //
        function Transaction(mode, storeNames, dbschema, parent) {
            var _this = this;
            /// <summary>
            ///    Transaction class. Represents a database transaction. All operations on db goes through a Transaction.
            /// </summary>
            /// <param name="mode" type="String">Any of "readwrite" or "readonly"</param>
            /// <param name="storeNames" type="Array">Array of table names to operate on</param>
            this.db = db;
            this.mode = mode;
            this.storeNames = storeNames;
            this.idbtrans = null;
            this.on = Events(this, "complete", "error", "abort");
            this.parent = parent || null;
            this.active = true;
            this._reculock = 0;
            this._blockedFuncs = [];
            this._resolve = null;
            this._reject = null;
            this._waitingFor = null;
            this._waitingQueue = null;
            this._spinCount = 0; // Just for debugging waitFor()
            this._completion = new Promise$1(function (resolve, reject) {
                _this._resolve = resolve;
                _this._reject = reject;
            });
            this._completion.then(function () {
                _this.active = false;
                _this.on.complete.fire();
            }, function (e) {
                var wasActive = _this.active;
                _this.active = false;
                _this.on.error.fire(e);
                _this.parent ?
                    _this.parent._reject(e) :
                    wasActive && _this.idbtrans && _this.idbtrans.abort();
                return rejection(e); // Indicate we actually DO NOT catch this error.
            });
        }
        props(Transaction.prototype, {
            //
            // Transaction Protected Methods (not required by API users, but needed internally and eventually by dexie extensions)
            //
            _lock: function () {
                assert(!PSD.global); // Locking and unlocking reuires to be within a PSD scope.
                // Temporary set all requests into a pending queue if they are called before database is ready.
                ++this._reculock; // Recursive read/write lock pattern using PSD (Promise Specific Data) instead of TLS (Thread Local Storage)
                if (this._reculock === 1 && !PSD.global)
                    PSD.lockOwnerFor = this;
                return this;
            },
            _unlock: function () {
                assert(!PSD.global); // Locking and unlocking reuires to be within a PSD scope.
                if (--this._reculock === 0) {
                    if (!PSD.global)
                        PSD.lockOwnerFor = null;
                    while (this._blockedFuncs.length > 0 && !this._locked()) {
                        var fnAndPSD = this._blockedFuncs.shift();
                        try {
                            usePSD(fnAndPSD[1], fnAndPSD[0]);
                        }
                        catch (e) { }
                    }
                }
                return this;
            },
            _locked: function () {
                // Checks if any write-lock is applied on this transaction.
                // To simplify the Dexie API for extension implementations, we support recursive locks.
                // This is accomplished by using "Promise Specific Data" (PSD).
                // PSD data is bound to a Promise and any child Promise emitted through then() or resolve( new Promise() ).
                // PSD is local to code executing on top of the call stacks of any of any code executed by Promise():
                //         * callback given to the Promise() constructor  (function (resolve, reject){...})
                //         * callbacks given to then()/catch()/finally() methods (function (value){...})
                // If creating a new independant Promise instance from within a Promise call stack, the new Promise will derive the PSD from the call stack of the parent Promise.
                // Derivation is done so that the inner PSD __proto__ points to the outer PSD.
                // PSD.lockOwnerFor will point to current transaction object if the currently executing PSD scope owns the lock.
                return this._reculock && PSD.lockOwnerFor !== this;
            },
            create: function (idbtrans) {
                var _this = this;
                if (!this.mode)
                    return this;
                assert(!this.idbtrans);
                if (!idbtrans && !idbdb) {
                    switch (dbOpenError && dbOpenError.name) {
                        case "DatabaseClosedError":
                            // Errors where it is no difference whether it was caused by the user operation or an earlier call to db.open()
                            throw new exceptions.DatabaseClosed(dbOpenError);
                        case "MissingAPIError":
                            // Errors where it is no difference whether it was caused by the user operation or an earlier call to db.open()
                            throw new exceptions.MissingAPI(dbOpenError.message, dbOpenError);
                        default:
                            // Make it clear that the user operation was not what caused the error - the error had occurred earlier on db.open()!
                            throw new exceptions.OpenFailed(dbOpenError);
                    }
                }
                if (!this.active)
                    throw new exceptions.TransactionInactive();
                assert(this._completion._state === null);
                idbtrans = this.idbtrans = idbtrans || idbdb.transaction(safariMultiStoreFix(this.storeNames), this.mode);
                idbtrans.onerror = wrap(function (ev) {
                    preventDefault(ev); // Prohibit default bubbling to window.error
                    _this._reject(idbtrans.error);
                });
                idbtrans.onabort = wrap(function (ev) {
                    preventDefault(ev);
                    _this.active && _this._reject(new exceptions.Abort(idbtrans.error));
                    _this.active = false;
                    _this.on("abort").fire(ev);
                });
                idbtrans.oncomplete = wrap(function () {
                    _this.active = false;
                    _this._resolve();
                });
                return this;
            },
            _promise: function (mode, fn, bWriteLock) {
                var _this = this;
                if (mode === READWRITE && this.mode !== READWRITE)
                    return rejection(new exceptions.ReadOnly("Transaction is readonly"));
                if (!this.active)
                    return rejection(new exceptions.TransactionInactive());
                if (this._locked()) {
                    return new Promise$1(function (resolve, reject) {
                        _this._blockedFuncs.push([function () {
                                _this._promise(mode, fn, bWriteLock).then(resolve, reject);
                            }, PSD]);
                    });
                }
                else if (bWriteLock) {
                    return newScope(function () {
                        var p = new Promise$1(function (resolve, reject) {
                            _this._lock();
                            var rv = fn(resolve, reject, _this);
                            if (rv && rv.then)
                                rv.then(resolve, reject);
                        });
                        p.finally(function () { return _this._unlock(); });
                        p._lib = true;
                        return p;
                    });
                }
                else {
                    var p = new Promise$1(function (resolve, reject) {
                        var rv = fn(resolve, reject, _this);
                        if (rv && rv.then)
                            rv.then(resolve, reject);
                    });
                    p._lib = true;
                    return p;
                }
            },
            _root: function () {
                return this.parent ? this.parent._root() : this;
            },
            waitFor: function (promise) {
                // Always operate on the root transaction (in case this is a sub stransaction)
                var root = this._root();
                // For stability reasons, convert parameter to promise no matter what type is passed to waitFor().
                // (We must be able to call .then() on it.)
                promise = Promise$1.resolve(promise);
                if (root._waitingFor) {
                    // Already called waitFor(). Wait for both to complete.
                    root._waitingFor = root._waitingFor.then(function () { return promise; });
                }
                else {
                    // We're not in waiting state. Start waiting state.
                    root._waitingFor = promise;
                    root._waitingQueue = [];
                    // Start interacting with indexedDB until promise completes:
                    var store = root.idbtrans.objectStore(root.storeNames[0]);
                    (function spin() {
                        ++root._spinCount; // For debugging only
                        while (root._waitingQueue.length)
                            (root._waitingQueue.shift())();
                        if (root._waitingFor)
                            store.get(-Infinity).onsuccess = spin;
                    }());
                }
                var currentWaitPromise = root._waitingFor;
                return new Promise$1(function (resolve, reject) {
                    promise.then(function (res) { return root._waitingQueue.push(wrap(resolve.bind(null, res))); }, function (err) { return root._waitingQueue.push(wrap(reject.bind(null, err))); }).finally(function () {
                        if (root._waitingFor === currentWaitPromise) {
                            // No one added a wait after us. Safe to stop the spinning.
                            root._waitingFor = null;
                        }
                    });
                });
            },
            //
            // Transaction Public Properties and Methods
            //
            abort: function () {
                this.active && this._reject(new exceptions.Abort());
                this.active = false;
            },
            tables: {
                get: deprecated("Transaction.tables", function () { return allTables; })
            },
            table: function (name) {
                var table = db.table(name); // Don't check that table is part of transaction. It must fail lazily!
                return new Table(name, table.schema, this);
            }
        });
        //
        //
        //
        // WhereClause
        //
        //
        //
        function WhereClause(table, index, orCollection) {
            /// <param name="table" type="Table"></param>
            /// <param name="index" type="String" optional="true"></param>
            /// <param name="orCollection" type="Collection" optional="true"></param>
            this._ctx = {
                table: table,
                index: index === ":id" ? null : index,
                or: orCollection
            };
        }
        props(WhereClause.prototype, function () {
            // WhereClause private methods
            function fail(collectionOrWhereClause, err, T) {
                var collection = collectionOrWhereClause instanceof WhereClause ?
                    new Collection(collectionOrWhereClause) :
                    collectionOrWhereClause;
                collection._ctx.error = T ? new T(err) : new TypeError(err);
                return collection;
            }
            function emptyCollection(whereClause) {
                return new Collection(whereClause, function () { return IDBKeyRange.only(""); }).limit(0);
            }
            function upperFactory(dir) {
                return dir === "next" ? function (s) { return s.toUpperCase(); } : function (s) { return s.toLowerCase(); };
            }
            function lowerFactory(dir) {
                return dir === "next" ? function (s) { return s.toLowerCase(); } : function (s) { return s.toUpperCase(); };
            }
            function nextCasing(key, lowerKey, upperNeedle, lowerNeedle, cmp, dir) {
                var length = Math.min(key.length, lowerNeedle.length);
                var llp = -1;
                for (var i = 0; i < length; ++i) {
                    var lwrKeyChar = lowerKey[i];
                    if (lwrKeyChar !== lowerNeedle[i]) {
                        if (cmp(key[i], upperNeedle[i]) < 0)
                            return key.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
                        if (cmp(key[i], lowerNeedle[i]) < 0)
                            return key.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
                        if (llp >= 0)
                            return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
                        return null;
                    }
                    if (cmp(key[i], lwrKeyChar) < 0)
                        llp = i;
                }
                if (length < lowerNeedle.length && dir === "next")
                    return key + upperNeedle.substr(key.length);
                if (length < key.length && dir === "prev")
                    return key.substr(0, upperNeedle.length);
                return (llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1));
            }
            function addIgnoreCaseAlgorithm(whereClause, match, needles, suffix) {
                /// <param name="needles" type="Array" elementType="String"></param>
                var upper, lower, compare, upperNeedles, lowerNeedles, direction, nextKeySuffix, needlesLen = needles.length;
                if (!needles.every(function (s) { return typeof s === 'string'; })) {
                    return fail(whereClause, STRING_EXPECTED);
                }
                function initDirection(dir) {
                    upper = upperFactory(dir);
                    lower = lowerFactory(dir);
                    compare = (dir === "next" ? simpleCompare : simpleCompareReverse);
                    var needleBounds = needles.map(function (needle) {
                        return { lower: lower(needle), upper: upper(needle) };
                    }).sort(function (a, b) {
                        return compare(a.lower, b.lower);
                    });
                    upperNeedles = needleBounds.map(function (nb) { return nb.upper; });
                    lowerNeedles = needleBounds.map(function (nb) { return nb.lower; });
                    direction = dir;
                    nextKeySuffix = (dir === "next" ? "" : suffix);
                }
                initDirection("next");
                var c = new Collection(whereClause, function () {
                    return IDBKeyRange.bound(upperNeedles[0], lowerNeedles[needlesLen - 1] + suffix);
                });
                c._ondirectionchange = function (direction) {
                    // This event onlys occur before filter is called the first time.
                    initDirection(direction);
                };
                var firstPossibleNeedle = 0;
                c._addAlgorithm(function (cursor, advance, resolve) {
                    /// <param name="cursor" type="IDBCursor"></param>
                    /// <param name="advance" type="Function"></param>
                    /// <param name="resolve" type="Function"></param>
                    var key = cursor.key;
                    if (typeof key !== 'string')
                        return false;
                    var lowerKey = lower(key);
                    if (match(lowerKey, lowerNeedles, firstPossibleNeedle)) {
                        return true;
                    }
                    else {
                        var lowestPossibleCasing = null;
                        for (var i = firstPossibleNeedle; i < needlesLen; ++i) {
                            var casing = nextCasing(key, lowerKey, upperNeedles[i], lowerNeedles[i], compare, direction);
                            if (casing === null && lowestPossibleCasing === null)
                                firstPossibleNeedle = i + 1;
                            else if (lowestPossibleCasing === null || compare(lowestPossibleCasing, casing) > 0) {
                                lowestPossibleCasing = casing;
                            }
                        }
                        if (lowestPossibleCasing !== null) {
                            advance(function () { cursor.continue(lowestPossibleCasing + nextKeySuffix); });
                        }
                        else {
                            advance(resolve);
                        }
                        return false;
                    }
                });
                return c;
            }
            //
            // WhereClause public methods
            //
            return {
                between: function (lower, upper, includeLower, includeUpper) {
                    /// <summary>
                    ///     Filter out records whose where-field lays between given lower and upper values. Applies to Strings, Numbers and Dates.
                    /// </summary>
                    /// <param name="lower"></param>
                    /// <param name="upper"></param>
                    /// <param name="includeLower" optional="true">Whether items that equals lower should be included. Default true.</param>
                    /// <param name="includeUpper" optional="true">Whether items that equals upper should be included. Default false.</param>
                    /// <returns type="Collection"></returns>
                    includeLower = includeLower !== false; // Default to true
                    includeUpper = includeUpper === true; // Default to false
                    try {
                        if ((cmp(lower, upper) > 0) ||
                            (cmp(lower, upper) === 0 && (includeLower || includeUpper) && !(includeLower && includeUpper)))
                            return emptyCollection(this); // Workaround for idiotic W3C Specification that DataError must be thrown if lower > upper. The natural result would be to return an empty collection.
                        return new Collection(this, function () { return IDBKeyRange.bound(lower, upper, !includeLower, !includeUpper); });
                    }
                    catch (e) {
                        return fail(this, INVALID_KEY_ARGUMENT);
                    }
                },
                equals: function (value) {
                    return new Collection(this, function () { return IDBKeyRange.only(value); });
                },
                above: function (value) {
                    return new Collection(this, function () { return IDBKeyRange.lowerBound(value, true); });
                },
                aboveOrEqual: function (value) {
                    return new Collection(this, function () { return IDBKeyRange.lowerBound(value); });
                },
                below: function (value) {
                    return new Collection(this, function () { return IDBKeyRange.upperBound(value, true); });
                },
                belowOrEqual: function (value) {
                    return new Collection(this, function () { return IDBKeyRange.upperBound(value); });
                },
                startsWith: function (str) {
                    /// <param name="str" type="String"></param>
                    if (typeof str !== 'string')
                        return fail(this, STRING_EXPECTED);
                    return this.between(str, str + maxString, true, true);
                },
                startsWithIgnoreCase: function (str) {
                    /// <param name="str" type="String"></param>
                    if (str === "")
                        return this.startsWith(str);
                    return addIgnoreCaseAlgorithm(this, function (x, a) { return x.indexOf(a[0]) === 0; }, [str], maxString);
                },
                equalsIgnoreCase: function (str) {
                    /// <param name="str" type="String"></param>
                    return addIgnoreCaseAlgorithm(this, function (x, a) { return x === a[0]; }, [str], "");
                },
                anyOfIgnoreCase: function () {
                    var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
                    if (set.length === 0)
                        return emptyCollection(this);
                    return addIgnoreCaseAlgorithm(this, function (x, a) { return a.indexOf(x) !== -1; }, set, "");
                },
                startsWithAnyOfIgnoreCase: function () {
                    var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
                    if (set.length === 0)
                        return emptyCollection(this);
                    return addIgnoreCaseAlgorithm(this, function (x, a) {
                        return a.some(function (n) {
                            return x.indexOf(n) === 0;
                        });
                    }, set, maxString);
                },
                anyOf: function () {
                    var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
                    var compare = ascending;
                    try {
                        set.sort(compare);
                    }
                    catch (e) {
                        return fail(this, INVALID_KEY_ARGUMENT);
                    }
                    if (set.length === 0)
                        return emptyCollection(this);
                    var c = new Collection(this, function () { return IDBKeyRange.bound(set[0], set[set.length - 1]); });
                    c._ondirectionchange = function (direction) {
                        compare = (direction === "next" ? ascending : descending);
                        set.sort(compare);
                    };
                    var i = 0;
                    c._addAlgorithm(function (cursor, advance, resolve) {
                        var key = cursor.key;
                        while (compare(key, set[i]) > 0) {
                            // The cursor has passed beyond this key. Check next.
                            ++i;
                            if (i === set.length) {
                                // There is no next. Stop searching.
                                advance(resolve);
                                return false;
                            }
                        }
                        if (compare(key, set[i]) === 0) {
                            // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
                            return true;
                        }
                        else {
                            // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
                            advance(function () { cursor.continue(set[i]); });
                            return false;
                        }
                    });
                    return c;
                },
                notEqual: function (value) {
                    return this.inAnyRange([[minKey, value], [value, maxKey]], { includeLowers: false, includeUppers: false });
                },
                noneOf: function () {
                    var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
                    if (set.length === 0)
                        return new Collection(this); // Return entire collection.
                    try {
                        set.sort(ascending);
                    }
                    catch (e) {
                        return fail(this, INVALID_KEY_ARGUMENT);
                    }
                    // Transform ["a","b","c"] to a set of ranges for between/above/below: [[minKey,"a"], ["a","b"], ["b","c"], ["c",maxKey]]
                    var ranges = set.reduce(function (res, val) { return res ? res.concat([[res[res.length - 1][1], val]]) : [[minKey, val]]; }, null);
                    ranges.push([set[set.length - 1], maxKey]);
                    return this.inAnyRange(ranges, { includeLowers: false, includeUppers: false });
                },
                /** Filter out values withing given set of ranges.
                * Example, give children and elders a rebate of 50%:
                *
                *   db.friends.where('age').inAnyRange([[0,18],[65,Infinity]]).modify({Rebate: 1/2});
                *
                * @param {(string|number|Date|Array)[][]} ranges
                * @param {{includeLowers: boolean, includeUppers: boolean}} options
                */
                inAnyRange: function (ranges, options) {
                    if (ranges.length === 0)
                        return emptyCollection(this);
                    if (!ranges.every(function (range) { return range[0] !== undefined && range[1] !== undefined && ascending(range[0], range[1]) <= 0; })) {
                        return fail(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", exceptions.InvalidArgument);
                    }
                    var includeLowers = !options || options.includeLowers !== false; // Default to true
                    var includeUppers = options && options.includeUppers === true; // Default to false
                    function addRange(ranges, newRange) {
                        for (var i = 0, l = ranges.length; i < l; ++i) {
                            var range = ranges[i];
                            if (cmp(newRange[0], range[1]) < 0 && cmp(newRange[1], range[0]) > 0) {
                                range[0] = min(range[0], newRange[0]);
                                range[1] = max(range[1], newRange[1]);
                                break;
                            }
                        }
                        if (i === l)
                            ranges.push(newRange);
                        return ranges;
                    }
                    var sortDirection = ascending;
                    function rangeSorter(a, b) { return sortDirection(a[0], b[0]); }
                    // Join overlapping ranges
                    var set;
                    try {
                        set = ranges.reduce(addRange, []);
                        set.sort(rangeSorter);
                    }
                    catch (ex) {
                        return fail(this, INVALID_KEY_ARGUMENT);
                    }
                    var i = 0;
                    var keyIsBeyondCurrentEntry = includeUppers ?
                        function (key) { return ascending(key, set[i][1]) > 0; } :
                        function (key) { return ascending(key, set[i][1]) >= 0; };
                    var keyIsBeforeCurrentEntry = includeLowers ?
                        function (key) { return descending(key, set[i][0]) > 0; } :
                        function (key) { return descending(key, set[i][0]) >= 0; };
                    function keyWithinCurrentRange(key) {
                        return !keyIsBeyondCurrentEntry(key) && !keyIsBeforeCurrentEntry(key);
                    }
                    var checkKey = keyIsBeyondCurrentEntry;
                    var c = new Collection(this, function () {
                        return IDBKeyRange.bound(set[0][0], set[set.length - 1][1], !includeLowers, !includeUppers);
                    });
                    c._ondirectionchange = function (direction) {
                        if (direction === "next") {
                            checkKey = keyIsBeyondCurrentEntry;
                            sortDirection = ascending;
                        }
                        else {
                            checkKey = keyIsBeforeCurrentEntry;
                            sortDirection = descending;
                        }
                        set.sort(rangeSorter);
                    };
                    c._addAlgorithm(function (cursor, advance, resolve) {
                        var key = cursor.key;
                        while (checkKey(key)) {
                            // The cursor has passed beyond this key. Check next.
                            ++i;
                            if (i === set.length) {
                                // There is no next. Stop searching.
                                advance(resolve);
                                return false;
                            }
                        }
                        if (keyWithinCurrentRange(key)) {
                            // The current cursor value should be included and we should continue a single step in case next item has the same key or possibly our next key in set.
                            return true;
                        }
                        else if (cmp(key, set[i][1]) === 0 || cmp(key, set[i][0]) === 0) {
                            // includeUpper or includeLower is false so keyWithinCurrentRange() returns false even though we are at range border.
                            // Continue to next key but don't include this one.
                            return false;
                        }
                        else {
                            // cursor.key not yet at set[i]. Forward cursor to the next key to hunt for.
                            advance(function () {
                                if (sortDirection === ascending)
                                    cursor.continue(set[i][0]);
                                else
                                    cursor.continue(set[i][1]);
                            });
                            return false;
                        }
                    });
                    return c;
                },
                startsWithAnyOf: function () {
                    var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
                    if (!set.every(function (s) { return typeof s === 'string'; })) {
                        return fail(this, "startsWithAnyOf() only works with strings");
                    }
                    if (set.length === 0)
                        return emptyCollection(this);
                    return this.inAnyRange(set.map(function (str) {
                        return [str, str + maxString];
                    }));
                }
            };
        });
        //
        //
        //
        // Collection Class
        //
        //
        //
        function Collection(whereClause, keyRangeGenerator) {
            /// <summary>
            ///
            /// </summary>
            /// <param name="whereClause" type="WhereClause">Where clause instance</param>
            /// <param name="keyRangeGenerator" value="function(){ return IDBKeyRange.bound(0,1);}" optional="true"></param>
            var keyRange = null, error = null;
            if (keyRangeGenerator)
                try {
                    keyRange = keyRangeGenerator();
                }
                catch (ex) {
                    error = ex;
                }
            var whereCtx = whereClause._ctx, table = whereCtx.table;
            this._ctx = {
                table: table,
                index: whereCtx.index,
                isPrimKey: (!whereCtx.index || (table.schema.primKey.keyPath && whereCtx.index === table.schema.primKey.name)),
                range: keyRange,
                keysOnly: false,
                dir: "next",
                unique: "",
                algorithm: null,
                filter: null,
                replayFilter: null,
                justLimit: true,
                isMatch: null,
                offset: 0,
                limit: Infinity,
                error: error,
                or: whereCtx.or,
                valueMapper: table.hook.reading.fire
            };
        }
        function isPlainKeyRange(ctx, ignoreLimitFilter) {
            return !(ctx.filter || ctx.algorithm || ctx.or) &&
                (ignoreLimitFilter ? ctx.justLimit : !ctx.replayFilter);
        }
        props(Collection.prototype, function () {
            //
            // Collection Private Functions
            //
            function addFilter(ctx, fn) {
                ctx.filter = combine(ctx.filter, fn);
            }
            function addReplayFilter(ctx, factory, isLimitFilter) {
                var curr = ctx.replayFilter;
                ctx.replayFilter = curr ? function () { return combine(curr(), factory()); } : factory;
                ctx.justLimit = isLimitFilter && !curr;
            }
            function addMatchFilter(ctx, fn) {
                ctx.isMatch = combine(ctx.isMatch, fn);
            }
            /** @param ctx {
             *      isPrimKey: boolean,
             *      table: Table,
             *      index: string
             * }
             * @param store IDBObjectStore
             **/
            function getIndexOrStore(ctx, store) {
                if (ctx.isPrimKey)
                    return store;
                var indexSpec = ctx.table.schema.idxByName[ctx.index];
                if (!indexSpec)
                    throw new exceptions.Schema("KeyPath " + ctx.index + " on object store " + store.name + " is not indexed");
                return store.index(indexSpec.name);
            }
            /** @param ctx {
             *      isPrimKey: boolean,
             *      table: Table,
             *      index: string,
             *      keysOnly: boolean,
             *      range?: IDBKeyRange,
             *      dir: "next" | "prev"
             * }
             */
            function openCursor(ctx, store) {
                var idxOrStore = getIndexOrStore(ctx, store);
                return ctx.keysOnly && 'openKeyCursor' in idxOrStore ?
                    idxOrStore.openKeyCursor(ctx.range || null, ctx.dir + ctx.unique) :
                    idxOrStore.openCursor(ctx.range || null, ctx.dir + ctx.unique);
            }
            function iter(ctx, fn, resolve, reject, idbstore) {
                var filter = ctx.replayFilter ? combine(ctx.filter, ctx.replayFilter()) : ctx.filter;
                if (!ctx.or) {
                    iterate(openCursor(ctx, idbstore), combine(ctx.algorithm, filter), fn, resolve, reject, !ctx.keysOnly && ctx.valueMapper);
                }
                else
                    (function () {
                        var set = {};
                        var resolved = 0;
                        function resolveboth() {
                            if (++resolved === 2)
                                resolve(); // Seems like we just support or btwn max 2 expressions, but there are no limit because we do recursion.
                        }
                        function union(item, cursor, advance) {
                            if (!filter || filter(cursor, advance, resolveboth, reject)) {
                                var primaryKey = cursor.primaryKey;
                                var key = '' + primaryKey;
                                if (key === '[object ArrayBuffer]')
                                    key = '' + new Uint8Array(primaryKey);
                                if (!hasOwn(set, key)) {
                                    set[key] = true;
                                    fn(item, cursor, advance);
                                }
                            }
                        }
                        ctx.or._iterate(union, resolveboth, reject, idbstore);
                        iterate(openCursor(ctx, idbstore), ctx.algorithm, union, resolveboth, reject, !ctx.keysOnly && ctx.valueMapper);
                    })();
            }
            return {
                //
                // Collection Protected Functions
                //
                _read: function (fn, cb) {
                    var ctx = this._ctx;
                    return ctx.error ?
                        ctx.table._trans(null, rejection.bind(null, ctx.error)) :
                        ctx.table._idbstore(READONLY, fn).then(cb);
                },
                _write: function (fn) {
                    var ctx = this._ctx;
                    return ctx.error ?
                        ctx.table._trans(null, rejection.bind(null, ctx.error)) :
                        ctx.table._idbstore(READWRITE, fn, "locked"); // When doing write operations on collections, always lock the operation so that upcoming operations gets queued.
                },
                _addAlgorithm: function (fn) {
                    var ctx = this._ctx;
                    ctx.algorithm = combine(ctx.algorithm, fn);
                },
                _iterate: function (fn, resolve, reject, idbstore) {
                    return iter(this._ctx, fn, resolve, reject, idbstore);
                },
                clone: function (props$$1) {
                    var rv = Object.create(this.constructor.prototype), ctx = Object.create(this._ctx);
                    if (props$$1)
                        extend(ctx, props$$1);
                    rv._ctx = ctx;
                    return rv;
                },
                raw: function () {
                    this._ctx.valueMapper = null;
                    return this;
                },
                //
                // Collection Public methods
                //
                each: function (fn) {
                    var ctx = this._ctx;
                    return this._read(function (resolve, reject, idbstore) {
                        iter(ctx, fn, resolve, reject, idbstore);
                    });
                },
                count: function (cb) {
                    var ctx = this._ctx;
                    if (isPlainKeyRange(ctx, true)) {
                        // This is a plain key range. We can use the count() method if the index.
                        return this._read(function (resolve, reject, idbstore) {
                            var idx = getIndexOrStore(ctx, idbstore);
                            var req = (ctx.range ? idx.count(ctx.range) : idx.count());
                            req.onerror = eventRejectHandler(reject);
                            req.onsuccess = function (e) {
                                resolve(Math.min(e.target.result, ctx.limit));
                            };
                        }, cb);
                    }
                    else {
                        // Algorithms, filters or expressions are applied. Need to count manually.
                        var count = 0;
                        return this._read(function (resolve, reject, idbstore) {
                            iter(ctx, function () { ++count; return false; }, function () { resolve(count); }, reject, idbstore);
                        }, cb);
                    }
                },
                sortBy: function (keyPath, cb) {
                    /// <param name="keyPath" type="String"></param>
                    var parts = keyPath.split('.').reverse(), lastPart = parts[0], lastIndex = parts.length - 1;
                    function getval(obj, i) {
                        if (i)
                            return getval(obj[parts[i]], i - 1);
                        return obj[lastPart];
                    }
                    var order = this._ctx.dir === "next" ? 1 : -1;
                    function sorter(a, b) {
                        var aVal = getval(a, lastIndex), bVal = getval(b, lastIndex);
                        return aVal < bVal ? -order : aVal > bVal ? order : 0;
                    }
                    return this.toArray(function (a) {
                        return a.sort(sorter);
                    }).then(cb);
                },
                toArray: function (cb) {
                    var ctx = this._ctx;
                    return this._read(function (resolve, reject, idbstore) {
                        if (hasGetAll && ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
                            // Special optimation if we could use IDBObjectStore.getAll() or
                            // IDBKeyRange.getAll():
                            var readingHook = ctx.table.hook.reading.fire;
                            var idxOrStore = getIndexOrStore(ctx, idbstore);
                            var req = ctx.limit < Infinity ?
                                idxOrStore.getAll(ctx.range, ctx.limit) :
                                idxOrStore.getAll(ctx.range);
                            req.onerror = eventRejectHandler(reject);
                            req.onsuccess = readingHook === mirror ?
                                eventSuccessHandler(resolve) :
                                eventSuccessHandler(function (res) {
                                    try {
                                        resolve(res.map(readingHook));
                                    }
                                    catch (e) {
                                        reject(e);
                                    }
                                });
                        }
                        else {
                            // Getting array through a cursor.
                            var a = [];
                            iter(ctx, function (item) { a.push(item); }, function arrayComplete() {
                                resolve(a);
                            }, reject, idbstore);
                        }
                    }, cb);
                },
                offset: function (offset) {
                    var ctx = this._ctx;
                    if (offset <= 0)
                        return this;
                    ctx.offset += offset; // For count()
                    if (isPlainKeyRange(ctx)) {
                        addReplayFilter(ctx, function () {
                            var offsetLeft = offset;
                            return function (cursor, advance) {
                                if (offsetLeft === 0)
                                    return true;
                                if (offsetLeft === 1) {
                                    --offsetLeft;
                                    return false;
                                }
                                advance(function () {
                                    cursor.advance(offsetLeft);
                                    offsetLeft = 0;
                                });
                                return false;
                            };
                        });
                    }
                    else {
                        addReplayFilter(ctx, function () {
                            var offsetLeft = offset;
                            return function () { return (--offsetLeft < 0); };
                        });
                    }
                    return this;
                },
                limit: function (numRows) {
                    this._ctx.limit = Math.min(this._ctx.limit, numRows); // For count()
                    addReplayFilter(this._ctx, function () {
                        var rowsLeft = numRows;
                        return function (cursor, advance, resolve) {
                            if (--rowsLeft <= 0)
                                advance(resolve); // Stop after this item has been included
                            return rowsLeft >= 0; // If numRows is already below 0, return false because then 0 was passed to numRows initially. Otherwise we wouldnt come here.
                        };
                    }, true);
                    return this;
                },
                until: function (filterFunction, bIncludeStopEntry) {
                    addFilter(this._ctx, function (cursor, advance, resolve) {
                        if (filterFunction(cursor.value)) {
                            advance(resolve);
                            return bIncludeStopEntry;
                        }
                        else {
                            return true;
                        }
                    });
                    return this;
                },
                first: function (cb) {
                    return this.limit(1).toArray(function (a) { return a[0]; }).then(cb);
                },
                last: function (cb) {
                    return this.reverse().first(cb);
                },
                filter: function (filterFunction) {
                    /// <param name="jsFunctionFilter" type="Function">function(val){return true/false}</param>
                    addFilter(this._ctx, function (cursor) {
                        return filterFunction(cursor.value);
                    });
                    // match filters not used in Dexie.js but can be used by 3rd part libraries to test a
                    // collection for a match without querying DB. Used by Dexie.Observable.
                    addMatchFilter(this._ctx, filterFunction);
                    return this;
                },
                and: function (filterFunction) {
                    return this.filter(filterFunction);
                },
                or: function (indexName) {
                    return new WhereClause(this._ctx.table, indexName, this);
                },
                reverse: function () {
                    this._ctx.dir = (this._ctx.dir === "prev" ? "next" : "prev");
                    if (this._ondirectionchange)
                        this._ondirectionchange(this._ctx.dir);
                    return this;
                },
                desc: function () {
                    return this.reverse();
                },
                eachKey: function (cb) {
                    var ctx = this._ctx;
                    ctx.keysOnly = !ctx.isMatch;
                    return this.each(function (val, cursor) { cb(cursor.key, cursor); });
                },
                eachUniqueKey: function (cb) {
                    this._ctx.unique = "unique";
                    return this.eachKey(cb);
                },
                eachPrimaryKey: function (cb) {
                    var ctx = this._ctx;
                    ctx.keysOnly = !ctx.isMatch;
                    return this.each(function (val, cursor) { cb(cursor.primaryKey, cursor); });
                },
                keys: function (cb) {
                    var ctx = this._ctx;
                    ctx.keysOnly = !ctx.isMatch;
                    var a = [];
                    return this.each(function (item, cursor) {
                        a.push(cursor.key);
                    }).then(function () {
                        return a;
                    }).then(cb);
                },
                primaryKeys: function (cb) {
                    var ctx = this._ctx;
                    if (hasGetAll && ctx.dir === 'next' && isPlainKeyRange(ctx, true) && ctx.limit > 0) {
                        // Special optimation if we could use IDBObjectStore.getAllKeys() or
                        // IDBKeyRange.getAllKeys():
                        return this._read(function (resolve, reject, idbstore) {
                            var idxOrStore = getIndexOrStore(ctx, idbstore);
                            var req = ctx.limit < Infinity ?
                                idxOrStore.getAllKeys(ctx.range, ctx.limit) :
                                idxOrStore.getAllKeys(ctx.range);
                            req.onerror = eventRejectHandler(reject);
                            req.onsuccess = eventSuccessHandler(resolve);
                        }).then(cb);
                    }
                    ctx.keysOnly = !ctx.isMatch;
                    var a = [];
                    return this.each(function (item, cursor) {
                        a.push(cursor.primaryKey);
                    }).then(function () {
                        return a;
                    }).then(cb);
                },
                uniqueKeys: function (cb) {
                    this._ctx.unique = "unique";
                    return this.keys(cb);
                },
                firstKey: function (cb) {
                    return this.limit(1).keys(function (a) { return a[0]; }).then(cb);
                },
                lastKey: function (cb) {
                    return this.reverse().firstKey(cb);
                },
                distinct: function () {
                    var ctx = this._ctx, idx = ctx.index && ctx.table.schema.idxByName[ctx.index];
                    if (!idx || !idx.multi)
                        return this; // distinct() only makes differencies on multiEntry indexes.
                    var set = {};
                    addFilter(this._ctx, function (cursor) {
                        var strKey = cursor.primaryKey.toString(); // Converts any Date to String, String to String, Number to String and Array to comma-separated string
                        var found = hasOwn(set, strKey);
                        set[strKey] = true;
                        return !found;
                    });
                    return this;
                },
                //
                // Methods that mutate storage
                //
                modify: function (changes) {
                    var self = this, ctx = this._ctx, hook = ctx.table.hook, updatingHook = hook.updating.fire, deletingHook = hook.deleting.fire;
                    return this._write(function (resolve, reject, idbstore, trans) {
                        var modifyer;
                        if (typeof changes === 'function') {
                            // Changes is a function that may update, add or delete propterties or even require a deletion the object itself (delete this.item)
                            if (updatingHook === nop && deletingHook === nop) {
                                // Noone cares about what is being changed. Just let the modifier function be the given argument as is.
                                modifyer = changes;
                            }
                            else {
                                // People want to know exactly what is being modified or deleted.
                                // Let modifyer be a proxy function that finds out what changes the caller is actually doing
                                // and call the hooks accordingly!
                                modifyer = function (item) {
                                    var origItem = deepClone(item); // Clone the item first so we can compare laters.
                                    if (changes.call(this, item, this) === false)
                                        return false; // Call the real modifyer function (If it returns false explicitely, it means it dont want to modify anyting on this object)
                                    if (!hasOwn(this, "value")) {
                                        // The real modifyer function requests a deletion of the object. Inform the deletingHook that a deletion is taking place.
                                        deletingHook.call(this, this.primKey, item, trans);
                                    }
                                    else {
                                        // No deletion. Check what was changed
                                        var objectDiff = getObjectDiff(origItem, this.value);
                                        var additionalChanges = updatingHook.call(this, objectDiff, this.primKey, origItem, trans);
                                        if (additionalChanges) {
                                            // Hook want to apply additional modifications. Make sure to fullfill the will of the hook.
                                            item = this.value;
                                            keys$1(additionalChanges).forEach(function (keyPath) {
                                                setByKeyPath(item, keyPath, additionalChanges[keyPath]); // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath
                                            });
                                        }
                                    }
                                };
                            }
                        }
                        else if (updatingHook === nop) {
                            // changes is a set of {keyPath: value} and no one is listening to the updating hook.
                            var keyPaths = keys$1(changes);
                            var numKeys = keyPaths.length;
                            modifyer = function (item) {
                                var anythingModified = false;
                                for (var i = 0; i < numKeys; ++i) {
                                    var keyPath = keyPaths[i], val = changes[keyPath];
                                    if (getByKeyPath(item, keyPath) !== val) {
                                        setByKeyPath(item, keyPath, val); // Adding {keyPath: undefined} means that the keyPath should be deleted. Handled by setByKeyPath
                                        anythingModified = true;
                                    }
                                }
                                return anythingModified;
                            };
                        }
                        else {
                            // changes is a set of {keyPath: value} and people are listening to the updating hook so we need to call it and
                            // allow it to add additional modifications to make.
                            var origChanges = changes;
                            changes = shallowClone(origChanges); // Let's work with a clone of the changes keyPath/value set so that we can restore it in case a hook extends it.
                            modifyer = function (item) {
                                var anythingModified = false;
                                var additionalChanges = updatingHook.call(this, changes, this.primKey, deepClone(item), trans);
                                if (additionalChanges)
                                    extend(changes, additionalChanges);
                                keys$1(changes).forEach(function (keyPath) {
                                    var val = changes[keyPath];
                                    if (getByKeyPath(item, keyPath) !== val) {
                                        setByKeyPath(item, keyPath, val);
                                        anythingModified = true;
                                    }
                                });
                                if (additionalChanges)
                                    changes = shallowClone(origChanges); // Restore original changes for next iteration
                                return anythingModified;
                            };
                        }
                        var count = 0;
                        var successCount = 0;
                        var iterationComplete = false;
                        var failures = [];
                        var failKeys = [];
                        var currentKey = null;
                        function modifyItem(item, cursor) {
                            currentKey = cursor.primaryKey;
                            var thisContext = {
                                primKey: cursor.primaryKey,
                                value: item,
                                onsuccess: null,
                                onerror: null
                            };
                            function onerror(e) {
                                failures.push(e);
                                failKeys.push(thisContext.primKey);
                                checkFinished();
                                return true; // Catch these errors and let a final rejection decide whether or not to abort entire transaction
                            }
                            if (modifyer.call(thisContext, item, thisContext) !== false) {
                                var bDelete = !hasOwn(thisContext, "value");
                                ++count;
                                tryCatch(function () {
                                    var req = (bDelete ? cursor.delete() : cursor.update(thisContext.value));
                                    req._hookCtx = thisContext;
                                    req.onerror = hookedEventRejectHandler(onerror);
                                    req.onsuccess = hookedEventSuccessHandler(function () {
                                        ++successCount;
                                        checkFinished();
                                    });
                                }, onerror);
                            }
                            else if (thisContext.onsuccess) {
                                // Hook will expect either onerror or onsuccess to always be called!
                                thisContext.onsuccess(thisContext.value);
                            }
                        }
                        function doReject(e) {
                            if (e) {
                                failures.push(e);
                                failKeys.push(currentKey);
                            }
                            return reject(new ModifyError("Error modifying one or more objects", failures, successCount, failKeys));
                        }
                        function checkFinished() {
                            if (iterationComplete && successCount + failures.length === count) {
                                if (failures.length > 0)
                                    doReject();
                                else
                                    resolve(successCount);
                            }
                        }
                        self.clone().raw()._iterate(modifyItem, function () {
                            iterationComplete = true;
                            checkFinished();
                        }, doReject, idbstore);
                    });
                },
                'delete': function () {
                    var _this = this;
                    var ctx = this._ctx, range = ctx.range, deletingHook = ctx.table.hook.deleting.fire, hasDeleteHook = deletingHook !== nop;
                    if (!hasDeleteHook &&
                        isPlainKeyRange(ctx) &&
                        ((ctx.isPrimKey && !hangsOnDeleteLargeKeyRange) || !range)) {
                        // May use IDBObjectStore.delete(IDBKeyRange) in this case (Issue #208)
                        // For chromium, this is the way most optimized version.
                        // For IE/Edge, this could hang the indexedDB engine and make operating system instable
                        // (https://gist.github.com/dfahlander/5a39328f029de18222cf2125d56c38f7)
                        return this._write(function (resolve, reject, idbstore) {
                            // Our API contract is to return a count of deleted items, so we have to count() before delete().
                            var onerror = eventRejectHandler(reject), countReq = (range ? idbstore.count(range) : idbstore.count());
                            countReq.onerror = onerror;
                            countReq.onsuccess = function () {
                                var count = countReq.result;
                                tryCatch(function () {
                                    var delReq = (range ? idbstore.delete(range) : idbstore.clear());
                                    delReq.onerror = onerror;
                                    delReq.onsuccess = function () { return resolve(count); };
                                }, function (err) { return reject(err); });
                            };
                        });
                    }
                    // Default version to use when collection is not a vanilla IDBKeyRange on the primary key.
                    // Divide into chunks to not starve RAM.
                    // If has delete hook, we will have to collect not just keys but also objects, so it will use
                    // more memory and need lower chunk size.
                    var CHUNKSIZE = hasDeleteHook ? 2000 : 10000;
                    return this._write(function (resolve, reject, idbstore, trans) {
                        var totalCount = 0;
                        // Clone collection and change its table and set a limit of CHUNKSIZE on the cloned Collection instance.
                        var collection = _this
                            .clone({
                            keysOnly: !ctx.isMatch && !hasDeleteHook
                        }) // load just keys (unless filter() or and() or deleteHook has subscribers)
                            .distinct() // In case multiEntry is used, never delete same key twice because resulting count
                            .limit(CHUNKSIZE)
                            .raw(); // Don't filter through reading-hooks (like mapped classes etc)
                        var keysOrTuples = [];
                        // We're gonna do things on as many chunks that are needed.
                        // Use recursion of nextChunk function:
                        var nextChunk = function () { return collection.each(hasDeleteHook ? function (val, cursor) {
                            // Somebody subscribes to hook('deleting'). Collect all primary keys and their values,
                            // so that the hook can be called with its values in bulkDelete().
                            keysOrTuples.push([cursor.primaryKey, cursor.value]);
                        } : function (val, cursor) {
                            // No one subscribes to hook('deleting'). Collect only primary keys:
                            keysOrTuples.push(cursor.primaryKey);
                        }).then(function () {
                            // Chromium deletes faster when doing it in sort order.
                            hasDeleteHook ?
                                keysOrTuples.sort(function (a, b) { return ascending(a[0], b[0]); }) :
                                keysOrTuples.sort(ascending);
                            return bulkDelete(idbstore, trans, keysOrTuples, hasDeleteHook, deletingHook);
                        }).then(function () {
                            var count = keysOrTuples.length;
                            totalCount += count;
                            keysOrTuples = [];
                            return count < CHUNKSIZE ? totalCount : nextChunk();
                        }); };
                        resolve(nextChunk());
                    });
                }
            };
        });
        //
        //
        //
        // ------------------------- Help functions ---------------------------
        //
        //
        //
        function lowerVersionFirst(a, b) {
            return a._cfg.version - b._cfg.version;
        }
        function setApiOnPlace(objs, tableNames, dbschema) {
            tableNames.forEach(function (tableName) {
                var schema = dbschema[tableName];
                objs.forEach(function (obj) {
                    if (!(tableName in obj)) {
                        if (obj === Transaction.prototype || obj instanceof Transaction) {
                            // obj is a Transaction prototype (or prototype of a subclass to Transaction)
                            // Make the API a getter that returns this.table(tableName)
                            setProp(obj, tableName, { get: function () { return this.table(tableName); } });
                        }
                        else {
                            // Table will not be bound to a transaction (will use Dexie.currentTransaction)
                            obj[tableName] = new Table(tableName, schema);
                        }
                    }
                });
            });
        }
        function removeTablesApi(objs) {
            objs.forEach(function (obj) {
                for (var key in obj) {
                    if (obj[key] instanceof Table)
                        delete obj[key];
                }
            });
        }
        function iterate(req, filter, fn, resolve, reject, valueMapper) {
            // Apply valueMapper (hook('reading') or mappped class)
            var mappedFn = valueMapper ? function (x, c, a) { return fn(valueMapper(x), c, a); } : fn;
            // Wrap fn with PSD and microtick stuff from Promise.
            var wrappedFn = wrap(mappedFn, reject);
            if (!req.onerror)
                req.onerror = eventRejectHandler(reject);
            if (filter) {
                req.onsuccess = trycatcher(function filter_record() {
                    var cursor = req.result;
                    if (cursor) {
                        var c = function () { cursor.continue(); };
                        if (filter(cursor, function (advancer) { c = advancer; }, resolve, reject))
                            wrappedFn(cursor.value, cursor, function (advancer) { c = advancer; });
                        c();
                    }
                    else {
                        resolve();
                    }
                }, reject);
            }
            else {
                req.onsuccess = trycatcher(function filter_record() {
                    var cursor = req.result;
                    if (cursor) {
                        var c = function () { cursor.continue(); };
                        wrappedFn(cursor.value, cursor, function (advancer) { c = advancer; });
                        c();
                    }
                    else {
                        resolve();
                    }
                }, reject);
            }
        }
        function parseIndexSyntax(indexes) {
            /// <param name="indexes" type="String"></param>
            /// <returns type="Array" elementType="IndexSpec"></returns>
            var rv = [];
            indexes.split(',').forEach(function (index) {
                index = index.trim();
                var name = index.replace(/([&*]|\+\+)/g, ""); // Remove "&", "++" and "*"
                // Let keyPath of "[a+b]" be ["a","b"]:
                var keyPath = /^\[/.test(name) ? name.match(/^\[(.*)\]$/)[1].split('+') : name;
                rv.push(new IndexSpec(name, keyPath || null, /\&/.test(index), /\*/.test(index), /\+\+/.test(index), isArray$1(keyPath), /\./.test(index)));
            });
            return rv;
        }
        function cmp(key1, key2) {
            return indexedDB.cmp(key1, key2);
        }
        function min(a, b) {
            return cmp(a, b) < 0 ? a : b;
        }
        function max(a, b) {
            return cmp(a, b) > 0 ? a : b;
        }
        function ascending(a, b) {
            return indexedDB.cmp(a, b);
        }
        function descending(a, b) {
            return indexedDB.cmp(b, a);
        }
        function simpleCompare(a, b) {
            return a < b ? -1 : a === b ? 0 : 1;
        }
        function simpleCompareReverse(a, b) {
            return a > b ? -1 : a === b ? 0 : 1;
        }
        function combine(filter1, filter2) {
            return filter1 ?
                filter2 ?
                    function () { return filter1.apply(this, arguments) && filter2.apply(this, arguments); } :
                    filter1 :
                filter2;
        }
        function readGlobalSchema() {
            db.verno = idbdb.version / 10;
            db._dbSchema = globalSchema = {};
            dbStoreNames = slice(idbdb.objectStoreNames, 0);
            if (dbStoreNames.length === 0)
                return; // Database contains no stores.
            var trans = idbdb.transaction(safariMultiStoreFix(dbStoreNames), 'readonly');
            dbStoreNames.forEach(function (storeName) {
                var store = trans.objectStore(storeName), keyPath = store.keyPath, dotted = keyPath && typeof keyPath === 'string' && keyPath.indexOf('.') !== -1;
                var primKey = new IndexSpec(keyPath, keyPath || "", false, false, !!store.autoIncrement, keyPath && typeof keyPath !== 'string', dotted);
                var indexes = [];
                for (var j = 0; j < store.indexNames.length; ++j) {
                    var idbindex = store.index(store.indexNames[j]);
                    keyPath = idbindex.keyPath;
                    dotted = keyPath && typeof keyPath === 'string' && keyPath.indexOf('.') !== -1;
                    var index = new IndexSpec(idbindex.name, keyPath, !!idbindex.unique, !!idbindex.multiEntry, false, keyPath && typeof keyPath !== 'string', dotted);
                    indexes.push(index);
                }
                globalSchema[storeName] = new TableSchema(storeName, primKey, indexes, {});
            });
            setApiOnPlace([allTables], keys$1(globalSchema), globalSchema);
        }
        function adjustToExistingIndexNames(schema, idbtrans) {
            /// <summary>
            /// Issue #30 Problem with existing db - adjust to existing index names when migrating from non-dexie db
            /// </summary>
            /// <param name="schema" type="Object">Map between name and TableSchema</param>
            /// <param name="idbtrans" type="IDBTransaction"></param>
            var storeNames = idbtrans.db.objectStoreNames;
            for (var i = 0; i < storeNames.length; ++i) {
                var storeName = storeNames[i];
                var store = idbtrans.objectStore(storeName);
                hasGetAll = 'getAll' in store;
                for (var j = 0; j < store.indexNames.length; ++j) {
                    var indexName = store.indexNames[j];
                    var keyPath = store.index(indexName).keyPath;
                    var dexieName = typeof keyPath === 'string' ? keyPath : "[" + slice(keyPath).join('+') + "]";
                    if (schema[storeName]) {
                        var indexSpec = schema[storeName].idxByName[dexieName];
                        if (indexSpec)
                            indexSpec.name = indexName;
                    }
                }
            }
            // Bug with getAll() on Safari ver<604 on Workers only, see discussion following PR #579
            if (/Safari/.test(navigator.userAgent) &&
                !/(Chrome\/|Edge\/)/.test(navigator.userAgent) &&
                _global.WorkerGlobalScope && _global instanceof _global.WorkerGlobalScope &&
                [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604) {
                hasGetAll = false;
            }
        }
        function fireOnBlocked(ev) {
            db.on("blocked").fire(ev);
            // Workaround (not fully*) for missing "versionchange" event in IE,Edge and Safari:
            connections
                .filter(function (c) { return c.name === db.name && c !== db && !c._vcFired; })
                .map(function (c) { return c.on("versionchange").fire(ev); });
        }
        extend(this, {
            Collection: Collection,
            Table: Table,
            Transaction: Transaction,
            Version: Version,
            WhereClause: WhereClause
        });
        init();
        addons.forEach(function (fn) {
            fn(db);
        });
    }
    function parseType(type) {
        if (typeof type === 'function') {
            return new type();
        }
        else if (isArray$1(type)) {
            return [parseType(type[0])];
        }
        else if (type && typeof type === 'object') {
            var rv = {};
            applyStructure(rv, type);
            return rv;
        }
        else {
            return type;
        }
    }
    function applyStructure(obj, structure) {
        keys$1(structure).forEach(function (member) {
            var value = parseType(structure[member]);
            obj[member] = value;
        });
        return obj;
    }
    function hookedEventSuccessHandler(resolve) {
        // wrap() is needed when calling hooks because the rare scenario of:
        //  * hook does a db operation that fails immediately (IDB throws exception)
        //    For calling db operations on correct transaction, wrap makes sure to set PSD correctly.
        //    wrap() will also execute in a virtual tick.
        //  * If not wrapped in a virtual tick, direct exception will launch a new physical tick.
        //  * If this was the last event in the bulk, the promise will resolve after a physical tick
        //    and the transaction will have committed already.
        // If no hook, the virtual tick will be executed in the reject()/resolve of the final promise,
        // because it is always marked with _lib = true when created using Transaction._promise().
        return wrap(function (event) {
            var req = event.target, ctx = req._hookCtx, // Contains the hook error handler. Put here instead of closure to boost performance.
            result = ctx.value || req.result, // Pass the object value on updates. The result from IDB is the primary key.
            hookSuccessHandler = ctx && ctx.onsuccess;
            hookSuccessHandler && hookSuccessHandler(result);
            resolve && resolve(result);
        }, resolve);
    }
    function eventRejectHandler(reject) {
        return wrap(function (event) {
            preventDefault(event);
            reject(event.target.error);
            return false;
        });
    }
    function eventSuccessHandler(resolve) {
        return wrap(function (event) {
            resolve(event.target.result);
        });
    }
    function hookedEventRejectHandler(reject) {
        return wrap(function (event) {
            // See comment on hookedEventSuccessHandler() why wrap() is needed only when supporting hooks.
            var req = event.target, err = req.error, ctx = req._hookCtx, // Contains the hook error handler. Put here instead of closure to boost performance.
            hookErrorHandler = ctx && ctx.onerror;
            hookErrorHandler && hookErrorHandler(err);
            preventDefault(event);
            reject(err);
            return false;
        });
    }
    function preventDefault(event) {
        if (event.stopPropagation)
            event.stopPropagation();
        if (event.preventDefault)
            event.preventDefault();
    }
    function awaitIterator(iterator) {
        var callNext = function (result) { return iterator.next(result); }, doThrow = function (error) { return iterator.throw(error); }, onSuccess = step(callNext), onError = step(doThrow);
        function step(getNext) {
            return function (val) {
                var next = getNext(val), value = next.value;
                return next.done ? value :
                    (!value || typeof value.then !== 'function' ?
                        isArray$1(value) ? Promise$1.all(value).then(onSuccess, onError) : onSuccess(value) :
                        value.then(onSuccess, onError));
            };
        }
        return step(callNext)();
    }
    //
    // IndexSpec struct
    //
    function IndexSpec(name, keyPath, unique, multi, auto, compound, dotted) {
        /// <param name="name" type="String"></param>
        /// <param name="keyPath" type="String"></param>
        /// <param name="unique" type="Boolean"></param>
        /// <param name="multi" type="Boolean"></param>
        /// <param name="auto" type="Boolean"></param>
        /// <param name="compound" type="Boolean"></param>
        /// <param name="dotted" type="Boolean"></param>
        this.name = name;
        this.keyPath = keyPath;
        this.unique = unique;
        this.multi = multi;
        this.auto = auto;
        this.compound = compound;
        this.dotted = dotted;
        var keyPathSrc = typeof keyPath === 'string' ? keyPath : keyPath && ('[' + [].join.call(keyPath, '+') + ']');
        this.src = (unique ? '&' : '') + (multi ? '*' : '') + (auto ? "++" : "") + keyPathSrc;
    }
    //
    // TableSchema struct
    //
    function TableSchema(name, primKey, indexes, instanceTemplate) {
        /// <param name="name" type="String"></param>
        /// <param name="primKey" type="IndexSpec"></param>
        /// <param name="indexes" type="Array" elementType="IndexSpec"></param>
        /// <param name="instanceTemplate" type="Object"></param>
        this.name = name;
        this.primKey = primKey || new IndexSpec();
        this.indexes = indexes || [new IndexSpec()];
        this.instanceTemplate = instanceTemplate;
        this.mappedClass = null;
        this.idxByName = arrayToObject(indexes, function (index) { return [index.name, index]; });
    }
    function safariMultiStoreFix(storeNames) {
        return storeNames.length === 1 ? storeNames[0] : storeNames;
    }
    function getNativeGetDatabaseNamesFn(indexedDB) {
        var fn = indexedDB && (indexedDB.getDatabaseNames || indexedDB.webkitGetDatabaseNames);
        return fn && fn.bind(indexedDB);
    }
    // Export Error classes
    props(Dexie, fullNameExceptions); // Dexie.XXXError = class XXXError {...};
    //
    // Static methods and properties
    // 
    props(Dexie, {
        //
        // Static delete() method.
        //
        delete: function (databaseName) {
            var db = new Dexie(databaseName), promise = db.delete();
            promise.onblocked = function (fn) {
                db.on("blocked", fn);
                return this;
            };
            return promise;
        },
        //
        // Static exists() method.
        //
        exists: function (name) {
            return new Dexie(name).open().then(function (db) {
                db.close();
                return true;
            }).catch(Dexie.NoSuchDatabaseError, function () { return false; });
        },
        //
        // Static method for retrieving a list of all existing databases at current host.
        //
        getDatabaseNames: function (cb) {
            var getDatabaseNames = getNativeGetDatabaseNamesFn(Dexie.dependencies.indexedDB);
            return getDatabaseNames ? new Promise$1(function (resolve, reject) {
                var req = getDatabaseNames();
                req.onsuccess = function (event) {
                    resolve(slice(event.target.result, 0)); // Converst DOMStringList to Array<String>
                };
                req.onerror = eventRejectHandler(reject);
            }).then(cb) : dbNamesDB.dbnames.toCollection().primaryKeys(cb);
        },
        defineClass: function () {
            // Default constructor able to copy given properties into this object.
            function Class(properties) {
                /// <param name="properties" type="Object" optional="true">Properties to initialize object with.
                /// </param>
                if (properties)
                    extend(this, properties);
            }
            return Class;
        },
        applyStructure: applyStructure,
        ignoreTransaction: function (scopeFunc) {
            // In case caller is within a transaction but needs to create a separate transaction.
            // Example of usage:
            //
            // Let's say we have a logger function in our app. Other application-logic should be unaware of the
            // logger function and not need to include the 'logentries' table in all transaction it performs.
            // The logging should always be done in a separate transaction and not be dependant on the current
            // running transaction context. Then you could use Dexie.ignoreTransaction() to run code that starts a new transaction.
            //
            //     Dexie.ignoreTransaction(function() {
            //         db.logentries.add(newLogEntry);
            //     });
            //
            // Unless using Dexie.ignoreTransaction(), the above example would try to reuse the current transaction
            // in current Promise-scope.
            //
            // An alternative to Dexie.ignoreTransaction() would be setImmediate() or setTimeout(). The reason we still provide an
            // API for this because
            //  1) The intention of writing the statement could be unclear if using setImmediate() or setTimeout().
            //  2) setTimeout() would wait unnescessary until firing. This is however not the case with setImmediate().
            //  3) setImmediate() is not supported in the ES standard.
            //  4) You might want to keep other PSD state that was set in a parent PSD, such as PSD.letThrough.
            return PSD.trans ?
                usePSD(PSD.transless, scopeFunc) : // Use the closest parent that was non-transactional.
                scopeFunc(); // No need to change scope because there is no ongoing transaction.
        },
        vip: function (fn) {
            // To be used by subscribers to the on('ready') event.
            // This will let caller through to access DB even when it is blocked while the db.ready() subscribers are firing.
            // This would have worked automatically if we were certain that the Provider was using Dexie.Promise for all asyncronic operations. The promise PSD
            // from the provider.connect() call would then be derived all the way to when provider would call localDatabase.applyChanges(). But since
            // the provider more likely is using non-promise async APIs or other thenable implementations, we cannot assume that.
            // Note that this method is only useful for on('ready') subscribers that is returning a Promise from the event. If not using vip()
            // the database could deadlock since it wont open until the returned Promise is resolved, and any non-VIPed operation started by
            // the caller will not resolve until database is opened.
            return newScope(function () {
                PSD.letThrough = true; // Make sure we are let through if still blocking db due to onready is firing.
                return fn();
            });
        },
        async: function (generatorFn) {
            return function () {
                try {
                    var rv = awaitIterator(generatorFn.apply(this, arguments));
                    if (!rv || typeof rv.then !== 'function')
                        return Promise$1.resolve(rv);
                    return rv;
                }
                catch (e) {
                    return rejection(e);
                }
            };
        },
        spawn: function (generatorFn, args, thiz) {
            try {
                var rv = awaitIterator(generatorFn.apply(thiz, args || []));
                if (!rv || typeof rv.then !== 'function')
                    return Promise$1.resolve(rv);
                return rv;
            }
            catch (e) {
                return rejection(e);
            }
        },
        // Dexie.currentTransaction property
        currentTransaction: {
            get: function () { return PSD.trans || null; }
        },
        waitFor: function (promiseOrFunction, optionalTimeout) {
            // If a function is provided, invoke it and pass the returning value to Transaction.waitFor()
            var promise = Promise$1.resolve(typeof promiseOrFunction === 'function' ? Dexie.ignoreTransaction(promiseOrFunction) : promiseOrFunction)
                .timeout(optionalTimeout || 60000); // Default the timeout to one minute. Caller may specify Infinity if required.       
            // Run given promise on current transaction. If no current transaction, just return a Dexie promise based
            // on given value.
            return PSD.trans ? PSD.trans.waitFor(promise) : promise;
        },
        // Export our Promise implementation since it can be handy as a standalone Promise implementation
        Promise: Promise$1,
        // Dexie.debug proptery:
        // Dexie.debug = false
        // Dexie.debug = true
        // Dexie.debug = "dexie" - don't hide dexie's stack frames.
        debug: {
            get: function () { return debug; },
            set: function (value) {
                setDebug(value, value === 'dexie' ? function () { return true; } : dexieStackFrameFilter);
            }
        },
        // Export our derive/extend/override methodology
        derive: derive,
        extend: extend,
        props: props,
        override: override,
        // Export our Events() function - can be handy as a toolkit
        Events: Events,
        // Utilities
        getByKeyPath: getByKeyPath,
        setByKeyPath: setByKeyPath,
        delByKeyPath: delByKeyPath,
        shallowClone: shallowClone,
        deepClone: deepClone,
        getObjectDiff: getObjectDiff,
        asap: asap,
        maxKey: maxKey,
        minKey: minKey,
        // Addon registry
        addons: [],
        // Global DB connection list
        connections: connections,
        MultiModifyError: exceptions.Modify,
        errnames: errnames,
        // Export other static classes
        IndexSpec: IndexSpec,
        TableSchema: TableSchema,
        //
        // Dependencies
        //
        // These will automatically work in browsers with indexedDB support, or where an indexedDB polyfill has been included.
        //
        // In node.js, however, these properties must be set "manually" before instansiating a new Dexie().
        // For node.js, you need to require indexeddb-js or similar and then set these deps.
        //
        dependencies: (function () {
            try {
                return {
                    // Required:
                    indexedDB: _global.indexedDB || _global.mozIndexedDB || _global.webkitIndexedDB || _global.msIndexedDB,
                    IDBKeyRange: _global.IDBKeyRange || _global.webkitIDBKeyRange
                };
            }
            catch (e) {
                return {
                    indexedDB: null,
                    IDBKeyRange: null
                };
            }
        })(),
        // API Version Number: Type Number, make sure to always set a version number that can be comparable correctly. Example: 0.9, 0.91, 0.92, 1.0, 1.01, 1.1, 1.2, 1.21, etc.
        semVer: DEXIE_VERSION,
        version: DEXIE_VERSION.split('.')
            .map(function (n) { return parseInt(n); })
            .reduce(function (p, c, i) { return p + (c / Math.pow(10, i * 2)); }),
        // https://github.com/dfahlander/Dexie.js/issues/186
        // typescript compiler tsc in mode ts-->es5 & commonJS, will expect require() to return
        // x.default. Workaround: Set Dexie.default = Dexie.
        default: Dexie,
        // Make it possible to import {Dexie} (non-default import)
        // Reason 1: May switch to that in future.
        // Reason 2: We declare it both default and named exported in d.ts to make it possible
        // to let addons extend the Dexie interface with Typescript 2.1 (works only when explicitely
        // exporting the symbol, not just default exporting)
        Dexie: Dexie
    });
    // Map DOMErrors and DOMExceptions to corresponding Dexie errors. May change in Dexie v2.0.
    Promise$1.rejectionMapper = mapError;
    // Initialize dbNamesDB (won't ever be opened on chromium browsers')
    dbNamesDB = new Dexie('__dbnames');
    dbNamesDB.version(1).stores({ dbnames: 'name' });
    (function () {
        // Migrate from Dexie 1.x database names stored in localStorage:
        var DBNAMES = 'Dexie.DatabaseNames';
        try {
            if (typeof localStorage !== undefined && _global.document !== undefined) {
                // Have localStorage and is not executing in a worker. Lets migrate from Dexie 1.x.
                JSON.parse(localStorage.getItem(DBNAMES) || "[]")
                    .forEach(function (name) { return dbNamesDB.dbnames.put({ name: name }).catch(nop); });
                localStorage.removeItem(DBNAMES);
            }
        }
        catch (_e) { }
    })();
    //# sourceMappingURL=dexie.es.js.map

    const db = new Dexie("QuizQuestions");

    const dbSchemaV1 = {
      quizQuestion:
        "++id, name, question, *submittedAnswers, *correctAnswers, correctAnswersCount"
    };

    db.version(1).stores(dbSchemaV1);

    const saveToDB = (
      {
        parentQuizName,
        question,
        submittedAnswers,
        correctAnswers,
        correctAnswersCount
      },
      onSuccess
    ) => {
      db.open().catch(err => "Failed to open db: " + (err.stack || err));

      db.quizQuestion
        .put({
          name: parentQuizName,
          question,
          submittedAnswers,
          correctAnswers,
          correctAnswersCount,
          timestamp: new Date().toISOString()
        })
        .then(() => {
          onSuccess();
        });
    };

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
        var getAnsweredQuestionsForAllQuizzes = function () {
            return quizzes.map(function (quiz) { return quiz.getAnsweredQuestions(); });
        };
        var getCurrentQuestion = function () {
            return getCurrentQuiz().getQuestion(currentQuestionNo);
        };
        var onSubmitAnswer = function (answer) {
            var currentQuestion = getCurrentQuestion();
            saveToDB(currentQuestion.submitAnswer(answer), function () {
                console.log("Saved to DB!", answer);
            });
            return update(function (n) { return (__assign(__assign({}, n), { questionNo: n.questionNo + 1 })); });
        };
        return {
            subscribe: subscribe,
            next: next,
            previous: previous,
            goTo: goTo,
            getAllQuizNames: getAllQuizNames,
            getCurrentQuiz: getCurrentQuiz,
            getAnsweredQuestionsForAllQuizzes: getAnsweredQuestionsForAllQuizzes,
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

    class VoiceInput {
      constructor() {
        this.lang = "pl-PL";
        this.numericOnly = true; // TODO: make it constructor parameters

        try {
          this.recognition = new SpeechRecognition();
        } catch {
          this.recognition = new webkitSpeechRecognition();
        }
        this.recognition.lang = this.lang;
        this.recognition.interimResults = false;
      }

      startAfter(ms) {
        this.id = setTimeout(() => {
          this.recognition.start(), ms;
        });
      }

      onResult(onSuccess, onFailure) {
        this.recognition.onresult = e => {
          const baseResult = e.results[0][0].transcript;
          if (this.numericOnly) {
            const result = this.processNumericInput(baseResult).toString();

            result ? onSuccess(result) : onFailure();
          }
        };
      }

      processNumericInput(input) {
        const inputAsSeparateWords = input.split(" ");

        const digits = inputAsSeparateWords
          .map(w => convertStringToDigit(w, this.lang))
          .filter(d => d != undefined);

        const numbers = inputAsSeparateWords.filter(w => !isNaN(parseInt(w)));

        const givenValidAnswers = [...digits, ...numbers];

        const finalResult = givenValidAnswers[givenValidAnswers.length - 1];

        return finalResult || ""
      }

      stop() {
        console.log("stopping");
        clearTimeout(this.id);
        this.recognition.abort();
      }
    }

    const convertStringToDigit = (string, locale) => {
      return localesStrings[locale][string]
    };

    const localesStrings = {
      "pl-PL": {
        jeden: "1",
        dwa: "2",
        trzy: "3",
        cztery: "4",
        pięć: "5",
        sześć: "6",
        cześć: "6",
        siedem: "7",
        osioem: "8",
        dziewięć: "9"
      }
    };

    function createInputStore() {
        var _a = writable(""), subscribe = _a.subscribe, set = _a.set;
        var value = "";
        subscribe(function (val) {
            value = val;
        });
        var onInput = function (inputValue) { return set(inputValue.replace(/[^0-9]/g, "")); };
        var getValue = function () { return value; };
        var resetValue = function () { return set(""); };
        return {
            subscribe: subscribe,
            onInput: onInput,
            getValue: getValue,
            resetValue: resetValue
        };
    }
    var inputStore = createInputStore();
    //# sourceMappingURL=inputStore.js.map

    function createControllerStore() {
        var _a = writable("keyboard"), subscribe = _a.subscribe, set = _a.set;
        var voiceInput = new VoiceInput();
        var currentController = "";
        subscribe(function (val) {
            currentController = val;
        });
        var turnMicrophoneOn = function () {
            set("microphone");
            startVoiceInput();
            console.log("microphone check 1, 2");
        };
        var turnMicrophoneOff = function () {
            set("keyboard");
            console.log("microphone... offfff");
        };
        var getCurrentController = function () { return currentController; };
        var resetMicrophone = function () {
            currentController === "microphone" && startVoiceInput();
        };
        var startVoiceInput = function () {
            console.log("voice input initialized");
            voiceInput.stop();
            voiceInput.startAfter(50);
            voiceInput.onResult(function (res) {
                inputStore.onInput(res);
            }, urgeToRepeat);
        };
        var urgeToRepeat = function () {
            console.log("REPEAT PLEASE");
            startVoiceInput();
        };
        return {
            turnMicrophoneOn: turnMicrophoneOn,
            turnMicrophoneOff: turnMicrophoneOff,
            resetMicrophone: resetMicrophone,
            getCurrentController: getCurrentController
        };
    }
    var controllerStore = createControllerStore();
    //# sourceMappingURL=controllerStore.js.map

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
    			add_location(div, file$2, 28, 0, 439);
    			dispose = listen_dev(div, "click", ctx.click_handler);
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
    	let { name, id, handleClick, isSelected } = $$props;

    	const writable_props = ['name', 'id', 'handleClick', 'isSelected'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<QuizIcon> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleClick(id);

    	$$self.$set = $$props => {
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    		if ('id' in $$props) $$invalidate('id', id = $$props.id);
    		if ('handleClick' in $$props) $$invalidate('handleClick', handleClick = $$props.handleClick);
    		if ('isSelected' in $$props) $$invalidate('isSelected', isSelected = $$props.isSelected);
    	};

    	$$self.$capture_state = () => {
    		return { name, id, handleClick, isSelected };
    	};

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    		if ('id' in $$props) $$invalidate('id', id = $$props.id);
    		if ('handleClick' in $$props) $$invalidate('handleClick', handleClick = $$props.handleClick);
    		if ('isSelected' in $$props) $$invalidate('isSelected', isSelected = $$props.isSelected);
    	};

    	return {
    		name,
    		id,
    		handleClick,
    		isSelected,
    		click_handler
    	};
    }

    class QuizIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["name", "id", "handleClick", "isSelected"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "QuizIcon", options, id: create_fragment$2.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.name === undefined && !('name' in props)) {
    			console.warn("<QuizIcon> was created without expected prop 'name'");
    		}
    		if (ctx.id === undefined && !('id' in props)) {
    			console.warn("<QuizIcon> was created without expected prop 'id'");
    		}
    		if (ctx.handleClick === undefined && !('handleClick' in props)) {
    			console.warn("<QuizIcon> was created without expected prop 'handleClick'");
    		}
    		if (ctx.isSelected === undefined && !('isSelected' in props)) {
    			console.warn("<QuizIcon> was created without expected prop 'isSelected'");
    		}
    	}

    	get name() {
    		throw new Error("<QuizIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<QuizIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<QuizIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<QuizIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleClick() {
    		throw new Error("<QuizIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleClick(value) {
    		throw new Error("<QuizIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isSelected() {
    		throw new Error("<QuizIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isSelected(value) {
    		throw new Error("<QuizIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Layout/ControlBar.svelte generated by Svelte v3.12.1 */

    const file$3 = "src/Layout/ControlBar.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.name = list[i];
    	return child_ctx;
    }

    // (36:2) {#each names as name (name)}
    function create_each_block(key_1, ctx) {
    	var first, current;

    	var quizicon = new QuizIcon({
    		props: {
    		name: ctx.noPrefix(ctx.name),
    		id: ctx.name,
    		handleClick: ctx.handleIconClick,
    		isSelected: ctx.selectedQuizName === ctx.name
    	},
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
    			if (changed.selectedQuizName) quizicon_changes.isSelected = ctx.selectedQuizName === ctx.name;
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(36:2) {#each names as name (name)}", ctx });
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
    			attr_dev(div, "class", "wrapper svelte-kjpgu6");
    			add_location(div, file$3, 33, 0, 658);
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
    	let { appPrefix } = $$props;

      let selectedQuizName;
      const quizStore = getContext("quizStore");

      const names = quizStore.getAllQuizNames();

      const handleIconClick = name => {
        quizStore.goTo(name);
      };

      quizStore.subscribe(value => {
        $$invalidate('selectedQuizName', selectedQuizName = value.quizName);
      });

      const noPrefix = name =>
        name.includes(appPrefix) && name.slice(appPrefix.length + 1, name.length);

    	const writable_props = ['appPrefix'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<ControlBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('appPrefix' in $$props) $$invalidate('appPrefix', appPrefix = $$props.appPrefix);
    	};

    	$$self.$capture_state = () => {
    		return { appPrefix, selectedQuizName };
    	};

    	$$self.$inject_state = $$props => {
    		if ('appPrefix' in $$props) $$invalidate('appPrefix', appPrefix = $$props.appPrefix);
    		if ('selectedQuizName' in $$props) $$invalidate('selectedQuizName', selectedQuizName = $$props.selectedQuizName);
    	};

    	return {
    		appPrefix,
    		selectedQuizName,
    		names,
    		handleIconClick,
    		noPrefix
    	};
    }

    class ControlBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["appPrefix"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "ControlBar", options, id: create_fragment$3.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.appPrefix === undefined && !('appPrefix' in props)) {
    			console.warn("<ControlBar> was created without expected prop 'appPrefix'");
    		}
    	}

    	get appPrefix() {
    		throw new Error("<ControlBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set appPrefix(value) {
    		throw new Error("<ControlBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/GenericComponents/NumericInput.svelte generated by Svelte v3.12.1 */
    const { console: console_1 } = globals;

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
    			add_location(input, file$4, 67, 0, 1204);

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

      const value = Math.ceil(Math.random() * 1000);

      onMount(() => {
        console.log("mounted", value);
      });

      onDestroy(() => {
        console.log("onDestroy", value);
      });

      beforeUpdate(() => {
        console.log("beforeUpdate", value);
      });
      afterUpdate(() => {
        console.log("afterUpdate", value);
      });

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
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console_1.warn(`<NumericInput> was created with unknown prop '${key}'`);
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
    			console_1.warn("<NumericInput> was created without expected prop 'onSubmit'");
    		}
    		if (ctx.onNavigate === undefined && !('onNavigate' in props)) {
    			console_1.warn("<NumericInput> was created without expected prop 'onNavigate'");
    		}
    		if (ctx.onFocus === undefined && !('onFocus' in props)) {
    			console_1.warn("<NumericInput> was created without expected prop 'onFocus'");
    		}
    		if (ctx.isFocused === undefined && !('isFocused' in props)) {
    			console_1.warn("<NumericInput> was created without expected prop 'isFocused'");
    		}
    		if (ctx.maxLength === undefined && !('maxLength' in props)) {
    			console_1.warn("<NumericInput> was created without expected prop 'maxLength'");
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
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-tjp536");
    			toggle_class(input, "focused", ctx.isFocused);
    			toggle_class(input, "blurred", !ctx.isFocused);
    			add_location(input, file$6, 78, 0, 1574);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler),
    				listen_dev(input, "focus", ctx.handleFocus),
    				listen_dev(input, "blur", ctx.handleBlur),
    				listen_dev(input, "keydown", ctx.handleKeydown)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			set_input_value(input, ctx.displayedInputValue);

    			ctx.input_binding(input);
    		},

    		p: function update(changed, ctx) {
    			if (changed.displayedInputValue && (input.value !== ctx.displayedInputValue)) set_input_value(input, ctx.displayedInputValue);

    			if (changed.maxLength) {
    				attr_dev(input, "maxlength", ctx.maxLength);
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
    	

      let { onSubmit, onNavigate, onFocus, maxLength } = $$props;
      // export let value;

      const inputStore = getContext("inputStore");
      const quizStore = getContext("quizStore");
      const controllerStore = getContext("controllerStore");

      let inputNode;
      let isFocused;
      let displayedInputValue;

      inputStore.subscribe(val => {
        $$invalidate('displayedInputValue', displayedInputValue = inputStore.getValue());
        inputNode && inputNode.focus();
      });

      beforeUpdate(() => {
        displayedInputValue && inputStore.onInput(displayedInputValue);
      });

      afterUpdate(() => {
        $$invalidate('displayedInputValue', displayedInputValue = inputStore.getValue());
      });

      const handleFocus = () => {
        $$invalidate('isFocused', isFocused = true);
      };

      const handleBlur = () => {
        $$invalidate('isFocused', isFocused = false);
      };

      const handleSubmit = () => {
        quizStore.onSubmitAnswer(displayedInputValue);
        inputStore.resetValue();
        controllerStore.resetMicrophone();
      };

      const handleKeydown = e => {
        if (e.code === "Enter") handleSubmit();
        if (typeof onNavigate === "function") onNavigate(e.key);
      };

    	const writable_props = ['onSubmit', 'onNavigate', 'onFocus', 'maxLength'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<NumericInputv2> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		displayedInputValue = this.value;
    		$$invalidate('displayedInputValue', displayedInputValue);
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
    		if ('maxLength' in $$props) $$invalidate('maxLength', maxLength = $$props.maxLength);
    	};

    	$$self.$capture_state = () => {
    		return { onSubmit, onNavigate, onFocus, maxLength, inputNode, isFocused, displayedInputValue };
    	};

    	$$self.$inject_state = $$props => {
    		if ('onSubmit' in $$props) $$invalidate('onSubmit', onSubmit = $$props.onSubmit);
    		if ('onNavigate' in $$props) $$invalidate('onNavigate', onNavigate = $$props.onNavigate);
    		if ('onFocus' in $$props) $$invalidate('onFocus', onFocus = $$props.onFocus);
    		if ('maxLength' in $$props) $$invalidate('maxLength', maxLength = $$props.maxLength);
    		if ('inputNode' in $$props) $$invalidate('inputNode', inputNode = $$props.inputNode);
    		if ('isFocused' in $$props) $$invalidate('isFocused', isFocused = $$props.isFocused);
    		if ('displayedInputValue' in $$props) $$invalidate('displayedInputValue', displayedInputValue = $$props.displayedInputValue);
    	};

    	$$self.$$.update = ($$dirty = { inputNode: 1 }) => {
    		if ($$dirty.inputNode) { inputNode && inputNode.focus(); }
    	};

    	return {
    		onSubmit,
    		onNavigate,
    		onFocus,
    		maxLength,
    		inputNode,
    		isFocused,
    		displayedInputValue,
    		handleFocus,
    		handleBlur,
    		handleKeydown,
    		input_input_handler,
    		input_binding
    	};
    }

    class NumericInputv2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, ["onSubmit", "onNavigate", "onFocus", "maxLength"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "NumericInputv2", options, id: create_fragment$6.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
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

    // (43:6) {:else}
    function create_else_block$1(ctx) {
    	var div, t_value = ctx.element + "", t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "symbol svelte-1n1izmm");
    			add_location(div, file$7, 43, 8, 931);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$1.name, type: "else", source: "(43:6) {:else}", ctx });
    	return block;
    }

    // (36:6) {#if element === INPUT_SYMBOL && !answered}
    function create_if_block$1(ctx) {
    	var div, current;

    	var numericinputv2 = new NumericInputv2({
    		props: {
    		value: 4,
    		maxLength: ctx.quizQuestion.getCorrectAnswer().length,
    		submittedValue: ctx.quizQuestion.getLastSubmittedAnswer()
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			numericinputv2.$$.fragment.c();
    			attr_dev(div, "class", "input svelte-1n1izmm");
    			add_location(div, file$7, 36, 8, 693);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(numericinputv2, div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var numericinputv2_changes = {};
    			if (changed.quizQuestion) numericinputv2_changes.maxLength = ctx.quizQuestion.getCorrectAnswer().length;
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$1.name, type: "if", source: "(36:6) {#if element === INPUT_SYMBOL && !answered}", ctx });
    	return block;
    }

    // (34:2) {#each quizQuestion.getAsArray() as element}
    function create_each_block$2(ctx) {
    	var div, current_block_type_index, if_block, t, current;

    	var if_block_creators = [
    		create_if_block$1,
    		create_else_block$1
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.element === INPUT_SYMBOL && !ctx.answered) return 0;
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
    			add_location(div, file$7, 34, 4, 616);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$2.name, type: "each", source: "(34:2) {#each quizQuestion.getAsArray() as element}", ctx });
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
    			add_location(div, file$7, 32, 0, 543);
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
    			if (changed.quizQuestion || changed.INPUT_SYMBOL || changed.answered) {
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
    	let { answered, quizQuestion } = $$props;

    	const writable_props = ['answered', 'quizQuestion'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<SingleEquation> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('answered' in $$props) $$invalidate('answered', answered = $$props.answered);
    		if ('quizQuestion' in $$props) $$invalidate('quizQuestion', quizQuestion = $$props.quizQuestion);
    	};

    	$$self.$capture_state = () => {
    		return { answered, quizQuestion };
    	};

    	$$self.$inject_state = $$props => {
    		if ('answered' in $$props) $$invalidate('answered', answered = $$props.answered);
    		if ('quizQuestion' in $$props) $$invalidate('quizQuestion', quizQuestion = $$props.quizQuestion);
    	};

    	return { answered, quizQuestion };
    }

    class SingleEquation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, ["answered", "quizQuestion"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "SingleEquation", options, id: create_fragment$7.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.answered === undefined && !('answered' in props)) {
    			console.warn("<SingleEquation> was created without expected prop 'answered'");
    		}
    		if (ctx.quizQuestion === undefined && !('quizQuestion' in props)) {
    			console.warn("<SingleEquation> was created without expected prop 'quizQuestion'");
    		}
    	}

    	get answered() {
    		throw new Error("<SingleEquation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set answered(value) {
    		throw new Error("<SingleEquation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get quizQuestion() {
    		throw new Error("<SingleEquation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quizQuestion(value) {
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
    		props: {
    		quizQuestion: ctx.answeredEquation,
    		answered: true
    	},
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
    		props: { quizQuestion: ctx.quizQuestion },
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
    			add_location(div1, file$8, 41, 2, 899);
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

    	return { quizQuestion, answeredEquations };
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
    			add_location(div, file$9, 24, 0, 583);
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
        $$invalidate('isMultiplicationTable', isMultiplicationTable = value.quizName.includes(MULTIPLICATION_TABLE));
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

    /* src/GenericComponents/ToggleIconButton.svelte generated by Svelte v3.12.1 */

    const file$a = "src/GenericComponents/ToggleIconButton.svelte";

    // (39:2) {:else}
    function create_else_block$3(ctx) {
    	var i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "fas fa-keyboard");
    			add_location(i, file$a, 39, 4, 737);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(i);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$3.name, type: "else", source: "(39:2) {:else}", ctx });
    	return block;
    }

    // (37:2) {#if !isSelectedMicrophone}
    function create_if_block$3(ctx) {
    	var i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "fas fa-microphone");
    			add_location(i, file$a, 37, 4, 691);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(i);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$3.name, type: "if", source: "(37:2) {#if !isSelectedMicrophone}", ctx });
    	return block;
    }

    function create_fragment$a(ctx) {
    	var div, dispose;

    	function select_block_type(changed, ctx) {
    		if (!ctx.isSelectedMicrophone) return create_if_block$3;
    		return create_else_block$3;
    	}

    	var current_block_type = select_block_type(null, ctx);
    	var if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "button svelte-2iytd3");
    			add_location(div, file$a, 35, 0, 617);
    			dispose = listen_dev(div, "click", ctx.onClick);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type !== (current_block_type = select_block_type(changed, ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			if_block.d();
    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$a.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { turnOn, turnOff } = $$props;

      let isSelectedMicrophone = false;

      const onClick = () => {
        isSelectedMicrophone ? turnOff() : turnOn();
        $$invalidate('isSelectedMicrophone', isSelectedMicrophone = !isSelectedMicrophone);
      };

    	const writable_props = ['turnOn', 'turnOff'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<ToggleIconButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('turnOn' in $$props) $$invalidate('turnOn', turnOn = $$props.turnOn);
    		if ('turnOff' in $$props) $$invalidate('turnOff', turnOff = $$props.turnOff);
    	};

    	$$self.$capture_state = () => {
    		return { turnOn, turnOff, isSelectedMicrophone };
    	};

    	$$self.$inject_state = $$props => {
    		if ('turnOn' in $$props) $$invalidate('turnOn', turnOn = $$props.turnOn);
    		if ('turnOff' in $$props) $$invalidate('turnOff', turnOff = $$props.turnOff);
    		if ('isSelectedMicrophone' in $$props) $$invalidate('isSelectedMicrophone', isSelectedMicrophone = $$props.isSelectedMicrophone);
    	};

    	return {
    		turnOn,
    		turnOff,
    		isSelectedMicrophone,
    		onClick
    	};
    }

    class ToggleIconButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, ["turnOn", "turnOff"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "ToggleIconButton", options, id: create_fragment$a.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.turnOn === undefined && !('turnOn' in props)) {
    			console.warn("<ToggleIconButton> was created without expected prop 'turnOn'");
    		}
    		if (ctx.turnOff === undefined && !('turnOff' in props)) {
    			console.warn("<ToggleIconButton> was created without expected prop 'turnOff'");
    		}
    	}

    	get turnOn() {
    		throw new Error("<ToggleIconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set turnOn(value) {
    		throw new Error("<ToggleIconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get turnOff() {
    		throw new Error("<ToggleIconButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set turnOff(value) {
    		throw new Error("<ToggleIconButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var bind = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    /*!
     * Determine if an object is a Buffer
     *
     * @author   Feross Aboukhadijeh <https://feross.org>
     * @license  MIT
     */

    var isBuffer = function isBuffer (obj) {
      return obj != null && obj.constructor != null &&
        typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
    };

    /*global toString:true*/

    // utils is a library of generic helper functions non-specific to axios

    var toString = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray$2(val) {
      return toString.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject$1(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction$1(val) {
      return toString.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject$1(val) && isFunction$1(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim(str) {
      return str.replace(/^\s*/, '').replace(/\s*$/, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray$2(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (typeof result[key] === 'object' && typeof val === 'object') {
          result[key] = merge(result[key], val);
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Function equal to merge with the difference being that no reference
     * to original objects is kept.
     *
     * @see merge
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function deepMerge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (typeof result[key] === 'object' && typeof val === 'object') {
          result[key] = deepMerge(result[key], val);
        } else if (typeof val === 'object') {
          result[key] = deepMerge({}, val);
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend$1(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    var utils = {
      isArray: isArray$2,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject$1,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction$1,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      deepMerge: deepMerge,
      extend: extend$1,
      trim: trim
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn(data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password || '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        // Listen for ready state
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }

          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(resolve, reject, response);

          // Clean up request
          request = null;
        };

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          var cookies$1 = cookies;

          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
            cookies$1.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (config.withCredentials) {
          request.withCredentials = true;
        }

        // Add responseType to request if needed
        if (config.responseType) {
          try {
            request.responseType = config.responseType;
          } catch (e) {
            // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
            // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
            if (config.responseType !== 'json') {
              throw e;
            }
          }
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken) {
          // Handle cancellation
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (!request) {
              return;
            }

            request.abort();
            reject(cancel);
            // Clean up request
            request = null;
          });
        }

        if (requestData === undefined) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      // Only Node.JS has a process variable that is of [[Class]] process
      if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      } else if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      }
      return adapter;
    }

    var defaults = {
      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');
        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data)) {
          setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
          return JSON.stringify(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        /*eslint no-param-reassign:0*/
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) { /* Ignore */ }
        }
        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      }
    };

    defaults.headers = {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Support baseURL config
      if (config.baseURL && !isAbsoluteURL(config.url)) {
        config.url = combineURLs(config.baseURL, config.url);
      }

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData(
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers || {}
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData(
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData(
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      utils.forEach(['url', 'method', 'params', 'data'], function valueFromConfig2(prop) {
        if (typeof config2[prop] !== 'undefined') {
          config[prop] = config2[prop];
        }
      });

      utils.forEach(['headers', 'auth', 'proxy'], function mergeDeepProperties(prop) {
        if (utils.isObject(config2[prop])) {
          config[prop] = utils.deepMerge(config1[prop], config2[prop]);
        } else if (typeof config2[prop] !== 'undefined') {
          config[prop] = config2[prop];
        } else if (utils.isObject(config1[prop])) {
          config[prop] = utils.deepMerge(config1[prop]);
        } else if (typeof config1[prop] !== 'undefined') {
          config[prop] = config1[prop];
        }
      });

      utils.forEach([
        'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
        'timeout', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
        'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'maxContentLength',
        'validateStatus', 'maxRedirects', 'httpAgent', 'httpsAgent', 'cancelToken',
        'socketPath'
      ], function defaultToConfig2(prop) {
        if (typeof config2[prop] !== 'undefined') {
          config[prop] = config2[prop];
        } else if (typeof config1[prop] !== 'undefined') {
          config[prop] = config1[prop];
        }
      });

      return config;
    };

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = mergeConfig(this.defaults, config);
      config.method = config.method ? config.method.toLowerCase() : 'get';

      // Hook up interceptors middleware
      var chain = [dispatchRequest, undefined];
      var promise = Promise.resolve(config);

      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });

      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(utils.merge(config || {}, {
          method: method,
          url: url
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(utils.merge(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;
      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      return instance;
    }

    // Create the default instance to be exported
    var axios = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios_1;

    // Factory for creating new instances
    axios.create = function create(instanceConfig) {
      return createInstance(mergeConfig(axios.defaults, instanceConfig));
    };

    // Expose Cancel & CancelToken
    axios.Cancel = Cancel_1;
    axios.CancelToken = CancelToken_1;
    axios.isCancel = isCancel;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };
    axios.spread = spread;

    var axios_1 = axios;

    // Allow use of default import syntax in TypeScript
    var default_1 = axios;
    axios_1.default = default_1;

    /* src/App.svelte generated by Svelte v3.12.1 */

    const file$b = "src/App.svelte";

    function create_fragment$b(ctx) {
    	var div, header1, t0, main, t1, footer, t2, current;

    	var header0 = new Header({ $$inline: true });

    	var quizdisplay = new QuizDisplay({ $$inline: true });

    	var controlbar = new ControlBar({
    		props: { appPrefix: APP_PREFIX },
    		$$inline: true
    	});

    	var toggleiconbutton = new ToggleIconButton({
    		props: {
    		turnOn: controllerStore.turnMicrophoneOn,
    		turnOff: controllerStore.turnMicrophoneOff
    	},
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
    			t2 = space();
    			toggleiconbutton.$$.fragment.c();
    			attr_dev(header1, "class", "header svelte-1qu7f0a");
    			add_location(header1, file$b, 63, 2, 1441);
    			attr_dev(main, "class", "main svelte-1qu7f0a");
    			add_location(main, file$b, 67, 2, 1495);
    			attr_dev(footer, "class", "footer svelte-1qu7f0a");
    			add_location(footer, file$b, 71, 2, 1548);
    			attr_dev(div, "class", "app svelte-1qu7f0a");
    			add_location(div, file$b, 61, 0, 1420);
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
    			append_dev(footer, t2);
    			mount_component(toggleiconbutton, footer, null);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(header0.$$.fragment, local);

    			transition_in(quizdisplay.$$.fragment, local);

    			transition_in(controlbar.$$.fragment, local);

    			transition_in(toggleiconbutton.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(header0.$$.fragment, local);
    			transition_out(quizdisplay.$$.fragment, local);
    			transition_out(controlbar.$$.fragment, local);
    			transition_out(toggleiconbutton.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			destroy_component(header0);

    			destroy_component(quizdisplay);

    			destroy_component(controlbar);

    			destroy_component(toggleiconbutton);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$b.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$b($$self) {
    	

      setContext("quizStore", quizStore);
      setContext("scoreStore", scoreStore);
      setContext("controllerStore", controllerStore);
      setContext("inputStore", inputStore);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {};

    	return {};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$b.name });
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
