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
function exclude_internal_props(props) {
    const result = {};
    for (const k in props)
        if (k[0] !== '$')
            result[k] = props[k];
    return result;
}
function compute_slots(slots) {
    const result = {};
    for (const key in slots) {
        result[key] = true;
    }
    return result;
}

const globals = (typeof window !== 'undefined'
    ? window
    : typeof globalThis !== 'undefined'
        ? globalThis
        : global);
function append(target, node) {
    target.appendChild(node);
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
function set_style(node, key, value, important) {
    if (value == null) {
        node.style.removeProperty(key);
    }
    else {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}
function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, bubbles, cancelable, detail);
    return e;
}
function attribute_to_object(attributes) {
    const result = {};
    for (const attribute of attributes) {
        result[attribute.name] = attribute.value;
    }
    return result;
}
function get_custom_elements_slots(element) {
    const result = {};
    element.childNodes.forEach((node) => {
        result[node.slot || 'default'] = true;
    });
    return result;
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
 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
 * it can be called from an external module).
 *
 * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
 *
 * https://svelte.dev/docs#run-time-svelte-onmount
 */
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
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
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
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
let SvelteElement;
if (typeof HTMLElement === 'function') {
    SvelteElement = class extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
        }
        connectedCallback() {
            const { on_mount } = this.$$;
            this.$$.on_disconnect = on_mount.map(run).filter(is_function);
            // @ts-ignore todo: improve typings
            for (const key in this.$$.slotted) {
                // @ts-ignore todo: improve typings
                this.appendChild(this.$$.slotted[key]);
            }
        }
        attributeChangedCallback(attr, _oldValue, newValue) {
            this[attr] = newValue;
        }
        disconnectedCallback() {
            run_all(this.$$.on_disconnect);
        }
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            // TODO should this delegate to addEventListener?
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
    };
}

/* src/components/svelte/button/BiButton.svelte generated by Svelte v3.59.2 */

function create_else_block(ctx) {
	let slot;

	return {
		c() {
			slot = element("slot");
			slot.innerHTML = `<em>Button is empty</em>`;
		},
		m(target, anchor) {
			insert(target, slot, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(slot);
		}
	};
}

// (65:2) {#if text}
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
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

function create_fragment(ctx) {
	let button;
	let mounted;
	let dispose;

	function select_block_type(ctx, dirty) {
		if (/*text*/ ctx[0]) return create_if_block;
		return create_else_block;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);
	let button_levels = [/*$$props*/ ctx[7]];
	let button_data = {};

	for (let i = 0; i < button_levels.length; i += 1) {
		button_data = assign(button_data, button_levels[i]);
	}

	return {
		c() {
			button = element("button");
			if_block.c();
			this.c = noop;
			set_attributes(button, button_data);
			toggle_class(button, "bi-btn", /*isDefault*/ ctx[6]);
			toggle_class(button, "bi-btn-primary", /*type*/ ctx[1] === "primary");
			toggle_class(button, "bi-btn-secondary", /*type*/ ctx[1] === "secondary");
			toggle_class(button, "bi-btn-danger", /*type*/ ctx[1] === "danger");
			toggle_class(button, "bi-btn-success", /*type*/ ctx[1] === "success");
			toggle_class(button, "bi-btn-warning", /*type*/ ctx[1] === "warning");
			toggle_class(button, "bi-btn-info", /*type*/ ctx[1] === "info");
			toggle_class(button, "bi-btn-small", /*size*/ ctx[2] === "small");
			toggle_class(button, "bi-btn-large", /*size*/ ctx[2] === "large");
			toggle_class(button, "bi-btn-full", /*size*/ ctx[2] === "full");
			toggle_class(button, "bi-btn-round", /*rounded*/ ctx[3]);
			toggle_class(button, "bi-btn-circle", /*circle*/ ctx[4]);
			toggle_class(button, "bi-btn-disabled", /*disabled*/ ctx[5]);
		},
		m(target, anchor) {
			insert(target, button, anchor);
			if_block.m(button, null);
			if (button.autofocus) button.focus();

			if (!mounted) {
				dispose = listen(button, "click", /*click_handler*/ ctx[8]);
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(button, null);
				}
			}

			set_attributes(button, button_data = get_spread_update(button_levels, [dirty & /*$$props*/ 128 && /*$$props*/ ctx[7]]));
			toggle_class(button, "bi-btn", /*isDefault*/ ctx[6]);
			toggle_class(button, "bi-btn-primary", /*type*/ ctx[1] === "primary");
			toggle_class(button, "bi-btn-secondary", /*type*/ ctx[1] === "secondary");
			toggle_class(button, "bi-btn-danger", /*type*/ ctx[1] === "danger");
			toggle_class(button, "bi-btn-success", /*type*/ ctx[1] === "success");
			toggle_class(button, "bi-btn-warning", /*type*/ ctx[1] === "warning");
			toggle_class(button, "bi-btn-info", /*type*/ ctx[1] === "info");
			toggle_class(button, "bi-btn-small", /*size*/ ctx[2] === "small");
			toggle_class(button, "bi-btn-large", /*size*/ ctx[2] === "large");
			toggle_class(button, "bi-btn-full", /*size*/ ctx[2] === "full");
			toggle_class(button, "bi-btn-round", /*rounded*/ ctx[3]);
			toggle_class(button, "bi-btn-circle", /*circle*/ ctx[4]);
			toggle_class(button, "bi-btn-disabled", /*disabled*/ ctx[5]);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(button);
			if_block.d();
			mounted = false;
			dispose();
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let { text = undefined } = $$props;
	let { type = '' } = $$props;
	let { size = '' } = $$props;
	let { rounded = false } = $$props;
	let { circle = false } = $$props;
	let { disabled = false } = $$props;
	let isDefault = false;

	if (type !== "primary" && type !== "secondary" && type !== "danger" && type !== "success" && type !== "warning" && type !== "info") {
		isDefault = true;
	}

	function click_handler(event) {
		bubble.call(this, $$self, event);
	}

	$$self.$$set = $$new_props => {
		$$invalidate(7, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
		if ('text' in $$new_props) $$invalidate(0, text = $$new_props.text);
		if ('type' in $$new_props) $$invalidate(1, type = $$new_props.type);
		if ('size' in $$new_props) $$invalidate(2, size = $$new_props.size);
		if ('rounded' in $$new_props) $$invalidate(3, rounded = $$new_props.rounded);
		if ('circle' in $$new_props) $$invalidate(4, circle = $$new_props.circle);
		if ('disabled' in $$new_props) $$invalidate(5, disabled = $$new_props.disabled);
	};

	$$props = exclude_internal_props($$props);
	return [text, type, size, rounded, circle, disabled, isDefault, $$props, click_handler];
}

class BiButton extends SvelteElement {
	constructor(options) {
		super();

		init(
			this,
			{
				target: this.shadowRoot,
				props: attribute_to_object(this.attributes),
				customElement: true
			},
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
			null
		);

		if (options) {
			if (options.target) {
				insert(options.target, this, options.anchor);
			}

			if (options.props) {
				this.$set(options.props);
				flush();
			}
		}
	}

	static get observedAttributes() {
		return ["text", "type", "size", "rounded", "circle", "disabled"];
	}

	get text() {
		return this.$$.ctx[0];
	}

	set text(text) {
		this.$$set({ text });
		flush();
	}

	get type() {
		return this.$$.ctx[1];
	}

	set type(type) {
		this.$$set({ type });
		flush();
	}

	get size() {
		return this.$$.ctx[2];
	}

	set size(size) {
		this.$$set({ size });
		flush();
	}

	get rounded() {
		return this.$$.ctx[3];
	}

	set rounded(rounded) {
		this.$$set({ rounded });
		flush();
	}

	get circle() {
		return this.$$.ctx[4];
	}

	set circle(circle) {
		this.$$set({ circle });
		flush();
	}

	get disabled() {
		return this.$$.ctx[5];
	}

	set disabled(disabled) {
		this.$$set({ disabled });
		flush();
	}
}

customElements.define("bi-button", BiButton);

/* src/components/svelte/sidebarPanels/BiSidebarPanels.svelte generated by Svelte v3.59.2 */

const { window: window_1 } = globals;

function create_if_block_3(ctx) {
	let aside;
	let slot;

	return {
		c() {
			aside = element("aside");
			slot = element("slot");
			attr(slot, "name", "left");
			attr(aside, "style", /*leftAsideStyle*/ ctx[5]);
		},
		m(target, anchor) {
			insert(target, aside, anchor);
			append(aside, slot);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*leftAsideStyle*/ 32) {
				attr(aside, "style", /*leftAsideStyle*/ ctx[5]);
			}
		},
		d(detaching) {
			if (detaching) detach(aside);
		}
	};
}

// (151:1) {#if $$slots.right}
function create_if_block_2(ctx) {
	let aside;
	let slot;

	return {
		c() {
			aside = element("aside");
			slot = element("slot");
			attr(slot, "name", "right");
			attr(aside, "style", /*rightAsideStyle*/ ctx[4]);
		},
		m(target, anchor) {
			insert(target, aside, anchor);
			append(aside, slot);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*rightAsideStyle*/ 16) {
				attr(aside, "style", /*rightAsideStyle*/ ctx[4]);
			}
		},
		d(detaching) {
			if (detaching) detach(aside);
		}
	};
}

// (157:1) {#if $$slots.left && mobileMode}
function create_if_block_1(ctx) {
	let section;
	let mounted;
	let dispose;

	return {
		c() {
			section = element("section");
			attr(section, "style", /*leftScreenStyle*/ ctx[3]);
		},
		m(target, anchor) {
			insert(target, section, anchor);

			if (!mounted) {
				dispose = [
					listen(section, "click", /*leftScreenOff*/ ctx[8]),
					listen(section, "keypress", /*leftScreenOff*/ ctx[8])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*leftScreenStyle*/ 8) {
				attr(section, "style", /*leftScreenStyle*/ ctx[3]);
			}
		},
		d(detaching) {
			if (detaching) detach(section);
			mounted = false;
			run_all(dispose);
		}
	};
}

// (161:1) {#if $$slots.right && mobileMode}
function create_if_block$1(ctx) {
	let section;
	let mounted;
	let dispose;

	return {
		c() {
			section = element("section");
			attr(section, "style", /*rightScreenStyle*/ ctx[2]);
		},
		m(target, anchor) {
			insert(target, section, anchor);

			if (!mounted) {
				dispose = [
					listen(section, "click", /*rightScreenOff*/ ctx[9]),
					listen(section, "keypress", /*rightScreenOff*/ ctx[9])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*rightScreenStyle*/ 4) {
				attr(section, "style", /*rightScreenStyle*/ ctx[2]);
			}
		},
		d(detaching) {
			if (detaching) detach(section);
			mounted = false;
			run_all(dispose);
		}
	};
}

function create_fragment$1(ctx) {
	let main;
	let t0;
	let section;
	let slot;
	let t1;
	let t2;
	let t3;
	let mounted;
	let dispose;
	let if_block0 = /*$$slots*/ ctx[10].left && create_if_block_3(ctx);
	let if_block1 = /*$$slots*/ ctx[10].right && create_if_block_2(ctx);
	let if_block2 = /*$$slots*/ ctx[10].left && /*mobileMode*/ ctx[0] && create_if_block_1(ctx);
	let if_block3 = /*$$slots*/ ctx[10].right && /*mobileMode*/ ctx[0] && create_if_block$1(ctx);

	return {
		c() {
			main = element("main");
			if (if_block0) if_block0.c();
			t0 = space();
			section = element("section");
			slot = element("slot");
			t1 = space();
			if (if_block1) if_block1.c();
			t2 = space();
			if (if_block2) if_block2.c();
			t3 = space();
			if (if_block3) if_block3.c();
			this.c = noop;
			attr(slot, "name", "content");
			attr(section, "style", /*contentStyle*/ ctx[1]);
			set_style(main, "position", "absolute");
			set_style(main, "top", "0");
			set_style(main, "bottom", "0");
			set_style(main, "left", "0");
			set_style(main, "right", "0");
			set_style(main, "overflow-x", "hidden");
		},
		m(target, anchor) {
			insert(target, main, anchor);
			if (if_block0) if_block0.m(main, null);
			append(main, t0);
			append(main, section);
			append(section, slot);
			append(main, t1);
			if (if_block1) if_block1.m(main, null);
			append(main, t2);
			if (if_block2) if_block2.m(main, null);
			append(main, t3);
			if (if_block3) if_block3.m(main, null);

			if (!mounted) {
				dispose = [
					listen(window_1, "resize", /*setPanelStates*/ ctx[7](true)),
					listen(section, "transitionend", /*onTransitionEnd*/ ctx[6])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (/*$$slots*/ ctx[10].left) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_3(ctx);
					if_block0.c();
					if_block0.m(main, t0);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (dirty[0] & /*contentStyle*/ 2) {
				attr(section, "style", /*contentStyle*/ ctx[1]);
			}

			if (/*$$slots*/ ctx[10].right) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_2(ctx);
					if_block1.c();
					if_block1.m(main, t2);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (/*$$slots*/ ctx[10].left && /*mobileMode*/ ctx[0]) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_1(ctx);
					if_block2.c();
					if_block2.m(main, t3);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (/*$$slots*/ ctx[10].right && /*mobileMode*/ ctx[0]) {
				if (if_block3) {
					if_block3.p(ctx, dirty);
				} else {
					if_block3 = create_if_block$1(ctx);
					if_block3.c();
					if_block3.m(main, null);
				}
			} else if (if_block3) {
				if_block3.d(1);
				if_block3 = null;
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(main);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			if (if_block3) if_block3.d();
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	let mobileMode;
	let mobilePanelWidth;
	let leftAsideStyle;
	let rightAsideStyle;
	let leftScreenStyle;
	let rightScreenStyle;
	let contentLeft;
	let contentWidth;
	let contentStyle;
	let { $$slots: slots = {}, $$scope } = $$props;
	const $$slots = compute_slots(slots);

	const updatePanels = ({ left, right }) => {
		if (left !== undefined) {
			setLeft(!!left);
		}

		if (right !== undefined) {
			setRight(!!right);
		}
	};

	let { mobileBreakpoint = 500 } = $$props;
	let { screenWidth = '70px' } = $$props;
	let { screenColor = '#444' } = $$props;
	let { leftOpenBreakpoint = 768 } = $$props;
	let { rightOpenBreakpoint = 1200 } = $$props;
	let { width = '250px' } = $$props;
	let { leftWidth } = $$props;
	let { rightWidth } = $$props;
	let { duration = '0.08s' } = $$props;
	const dispatch = createEventDispatcher();
	let windowWidth;
	let leftOpen;
	let leftTransitioning;
	let rightOpen;
	let rightTransitioning;

	const setLeft = (open, transition = true) => {
		$$invalidate(22, leftOpen = open);
		$$invalidate(23, leftTransitioning = transition);
	};

	const setRight = (open, transition = true) => {
		$$invalidate(24, rightOpen = open);
		$$invalidate(25, rightTransitioning = transition);
	};

	const onTransitionEnd = ({ propertyName }) => {
		if (propertyName === 'left' || propertyName === 'width') {
			$$invalidate(23, leftTransitioning = false);
			$$invalidate(25, rightTransitioning = false);
			dispatch('change', { left: leftOpen, right: rightOpen });
		}
	};

	const setPanelStates = transition => () => {
		$$invalidate(21, windowWidth = window.innerWidth);

		if (leftOpenBreakpoint && windowWidth > leftOpenBreakpoint) {
			setLeft(true, transition);
		}

		if (rightOpenBreakpoint && windowWidth > rightOpenBreakpoint) {
			setRight(true, transition);
		}

		if (leftOpenBreakpoint && windowWidth < leftOpenBreakpoint) {
			setLeft(false, transition);
		}

		if (rightOpenBreakpoint && windowWidth < rightOpenBreakpoint) {
			setRight(false, transition);
		}

		dispatch('change', { left: leftOpen, right: rightOpen });
	};

	onMount(setPanelStates(false));

	const leftScreenOff = () => {
		setLeft(false);
	};

	const rightScreenOff = () => {
		setRight(false);
	};

	const commonStyles = `
		position: absolute;
		top: 0;
		bottom: 0;
		overflow-y: auto;
	`;

	const generateAsideStyle = (side, width, z) => `
		${commonStyles}
		${side}: 0;
		width: ${width};
		z-index: ${z};
	`;

	const generateContentStyle = (side, open, transitioning, color) => `
		${commonStyles}
		${side}: calc(100% - ${screenWidth});
		width: ${screenWidth};
		z-index: ${open && !transitioning ? '5' : '-1'};
		opacity: ${open && !transitioning && '0.5' || '0'};
		background-color: ${color};
	`;

	$$self.$$set = $$props => {
		if ('mobileBreakpoint' in $$props) $$invalidate(12, mobileBreakpoint = $$props.mobileBreakpoint);
		if ('screenWidth' in $$props) $$invalidate(13, screenWidth = $$props.screenWidth);
		if ('screenColor' in $$props) $$invalidate(14, screenColor = $$props.screenColor);
		if ('leftOpenBreakpoint' in $$props) $$invalidate(15, leftOpenBreakpoint = $$props.leftOpenBreakpoint);
		if ('rightOpenBreakpoint' in $$props) $$invalidate(16, rightOpenBreakpoint = $$props.rightOpenBreakpoint);
		if ('width' in $$props) $$invalidate(17, width = $$props.width);
		if ('leftWidth' in $$props) $$invalidate(18, leftWidth = $$props.leftWidth);
		if ('rightWidth' in $$props) $$invalidate(19, rightWidth = $$props.rightWidth);
		if ('duration' in $$props) $$invalidate(20, duration = $$props.duration);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*windowWidth, mobileBreakpoint*/ 2101248) {
			 $$invalidate(0, mobileMode = windowWidth < mobileBreakpoint);
		}

		if ($$self.$$.dirty[0] & /*screenWidth*/ 8192) {
			 $$invalidate(28, mobilePanelWidth = `calc(100% - ${screenWidth})`);
		}

		if ($$self.$$.dirty[0] & /*mobileMode, mobilePanelWidth, leftWidth, width, leftOpen*/ 273022977) {
			 $$invalidate(5, leftAsideStyle = generateAsideStyle('left', mobileMode ? mobilePanelWidth : leftWidth || width, mobileMode && leftOpen ? '3' : '2'));
		}

		if ($$self.$$.dirty[0] & /*mobileMode, mobilePanelWidth, rightWidth, width, rightOpen*/ 285868033) {
			 $$invalidate(4, rightAsideStyle = generateAsideStyle('right', mobileMode ? mobilePanelWidth : rightWidth || width, mobileMode && rightOpen ? '2' : '1'));
		}

		if ($$self.$$.dirty[0] & /*mobileMode, leftOpen, leftTransitioning, screenColor*/ 12599297) {
			 $$invalidate(3, leftScreenStyle = mobileMode && generateContentStyle('left', leftOpen, leftTransitioning, screenColor));
		}

		if ($$self.$$.dirty[0] & /*mobileMode, rightOpen, rightTransitioning, screenColor*/ 50348033) {
			 $$invalidate(2, rightScreenStyle = mobileMode && generateContentStyle('right', rightOpen, rightTransitioning, screenColor));
		}

		if ($$self.$$.dirty[0] & /*mobileMode, leftOpen, screenWidth, rightOpen, leftWidth, width*/ 21372929) {
			 $$invalidate(27, contentLeft = mobileMode
			? leftOpen && `calc(100% - ${screenWidth})` || rightOpen && `calc(${screenWidth} - 100%)` || '0px'
			: leftOpen ? leftWidth || width : '0px');
		}

		if ($$self.$$.dirty[0] & /*mobileMode, leftOpen, leftWidth, width, rightOpen, rightWidth*/ 21889025) {
			 $$invalidate(26, contentWidth = mobileMode
			? '100%'
			: `calc(100% - ${leftOpen ? leftWidth || width : '0px'} - ${rightOpen ? rightWidth || width : '0px'})`);
		}

		if ($$self.$$.dirty[0] & /*contentLeft, contentWidth, duration*/ 202375168) {
			 $$invalidate(1, contentStyle = `
		${commonStyles}
		left: ${contentLeft};
		width: ${contentWidth};
		transition: width ${duration} ease-in-out, left ${duration} ease-in-out;
		z-index: 5;
	`);
		}
	};

	return [
		mobileMode,
		contentStyle,
		rightScreenStyle,
		leftScreenStyle,
		rightAsideStyle,
		leftAsideStyle,
		onTransitionEnd,
		setPanelStates,
		leftScreenOff,
		rightScreenOff,
		$$slots,
		updatePanels,
		mobileBreakpoint,
		screenWidth,
		screenColor,
		leftOpenBreakpoint,
		rightOpenBreakpoint,
		width,
		leftWidth,
		rightWidth,
		duration,
		windowWidth,
		leftOpen,
		leftTransitioning,
		rightOpen,
		rightTransitioning,
		contentWidth,
		contentLeft,
		mobilePanelWidth
	];
}

class BiSidebarPanels extends SvelteElement {
	constructor(options) {
		super();

		init(
			this,
			{
				target: this.shadowRoot,
				props: {
					...attribute_to_object(this.attributes),
					$$slots: get_custom_elements_slots(this)
				},
				customElement: true
			},
			instance$1,
			create_fragment$1,
			safe_not_equal,
			{
				updatePanels: 11,
				mobileBreakpoint: 12,
				screenWidth: 13,
				screenColor: 14,
				leftOpenBreakpoint: 15,
				rightOpenBreakpoint: 16,
				width: 17,
				leftWidth: 18,
				rightWidth: 19,
				duration: 20
			},
			null,
			[-1, -1]
		);

		if (options) {
			if (options.target) {
				insert(options.target, this, options.anchor);
			}

			if (options.props) {
				this.$set(options.props);
				flush();
			}
		}
	}

	static get observedAttributes() {
		return [
			"updatePanels",
			"mobileBreakpoint",
			"screenWidth",
			"screenColor",
			"leftOpenBreakpoint",
			"rightOpenBreakpoint",
			"width",
			"leftWidth",
			"rightWidth",
			"duration"
		];
	}

	get updatePanels() {
		return this.$$.ctx[11];
	}

	get mobileBreakpoint() {
		return this.$$.ctx[12];
	}

	set mobileBreakpoint(mobileBreakpoint) {
		this.$$set({ mobileBreakpoint });
		flush();
	}

	get screenWidth() {
		return this.$$.ctx[13];
	}

	set screenWidth(screenWidth) {
		this.$$set({ screenWidth });
		flush();
	}

	get screenColor() {
		return this.$$.ctx[14];
	}

	set screenColor(screenColor) {
		this.$$set({ screenColor });
		flush();
	}

	get leftOpenBreakpoint() {
		return this.$$.ctx[15];
	}

	set leftOpenBreakpoint(leftOpenBreakpoint) {
		this.$$set({ leftOpenBreakpoint });
		flush();
	}

	get rightOpenBreakpoint() {
		return this.$$.ctx[16];
	}

	set rightOpenBreakpoint(rightOpenBreakpoint) {
		this.$$set({ rightOpenBreakpoint });
		flush();
	}

	get width() {
		return this.$$.ctx[17];
	}

	set width(width) {
		this.$$set({ width });
		flush();
	}

	get leftWidth() {
		return this.$$.ctx[18];
	}

	set leftWidth(leftWidth) {
		this.$$set({ leftWidth });
		flush();
	}

	get rightWidth() {
		return this.$$.ctx[19];
	}

	set rightWidth(rightWidth) {
		this.$$set({ rightWidth });
		flush();
	}

	get duration() {
		return this.$$.ctx[20];
	}

	set duration(duration) {
		this.$$set({ duration });
		flush();
	}
}

customElements.define("bi-sidebar-panels", BiSidebarPanels);

/* src/components/svelte/accordion/BiAccordion.svelte generated by Svelte v3.59.2 */

function create_fragment$2(ctx) {
	let div1;

	return {
		c() {
			div1 = element("div");
			div1.innerHTML = `<div class="bi-accordion-tabs"><slot></slot></div>`;
			this.c = noop;
			attr(div1, "class", "bi-accordion");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
		},
		p: noop,
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div1);
		}
	};
}

function instance$2($$self, $$props, $$invalidate) {
	let { accordionType = 'single' } = $$props;
	let { colapse = false } = $$props;
	const dispatch = createEventDispatcher();

	$$self.$$set = $$props => {
		if ('accordionType' in $$props) $$invalidate(0, accordionType = $$props.accordionType);
		if ('colapse' in $$props) $$invalidate(1, colapse = $$props.colapse);
	};

	return [accordionType, colapse];
}

class BiAccordion extends SvelteElement {
	constructor(options) {
		super();

		init(
			this,
			{
				target: this.shadowRoot,
				props: attribute_to_object(this.attributes),
				customElement: true
			},
			instance$2,
			create_fragment$2,
			safe_not_equal,
			{ accordionType: 0, colapse: 1 },
			null
		);

		if (options) {
			if (options.target) {
				insert(options.target, this, options.anchor);
			}

			if (options.props) {
				this.$set(options.props);
				flush();
			}
		}
	}

	static get observedAttributes() {
		return ["accordionType", "colapse"];
	}

	get accordionType() {
		return this.$$.ctx[0];
	}

	set accordionType(accordionType) {
		this.$$set({ accordionType });
		flush();
	}

	get colapse() {
		return this.$$.ctx[1];
	}

	set colapse(colapse) {
		this.$$set({ colapse });
		flush();
	}
}

/* src/components/svelte/accordion/BiAccordionItem.svelte generated by Svelte v3.59.2 */

function create_fragment$3(ctx) {
	let div1;

	return {
		c() {
			div1 = element("div");

			div1.innerHTML = `<input type="radio" id="rd1" name="rd"/> 
  <label class="bi-accordion-tab-label" for="rd1"><slot name="title"></slot></label> 
  <div class="bi-accordion-tab-content"><slot name="content"></slot></div>`;

			this.c = noop;
			attr(div1, "class", "bi-accordion-tab");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
		},
		p: noop,
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div1);
		}
	};
}

function instance$3($$self, $$props, $$invalidate) {
	let { open = false } = $$props;

	$$self.$$set = $$props => {
		if ('open' in $$props) $$invalidate(0, open = $$props.open);
	};

	return [open];
}

class BiAccordionItem extends SvelteElement {
	constructor(options) {
		super();

		init(
			this,
			{
				target: this.shadowRoot,
				props: attribute_to_object(this.attributes),
				customElement: true
			},
			instance$3,
			create_fragment$3,
			safe_not_equal,
			{ open: 0 },
			null
		);

		if (options) {
			if (options.target) {
				insert(options.target, this, options.anchor);
			}

			if (options.props) {
				this.$set(options.props);
				flush();
			}
		}
	}

	static get observedAttributes() {
		return ["open"];
	}

	get open() {
		return this.$$.ctx[0];
	}

	set open(open) {
		this.$$set({ open });
		flush();
	}
}

const BirdieUi = {
  BiButton,
  BiSidebarPanels,
  BiAccordion,
  BiAccordionItem
};

export { BiAccordion, BiAccordionItem, BiButton, BiSidebarPanels, BirdieUi };
