
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
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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

    var ScoreService = /** @class */ (function () {
        function ScoreService(config) {
            var _this = this;
            this.score = 0;
            this.incrementBy = 1;
            this.strikeLength = 0;
            this.strikeThreshhold = 5;
            this.incrementCallbacks = [];
            this.getScore = function () { return _this.score; };
            this.getStrikeLength = function () { return _this.strikeLength; };
            this.incrementScore = function () {
                if (_this.score === 0)
                    _this.score = 1;
                _this.score = _this.score + _this.incrementBy;
                if (_this.strikeLength % _this.strikeThreshhold === 0) {
                    ++_this.incrementBy;
                }
                ++_this.strikeLength;
                _this.incrementCallbacks.map(function (cb) { return cb(); });
            };
            this.resetStrike = function () {
                _this.incrementBy = 1;
                _this.strikeLength = 0;
            };
            this.setCallbacksForIncrement = function (cb) {
                if (typeof cb === "function")
                    _this.incrementCallbacks.push(cb);
                else
                    throw new Error("Callback provided to Score.service.ts is not a function!");
            };
            if (config && config.strikeThreshhold) {
                this.strikeThreshhold = config.strikeThreshhold;
            }
        }
        return ScoreService;
    }());
    //# sourceMappingURL=Score.service.js.map

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

    /* src/Header.svelte generated by Svelte v3.12.1 */

    const file$1 = "src/Header.svelte";

    // (61:2) <NumericDisplay text="score" numbers={score}>
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
    			attr_dev(div0, "class", "text svelte-1595u16");
    			add_location(div0, file$1, 62, 6, 1225);
    			attr_dev(div1, "class", "number svelte-1595u16");
    			add_location(div1, file$1, 63, 6, 1268);
    			attr_dev(div2, "class", "strike svelte-1595u16");
    			add_location(div2, file$1, 61, 4, 1198);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot.name, type: "slot", source: "(61:2) <NumericDisplay text=\"score\" numbers={score}>", ctx });
    	return block;
    }

    function create_fragment$1(ctx) {
    	var header, t0, h1, t2, current;

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
    			header = element("header");
    			numericdisplay0.$$.fragment.c();
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Count Fast!";
    			t2 = space();
    			numericdisplay1.$$.fragment.c();
    			attr_dev(h1, "class", "title svelte-1595u16");
    			add_location(h1, file$1, 58, 2, 1110);
    			attr_dev(header, "class", "header svelte-1595u16");
    			add_location(header, file$1, 54, 0, 1032);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			mount_component(numericdisplay0, header, null);
    			append_dev(header, t0);
    			append_dev(header, h1);
    			append_dev(header, t2);
    			mount_component(numericdisplay1, header, null);
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
    				detach_dev(header);
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
    	

      const scoreService = getContext("scoreService");

      scoreService.setCallbacksForIncrement(() => {
        $$invalidate('score', score = scoreService.getScore());
        $$invalidate('strikeLength', strikeLength = scoreService.getStrikeLength());
        $$invalidate('strikeText', strikeText = "strike");
      });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('timer' in $$props) $$invalidate('timer', timer = $$props.timer);
    		if ('score' in $$props) $$invalidate('score', score = $$props.score);
    		if ('strikeLength' in $$props) $$invalidate('strikeLength', strikeLength = $$props.strikeLength);
    		if ('strikeText' in $$props) $$invalidate('strikeText', strikeText = $$props.strikeText);
    	};

    	let score, strikeLength, strikeText;

    	$$invalidate('score', score = scoreService.getScore());
    	$$invalidate('strikeLength', strikeLength = "");
    	$$invalidate('strikeText', strikeText = "");

    	return { score, strikeLength, strikeText };
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Header", options, id: create_fragment$1.name });
    	}
    }

    /* src/ControlBar/AppletIcon.svelte generated by Svelte v3.12.1 */

    const file$2 = "src/ControlBar/AppletIcon.svelte";

    function create_fragment$2(ctx) {
    	var div, t, dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(ctx.name);
    			attr_dev(div, "class", "wrapper svelte-1hwm0cr");
    			toggle_class(div, "selected", ctx.isSelected);
    			add_location(div, file$2, 41, 0, 653);
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
      const appStore = getContext("appStore");

      let selectedAppletID;

      appStore.subscribe(value => {
        $$invalidate('selectedAppletID', selectedAppletID = value);
      });

      const handleClick = () => {
        appStore.set(name);
      };

    	const writable_props = ['name'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<AppletIcon> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    	};

    	$$self.$capture_state = () => {
    		return { name, selectedAppletID, isSelected };
    	};

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    		if ('selectedAppletID' in $$props) $$invalidate('selectedAppletID', selectedAppletID = $$props.selectedAppletID);
    		if ('isSelected' in $$props) $$invalidate('isSelected', isSelected = $$props.isSelected);
    	};

    	let isSelected;

    	$$self.$$.update = ($$dirty = { selectedAppletID: 1, name: 1 }) => {
    		if ($$dirty.selectedAppletID || $$dirty.name) { $$invalidate('isSelected', isSelected = selectedAppletID === name); }
    	};

    	return { name, handleClick, isSelected };
    }

    class AppletIcon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["name"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "AppletIcon", options, id: create_fragment$2.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.name === undefined && !('name' in props)) {
    			console.warn("<AppletIcon> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<AppletIcon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<AppletIcon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ControlBar/ControlBar.svelte generated by Svelte v3.12.1 */

    const file$3 = "src/ControlBar/ControlBar.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.option = list[i];
    	return child_ctx;
    }

    // (17:2) {#each options as option (option)}
    function create_each_block(key_1, ctx) {
    	var first, current;

    	var appleticon = new AppletIcon({
    		props: { name: ctx.option },
    		$$inline: true
    	});

    	const block = {
    		key: key_1,

    		first: null,

    		c: function create() {
    			first = empty();
    			appleticon.$$.fragment.c();
    			this.first = first;
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(appleticon, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var appleticon_changes = {};
    			if (changed.options) appleticon_changes.name = ctx.option;
    			appleticon.$set(appleticon_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(appleticon.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(appleticon.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(first);
    			}

    			destroy_component(appleticon, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(17:2) {#each options as option (option)}", ctx });
    	return block;
    }

    function create_fragment$3(ctx) {
    	var div, each_blocks = [], each_1_lookup = new Map(), current;

    	let each_value = ctx.options;

    	const get_key = ctx => ctx.option;

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
    			add_location(div, file$3, 14, 0, 214);
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
    			const each_value = ctx.options;

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
    	let { options } = $$props;

    	const writable_props = ['options'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<ControlBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('options' in $$props) $$invalidate('options', options = $$props.options);
    	};

    	$$self.$capture_state = () => {
    		return { options };
    	};

    	$$self.$inject_state = $$props => {
    		if ('options' in $$props) $$invalidate('options', options = $$props.options);
    	};

    	return { options };
    }

    class ControlBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["options"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "ControlBar", options, id: create_fragment$3.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.options === undefined && !('options' in props)) {
    			console.warn("<ControlBar> was created without expected prop 'options'");
    		}
    	}

    	get options() {
    		throw new Error("<ControlBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<ControlBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
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

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    var Signs;
    (function (Signs) {
        Signs["Mult"] = "x";
        Signs["Equal"] = "=";
    })(Signs || (Signs = {}));
    var MultiplicationEquation = /** @class */ (function () {
        function MultiplicationEquation(value1, value2) {
            var _this = this;
            this.formatEqResultRHS = function () { return [
                _this.value1,
                Signs.Mult,
                _this.value2,
                Signs.Equal,
                _this.result
            ]; };
            this.formatEqResultLHS = function () { return [
                _this.result,
                Signs.Equal,
                _this.value1,
                Signs.Mult,
                _this.value2
            ]; };
            this.formatRHEq = function () { return [_this.value1, "x", _this.value2, "=", _this.result]; };
            this.getResult = function () { return _this.value1 * _this.value2; };
            this.value1 = value1;
            this.value2 = value2;
            this.result = value1 * value2;
        }
        return MultiplicationEquation;
    }());
    function generateEquationsForARange(range) {
        return __spreadArrays(new Array(range.x)).map(function (_, i) {
            return __spreadArrays(new Array(range.y)).map(function (_, j) { return new MultiplicationEquation(i + 1, j + 1); });
        })
            .flat();
    }
    //# sourceMappingURL=MultiplicationEquation.js.map

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

    // export interface QuizQuestionI {
    //   index: string
    //   question: any[]
    //   correctAnswers: any[]
    //   submittedAnswers: any[]
    //   correctAnswerCount: number
    // }
    var Quiz = /** @class */ (function () {
        function Quiz(quizQuestions, currentIndex, options) {
            if (currentIndex === void 0) { currentIndex = 0; }
            this.quizQuestions = quizQuestions;
            this.currentIndex = currentIndex;
            if (options.shuffled) {
                this.quizQuestions = shuffle_1(quizQuestions);
            }
            else {
                this.quizQuestions = quizQuestions;
            }
        }
        Quiz.prototype.getAnsweredQuestions = function () {
            return this.quizQuestions.filter(function (q) { return q.getLastSubmittedAnswer() != undefined; });
        };
        Quiz.prototype.incrementIndex = function () {
            this.currentIndex = this.currentIndex + 1;
        };
        Quiz.prototype.getCurrentQuestion = function () {
            return this.quizQuestions[this.currentIndex];
        };
        Quiz.prototype.onSubmitAnswer = function () {
            this.getCurrentQuestion().listeners.onSubmitAnswer();
        };
        return Quiz;
    }());
    //# sourceMappingURL=Quiz.v2.js.map

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
        QuizQuestion.prototype.getInArray = function () {
            return this.question;
        };
        QuizQuestion.prototype.getLastSubmittedAnswer = function () {
            return this.submittedAnswers[this.submittedAnswers.length - 1];
        };
        QuizQuestion.prototype.submitAnswer = function (submittedAnswer) {
            if (this.correctAnswers.includes(submittedAnswer)) {
                ++this.correctAnswerCount;
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

    function equationQuizAdapter(ID, equation, position, listeners) {
        var question = __spreadArrays(equation.slice(0, position), [
            "|_|"
        ], equation.slice(position + 1, equation.length));
        var correctAnswers = equation[position].toString();
        return new QuizQuestion(ID, question, [correctAnswers], listeners);
    }
    //# sourceMappingURL=equationQuizAdapter.js.map

    /* src/GenericComponents/NumericInputv2.svelte generated by Svelte v3.12.1 */

    const file$4 = "src/GenericComponents/NumericInputv2.svelte";

    function create_fragment$4(ctx) {
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
    			add_location(input, file$4, 60, 0, 1044);

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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$4.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, ["submittedValue", "onSubmit", "onNavigate", "onFocus", "maxLength"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "NumericInputv2", options, id: create_fragment$4.name });

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

    /* src/MultiplicationEquations/SingleEquation.svelte generated by Svelte v3.12.1 */

    const file$5 = "src/MultiplicationEquations/SingleEquation.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.element = list[i];
    	return child_ctx;
    }

    // (42:6) {:else}
    function create_else_block(ctx) {
    	var div, t_value = ctx.element + "", t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "symbol svelte-1n1izmm");
    			add_location(div, file$5, 42, 8, 826);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.equation) && t_value !== (t_value = ctx.element + "")) {
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block.name, type: "else", source: "(42:6) {:else}", ctx });
    	return block;
    }

    // (35:6) {#if element === '|_|'}
    function create_if_block(ctx) {
    	var div, current;

    	var numericinputv2 = new NumericInputv2({
    		props: {
    		maxLength: 3,
    		onSubmit: ctx.func,
    		submittedValue: ctx.equation.getLastSubmittedAnswer()
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			numericinputv2.$$.fragment.c();
    			attr_dev(div, "class", "input svelte-1n1izmm");
    			add_location(div, file$5, 35, 8, 588);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(numericinputv2, div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var numericinputv2_changes = {};
    			if (changed.equation) numericinputv2_changes.onSubmit = ctx.func;
    			if (changed.equation) numericinputv2_changes.submittedValue = ctx.equation.getLastSubmittedAnswer();
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(35:6) {#if element === '|_|'}", ctx });
    	return block;
    }

    // (33:2) {#each equation.getInArray() as element}
    function create_each_block$1(ctx) {
    	var div, current_block_type_index, if_block, t, current;

    	var if_block_creators = [
    		create_if_block,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.element === '|_|') return 0;
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
    			add_location(div, file$5, 33, 4, 531);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$1.name, type: "each", source: "(33:2) {#each equation.getInArray() as element}", ctx });
    	return block;
    }

    function create_fragment$5(ctx) {
    	var div, current;

    	let each_value = ctx.equation.getInArray();

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
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
    			add_location(div, file$5, 31, 0, 462);
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
    			if (changed.equation) {
    				each_value = ctx.equation.getInArray();

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$5.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { equation } = $$props;

    	const writable_props = ['equation'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<SingleEquation> was created with unknown prop '${key}'`);
    	});

    	const func = (answer) => equation.submitAnswer(answer);

    	$$self.$set = $$props => {
    		if ('equation' in $$props) $$invalidate('equation', equation = $$props.equation);
    	};

    	$$self.$capture_state = () => {
    		return { equation };
    	};

    	$$self.$inject_state = $$props => {
    		if ('equation' in $$props) $$invalidate('equation', equation = $$props.equation);
    	};

    	return { equation, func };
    }

    class SingleEquation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, ["equation"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "SingleEquation", options, id: create_fragment$5.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.equation === undefined && !('equation' in props)) {
    			console.warn("<SingleEquation> was created without expected prop 'equation'");
    		}
    	}

    	get equation() {
    		throw new Error("<SingleEquation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set equation(value) {
    		throw new Error("<SingleEquation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/MultiplicationEquations/EquationsDisplay.svelte generated by Svelte v3.12.1 */

    const file$6 = "src/MultiplicationEquations/EquationsDisplay.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.answeredEquation = list[i];
    	return child_ctx;
    }

    // (40:2) {#each quiz.getAnsweredQuestions() as answeredEquation (answeredEquation.ID)}
    function create_each_block$2(key_1, ctx) {
    	var first, current;

    	var singleequation = new SingleEquation({
    		props: { equation: ctx.answeredEquation },
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

    		p: noop,

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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$2.name, type: "each", source: "(40:2) {#each quiz.getAnsweredQuestions() as answeredEquation (answeredEquation.ID)}", ctx });
    	return block;
    }

    function create_fragment$6(ctx) {
    	var div, each_blocks = [], each_1_lookup = new Map(), t, current;

    	let each_value = ctx.quiz.getAnsweredQuestions();

    	const get_key = ctx => ctx.answeredEquation.ID;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	var singleequation = new SingleEquation({
    		props: {
    		equation: ctx.currentEquation,
    		onSubmit: ctx.quiz.onSubmitAnswer
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			singleequation.$$.fragment.c();
    			attr_dev(div, "class", "wrapper");
    			add_location(div, file$6, 38, 0, 1129);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    			mount_component(singleequation, div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			const each_value = ctx.quiz.getAnsweredQuestions();

    			group_outros();
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$2, t, get_each_context$2);
    			check_outros();

    			var singleequation_changes = {};
    			if (changed.currentEquation) singleequation_changes.equation = ctx.currentEquation;
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
    				detach_dev(div);
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			destroy_component(singleequation);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$6.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	

      const dispatch = createEventDispatcher();

      const onSubmitAnswer = i => {
        quiz.incrementIndex();
        $$invalidate('currentEquation', currentEquation = quiz.getCurrentQuestion());
      };
      const onSubmitCorrectAnswer = i => {
        dispatch("answerSubmitted", { correct: true, index: `${i}` });
      };
      const onSubmitIncorrectAnswer = i => {
        dispatch("answerSubmitted", { correct: false, index: `${i}` });
      };

      const equations = generateEquationsForARange({ x: 10, y: 10 }).map(eq =>
        eq.formatEqResultRHS()
      );

      const quizQuestions = equations.map((eq, i) =>
        equationQuizAdapter(`[["_*y=z"], [${i}]]`, eq, 0, {
          onSubmitAnswer,
          onSubmitCorrectAnswer,
          onSubmitIncorrectAnswer
        })
      );

      const quiz = new Quiz(quizQuestions, 9, { shuffled: true });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('currentEquation' in $$props) $$invalidate('currentEquation', currentEquation = $$props.currentEquation);
    	};

    	let currentEquation;

    	$$invalidate('currentEquation', currentEquation = quiz.getCurrentQuestion());

    	return { quiz, currentEquation };
    }

    class EquationsDisplay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "EquationsDisplay", options, id: create_fragment$6.name });
    	}
    }

    /* src/App.svelte generated by Svelte v3.12.1 */

    const file$7 = "src/App.svelte";

    function create_fragment$7(ctx) {
    	var div1, div0, t0, main, t1, footer, current;

    	var header = new Header({ $$inline: true });

    	var equationsdisplay = new EquationsDisplay({ $$inline: true });
    	equationsdisplay.$on("answerSubmitted", ctx.handleAnswerSubmitted);

    	var controlbar = new ControlBar({
    		props: { options: ctx.appletsID },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			header.$$.fragment.c();
    			t0 = space();
    			main = element("main");
    			equationsdisplay.$$.fragment.c();
    			t1 = space();
    			footer = element("footer");
    			controlbar.$$.fragment.c();
    			attr_dev(div0, "class", "header svelte-10iewqs");
    			add_location(div0, file$7, 69, 2, 1441);
    			attr_dev(main, "class", "main svelte-10iewqs");
    			add_location(main, file$7, 73, 2, 1489);
    			attr_dev(footer, "class", "footer svelte-10iewqs");
    			add_location(footer, file$7, 77, 2, 1590);
    			attr_dev(div1, "class", "app svelte-10iewqs");
    			add_location(div1, file$7, 68, 0, 1421);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(header, div0, null);
    			append_dev(div1, t0);
    			append_dev(div1, main);
    			mount_component(equationsdisplay, main, null);
    			append_dev(div1, t1);
    			append_dev(div1, footer);
    			mount_component(controlbar, footer, null);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);

    			transition_in(equationsdisplay.$$.fragment, local);

    			transition_in(controlbar.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(equationsdisplay.$$.fragment, local);
    			transition_out(controlbar.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div1);
    			}

    			destroy_component(header);

    			destroy_component(equationsdisplay);

    			destroy_component(controlbar);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$7.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$7($$self) {
    	

      const appletsID = ["x * y = _", "_ * y = z", "x * _ = z", "table"];
      let currentAppletID;

      const appStore = writable(appletsID[0]);
      setContext("appStore", appStore);
      // $: console.log(currentAppletID);

      appStore.subscribe(value => {
        currentAppletID = value;
      });

      const scoreService = new ScoreService();
      setContext("scoreService", scoreService);

      const handleAnswerSubmitted = e => {
        if (e.detail.correct) {
          scoreService.incrementScore();
        } else {
          scoreService.resetStrike();
        }
      };

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('currentAppletID' in $$props) currentAppletID = $$props.currentAppletID;
    	};

    	currentAppletID = appStore;

    	return { appletsID, handleAnswerSubmitted };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$7.name });
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
