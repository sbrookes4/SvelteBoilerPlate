
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value) {
        node.style.setProperty(key, value);
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
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
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

    /* src\Header.svelte generated by Svelte v3.6.9 */

    const file = "src\\Header.svelte";

    function create_fragment(ctx) {
    	var div3, div2, div0, img0, t0, div1, a0, img1, t1, a1, img2, t2, a2, img3, t3, a3, img4;

    	return {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div1 = element("div");
    			a0 = element("a");
    			img1 = element("img");
    			t1 = space();
    			a1 = element("a");
    			img2 = element("img");
    			t2 = space();
    			a2 = element("a");
    			img3 = element("img");
    			t3 = space();
    			a3 = element("a");
    			img4 = element("img");
    			attr(img0, "class", "banner svelte-m8tpnb");
    			attr(img0, "alt", "");
    			attr(img0, "src", "/ASSETS/HEADER/SVELTE_BANNER.jpg");
    			add_location(img0, file, 28, 12, 458);
    			attr(div0, "class", "col-sm-12 col-md-12 col-lg-6 col-xl-6");
    			add_location(div0, file, 27, 8, 393);
    			attr(img1, "class", "logo svelte-m8tpnb");
    			attr(img1, "alt", "");
    			attr(img1, "src", "/ASSETS/ICONS/YT.png");
    			add_location(img1, file, 33, 46, 654);
    			attr(a0, "href", "https://www.youtube.com");
    			add_location(a0, file, 33, 12, 620);
    			attr(img2, "class", "logo svelte-m8tpnb");
    			attr(img2, "alt", "");
    			attr(img2, "src", "/ASSETS/ICONS/twitter.png");
    			add_location(img2, file, 35, 46, 761);
    			attr(a1, "href", "https://www.twitter.com");
    			add_location(a1, file, 35, 12, 727);
    			attr(img3, "class", "logo svelte-m8tpnb");
    			attr(img3, "alt", "");
    			attr(img3, "src", "/ASSETS/ICONS/linkedin.png");
    			add_location(img3, file, 37, 47, 874);
    			attr(a2, "href", "https://www.linkedin.com");
    			add_location(a2, file, 37, 12, 839);
    			attr(img4, "class", "logo svelte-m8tpnb");
    			attr(img4, "alt", "");
    			attr(img4, "src", "/ASSETS/ICONS/facebook.png");
    			add_location(img4, file, 39, 47, 990);
    			attr(a3, "href", "https://www.facebook.com");
    			add_location(a3, file, 39, 12, 955);
    			attr(div1, "class", "col-sm-12 col-md-12 col-lg-6 col-xl-6");
    			add_location(div1, file, 31, 8, 553);
    			attr(div2, "class", "row mb-5");
    			add_location(div2, file, 25, 4, 359);
    			attr(div3, "class", "container-fluid mt-5 mb-5");
    			add_location(div3, file, 23, 0, 312);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div2);
    			append(div2, div0);
    			append(div0, img0);
    			append(div2, t0);
    			append(div2, div1);
    			append(div1, a0);
    			append(a0, img1);
    			append(div1, t1);
    			append(div1, a1);
    			append(a1, img2);
    			append(div1, t2);
    			append(div1, a2);
    			append(a2, img3);
    			append(div1, t3);
    			append(div1, a3);
    			append(a3, img4);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div3);
    			}
    		}
    	};
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, []);
    	}
    }

    /* src\Navbar.svelte generated by Svelte v3.6.9 */

    const file$1 = "src\\Navbar.svelte";

    function create_fragment$1(ctx) {
    	var div1, nav, button0, span0, t0, div0, ul, li0, a0, span1, span2, t3, li1, a1, span3, t5, li2, a2, span4, t7, li3, a3, span5, t9, form, input, t10, button1;

    	return {
    		c: function create() {
    			div1 = element("div");
    			nav = element("nav");
    			button0 = element("button");
    			span0 = element("span");
    			t0 = space();
    			div0 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			span1 = element("span");
    			span1.textContent = "Home  ";
    			span2 = element("span");
    			span2.textContent = "(current)";
    			t3 = space();
    			li1 = element("li");
    			a1 = element("a");
    			span3 = element("span");
    			span3.textContent = "Set Up";
    			t5 = space();
    			li2 = element("li");
    			a2 = element("a");
    			span4 = element("span");
    			span4.textContent = "Hello World  ";
    			t7 = space();
    			li3 = element("li");
    			a3 = element("a");
    			span5 = element("span");
    			span5.textContent = "How it Works  ";
    			t9 = space();
    			form = element("form");
    			input = element("input");
    			t10 = space();
    			button1 = element("button");
    			button1.textContent = "Search";
    			attr(span0, "class", "navbar-toggler-icon");
    			add_location(span0, file$1, 34, 5, 790);
    			attr(button0, "class", "navbar-toggler");
    			attr(button0, "type", "button");
    			button0.dataset.toggle = "collapse";
    			button0.dataset.target = "#navbarSupportedContent";
    			attr(button0, "aria-controls", "navbarSupportedContent");
    			attr(button0, "aria-expanded", "false");
    			attr(button0, "aria-label", "Toggle navigation");
    			add_location(button0, file$1, 33, 3, 585);
    			set_style(span1, "color", "black");
    			set_style(span1, "font-weight", "700");
    			add_location(span1, file$1, 41, 70, 1067);
    			attr(span2, "class", "sr-only");
    			add_location(span2, file$1, 41, 131, 1128);
    			attr(a0, "class", "nav-link");
    			set_style(a0, "font-size", "3vh");
    			attr(a0, "href", "index.html");
    			add_location(a0, file$1, 41, 9, 1006);
    			attr(li0, "class", "nav-item active");
    			add_location(li0, file$1, 40, 7, 967);
    			attr(span3, "class", "menuItemCustom svelte-wfy16x");
    			set_style(span3, "color", "black");
    			set_style(span3, "font-weight", "700");
    			add_location(span3, file$1, 45, 82, 1300);
    			attr(a1, "class", "nav-link");
    			set_style(a1, "font-size", "3vh");
    			attr(a1, "href", "https://www.google.com");
    			add_location(a1, file$1, 45, 9, 1227);
    			attr(li1, "class", "nav-item");
    			add_location(li1, file$1, 44, 7, 1195);
    			attr(span4, "class", "menuItemCustom svelte-wfy16x");
    			add_location(span4, file$1, 49, 82, 1514);
    			attr(a2, "class", "nav-link");
    			set_style(a2, "font-size", "3vh");
    			attr(a2, "href", "https://www.google.com");
    			add_location(a2, file$1, 49, 9, 1441);
    			attr(li2, "class", "nav-item");
    			add_location(li2, file$1, 48, 7, 1409);
    			attr(span5, "class", "menuItemCustom svelte-wfy16x");
    			add_location(span5, file$1, 53, 82, 1701);
    			attr(a3, "class", "nav-link");
    			set_style(a3, "font-size", "3vh");
    			attr(a3, "href", "https://www.google.com");
    			add_location(a3, file$1, 53, 9, 1628);
    			attr(li3, "class", "nav-item");
    			add_location(li3, file$1, 52, 7, 1596);
    			attr(ul, "class", "navbar-nav mr-auto");
    			add_location(ul, file$1, 38, 5, 925);
    			attr(input, "class", "form-control mr-sm-2 inputBoxCustom svelte-wfy16x");
    			attr(input, "type", "search");
    			attr(input, "placeholder", "Search");
    			attr(input, "aria-label", "Search");
    			add_location(input, file$1, 66, 12, 2053);
    			attr(button1, "class", "btn my-2 my-sm-0 searchButtonCustom svelte-wfy16x");
    			attr(button1, "type", "submit");
    			add_location(button1, file$1, 68, 12, 2175);
    			attr(form, "class", "form-inline my-2 my-lg-0");
    			add_location(form, file$1, 64, 8, 1998);
    			attr(div0, "class", "collapse navbar-collapse");
    			attr(div0, "id", "navbarSupportedContent");
    			add_location(div0, file$1, 37, 3, 852);
    			attr(nav, "class", "navbar navbar-expand-lg navbar-dark");
    			set_style(nav, "background-color", "#ff3e00");
    			add_location(nav, file$1, 31, 1, 442);
    			attr(div1, "class", "borders svelte-wfy16x");
    			add_location(div1, file$1, 29, 0, 416);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, nav);
    			append(nav, button0);
    			append(button0, span0);
    			append(nav, t0);
    			append(nav, div0);
    			append(div0, ul);
    			append(ul, li0);
    			append(li0, a0);
    			append(a0, span1);
    			append(a0, span2);
    			append(ul, t3);
    			append(ul, li1);
    			append(li1, a1);
    			append(a1, span3);
    			append(ul, t5);
    			append(ul, li2);
    			append(li2, a2);
    			append(a2, span4);
    			append(ul, t7);
    			append(ul, li3);
    			append(li3, a3);
    			append(a3, span5);
    			append(div0, t9);
    			append(div0, form);
    			append(form, input);
    			append(form, t10);
    			append(form, button1);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}
    		}
    	};
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$1, safe_not_equal, []);
    	}
    }

    /* src\Body.svelte generated by Svelte v3.6.9 */

    const file$2 = "src\\Body.svelte";

    function create_fragment$2(ctx) {
    	var div0, h1, t1, br0, t2, br1, t3, h2, t5, br2, t6, br3, t7, h3, t8, a, t10, t11, br4, t12, br5, t13, h4, t14, br6, t15, t16, br7, t17, br8, t18, div1, img;

    	return {
    		c: function create() {
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Svelte Starter Boiler Plate";
    			t1 = space();
    			br0 = element("br");
    			t2 = space();
    			br1 = element("br");
    			t3 = space();
    			h2 = element("h2");
    			h2.textContent = "A convenient and intuitive way to start learning about and developing with Svelte!";
    			t5 = space();
    			br2 = element("br");
    			t6 = space();
    			br3 = element("br");
    			t7 = space();
    			h3 = element("h3");
    			t8 = text("Check out the ");
    			a = element("a");
    			a.textContent = "Svelte BoilerPlate Github Resource";
    			t10 = text(" to download file examples.");
    			t11 = space();
    			br4 = element("br");
    			t12 = space();
    			br5 = element("br");
    			t13 = space();
    			h4 = element("h4");
    			t14 = text("Please feel free to check out this website to see if the information provided proves useful in your Svelte learning.");
    			br6 = element("br");
    			t15 = text("\r\nEspecially written for entry and Jr. level developers wanting to grow beyond the basics.");
    			t16 = space();
    			br7 = element("br");
    			t17 = space();
    			br8 = element("br");
    			t18 = space();
    			div1 = element("div");
    			img = element("img");
    			add_location(h1, file$2, 17, 0, 129);
    			add_location(br0, file$2, 18, 0, 167);
    			add_location(br1, file$2, 19, 0, 173);
    			add_location(h2, file$2, 20, 0, 179);
    			add_location(br2, file$2, 21, 0, 272);
    			add_location(br3, file$2, 22, 0, 278);
    			attr(a, "href", "https://github.com/sbrookes4/SvelteBoilerPlate");
    			set_style(a, "text-decoration", "underline");
    			add_location(a, file$2, 23, 18, 302);
    			add_location(h3, file$2, 23, 0, 284);
    			add_location(br4, file$2, 25, 0, 468);
    			add_location(br5, file$2, 26, 0, 474);
    			add_location(br6, file$2, 27, 120, 600);
    			add_location(h4, file$2, 27, 0, 480);
    			add_location(br7, file$2, 30, 0, 703);
    			add_location(br8, file$2, 31, 0, 709);
    			attr(div0, "class", "svelte-inhxfv");
    			add_location(div0, file$2, 15, 0, 120);
    			attr(img, "alt", "");
    			attr(img, "src", "/ASSETS/IMAGES/svelte3.png");
    			attr(img, "class", "svelte-inhxfv");
    			add_location(img, file$2, 37, 4, 740);
    			attr(div1, "class", "svelte-inhxfv");
    			add_location(div1, file$2, 35, 0, 727);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div0, anchor);
    			append(div0, h1);
    			append(div0, t1);
    			append(div0, br0);
    			append(div0, t2);
    			append(div0, br1);
    			append(div0, t3);
    			append(div0, h2);
    			append(div0, t5);
    			append(div0, br2);
    			append(div0, t6);
    			append(div0, br3);
    			append(div0, t7);
    			append(div0, h3);
    			append(h3, t8);
    			append(h3, a);
    			append(h3, t10);
    			append(div0, t11);
    			append(div0, br4);
    			append(div0, t12);
    			append(div0, br5);
    			append(div0, t13);
    			append(div0, h4);
    			append(h4, t14);
    			append(h4, br6);
    			append(h4, t15);
    			append(div0, t16);
    			append(div0, br7);
    			append(div0, t17);
    			append(div0, br8);
    			insert(target, t18, anchor);
    			insert(target, div1, anchor);
    			append(div1, img);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div0);
    				detach(t18);
    				detach(div1);
    			}
    		}
    	};
    }

    class Body extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$2, safe_not_equal, []);
    	}
    }

    /* src\BodyBootstrap.svelte generated by Svelte v3.6.9 */

    const file$3 = "src\\BodyBootstrap.svelte";

    function create_fragment$3(ctx) {
    	var div4, div3, div0, h10, t1, div1, h11, t3, div2, h12;

    	return {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Set Up";
    			t1 = space();
    			div1 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Hello World";
    			t3 = space();
    			div2 = element("div");
    			h12 = element("h1");
    			h12.textContent = "HowIt Works";
    			add_location(h10, file$3, 14, 12, 234);
    			attr(div0, "id", "setUp");
    			attr(div0, "class", "col-sm-12 col-md-12 col-lg-12 col-xl-12 svelte-14u93vd");
    			add_location(div0, file$3, 13, 8, 147);
    			add_location(h11, file$3, 18, 12, 369);
    			attr(div1, "id", "helloWorld");
    			attr(div1, "class", "col-sm-12 col-md-12 col-lg-12 col-xl-12 svelte-14u93vd");
    			add_location(div1, file$3, 17, 8, 277);
    			add_location(h12, file$3, 22, 12, 509);
    			attr(div2, "id", "howItWorks");
    			attr(div2, "class", "col-sm-12 col-md-12 col-lg-12 col-xl-12 svelte-14u93vd");
    			add_location(div2, file$3, 21, 8, 417);
    			attr(div3, "class", "row svelte-14u93vd");
    			add_location(div3, file$3, 11, 4, 118);
    			attr(div4, "class", "container-fluid mt-5 mb-5 ml-5 svelte-14u93vd");
    			add_location(div4, file$3, 9, 0, 66);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div3);
    			append(div3, div0);
    			append(div0, h10);
    			append(div3, t1);
    			append(div3, div1);
    			append(div1, h11);
    			append(div3, t3);
    			append(div3, div2);
    			append(div2, h12);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div4);
    			}
    		}
    	};
    }

    class BodyBootstrap extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$3, safe_not_equal, []);
    	}
    }

    /* src\Footer.svelte generated by Svelte v3.6.9 */

    const file$4 = "src\\Footer.svelte";

    function create_fragment$4(ctx) {
    	var div, h2, t1, br0, t2, br1, t3, br2;

    	return {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			h2.textContent = "Footer";
    			t1 = space();
    			br0 = element("br");
    			t2 = space();
    			br1 = element("br");
    			t3 = space();
    			br2 = element("br");
    			add_location(h2, file$4, 15, 0, 181);
    			add_location(br0, file$4, 17, 0, 200);
    			add_location(br1, file$4, 18, 0, 206);
    			add_location(br2, file$4, 19, 0, 212);
    			attr(div, "class", "svelte-8vmyz9");
    			add_location(div, file$4, 13, 0, 172);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, h2);
    			append(div, t1);
    			append(div, br0);
    			append(div, t2);
    			append(div, br1);
    			append(div, t3);
    			append(div, br2);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}
    		}
    	};
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$4, safe_not_equal, []);
    	}
    }

    /* src\App.svelte generated by Svelte v3.6.9 */

    function create_fragment$5(ctx) {
    	var t0, t1, t2, t3, current;

    	var header = new Header({ $$inline: true });

    	var navbar = new Navbar({ $$inline: true });

    	var body = new Body({ $$inline: true });

    	var bodybootstrap = new BodyBootstrap({ $$inline: true });

    	var footer = new Footer({ $$inline: true });

    	return {
    		c: function create() {
    			header.$$.fragment.c();
    			t0 = space();
    			navbar.$$.fragment.c();
    			t1 = space();
    			body.$$.fragment.c();
    			t2 = space();
    			bodybootstrap.$$.fragment.c();
    			t3 = space();
    			footer.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(navbar, target, anchor);
    			insert(target, t1, anchor);
    			mount_component(body, target, anchor);
    			insert(target, t2, anchor);
    			mount_component(bodybootstrap, target, anchor);
    			insert(target, t3, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);

    			transition_in(navbar.$$.fragment, local);

    			transition_in(body.$$.fragment, local);

    			transition_in(bodybootstrap.$$.fragment, local);

    			transition_in(footer.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(navbar.$$.fragment, local);
    			transition_out(body.$$.fragment, local);
    			transition_out(bodybootstrap.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(header, detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			destroy_component(navbar, detaching);

    			if (detaching) {
    				detach(t1);
    			}

    			destroy_component(body, detaching);

    			if (detaching) {
    				detach(t2);
    			}

    			destroy_component(bodybootstrap, detaching);

    			if (detaching) {
    				detach(t3);
    			}

    			destroy_component(footer, detaching);
    		}
    	};
    }

    class App_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$5, safe_not_equal, []);
    	}
    }

    var app = new App_1({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
