function noop() { }
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
function attribute_to_object(attributes) {
    const result = {};
    for (const attribute of attributes) {
        result[attribute.name] = attribute.value;
    }
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
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
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

/* src/components/svelte/birdie-buttons.svelte generated by Svelte v3.59.2 */

function create_fragment(ctx) {
	let button;
	let t0;
	let t1;
	let slot;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			t0 = text(/*text*/ ctx[0]);
			t1 = space();
			slot = element("slot");
			this.c = noop;
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
			append(button, slot);

			if (!mounted) {
				dispose = listen(button, "click", /*onClick*/ ctx[6]);
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*text*/ 1) set_data(t0, /*text*/ ctx[0]);

			if (dirty & /*type*/ 2) {
				toggle_class(button, "bi-btn", /*type*/ ctx[1] === 'default');
			}

			if (dirty & /*type*/ 2) {
				toggle_class(button, "bi-btn-primary", /*type*/ ctx[1] === 'primary');
			}

			if (dirty & /*type*/ 2) {
				toggle_class(button, "bi-btn-secondary", /*type*/ ctx[1] === 'secondary');
			}

			if (dirty & /*type*/ 2) {
				toggle_class(button, "bi-btn-danger", /*type*/ ctx[1] === 'danger');
			}

			if (dirty & /*type*/ 2) {
				toggle_class(button, "bi-btn-success", /*type*/ ctx[1] === 'success');
			}

			if (dirty & /*type*/ 2) {
				toggle_class(button, "bi-btn-warning", /*type*/ ctx[1] === 'warning');
			}

			if (dirty & /*type*/ 2) {
				toggle_class(button, "bi-btn-info", /*type*/ ctx[1] === 'info');
			}

			if (dirty & /*type*/ 2) {
				toggle_class(button, "bi-btn-text", /*type*/ ctx[1] === 'text');
			}

			if (dirty & /*type*/ 2) {
				toggle_class(button, "bi-btn-link", /*type*/ ctx[1] === 'link');
			}

			if (dirty & /*size*/ 4) {
				toggle_class(button, "bi-btn-small", /*size*/ ctx[2] === 'small');
			}

			if (dirty & /*size*/ 4) {
				toggle_class(button, "bi-btn-large", /*size*/ ctx[2] === 'large');
			}

			if (dirty & /*size*/ 4) {
				toggle_class(button, "bi-btn-full", /*size*/ ctx[2] === 'full');
			}

			if (dirty & /*rounded*/ 8) {
				toggle_class(button, "bi-btn-round", /*rounded*/ ctx[3]);
			}

			if (dirty & /*circle*/ 16) {
				toggle_class(button, "bi-btn-circle", /*circle*/ ctx[4]);
			}

			if (dirty & /*disabled*/ 32) {
				toggle_class(button, "bi-btn-disabled", /*disabled*/ ctx[5]);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(button);
			mounted = false;
			dispose();
		}
	};
}

function instance($$self, $$props, $$invalidate) {
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
	};

	return [text, type, size, rounded, circle, disabled, onClick];
}

class Birdie_buttons extends SvelteElement {
	constructor(options) {
		super();
		const style = document.createElement('style');
		style.textContent = `.bi-btn,.bi-btn-primary::-moz-focus-inner,.bi-btn-secondary::-moz-focus-inner,.bi-btn-success::-moz-focus-inner,.bi-btn-danger::-moz-focus-inner,.bi-btn-warning::-moz-focus-inner,.bi-btn-info::-moz-focus-inner{border:none}.bi-btn,.bi-btn-primary,.bi-btn-secondary,.bi-btn-success,.bi-btn-danger,.bi-btn-warning,.bi-btn-info,.bi-btn-text,.bi-btn-link{position:relative;display:inline-block;box-sizing:border-box;min-width:64px;padding:8px 12px;vertical-align:middle;text-align:center;text-overflow:ellipsis;text-transform:uppercase;text-decoration:none;font-size:14px;font-weight:500;line-height:16px;outline:none;border:none;cursor:pointer}.bi-btn-text,.bi-btn-link{padding:2px;background:none}.bi-btn:hover,.bi-btn:focus{box-shadow:inset 0 0 10px 5px rgba(143, 143, 143, 0.1)}.bi-btn-primary:hover,.bi-btn-primary:focus,.bi-btn-secondary:hover,.bi-btn-secondary:focus,.bi-btn-success:hover,.bi-btn-success:focus,.bi-btn-danger:hover,.bi-btn-danger:focus,.bi-btn-warning:hover,.bi-btn-warning:focus,.bi-btn-info:hover,.bi-btn-info:focus{box-shadow:inset 0 0 10px 5px rgba(80, 80, 80, 0.1)}.bi-btn-link:hover,.bi-btn-link:focus{color:#0275d8;transition:color 0.2s}.bi-btn:disabled,.bi-btn-primary:disabled,.bi-btn-secondary:disabled,.bi-btn-success:disabled,.bi-btn-danger:disabled,.bi-btn-warning:disabled,.bi-btn-info:disabled,.bi-btn-disabled{box-shadow:none;cursor:initial;opacity:0.6}.bi-btn{color:rgba(0, 0, 0, 0.38);background-color:#f1f1f1}.bi-btn-primary{color:#f7f7f7;background-color:#0275d8}.bi-btn-secondary{color:#f7f7f7;background-color:#5bc0de}.bi-btn-success{color:#f7f7f7;background-color:#5cb85c}.bi-btn-danger{color:#f7f7f7;background-color:#d9534f}.bi-btn-warning{color:#f7f7f7;background-color:#f0ad4e}.bi-btn-info{color:#f7f7f7;background-color:#5bc0de}.bi-btn-text{color:#545454}.bi-btn-link{color:#0275d8}.bi-btn-small{padding:3px 6px;font-size:12px}.bi-btn-large{padding:12px 24px;font-size:16px}.bi-btn-full{display:block}.bi-btn-round{border-radius:4px}.bi-btn-circle{width:60px;height:60px;padding:0;border-radius:50%}`;
		this.shadowRoot.appendChild(style);

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

customElements.define("bi-button", Birdie_buttons);
