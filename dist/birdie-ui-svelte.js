(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.BirdieUi = {}));
}(this, (function (exports) { 'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function append_styles(target, style_sheet_id, styles) {
        const append_styles_to = get_root_for_style(target);
        if (!append_styles_to.getElementById(style_sheet_id)) {
            const style = element('style');
            style.id = style_sheet_id;
            style.textContent = styles;
            append_stylesheet(append_styles_to, style);
        }
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
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
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        text.data = data;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
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
        else if (callback) {
            callback();
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    /* src/components/svelte/birdie-buttons.svelte generated by Svelte v3.59.2 */

    function add_css(target) {
    	append_styles(target, "svelte-2qo8dn", ".bi-btn.svelte-2qo8dn,.bi-btn-primary.svelte-2qo8dn::-moz-focus-inner,.bi-btn-secondary.svelte-2qo8dn::-moz-focus-inner,.bi-btn-success.svelte-2qo8dn::-moz-focus-inner,.bi-btn-danger.svelte-2qo8dn::-moz-focus-inner,.bi-btn-warning.svelte-2qo8dn::-moz-focus-inner,.bi-btn-info.svelte-2qo8dn::-moz-focus-inner{border:none}.bi-btn.svelte-2qo8dn,.bi-btn-primary.svelte-2qo8dn,.bi-btn-secondary.svelte-2qo8dn,.bi-btn-success.svelte-2qo8dn,.bi-btn-danger.svelte-2qo8dn,.bi-btn-warning.svelte-2qo8dn,.bi-btn-info.svelte-2qo8dn,.bi-btn-text.svelte-2qo8dn,.bi-btn-link.svelte-2qo8dn{position:relative;display:inline-block;box-sizing:border-box;min-width:64px;padding:8px 12px;vertical-align:middle;text-align:center;text-overflow:ellipsis;text-transform:uppercase;text-decoration:none;font-size:14px;font-weight:500;line-height:16px;outline:none;border:none;cursor:pointer}.bi-btn-text.svelte-2qo8dn,.bi-btn-link.svelte-2qo8dn{padding:2px;background:none}.bi-btn.svelte-2qo8dn:hover,.bi-btn.svelte-2qo8dn:focus{box-shadow:inset 0 0 10px 5px rgba(143, 143, 143, 0.1)}.bi-btn-primary.svelte-2qo8dn:hover,.bi-btn-primary.svelte-2qo8dn:focus,.bi-btn-secondary.svelte-2qo8dn:hover,.bi-btn-secondary.svelte-2qo8dn:focus,.bi-btn-success.svelte-2qo8dn:hover,.bi-btn-success.svelte-2qo8dn:focus,.bi-btn-danger.svelte-2qo8dn:hover,.bi-btn-danger.svelte-2qo8dn:focus,.bi-btn-warning.svelte-2qo8dn:hover,.bi-btn-warning.svelte-2qo8dn:focus,.bi-btn-info.svelte-2qo8dn:hover,.bi-btn-info.svelte-2qo8dn:focus{box-shadow:inset 0 0 10px 5px rgba(80, 80, 80, 0.1)}.bi-btn-link.svelte-2qo8dn:hover,.bi-btn-link.svelte-2qo8dn:focus{color:#0275d8;transition:color 0.2s}.bi-btn.svelte-2qo8dn:disabled,.bi-btn-primary.svelte-2qo8dn:disabled,.bi-btn-secondary.svelte-2qo8dn:disabled,.bi-btn-success.svelte-2qo8dn:disabled,.bi-btn-danger.svelte-2qo8dn:disabled,.bi-btn-warning.svelte-2qo8dn:disabled,.bi-btn-info.svelte-2qo8dn:disabled,.bi-btn-disabled.svelte-2qo8dn{box-shadow:none;cursor:initial;opacity:0.6}.bi-btn.svelte-2qo8dn{color:rgba(0, 0, 0, 0.38);background-color:#f1f1f1}.bi-btn-primary.svelte-2qo8dn{color:#f7f7f7;background-color:#0275d8}.bi-btn-secondary.svelte-2qo8dn{color:#f7f7f7;background-color:#5bc0de}.bi-btn-success.svelte-2qo8dn{color:#f7f7f7;background-color:#5cb85c}.bi-btn-danger.svelte-2qo8dn{color:#f7f7f7;background-color:#d9534f}.bi-btn-warning.svelte-2qo8dn{color:#f7f7f7;background-color:#f0ad4e}.bi-btn-info.svelte-2qo8dn{color:#f7f7f7;background-color:#5bc0de}.bi-btn-text.svelte-2qo8dn{color:#545454}.bi-btn-link.svelte-2qo8dn{color:#0275d8}.bi-btn-small.svelte-2qo8dn{padding:3px 6px;font-size:12px}.bi-btn-large.svelte-2qo8dn{padding:12px 24px;font-size:16px}.bi-btn-full.svelte-2qo8dn{display:block}.bi-btn-round.svelte-2qo8dn{border-radius:4px}.bi-btn-circle.svelte-2qo8dn{width:60px;height:60px;padding:0;border-radius:50%}");
    }

    function create_fragment(ctx) {
    	let button;
    	let t0;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	return {
    		c() {
    			button = element("button");
    			t0 = text(/*text*/ ctx[0]);
    			t1 = space();
    			if (default_slot) default_slot.c();
    			attr(button, "class", "svelte-2qo8dn");
    			toggle_class(button, "bi-btn", /*type*/ ctx[1] === 'default');
    			toggle_class(button, "bi-btn-primary", /*type*/ ctx[1] === 'primary');
    			toggle_class(button, "bi-btn-secondary", /*type*/ ctx[1] === 'secondary');
    			toggle_class(button, "bi-btn-danger", /*type*/ ctx[1] === 'danger');
    			toggle_class(button, "bi-btn-success", /*type*/ ctx[1] === 'success');
    			toggle_class(button, "bi-btn-warning", /*type*/ ctx[1] === 'warning');
    			toggle_class(button, "bi-btn-info", /*type*/ ctx[1] === 'info');
    			toggle_class(button, "bi-btn-text", /*type*/ ctx[1] === 'text');
    			toggle_class(button, "bi-btn-link", /*type*/ ctx[1] === 'link');
    			toggle_class(button, "bi-btn-small", /*size*/ ctx[2] === 'small');
    			toggle_class(button, "bi-btn-large", /*size*/ ctx[2] === 'large');
    			toggle_class(button, "bi-btn-full", /*size*/ ctx[2] === 'full');
    			toggle_class(button, "bi-btn-round", /*rounded*/ ctx[3]);
    			toggle_class(button, "bi-btn-circle", /*circle*/ ctx[4]);
    			toggle_class(button, "bi-btn-disabled", /*disabled*/ ctx[5]);
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, t0);
    			append(button, t1);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen(button, "click", /*onClick*/ ctx[6]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*text*/ 1) set_data(t0, /*text*/ ctx[0]);

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*type*/ 2) {
    				toggle_class(button, "bi-btn", /*type*/ ctx[1] === 'default');
    			}

    			if (!current || dirty & /*type*/ 2) {
    				toggle_class(button, "bi-btn-primary", /*type*/ ctx[1] === 'primary');
    			}

    			if (!current || dirty & /*type*/ 2) {
    				toggle_class(button, "bi-btn-secondary", /*type*/ ctx[1] === 'secondary');
    			}

    			if (!current || dirty & /*type*/ 2) {
    				toggle_class(button, "bi-btn-danger", /*type*/ ctx[1] === 'danger');
    			}

    			if (!current || dirty & /*type*/ 2) {
    				toggle_class(button, "bi-btn-success", /*type*/ ctx[1] === 'success');
    			}

    			if (!current || dirty & /*type*/ 2) {
    				toggle_class(button, "bi-btn-warning", /*type*/ ctx[1] === 'warning');
    			}

    			if (!current || dirty & /*type*/ 2) {
    				toggle_class(button, "bi-btn-info", /*type*/ ctx[1] === 'info');
    			}

    			if (!current || dirty & /*type*/ 2) {
    				toggle_class(button, "bi-btn-text", /*type*/ ctx[1] === 'text');
    			}

    			if (!current || dirty & /*type*/ 2) {
    				toggle_class(button, "bi-btn-link", /*type*/ ctx[1] === 'link');
    			}

    			if (!current || dirty & /*size*/ 4) {
    				toggle_class(button, "bi-btn-small", /*size*/ ctx[2] === 'small');
    			}

    			if (!current || dirty & /*size*/ 4) {
    				toggle_class(button, "bi-btn-large", /*size*/ ctx[2] === 'large');
    			}

    			if (!current || dirty & /*size*/ 4) {
    				toggle_class(button, "bi-btn-full", /*size*/ ctx[2] === 'full');
    			}

    			if (!current || dirty & /*rounded*/ 8) {
    				toggle_class(button, "bi-btn-round", /*rounded*/ ctx[3]);
    			}

    			if (!current || dirty & /*circle*/ 16) {
    				toggle_class(button, "bi-btn-circle", /*circle*/ ctx[4]);
    			}

    			if (!current || dirty & /*disabled*/ 32) {
    				toggle_class(button, "bi-btn-disabled", /*disabled*/ ctx[5]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { text = '' } = $$props;
    	let { type = 'default' } = $$props;
    	let { size = 'normal' } = $$props;
    	let { rounded = false } = $$props;
    	let { circle = false } = $$props;
    	let { disabled = false } = $$props;
    	const dispatch = createEventDispatcher();

    	function onClick(event) {
    		dispatch("click", event);
    	}

    	$$self.$$set = $$props => {
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('type' in $$props) $$invalidate(1, type = $$props.type);
    		if ('size' in $$props) $$invalidate(2, size = $$props.size);
    		if ('rounded' in $$props) $$invalidate(3, rounded = $$props.rounded);
    		if ('circle' in $$props) $$invalidate(4, circle = $$props.circle);
    		if ('disabled' in $$props) $$invalidate(5, disabled = $$props.disabled);
    		if ('$$scope' in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	return [text, type, size, rounded, circle, disabled, onClick, $$scope, slots];
    }

    class Birdie_buttons extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(
    			this,
    			options,
    			instance,
    			create_fragment,
    			safe_not_equal,
    			{
    				text: 0,
    				type: 1,
    				size: 2,
    				rounded: 3,
    				circle: 4,
    				disabled: 5
    			},
    			add_css
    		);
    	}
    }

    exports.BiButton = Birdie_buttons;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
