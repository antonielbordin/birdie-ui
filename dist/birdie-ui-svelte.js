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
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
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
    /**
     * List of attributes that should always be set through the attr method,
     * because updating them through the property setter doesn't work reliably.
     * In the example of `width`/`height`, the problem is that the setter only
     * accepts numeric values, but the attribute can also be set to a string like `50%`.
     * If this list becomes too big, rethink this approach.
     */
    const always_set_through_set_attribute = ['width', 'height'];
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set && always_set_through_set_attribute.indexOf(key) === -1) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
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

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
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
        else if (callback) {
            callback();
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
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

    /* src/components/svelte/BiButton.svelte generated by Svelte v3.59.2 */

    function add_css(target) {
    	append_styles(target, "svelte-1uisckt", ".bi-btn.svelte-1uisckt,.bi-btn-primary.svelte-1uisckt::-moz-focus-inner,.bi-btn-secondary.svelte-1uisckt::-moz-focus-inner,.bi-btn-success.svelte-1uisckt::-moz-focus-inner,.bi-btn-danger.svelte-1uisckt::-moz-focus-inner,.bi-btn-warning.svelte-1uisckt::-moz-focus-inner,.bi-btn-info.svelte-1uisckt::-moz-focus-inner{border:none}.bi-btn.svelte-1uisckt,.bi-btn-primary.svelte-1uisckt,.bi-btn-secondary.svelte-1uisckt,.bi-btn-success.svelte-1uisckt,.bi-btn-danger.svelte-1uisckt,.bi-btn-warning.svelte-1uisckt,.bi-btn-info.svelte-1uisckt{position:relative;display:inline-block;box-sizing:border-box;min-width:64px;padding:8px 12px;vertical-align:middle;text-align:center;text-overflow:ellipsis;text-transform:uppercase;text-decoration:none;font-size:14px;font-weight:500;line-height:16px;outline:none;border:none;cursor:pointer}.bi-btn.svelte-1uisckt:hover,.bi-btn.svelte-1uisckt:focus{box-shadow:inset 0 0 10px 5px rgba(143, 143, 143, 0.1)}.bi-btn-primary.svelte-1uisckt:hover,.bi-btn-primary.svelte-1uisckt:focus,.bi-btn-secondary.svelte-1uisckt:hover,.bi-btn-secondary.svelte-1uisckt:focus,.bi-btn-success.svelte-1uisckt:hover,.bi-btn-success.svelte-1uisckt:focus,.bi-btn-danger.svelte-1uisckt:hover,.bi-btn-danger.svelte-1uisckt:focus,.bi-btn-warning.svelte-1uisckt:hover,.bi-btn-warning.svelte-1uisckt:focus,.bi-btn-info.svelte-1uisckt:hover,.bi-btn-info.svelte-1uisckt:focus{box-shadow:inset 0 0 10px 5px rgba(80, 80, 80, 0.1)}.bi-btn.svelte-1uisckt:disabled,.bi-btn-primary.svelte-1uisckt:disabled,.bi-btn-secondary.svelte-1uisckt:disabled,.bi-btn-success.svelte-1uisckt:disabled,.bi-btn-danger.svelte-1uisckt:disabled,.bi-btn-warning.svelte-1uisckt:disabled,.bi-btn-info.svelte-1uisckt:disabled,.bi-btn-disabled.svelte-1uisckt{box-shadow:none;cursor:not-allowed;opacity:0.6}.bi-btn.svelte-1uisckt{color:rgba(0, 0, 0, 0.38);background-color:#f1f1f1}.bi-btn-primary.svelte-1uisckt{color:#f7f7f7;background-color:#0275d8}.bi-btn-secondary.svelte-1uisckt{color:#f7f7f7;background-color:#5bc0de}.bi-btn-success.svelte-1uisckt{color:#f7f7f7;background-color:#5cb85c}.bi-btn-danger.svelte-1uisckt{color:#f7f7f7;background-color:#d9534f}.bi-btn-warning.svelte-1uisckt{color:#f7f7f7;background-color:#f0ad4e}.bi-btn-info.svelte-1uisckt{color:#f7f7f7;background-color:#5bc0de}.bi-btn-small.svelte-1uisckt{padding:3px 6px;font-size:12px}.bi-btn-large.svelte-1uisckt{padding:12px 24px;font-size:16px}.bi-btn-full.svelte-1uisckt{display:block}.bi-btn-round.svelte-1uisckt{border-radius:4px}.bi-btn-circle.svelte-1uisckt{width:60px;height:60px;padding:0;border-radius:50%}");
    }

    // (101:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);
    	const default_slot_or_fallback = default_slot || fallback_block();

    	return {
    		c() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		m(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 32768)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[15],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d(detaching) {
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};
    }

    // (99:2) {#if text}
    function create_if_block(ctx) {
    	let t;

    	return {
    		c() {
    			t = text(/*text*/ ctx[0]);
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*text*/ 1) set_data(t, /*text*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (102:10)        
    function fallback_block(ctx) {
    	let em;

    	return {
    		c() {
    			em = element("em");
    			em.textContent = "Button is empty";
    		},
    		m(target, anchor) {
    			insert(target, em, anchor);
    		},
    		p: noop,
    		d(detaching) {
    			if (detaching) detach(em);
    		}
    	};
    }

    function create_fragment(ctx) {
    	let button;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*text*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let button_levels = [/*$$props*/ ctx[14]];
    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	return {
    		c() {
    			button = element("button");
    			if_block.c();
    			set_attributes(button, button_data);
    			toggle_class(button, "bi-btn", /*isDefault*/ ctx[13]);
    			toggle_class(button, "bi-btn-primary", /*primary*/ ctx[1] !== null);
    			toggle_class(button, "bi-btn-secondary", /*secondary*/ ctx[2] !== null);
    			toggle_class(button, "bi-btn-danger", /*danger*/ ctx[3] !== null);
    			toggle_class(button, "bi-btn-success", /*success*/ ctx[4] !== null);
    			toggle_class(button, "bi-btn-warning", /*warning*/ ctx[5] !== null);
    			toggle_class(button, "bi-btn-info", /*info*/ ctx[6] !== null);
    			toggle_class(button, "bi-btn-small", /*small*/ ctx[7]);
    			toggle_class(button, "bi-btn-large", /*large*/ ctx[8]);
    			toggle_class(button, "bi-btn-full", /*full*/ ctx[9]);
    			toggle_class(button, "bi-btn-round", /*rounded*/ ctx[10]);
    			toggle_class(button, "bi-btn-circle", /*circle*/ ctx[11]);
    			toggle_class(button, "bi-btn-disabled", /*disabled*/ ctx[12]);
    			toggle_class(button, "svelte-1uisckt", true);
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			if_blocks[current_block_type_index].m(button, null);
    			if (button.autofocus) button.focus();
    			current = true;

    			if (!mounted) {
    				dispose = listen(button, "click", /*click_handler*/ ctx[17]);
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
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
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(button, null);
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [dirty & /*$$props*/ 16384 && /*$$props*/ ctx[14]]));
    			toggle_class(button, "bi-btn", /*isDefault*/ ctx[13]);
    			toggle_class(button, "bi-btn-primary", /*primary*/ ctx[1] !== null);
    			toggle_class(button, "bi-btn-secondary", /*secondary*/ ctx[2] !== null);
    			toggle_class(button, "bi-btn-danger", /*danger*/ ctx[3] !== null);
    			toggle_class(button, "bi-btn-success", /*success*/ ctx[4] !== null);
    			toggle_class(button, "bi-btn-warning", /*warning*/ ctx[5] !== null);
    			toggle_class(button, "bi-btn-info", /*info*/ ctx[6] !== null);
    			toggle_class(button, "bi-btn-small", /*small*/ ctx[7]);
    			toggle_class(button, "bi-btn-large", /*large*/ ctx[8]);
    			toggle_class(button, "bi-btn-full", /*full*/ ctx[9]);
    			toggle_class(button, "bi-btn-round", /*rounded*/ ctx[10]);
    			toggle_class(button, "bi-btn-circle", /*circle*/ ctx[11]);
    			toggle_class(button, "bi-btn-disabled", /*disabled*/ ctx[12]);
    			toggle_class(button, "svelte-1uisckt", true);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { text = undefined } = $$props;
    	let { primary = null } = $$props;
    	let { secondary = null } = $$props;
    	let { danger = null } = $$props;
    	let { success = null } = $$props;
    	let { warning = null } = $$props;
    	let { info = null } = $$props;
    	let { small = false } = $$props;
    	let { large = false } = $$props;
    	let { full = false } = $$props;
    	let { rounded = false } = $$props;
    	let { circle = false } = $$props;
    	let { disabled = false } = $$props;
    	let isDefault = false;

    	if (!primary && !secondary && !danger && !success && !warning && !info) {
    		isDefault = true;
    	}

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(14, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('text' in $$new_props) $$invalidate(0, text = $$new_props.text);
    		if ('primary' in $$new_props) $$invalidate(1, primary = $$new_props.primary);
    		if ('secondary' in $$new_props) $$invalidate(2, secondary = $$new_props.secondary);
    		if ('danger' in $$new_props) $$invalidate(3, danger = $$new_props.danger);
    		if ('success' in $$new_props) $$invalidate(4, success = $$new_props.success);
    		if ('warning' in $$new_props) $$invalidate(5, warning = $$new_props.warning);
    		if ('info' in $$new_props) $$invalidate(6, info = $$new_props.info);
    		if ('small' in $$new_props) $$invalidate(7, small = $$new_props.small);
    		if ('large' in $$new_props) $$invalidate(8, large = $$new_props.large);
    		if ('full' in $$new_props) $$invalidate(9, full = $$new_props.full);
    		if ('rounded' in $$new_props) $$invalidate(10, rounded = $$new_props.rounded);
    		if ('circle' in $$new_props) $$invalidate(11, circle = $$new_props.circle);
    		if ('disabled' in $$new_props) $$invalidate(12, disabled = $$new_props.disabled);
    		if ('$$scope' in $$new_props) $$invalidate(15, $$scope = $$new_props.$$scope);
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		text,
    		primary,
    		secondary,
    		danger,
    		success,
    		warning,
    		info,
    		small,
    		large,
    		full,
    		rounded,
    		circle,
    		disabled,
    		isDefault,
    		$$props,
    		$$scope,
    		slots,
    		click_handler
    	];
    }

    class BiButton extends SvelteComponent {
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
    				primary: 1,
    				secondary: 2,
    				danger: 3,
    				success: 4,
    				warning: 5,
    				info: 6,
    				small: 7,
    				large: 8,
    				full: 9,
    				rounded: 10,
    				circle: 11,
    				disabled: 12
    			},
    			add_css
    		);
    	}
    }

    const BirdieUi = {
      BiButton
    };

    exports.BiButton = BiButton;
    exports.BirdieUi = BirdieUi;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
