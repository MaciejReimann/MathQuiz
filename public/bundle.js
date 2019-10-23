
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
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

    /* src/Header.svelte generated by Svelte v3.12.1 */

    const file = "src/Header.svelte";

    function create_fragment(ctx) {
    	var h1, p;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			p = element("p");
    			p.textContent = "CountFast!";
    			attr_dev(p, "class", "svelte-17py6ly");
    			add_location(p, file, 13, 2, 150);
    			add_location(h1, file, 12, 0, 143);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, p);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(h1);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Header", options, id: create_fragment.name });
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

    var Quiz = /** @class */ (function () {
        function Quiz(arrayOfQA, quizID, handlers) {
            var _this = this;
            this.quizQuestions = null;
            this.quizID = null;
            this.getQuestions = function () { return _this.quizQuestions; };
            this.submitAnswer = function (submittedAnswer, i) {
                _this.quizQuestions = _this.quizQuestions.map(function (quizQuestion) {
                    if (quizQuestion.index == i) {
                        if (quizQuestion.correctAnswers.includes(submittedAnswer)) {
                            _this.handlers.onSubmitCorrectAnswer(quizQuestion.index);
                            return __assign(__assign({}, quizQuestion), { correctAnswerCount: quizQuestion.correctAnswerCount + 1 });
                        }
                        else {
                            _this.handlers.onSubmitIncorrectAnswer(quizQuestion.index);
                            return __assign(__assign({}, quizQuestion), { submittedAnswers: __spreadArrays(quizQuestion.submittedAnswers, [
                                    submittedAnswer
                                ]) });
                        }
                    }
                    return quizQuestion;
                });
            };
            this.quizQuestions = arrayOfQA.map(function (qa, i) { return ({
                index: quizID + "." + i,
                question: qa.question,
                correctAnswers: qa.correctAnswers,
                submittedAnswers: [],
                correctAnswerCount: 0
            }); });
            console.log(this.quizQuestions);
            this.quizID = quizID;
            this.handlers = handlers;
        }
        return Quiz;
    }());
    //# sourceMappingURL=Quiz.js.map

    /* src/GenericComponents/NumericInput.svelte generated by Svelte v3.12.1 */
    const { console: console_1 } = globals;

    const file$1 = "src/GenericComponents/NumericInput.svelte";

    function create_fragment$1(ctx) {
    	var input, dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "maxlength", "2");
    			attr_dev(input, "class", "svelte-1yoboy5");
    			toggle_class(input, "invalid", ctx.isInvalid);
    			add_location(input, file$1, 39, 0, 673);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler),
    				listen_dev(input, "input", ctx.handleInput),
    				listen_dev(input, "change", ctx.handleSubmit),
    				listen_dev(input, "keydown", ctx.keydownHandler)
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { onSubmit, onNavigate, isFocused } = $$props;

      let inputNode;
      let inputValue = "";
      let isInvalid = false;

      function handleSubmit(e) {
        onSubmit(e.target.value);
      }

      function keydownHandler(e) {
        !isInvalid && onNavigate(e.key);
      }

      function handleInput() {
        isInvalid && console.log("It's invalid!!!");
      }

    	const writable_props = ['onSubmit', 'onNavigate', 'isFocused'];
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
    		if ('isFocused' in $$props) $$invalidate('isFocused', isFocused = $$props.isFocused);
    	};

    	$$self.$capture_state = () => {
    		return { onSubmit, onNavigate, isFocused, inputNode, inputValue, isInvalid };
    	};

    	$$self.$inject_state = $$props => {
    		if ('onSubmit' in $$props) $$invalidate('onSubmit', onSubmit = $$props.onSubmit);
    		if ('onNavigate' in $$props) $$invalidate('onNavigate', onNavigate = $$props.onNavigate);
    		if ('isFocused' in $$props) $$invalidate('isFocused', isFocused = $$props.isFocused);
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
    		isFocused,
    		inputNode,
    		inputValue,
    		isInvalid,
    		handleSubmit,
    		keydownHandler,
    		handleInput,
    		input_input_handler,
    		input_binding
    	};
    }

    class NumericInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$1, safe_not_equal, ["onSubmit", "onNavigate", "isFocused"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "NumericInput", options, id: create_fragment$1.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.onSubmit === undefined && !('onSubmit' in props)) {
    			console_1.warn("<NumericInput> was created without expected prop 'onSubmit'");
    		}
    		if (ctx.onNavigate === undefined && !('onNavigate' in props)) {
    			console_1.warn("<NumericInput> was created without expected prop 'onNavigate'");
    		}
    		if (ctx.isFocused === undefined && !('isFocused' in props)) {
    			console_1.warn("<NumericInput> was created without expected prop 'isFocused'");
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

    	get isFocused() {
    		throw new Error("<NumericInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isFocused(value) {
    		throw new Error("<NumericInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var MultiplicationTable = /** @class */ (function () {
        function MultiplicationTable(range) {
            var _this = this;
            this.equations = null;
            this.getResults = function () { return _this.equations.map(function (eq) { return eq.getResult(); }); };
            this.getQAPair = function () {
                return _this.equations.map(function (eq) { return ({
                    question: eq.formatRHEq(),
                    correctAnswers: [eq.getResult().toString()]
                }); });
            };
            this.equations = __spreadArrays(new Array(range)).map(function (_, i) {
                return __spreadArrays(new Array(range)).map(function (_, j) { return new MultiplicationEquation(i + 1, j + 1); });
            })
                .flat();
        }
        return MultiplicationTable;
    }());
    var MultiplicationEquation = /** @class */ (function () {
        function MultiplicationEquation(value1, value2) {
            var _this = this;
            this.value1 = null;
            this.value2 = null;
            this.result = null;
            this.formatRHEq = function () { return [_this.value1, "x", _this.value2, "=", _this.result]; };
            this.getResult = function () { return _this.value1 * _this.value2; };
            this.value1 = value1;
            this.value2 = value2;
            this.result = value1 * value2;
        }
        return MultiplicationEquation;
    }());
    //# sourceMappingURL=MultiplicationTable.js.map

    /* src/MultiplicationTable/MultiplicationTable.svelte generated by Svelte v3.12.1 */

    const file$2 = "src/MultiplicationTable/MultiplicationTable.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.question = list[i];
    	return child_ctx;
    }

    // (156:6) {:else}
    function create_else_block(ctx) {
    	var current;

    	function func(...args) {
    		return ctx.func(ctx, ...args);
    	}

    	var numericinput = new NumericInput({
    		props: {
    		isFocused: parseIndex(ctx.question.index) == ctx.focusedInputIndex,
    		onSubmit: func,
    		onNavigate: ctx.handleNavigate
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
    			if (changed.focusedInputIndex) numericinput_changes.isFocused = parseIndex(ctx.question.index) == ctx.focusedInputIndex;
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block.name, type: "else", source: "(156:6) {:else}", ctx });
    	return block;
    }

    // (154:6) {#if parseIndex(question.index) < 10 || parseIndex(question.index) % 10 == 0}
    function create_if_block(ctx) {
    	var div, t_value = ctx.question.correctAnswers[0] + "", t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "" + 'visible' + " svelte-bzjebj");
    			add_location(div, file$2, 154, 8, 3738);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(154:6) {#if parseIndex(question.index) < 10 || parseIndex(question.index) % 10 == 0}", ctx });
    	return block;
    }

    // (149:2) {#each quizQuestions as question (question.index)}
    function create_each_block(key_1, ctx) {
    	var div, current_block_type_index, if_block, t, current;

    	var if_block_creators = [
    		create_if_block,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (parseIndex(ctx.question.index) < 10 || parseIndex(ctx.question.index) % 10 == 0) return 0;
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
    			attr_dev(div, "class", "" + 'cell' + " svelte-bzjebj");
    			toggle_class(div, "correct", ctx.fieldsAnsweredCorrectly.includes(ctx.question.index));
    			toggle_class(div, "incorrect", ctx.fieldsAnsweredInorrectly.includes(ctx.question.index));
    			add_location(div, file$2, 149, 4, 3474);
    			this.first = div;
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			append_dev(div, t);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if_block.p(changed, ctx);

    			if ((changed.fieldsAnsweredCorrectly || changed.quizQuestions)) {
    				toggle_class(div, "correct", ctx.fieldsAnsweredCorrectly.includes(ctx.question.index));
    			}

    			if ((changed.fieldsAnsweredInorrectly || changed.quizQuestions)) {
    				toggle_class(div, "incorrect", ctx.fieldsAnsweredInorrectly.includes(ctx.question.index));
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(149:2) {#each quizQuestions as question (question.index)}", ctx });
    	return block;
    }

    function create_fragment$2(ctx) {
    	var div, each_blocks = [], each_1_lookup = new Map(), current;

    	let each_value = ctx.quizQuestions;

    	const get_key = ctx => ctx.question.index;

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
    			attr_dev(div, "class", "table-wrapper svelte-bzjebj");
    			add_location(div, file$2, 147, 0, 3389);
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
    			const each_value = ctx.quizQuestions;

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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    let firstSquareIndex = 11;

    let lastSquareIndex = 100;

    function parseIndex(string) {
      const numberPattern = /\d+/g;
      return parseInt(string.match(numberPattern)[0]);
    }

    function instance$1($$self, $$props, $$invalidate) {
    	

      let fieldsAnsweredCorrectly = [];
      let fieldsAnsweredInorrectly = [];

      const submitHandlers = {
        onSubmitCorrectAnswer: id => {
          $$invalidate('fieldsAnsweredCorrectly', fieldsAnsweredCorrectly = [...fieldsAnsweredCorrectly, id]);
          goRight();
        },
        onSubmitIncorrectAnswer: id => {
          $$invalidate('fieldsAnsweredInorrectly', fieldsAnsweredInorrectly = [...fieldsAnsweredInorrectly, id]);
        }
      };

      const multiplicationTableQuiz = new Quiz(
        new MultiplicationTable(10).getQAPair(),
        "mt",
        submitHandlers
      );

      const quizQuestions = multiplicationTableQuiz.getQuestions();

      function onSubmitAnswer(answer, index) {
        multiplicationTableQuiz.submitAnswer(answer, index);
      }

      let focusedInputIndex = firstSquareIndex;

      function handleNavigate(key) {
        switch (key) {
          case "ArrowUp":
            goUp();
            break;
          case "ArrowLeft":
            goLeft();
            break;
          case "ArrowRight":
            goRight();
            break;
          case "ArrowDown":
            goDown();
            break;
        }
      }

      function goRight() {
        if (focusedInputIndex + 1 === lastSquareIndex) {
          $$invalidate('focusedInputIndex', focusedInputIndex = firstSquareIndex - 1);
        }
        if ((focusedInputIndex + 1) % 10 === 0) {
          $$invalidate('focusedInputIndex', focusedInputIndex = focusedInputIndex + 2);
        } else {
          $$invalidate('focusedInputIndex', focusedInputIndex = focusedInputIndex + 1);
        }
        if (allAnsweredFieldsIndexes.includes(focusedInputIndex)) {
          goRight();
        }
      }

      function goLeft() {
        if (focusedInputIndex === firstSquareIndex) {
          $$invalidate('focusedInputIndex', focusedInputIndex = lastSquareIndex);
        }
        if (focusedInputIndex % 10 === 1) {
          $$invalidate('focusedInputIndex', focusedInputIndex = focusedInputIndex - 2);
        } else {
          $$invalidate('focusedInputIndex', focusedInputIndex = focusedInputIndex - 1);
        }
        if (allAnsweredFieldsIndexes.includes(focusedInputIndex)) {
          goLeft();
        }
      }

      function goDown() {
        if (focusedInputIndex + 10 > lastSquareIndex) {
          $$invalidate('focusedInputIndex', focusedInputIndex = (focusedInputIndex % 10) + 10);
        } else {
          $$invalidate('focusedInputIndex', focusedInputIndex = focusedInputIndex + 10);
        }
        if (allAnsweredFieldsIndexes.includes(focusedInputIndex)) {
          goDown();
        }
      }

      function goUp() {
        if (focusedInputIndex - 10 < firstSquareIndex) {
          $$invalidate('focusedInputIndex', focusedInputIndex = lastSquareIndex + focusedInputIndex - 20);
        } else {
          $$invalidate('focusedInputIndex', focusedInputIndex = focusedInputIndex - 10);
        }
        if (allAnsweredFieldsIndexes.includes(focusedInputIndex)) {
          goUp();
        }
      }

    	const func = ({ question }, answer) => onSubmitAnswer(answer, question.index);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('fieldsAnsweredCorrectly' in $$props) $$invalidate('fieldsAnsweredCorrectly', fieldsAnsweredCorrectly = $$props.fieldsAnsweredCorrectly);
    		if ('fieldsAnsweredInorrectly' in $$props) $$invalidate('fieldsAnsweredInorrectly', fieldsAnsweredInorrectly = $$props.fieldsAnsweredInorrectly);
    		if ('firstSquareIndex' in $$props) firstSquareIndex = $$props.firstSquareIndex;
    		if ('lastSquareIndex' in $$props) lastSquareIndex = $$props.lastSquareIndex;
    		if ('focusedInputIndex' in $$props) $$invalidate('focusedInputIndex', focusedInputIndex = $$props.focusedInputIndex);
    		if ('allAnsweredFieldsIndexes' in $$props) allAnsweredFieldsIndexes = $$props.allAnsweredFieldsIndexes;
    	};

    	let allAnsweredFieldsIndexes;

    	$$self.$$.update = ($$dirty = { fieldsAnsweredCorrectly: 1, fieldsAnsweredInorrectly: 1 }) => {
    		if ($$dirty.fieldsAnsweredCorrectly || $$dirty.fieldsAnsweredInorrectly) { allAnsweredFieldsIndexes = [
            ...fieldsAnsweredCorrectly,
            ...fieldsAnsweredInorrectly
          ].map(parseIndex); }
    	};

    	return {
    		fieldsAnsweredCorrectly,
    		fieldsAnsweredInorrectly,
    		quizQuestions,
    		onSubmitAnswer,
    		focusedInputIndex,
    		handleNavigate,
    		func
    	};
    }

    class MultiplicationTable_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$2, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "MultiplicationTable_1", options, id: create_fragment$2.name });
    	}
    }

    /* src/App.svelte generated by Svelte v3.12.1 */

    const file$3 = "src/App.svelte";

    function create_fragment$3(ctx) {
    	var h1, t, current;

    	var header = new Header({ $$inline: true });

    	var multiplicationtable = new MultiplicationTable_1({ $$inline: true });

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			header.$$.fragment.c();
    			t = space();
    			multiplicationtable.$$.fragment.c();
    			attr_dev(h1, "class", "svelte-jlstt9");
    			add_location(h1, file$3, 13, 0, 233);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			mount_component(header, h1, null);
    			append_dev(h1, t);
    			mount_component(multiplicationtable, h1, null);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);

    			transition_in(multiplicationtable.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(multiplicationtable.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(h1);
    			}

    			destroy_component(header);

    			destroy_component(multiplicationtable);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
    	return block;
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$3, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$3.name });
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
