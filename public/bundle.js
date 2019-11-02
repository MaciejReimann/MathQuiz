
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

    /* src/GenericComponents/NumericDisplay.svelte generated by Svelte v3.12.1 */

    const file = "src/GenericComponents/NumericDisplay.svelte";

    function create_fragment(ctx) {
    	var div, span0, t0, t1, span1, t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text(ctx.text);
    			t1 = space();
    			span1 = element("span");
    			t2 = text(ctx.numbers);
    			attr_dev(span0, "class", "text svelte-y9hym3");
    			add_location(span0, file, 24, 2, 360);
    			attr_dev(span1, "class", "numbers svelte-y9hym3");
    			add_location(span1, file, 25, 2, 395);
    			attr_dev(div, "class", "timer-wrapper svelte-y9hym3");
    			add_location(div, file, 22, 0, 329);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, t0);
    			append_dev(div, t1);
    			append_dev(div, span1);
    			append_dev(span1, t2);
    		},

    		p: function update(changed, ctx) {
    			if (changed.text) {
    				set_data_dev(t0, ctx.text);
    			}

    			if (changed.numbers) {
    				set_data_dev(t2, ctx.numbers);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { text, numbers } = $$props;

    	const writable_props = ['text', 'numbers'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<NumericDisplay> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('text' in $$props) $$invalidate('text', text = $$props.text);
    		if ('numbers' in $$props) $$invalidate('numbers', numbers = $$props.numbers);
    	};

    	$$self.$capture_state = () => {
    		return { text, numbers };
    	};

    	$$self.$inject_state = $$props => {
    		if ('text' in $$props) $$invalidate('text', text = $$props.text);
    		if ('numbers' in $$props) $$invalidate('numbers', numbers = $$props.numbers);
    	};

    	return { text, numbers };
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

    function create_fragment$1(ctx) {
    	var header, t0, h1, t2, current;

    	var numericdisplay0 = new NumericDisplay({
    		props: { text: "timer", numbers: timer },
    		$$inline: true
    	});

    	var numericdisplay1 = new NumericDisplay({
    		props: { text: "score", numbers: ctx.score },
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
    			attr_dev(h1, "class", "title svelte-19t0g86");
    			add_location(h1, file$1, 31, 2, 611);
    			attr_dev(header, "class", "header svelte-19t0g86");
    			add_location(header, file$1, 27, 0, 533);
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
    	

      window.addEventListener("score change", e => {
        $$invalidate('score', score = e.detail.score);
      });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('timer' in $$props) $$invalidate('timer', timer = $$props.timer);
    		if ('score' in $$props) $$invalidate('score', score = $$props.score);
    	};

    	let score;

    	$$invalidate('score', score = 0);

    	return { score };
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Header", options, id: create_fragment$1.name });
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

    var Quiz = /** @class */ (function () {
        function Quiz(quizQuestions, currentIndex) {
            if (currentIndex === void 0) { currentIndex = 0; }
            this.quizQuestions = quizQuestions;
            this.currentIndex = currentIndex;
            this.quizQuestions = quizQuestions;
        }
        Quiz.prototype.incrementIndex = function () {
            this.currentIndex = this.currentIndex + 1;
        };
        Quiz.prototype.getCurrentQuestion = function () {
            return this.quizQuestions[this.currentIndex];
        };
        return Quiz;
    }());
    //# sourceMappingURL=Quiz.v2.js.map

    var QuizQuestion = /** @class */ (function () {
        function QuizQuestion(question, correctAnswers, listeners) {
            this.correctAnswers = [];
            this.submittedAnswers = [];
            this.correctAnswerCount = 0;
            this.question = question;
            this.correctAnswers = correctAnswers;
            this.listeners = listeners;
        }
        QuizQuestion.prototype.getInArray = function () {
            return this.question;
        };
        QuizQuestion.prototype.submitAnswer = function (submittedAnswer) {
            console.log("QuizQuestion", submittedAnswer);
            if (this.correctAnswers.includes(submittedAnswer)) {
                this.correctAnswerCount = this.correctAnswerCount + 1;
                this.listeners.onSubmitCorrectAnswer();
            }
            else {
                this.listeners.onSubmitIncorrectAnswer();
            }
            this.submittedAnswers = __spreadArrays(this.submittedAnswers, [submittedAnswer]);
            this.listeners.onSubmitAnswer();
        };
        return QuizQuestion;
    }());
    //# sourceMappingURL=QuizQuestion.js.map

    function equationQuizAdapter(equation, position, listeners) {
        var question = __spreadArrays(equation.slice(0, position), [
            "|_|"
        ], equation.slice(position + 1, equation.length));
        var correctAnswers = equation[position].toString();
        return new QuizQuestion(question, [correctAnswers], listeners);
    }
    //# sourceMappingURL=equationQuizAdapter.js.map

    /* src/GenericComponents/NumericInputv2.svelte generated by Svelte v3.12.1 */

    const file$2 = "src/GenericComponents/NumericInputv2.svelte";

    function create_fragment$2(ctx) {
    	var input, dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "maxlength", ctx.maxLength);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-6nvr0x");
    			toggle_class(input, "focused", ctx.isFocused);
    			add_location(input, file$2, 59, 0, 966);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler),
    				listen_dev(input, "focus", ctx.handleFocus),
    				listen_dev(input, "blur", ctx.handleBlur),
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

    			if (changed.isFocused) {
    				toggle_class(input, "focused", ctx.isFocused);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { onSubmit, onNavigate, onFocus, maxLength } = $$props;

      let inputNode;
      let inputValue;
      let isFocused;

      const handleFocus = () => {
        $$invalidate('isFocused', isFocused = true);
      };

      const handleBlur = () => {
        $$invalidate('isFocused', isFocused = false);
      };

      const handleSubmit = () => {
        onSubmit(inputValue);
        $$invalidate('inputValue', inputValue = "");
      };

      const handleKeydown = e => {
        if (typeof onNavigate === "function") onNavigate(e.key);
      };

    	const writable_props = ['onSubmit', 'onNavigate', 'onFocus', 'maxLength'];
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
    		if ('onSubmit' in $$props) $$invalidate('onSubmit', onSubmit = $$props.onSubmit);
    		if ('onNavigate' in $$props) $$invalidate('onNavigate', onNavigate = $$props.onNavigate);
    		if ('onFocus' in $$props) $$invalidate('onFocus', onFocus = $$props.onFocus);
    		if ('maxLength' in $$props) $$invalidate('maxLength', maxLength = $$props.maxLength);
    	};

    	$$self.$capture_state = () => {
    		return { onSubmit, onNavigate, onFocus, maxLength, inputNode, inputValue, isFocused };
    	};

    	$$self.$inject_state = $$props => {
    		if ('onSubmit' in $$props) $$invalidate('onSubmit', onSubmit = $$props.onSubmit);
    		if ('onNavigate' in $$props) $$invalidate('onNavigate', onNavigate = $$props.onNavigate);
    		if ('onFocus' in $$props) $$invalidate('onFocus', onFocus = $$props.onFocus);
    		if ('maxLength' in $$props) $$invalidate('maxLength', maxLength = $$props.maxLength);
    		if ('inputNode' in $$props) $$invalidate('inputNode', inputNode = $$props.inputNode);
    		if ('inputValue' in $$props) $$invalidate('inputValue', inputValue = $$props.inputValue);
    		if ('isFocused' in $$props) $$invalidate('isFocused', isFocused = $$props.isFocused);
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
    		inputValue,
    		isFocused,
    		handleFocus,
    		handleBlur,
    		handleSubmit,
    		handleKeydown,
    		input_input_handler,
    		input_binding
    	};
    }

    class NumericInputv2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["onSubmit", "onNavigate", "onFocus", "maxLength"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "NumericInputv2", options, id: create_fragment$2.name });

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

    /* src/MultiplicationEquations/SingleEquation.svelte generated by Svelte v3.12.1 */

    const file$3 = "src/MultiplicationEquations/SingleEquation.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.element = list[i];
    	return child_ctx;
    }

    // (44:6) {:else}
    function create_else_block(ctx) {
    	var div, t_value = ctx.element + "", t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "symbol svelte-1n1izmm");
    			add_location(div, file$3, 44, 8, 843);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block.name, type: "else", source: "(44:6) {:else}", ctx });
    	return block;
    }

    // (40:6) {#if element === '|_|'}
    function create_if_block(ctx) {
    	var div, current;

    	var numericinputv2 = new NumericInputv2({
    		props: {
    		maxLength: 3,
    		onSubmit: ctx.handleSubmitAnswer
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			numericinputv2.$$.fragment.c();
    			attr_dev(div, "class", "input svelte-1n1izmm");
    			add_location(div, file$3, 40, 8, 713);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(numericinputv2, div, null);
    			current = true;
    		},

    		p: noop,

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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(40:6) {#if element === '|_|'}", ctx });
    	return block;
    }

    // (38:2) {#each equation.getInArray() as element}
    function create_each_block(ctx) {
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
    			add_location(div, file$3, 38, 4, 656);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(38:2) {#each equation.getInArray() as element}", ctx });
    	return block;
    }

    function create_fragment$3(ctx) {
    	var div, current;

    	let each_value = ctx.equation.getInArray();

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
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
    			add_location(div, file$3, 36, 0, 587);
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
    			if (changed.equation || changed.handleSubmitAnswer) {
    				each_value = ctx.equation.getInArray();

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { equation, onSubmit, elements } = $$props;

      function handleSubmitAnswer(answer) {
        equation.submitAnswer(answer);
      }

    	const writable_props = ['equation', 'onSubmit', 'elements'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<SingleEquation> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('equation' in $$props) $$invalidate('equation', equation = $$props.equation);
    		if ('onSubmit' in $$props) $$invalidate('onSubmit', onSubmit = $$props.onSubmit);
    		if ('elements' in $$props) $$invalidate('elements', elements = $$props.elements);
    	};

    	$$self.$capture_state = () => {
    		return { equation, onSubmit, elements };
    	};

    	$$self.$inject_state = $$props => {
    		if ('equation' in $$props) $$invalidate('equation', equation = $$props.equation);
    		if ('onSubmit' in $$props) $$invalidate('onSubmit', onSubmit = $$props.onSubmit);
    		if ('elements' in $$props) $$invalidate('elements', elements = $$props.elements);
    	};

    	return {
    		equation,
    		onSubmit,
    		elements,
    		handleSubmitAnswer
    	};
    }

    class SingleEquation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["equation", "onSubmit", "elements"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "SingleEquation", options, id: create_fragment$3.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.equation === undefined && !('equation' in props)) {
    			console.warn("<SingleEquation> was created without expected prop 'equation'");
    		}
    		if (ctx.onSubmit === undefined && !('onSubmit' in props)) {
    			console.warn("<SingleEquation> was created without expected prop 'onSubmit'");
    		}
    		if (ctx.elements === undefined && !('elements' in props)) {
    			console.warn("<SingleEquation> was created without expected prop 'elements'");
    		}
    	}

    	get equation() {
    		throw new Error("<SingleEquation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set equation(value) {
    		throw new Error("<SingleEquation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onSubmit() {
    		throw new Error("<SingleEquation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onSubmit(value) {
    		throw new Error("<SingleEquation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get elements() {
    		throw new Error("<SingleEquation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set elements(value) {
    		throw new Error("<SingleEquation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/MultiplicationEquations/EquationsDisplay.svelte generated by Svelte v3.12.1 */

    const file$4 = "src/MultiplicationEquations/EquationsDisplay.svelte";

    function create_fragment$4(ctx) {
    	var div, current;

    	var singleequation = new SingleEquation({
    		props: {
    		equation: ctx.currentEquation,
    		onSubmit: ctx.currentEquation.listeners.onSubmitAnswer
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			singleequation.$$.fragment.c();
    			attr_dev(div, "class", "wrapper");
    			add_location(div, file$4, 34, 0, 920);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(singleequation, div, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var singleequation_changes = {};
    			if (changed.currentEquation) singleequation_changes.equation = ctx.currentEquation;
    			if (changed.currentEquation) singleequation_changes.onSubmit = ctx.currentEquation.listeners.onSubmitAnswer;
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
    				detach_dev(div);
    			}

    			destroy_component(singleequation);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$4.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	

      const onSubmitAnswer = i => {
        quiz.incrementIndex();
        $$invalidate('currentEquation', currentEquation = quiz.getCurrentQuestion());
      };
      const onSubmitCorrectAnswer = i => {
        console.log("correct:  ", i);
      };
      const onSubmitIncorrectAnswer = i => {
        console.log("incorrect!  ", i);
      };

      const equations = generateEquationsForARange({ x: 10, y: 10 }).map(eq =>
        eq.formatEqResultRHS()
      );

      const quizQuestions = equations.map(eq =>
        equationQuizAdapter(eq, 0, {
          onSubmitAnswer,
          onSubmitCorrectAnswer,
          onSubmitIncorrectAnswer
        })
      );

      const quiz = new Quiz(quizQuestions, 9);

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('currentEquation' in $$props) $$invalidate('currentEquation', currentEquation = $$props.currentEquation);
    	};

    	let currentEquation;

    	$$invalidate('currentEquation', currentEquation = quiz.getCurrentQuestion());

    	return { currentEquation };
    }

    class EquationsDisplay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "EquationsDisplay", options, id: create_fragment$4.name });
    	}
    }

    /* src/App.svelte generated by Svelte v3.12.1 */

    const file$5 = "src/App.svelte";

    function create_fragment$5(ctx) {
    	var div1, div0, t, main, current;

    	var header = new Header({ $$inline: true });

    	var equationsdisplay = new EquationsDisplay({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			header.$$.fragment.c();
    			t = space();
    			main = element("main");
    			equationsdisplay.$$.fragment.c();
    			attr_dev(div0, "class", "header svelte-1hc2uby");
    			add_location(div0, file$5, 34, 2, 635);
    			attr_dev(main, "class", "main svelte-1hc2uby");
    			add_location(main, file$5, 38, 2, 683);
    			attr_dev(div1, "class", "app svelte-1hc2uby");
    			add_location(div1, file$5, 33, 0, 615);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(header, div0, null);
    			append_dev(div1, t);
    			append_dev(div1, main);
    			mount_component(equationsdisplay, main, null);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);

    			transition_in(equationsdisplay.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(equationsdisplay.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div1);
    			}

    			destroy_component(header);

    			destroy_component(equationsdisplay);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$5.name, type: "component", source: "", ctx });
    	return block;
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$5, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$5.name });
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
