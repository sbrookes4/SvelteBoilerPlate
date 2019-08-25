
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
    	var div1, nav, button0, span0, t0, div0, ul, li0, a0, span1, span2, t3, li1, a1, span3, t5, li2, a2, span4, t7, li3, a3, span5, t9, li4, a4, span6, t11, form, input, t12, button1;

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
    			li4 = element("li");
    			a4 = element("a");
    			span6 = element("span");
    			span6.textContent = "Components  ";
    			t11 = space();
    			form = element("form");
    			input = element("input");
    			t12 = space();
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
    			add_location(span3, file$1, 45, 66, 1284);
    			attr(a1, "class", "nav-link");
    			set_style(a1, "font-size", "3vh");
    			attr(a1, "href", "#setUp");
    			add_location(a1, file$1, 45, 9, 1227);
    			attr(li1, "class", "nav-item");
    			add_location(li1, file$1, 44, 7, 1195);
    			attr(span4, "class", "menuItemCustom svelte-wfy16x");
    			add_location(span4, file$1, 49, 71, 1487);
    			attr(a2, "class", "nav-link");
    			set_style(a2, "font-size", "3vh");
    			attr(a2, "href", "#helloWorld");
    			add_location(a2, file$1, 49, 9, 1425);
    			attr(li2, "class", "nav-item");
    			add_location(li2, file$1, 48, 7, 1393);
    			attr(span5, "class", "menuItemCustom svelte-wfy16x");
    			add_location(span5, file$1, 53, 71, 1663);
    			attr(a3, "class", "nav-link");
    			set_style(a3, "font-size", "3vh");
    			attr(a3, "href", "#howItWorks");
    			add_location(a3, file$1, 53, 9, 1601);
    			attr(li3, "class", "nav-item");
    			add_location(li3, file$1, 52, 7, 1569);
    			attr(span6, "class", "menuItemCustom svelte-wfy16x");
    			add_location(span6, file$1, 57, 71, 1840);
    			attr(a4, "class", "nav-link");
    			set_style(a4, "font-size", "3vh");
    			attr(a4, "href", "#components");
    			add_location(a4, file$1, 57, 9, 1778);
    			attr(li4, "class", "nav-item");
    			add_location(li4, file$1, 56, 7, 1746);
    			attr(ul, "class", "navbar-nav mr-auto");
    			add_location(ul, file$1, 38, 5, 925);
    			attr(input, "class", "form-control mr-sm-2 inputBoxCustom svelte-wfy16x");
    			attr(input, "type", "search");
    			attr(input, "placeholder", "Search");
    			attr(input, "aria-label", "Search");
    			add_location(input, file$1, 65, 12, 1997);
    			attr(button1, "class", "btn my-2 my-sm-0 searchButtonCustom svelte-wfy16x");
    			attr(button1, "type", "submit");
    			add_location(button1, file$1, 67, 12, 2119);
    			attr(form, "class", "form-inline my-2 my-lg-0");
    			add_location(form, file$1, 63, 8, 1942);
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
    			append(ul, t9);
    			append(ul, li4);
    			append(li4, a4);
    			append(a4, span6);
    			append(div0, t11);
    			append(div0, form);
    			append(form, input);
    			append(form, t12);
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
    			h1.textContent = "Svelte Starter Guide & Boiler Plate";
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
    			add_location(br0, file$2, 18, 0, 175);
    			add_location(br1, file$2, 19, 0, 181);
    			add_location(h2, file$2, 20, 0, 187);
    			add_location(br2, file$2, 21, 0, 280);
    			add_location(br3, file$2, 22, 0, 286);
    			attr(a, "href", "https://github.com/sbrookes4/SvelteBoilerPlate");
    			set_style(a, "text-decoration", "underline");
    			add_location(a, file$2, 23, 18, 310);
    			add_location(h3, file$2, 23, 0, 292);
    			add_location(br4, file$2, 25, 0, 476);
    			add_location(br5, file$2, 26, 0, 482);
    			add_location(br6, file$2, 27, 120, 608);
    			add_location(h4, file$2, 27, 0, 488);
    			add_location(br7, file$2, 30, 0, 711);
    			add_location(br8, file$2, 31, 0, 717);
    			attr(div0, "class", "svelte-inhxfv");
    			add_location(div0, file$2, 15, 0, 120);
    			attr(img, "alt", "");
    			attr(img, "src", "/ASSETS/IMAGES/svelte3.png");
    			attr(img, "class", "svelte-inhxfv");
    			add_location(img, file$2, 37, 4, 748);
    			attr(div1, "class", "svelte-inhxfv");
    			add_location(div1, file$2, 35, 0, 735);
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
    	var div6, div5, div0, h10, t1, br0, t2, p0, t3, br1, t4, br2, t5, a0, t7, br3, t8, br4, t9, img0, br5, t10, img1, br6, t11, img2, br7, t12, br8, t13, br9, t14, a1, t16, br10, t17, br11, t18, h11, t20, div1, h12, t22, br12, t23, p1, t24, br13, t25, br14, t26, br15, t27, br16, t28, br17, t29, b0, u0, br18, t31, a2, t33, br19, t34, br20, t35, img3, t36, br21, t37, br22, t38, br23, t39, br24, t40, br25, t41, br26, t42, b1, u1, br27, t44, a3, t46, br28, t47, br29, t48, img4, t49, br30, t50, br31, t51, br32, t52, br33, t53, br34, t54, br35, t55, img5, t56, br36, t57, br37, t58, br38, t59, br39, t60, img6, t61, br40, t62, br41, t63, b2, u2, br42, t65, a4, t67, br43, t68, br44, t69, img7, t70, br45, t71, br46, t72, br47, t73, br48, t74, br49, t75, br50, t76, img8, t77, br51, t78, br52, t79, br53, t80, br54, t81, img9, t82, br55, t83, br56, t84, t85, div2, h13, t87, br57, t88, p2, b3, u3, br58, t90, br59, t91, br60, t92, img10, t93, br61, t94, br62, t95, br63, t96, br64, t97, img11, t98, br65, t99, br66, t100, br67, t101, br68, t102, img12, t103, br69, t104, br70, t105, br71, t106, br72, t107, img13, t108, br73, t109, br74, t110, br75, t111, br76, t112, img14, t113, br77, t114, br78, t115, br79, t116, br80, t117, img15, t118, br81, t119, br82, t120, br83, t121, br84, t122, img16, t123, br85, t124, br86, t125, br87, t126, br88, t127, img17, t128, br89, t129, br90, t130, br91, t131, br92, t132, img18, t133, br93, t134, br94, t135, div3, h14, t137, p3, b4, u4, br95, t139, br96, t140, br97, t141, br98, t142, br99, t143, br100, t144, br101, t145, br102, t146, br103, t147, br104, t148, br105, t149, br106, t150, br107, t151, br108, t152, br109, t153, img19, t154, br110, t155, br111, t156, br112, t157, br113, t158, img20, t159, br114, t160, br115, t161, br116, t162, br117, t163, br118, t164, br119, t165, br120, t166, br121, t167, br122, t168, img21, t169, br123, t170, br124, t171, br125, t172, br126, t173, br127, t174, br128, t175, br129, t176, br130, t177, br131, t178, br132, t179, br133, t180, img22, t181, br134, t182, br135, t183, br136, t184, br137, t185, t186, t187, br138, t188, br139, t189, img23, t190, br140, t191, br141, t192, br142, t193, br143, t194, img24, t195, br144, t196, br145, t197, br146, t198, br147, t199, img25, t200, br148, t201, br149, t202, div4, h15, t204, br150, t205, p4, b5, u5, br151, t207, br152, t208, br153, t209, br154, t210, br155, t211, br156, t212, br157, t213, br158, t214, br159, t215, img26, t216, br160, t217, br161, t218, img27, t219, br162, t220, br163, t221, img28, t222, br164, t223, br165, t224, br166, t225, br167, t226, img29, t227, br168, t228, br169, t229, br170, t230, br171, t231, img30, t232, br172, t233, br173, t234, br174, t235, br175, t236, img31, t237, br176, t238, br177, t239, br178, t240, br179, t241, br180, t242, br181, t243, img32, t244, img33, t245, img34, t246, img35, t247, br182, t248, br183, t249, br184, t250, br185, t251, br186, t252, br187, t253, b6, u6, br188, t255, br189, t256, br190, t257, br191, t258, br192;

    	return {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Support";
    			t1 = space();
    			br0 = element("br");
    			t2 = space();
    			p0 = element("p");
    			t3 = text("This Svelte tutorial and bolierplate is free but your support would be greatly appreciated!\r\n            ");
    			br1 = element("br");
    			t4 = space();
    			br2 = element("br");
    			t5 = text("\r\n            We have these really cool Svelte drink coasters on ");
    			a0 = element("a");
    			a0.textContent = "Esty";
    			t7 = text(" as well as other cool programming drink coasters. Please stop by the Etsy store and purchase a couple of coasters! Your support really helps!\r\n            ");
    			br3 = element("br");
    			t8 = space();
    			br4 = element("br");
    			t9 = space();
    			img0 = element("img");
    			br5 = element("br");
    			t10 = space();
    			img1 = element("img");
    			br6 = element("br");
    			t11 = space();
    			img2 = element("img");
    			br7 = element("br");
    			t12 = space();
    			br8 = element("br");
    			t13 = space();
    			br9 = element("br");
    			t14 = text("\r\n            Purchase ");
    			a1 = element("a");
    			a1.textContent = "here on Esty.";
    			t16 = space();
    			br10 = element("br");
    			t17 = space();
    			br11 = element("br");
    			t18 = space();
    			h11 = element("h1");
    			h11.textContent = "Now for the tutorial...";
    			t20 = space();
    			div1 = element("div");
    			h12 = element("h1");
    			h12.textContent = "Set Up";
    			t22 = space();
    			br12 = element("br");
    			t23 = space();
    			p1 = element("p");
    			t24 = text("To get started you will need the following things installed:");
    			br13 = element("br");
    			t25 = text("\r\n            - An IDE (Integrated Development Environment) - I will be using Visual Studio Code");
    			br14 = element("br");
    			t26 = text("\r\n            - Node JS");
    			br15 = element("br");
    			t27 = text("\r\n            - The Svelte Starter Zip File\r\n            ");
    			br16 = element("br");
    			t28 = space();
    			br17 = element("br");
    			t29 = space();
    			b0 = element("b");
    			u0 = element("u");
    			u0.textContent = "Setting up Node JS";
    			br18 = element("br");
    			t31 = text("\r\n            1. Go to ");
    			a2 = element("a");
    			a2.textContent = "https://nodejs.org/en/";
    			t33 = text(" and download the latest version of Node JS.\r\n            ");
    			br19 = element("br");
    			t34 = space();
    			br20 = element("br");
    			t35 = space();
    			img3 = element("img");
    			t36 = space();
    			br21 = element("br");
    			t37 = space();
    			br22 = element("br");
    			t38 = text("\r\n            2. Follow the default prompts and install Node JS.\r\n            ");
    			br23 = element("br");
    			t39 = space();
    			br24 = element("br");
    			t40 = text("\r\n            3. Run Node JS by clicking the Node JS icon. \r\n            ");
    			br25 = element("br");
    			t41 = space();
    			br26 = element("br");
    			t42 = space();
    			b1 = element("b");
    			u1 = element("u");
    			u1.textContent = "Setting up Visual Studio Code";
    			br27 = element("br");
    			t44 = text("\r\n            1. Go to ");
    			a3 = element("a");
    			a3.textContent = "https://code.visualstudio.com/";
    			t46 = text(" and download the latest version of Visula Studio Code.\r\n            ");
    			br28 = element("br");
    			t47 = space();
    			br29 = element("br");
    			t48 = space();
    			img4 = element("img");
    			t49 = space();
    			br30 = element("br");
    			t50 = space();
    			br31 = element("br");
    			t51 = text("\r\n            2. Follow the default prompts and install Visual Studio Code.\r\n            ");
    			br32 = element("br");
    			t52 = space();
    			br33 = element("br");
    			t53 = text("\r\n            3. Open Visual Studio Code and install the Svelte extension. It isn’t mandatory but this will help with auto-completion and colorization for better ease of use. To open the extension menu, click on the \"boxes\" menu. \r\n            ");
    			br34 = element("br");
    			t54 = space();
    			br35 = element("br");
    			t55 = space();
    			img5 = element("img");
    			t56 = space();
    			br36 = element("br");
    			t57 = space();
    			br37 = element("br");
    			t58 = text("\r\n            Then type in 'Svelte' in the search bar. You should see 'Svelte x.x.x - Svelte language support for VS Code'; click on that and install the extension.\r\n            ");
    			br38 = element("br");
    			t59 = space();
    			br39 = element("br");
    			t60 = space();
    			img6 = element("img");
    			t61 = space();
    			br40 = element("br");
    			t62 = space();
    			br41 = element("br");
    			t63 = space();
    			b2 = element("b");
    			u2 = element("u");
    			u2.textContent = "Download the Svlete Starter Zip File ";
    			br42 = element("br");
    			t65 = text("\r\n            1. Go to ");
    			a4 = element("a");
    			a4.textContent = "https://svelte.dev/repl/";
    			t67 = text(" and download the latest version of the Svlete Starter Zip File. In the upper right-hand corner, you will see a download icon for the starter zip file. It’s HARD to find but I’ve marked it in red.\r\n            ");
    			br43 = element("br");
    			t68 = space();
    			br44 = element("br");
    			t69 = space();
    			img7 = element("img");
    			t70 = space();
    			br45 = element("br");
    			t71 = space();
    			br46 = element("br");
    			t72 = text("\r\n            2. Extract it to a folder of your choosing.\r\n            ");
    			br47 = element("br");
    			t73 = space();
    			br48 = element("br");
    			t74 = text("\r\n            3. For Windows users, delete the _MACOSX file as this is for Apple users.\r\n            ");
    			br49 = element("br");
    			t75 = space();
    			br50 = element("br");
    			t76 = space();
    			img8 = element("img");
    			t77 = space();
    			br51 = element("br");
    			t78 = space();
    			br52 = element("br");
    			t79 = text("            \r\n            4. Take all the contents from the ‘project-setup’ folder and put them into your project folder. Your project folder should look something like this:\r\n            ");
    			br53 = element("br");
    			t80 = space();
    			br54 = element("br");
    			t81 = space();
    			img9 = element("img");
    			t82 = space();
    			br55 = element("br");
    			t83 = space();
    			br56 = element("br");
    			t84 = text("            \r\n            5. So now you have everything set up to do the initial \"Hello World!\"");
    			t85 = space();
    			div2 = element("div");
    			h13 = element("h1");
    			h13.textContent = "Hello World";
    			t87 = space();
    			br57 = element("br");
    			t88 = space();
    			p2 = element("p");
    			b3 = element("b");
    			u3 = element("u");
    			u3.textContent = "Your First Hello World";
    			br58 = element("br");
    			t90 = text("\r\n            1. Open the Visual Studio Code and open the project folder.\r\n            ");
    			br59 = element("br");
    			t91 = space();
    			br60 = element("br");
    			t92 = space();
    			img10 = element("img");
    			t93 = space();
    			br61 = element("br");
    			t94 = space();
    			br62 = element("br");
    			t95 = text("  \r\n            2. Expand out the folder navigator to see the folder & file structure.\r\n            ");
    			br63 = element("br");
    			t96 = space();
    			br64 = element("br");
    			t97 = space();
    			img11 = element("img");
    			t98 = space();
    			br65 = element("br");
    			t99 = space();
    			br66 = element("br");
    			t100 = text("  \r\n            3. Open the terminal pane, If you are new to visual studio, to open the terminal click on ‘View’ on the menu and then ‘Terminal’ \r\n            ");
    			br67 = element("br");
    			t101 = space();
    			br68 = element("br");
    			t102 = space();
    			img12 = element("img");
    			t103 = space();
    			br69 = element("br");
    			t104 = space();
    			br70 = element("br");
    			t105 = text("  \r\n            4.The terminal command line pane will be at the bottom. Here you can type in commands.\r\n            ");
    			br71 = element("br");
    			t106 = space();
    			br72 = element("br");
    			t107 = space();
    			img13 = element("img");
    			t108 = space();
    			br73 = element("br");
    			t109 = space();
    			br74 = element("br");
    			t110 = text("             \r\n            5. We will now need to install Node JS into the project. To do this you will use the command line. Type in ‘npm install’ into the command line; this will install and associate an instance of NPM with this project. You can also use other command lines outside of Visual Studio’s terminal command line but just be sure you cd into the correct project folder.\r\n            ");
    			br75 = element("br");
    			t111 = space();
    			br76 = element("br");
    			t112 = space();
    			img14 = element("img");
    			t113 = space();
    			br77 = element("br");
    			t114 = space();
    			br78 = element("br");
    			t115 = text(" \r\n            Now a folder called \"node_modules\" should appear in the Explorer section; it is now associated with the project.\r\n            ");
    			br79 = element("br");
    			t116 = space();
    			br80 = element("br");
    			t117 = space();
    			img15 = element("img");
    			t118 = space();
    			br81 = element("br");
    			t119 = space();
    			br82 = element("br");
    			t120 = text(" \r\n            6. Click on package.json and view the file\r\n            ");
    			br83 = element("br");
    			t121 = space();
    			br84 = element("br");
    			t122 = space();
    			img16 = element("img");
    			t123 = space();
    			br85 = element("br");
    			t124 = space();
    			br86 = element("br");
    			t125 = text(" \r\n            7. Referencing  the commands, type in ‘npm run dev’ in the command line; this will get the Node JS local serving going on your computer; it is required for you to view your Svelte app. The dev command starts your dev environment as well as allow an auto compile function any time you save your project. This is very convenient because it automatically updates your app in the browser.\r\n            ");
    			br87 = element("br");
    			t126 = space();
    			br88 = element("br");
    			t127 = space();
    			img17 = element("img");
    			t128 = space();
    			br89 = element("br");
    			t129 = space();
    			br90 = element("br");
    			t130 = text(" \r\n            8. Go to your browser and type in 'localhost:5000' – to view your new Hello World app!\r\n            ");
    			br91 = element("br");
    			t131 = space();
    			br92 = element("br");
    			t132 = space();
    			img18 = element("img");
    			t133 = space();
    			br93 = element("br");
    			t134 = space();
    			br94 = element("br");
    			t135 = space();
    			div3 = element("div");
    			h14 = element("h1");
    			h14.textContent = "How It Works";
    			t137 = space();
    			p3 = element("p");
    			b4 = element("b");
    			u4 = element("u");
    			u4.textContent = "The Structure of the Svelte Project";
    			br95 = element("br");
    			t139 = text("\r\n            1. In the Hello World project open the following files:\r\n            ");
    			br96 = element("br");
    			t140 = space();
    			br97 = element("br");
    			t141 = text("\r\n            - index.html");
    			br98 = element("br");
    			t142 = text("\r\n            - global.css");
    			br99 = element("br");
    			t143 = text("\r\n            - bundle.css");
    			br100 = element("br");
    			t144 = text("\r\n            - bundle.js");
    			br101 = element("br");
    			t145 = text("\r\n            - main.js");
    			br102 = element("br");
    			t146 = text("\r\n            - App.svelte");
    			br103 = element("br");
    			t147 = text("\r\n            - package.json \r\n            ");
    			br104 = element("br");
    			t148 = space();
    			br105 = element("br");
    			t149 = text("\r\n            If you have some experience with things like React, Angular and View, Svelte should be intuitive for you. If you haven’t used those technologies before OR you are stepping up from basic HTML, CSS and Javascript, Svelte can be a little awkward at first. After doing a little bit of development with Svelte, you will understand why it is a great technology, how it helps organize your code into manageable chunks and compiles your code down into tiny file sizes!\r\n            ");
    			br106 = element("br");
    			t150 = space();
    			br107 = element("br");
    			t151 = text("\r\n            Below is a basic flow path diagram that gives you the high-level overview of how the all the main files relate to each other.\r\n            ");
    			br108 = element("br");
    			t152 = space();
    			br109 = element("br");
    			t153 = space();
    			img19 = element("img");
    			t154 = space();
    			br110 = element("br");
    			t155 = space();
    			br111 = element("br");
    			t156 = text("  \r\n            Starting with the index.html using the “top down thinking” reading the file, you’ll see it’s like any HTML file. When this file is read, the browser will read all CSS and JS files and Content Delivery Network(s) (CDN’s)you have linked.\r\n            ");
    			br112 = element("br");
    			t157 = space();
    			br113 = element("br");
    			t158 = space();
    			img20 = element("img");
    			t159 = space();
    			br114 = element("br");
    			t160 = space();
    			br115 = element("br");
    			t161 = text(" \r\n            At the end of the before the closing head tag you will see 'script defer src='/bundle.js'/script'; this will call the bundle.js file.\r\n            ");
    			br116 = element("br");
    			t162 = space();
    			br117 = element("br");
    			t163 = text(" \r\n            The bundle.js file is the file that Svelte generates when it compiles all of your projects files and code. What’s really neat about this is that it generates a very small file of optimized JavaScript that will help with website performance.    \r\n            ");
    			br118 = element("br");
    			t164 = space();
    			br119 = element("br");
    			t165 = text(" \r\n            If you look at the first few lines of the bundle.js you will see: ");
    			br120 = element("br");
    			t166 = text("\r\n            var app = (function () ...\r\n            ");
    			br121 = element("br");
    			t167 = space();
    			br122 = element("br");
    			t168 = space();
    			img21 = element("img");
    			t169 = space();
    			br123 = element("br");
    			t170 = space();
    			br124 = element("br");
    			t171 = text("  \r\n            The variable ‘app’ is found in the main.js file where it is instantiated. Basically, the bundle.js invokes the main.js file – if you remember the basics of programming, the entry point for programs starts with a main function and in this case,  main.js file is sort of a “gateway” file.\r\n            ");
    			br125 = element("br");
    			t172 = space();
    			br126 = element("br");
    			t173 = text(" \r\n            Looking at the main.js file, you will see in the code:\r\n            ");
    			br127 = element("br");
    			t174 = space();
    			br128 = element("br");
    			t175 = text(" \r\n            import App from './App.svelte';");
    			br129 = element("br");
    			t176 = text("\r\n            var app = new App(");
    			br130 = element("br");
    			t177 = text("\r\n\t        target: document.body....");
    			br131 = element("br");
    			t178 = space();
    			br132 = element("br");
    			t179 = space();
    			br133 = element("br");
    			t180 = space();
    			img22 = element("img");
    			t181 = space();
    			br134 = element("br");
    			t182 = space();
    			br135 = element("br");
    			t183 = text(" \r\n            What is happening here is that the main.js file is calling (known as invoking) the App.svelte file.\r\n            ");
    			br136 = element("br");
    			t184 = space();
    			br137 = element("br");
    			t185 = text(" \r\n            Next, looking at the App.Svelte file, this file is where you “link in” all of the components for your application. If you have used php and separated your website components and used ‘require’ or ‘include’ and/or if you have used Microsoft Razor Pages in ASP.NET Core, it’s the same principle. At the top you will need to import each component with script tags and then  in the body of the file, you will call them with the simple ");
    			t186 = text(string_001);
    			t187 = text(" tag. The image below is from a boiler plate I built out before writing this guide.\r\n            ");
    			br138 = element("br");
    			t188 = space();
    			br139 = element("br");
    			t189 = space();
    			img23 = element("img");
    			t190 = space();
    			br140 = element("br");
    			t191 = space();
    			br141 = element("br");
    			t192 = text(" \r\n            And for each component you want make, you will create a ‘.svelte’ file under the 'src' folder and put that component’s code in there. The image below is taken from a boiler plate project I made before this guide and is an example of compenentization techniques.\r\n            ");
    			br142 = element("br");
    			t193 = space();
    			br143 = element("br");
    			t194 = space();
    			img24 = element("img");
    			t195 = space();
    			br144 = element("br");
    			t196 = space();
    			br145 = element("br");
    			t197 = text(" \r\n            For each ‘.svelte’ file you create, you can put scripts and css at the top of the file. This may seem a little awkward if you are used to basic HTML, CSS and JS coding but it’s really awesome and helps with code management. No longer will you have to make separate JS and CSS files all over the place – you can keep your code nice and tidy. And what is really cool is that when the file is compiled, the JS and CSS will only be applied to that component, not the entire project (known as globally).  With this in mind, you will still need to remember that there is a global.css file back in the index.html head that will affect all files in the project, so do mind the CSS styles and JavaScript you have there that my cause issues.\r\n            ");
    			br146 = element("br");
    			t198 = space();
    			br147 = element("br");
    			t199 = space();
    			img25 = element("img");
    			t200 = space();
    			br148 = element("br");
    			t201 = space();
    			br149 = element("br");
    			t202 = space();
    			div4 = element("div");
    			h15 = element("h1");
    			h15.textContent = "Components";
    			t204 = space();
    			br150 = element("br");
    			t205 = space();
    			p4 = element("p");
    			b5 = element("b");
    			u5 = element("u");
    			u5.textContent = "The Concept of \"Components\" and \"Component-ization\"";
    			br151 = element("br");
    			t207 = text("\r\n            If you are familiar with ‘components’ and ‘component-ization,’ go ahead and skip this section. \r\n            ");
    			br152 = element("br");
    			t208 = space();
    			br153 = element("br");
    			t209 = text("\r\n            Making components and putting them into your app is fairly straightforward once you get the hang of it. If ‘component(s)’  and ‘component-ization’ is a new term and concept for you coming from basic HTML, CSS and JS, think of components as blocks of your divs and sections of the website or app.  \r\n            ");
    			br154 = element("br");
    			t210 = space();
    			br155 = element("br");
    			t211 = text("    \r\n            After building out ‘pre_Componentize.html’ file, you can see it has 159 lines of code to go through. This website has a total of 6 pages, so if you copied and pasted the same code over again into each file, you now have 954 lines of code to work though, each file being really long. \r\n            ");
    			br156 = element("br");
    			t212 = space();
    			br157 = element("br");
    			t213 = text("            \r\n            So let’s ‘component-ize’ a basic HTML page into separate parts from the top down; you have  your head, header, navigation/menu, body, parts within your body, and the footer.           \r\n            ");
    			br158 = element("br");
    			t214 = space();
    			br159 = element("br");
    			t215 = space();
    			img26 = element("img");
    			t216 = space();
    			br160 = element("br");
    			t217 = space();
    			br161 = element("br");
    			t218 = space();
    			img27 = element("img");
    			t219 = space();
    			br162 = element("br");
    			t220 = space();
    			br163 = element("br");
    			t221 = space();
    			img28 = element("img");
    			t222 = space();
    			br164 = element("br");
    			t223 = space();
    			br165 = element("br");
    			t224 = text("\r\n            Instead of writing everything in one long file... \r\n            ");
    			br166 = element("br");
    			t225 = space();
    			br167 = element("br");
    			t226 = space();
    			img29 = element("img");
    			t227 = space();
    			br168 = element("br");
    			t228 = space();
    			br169 = element("br");
    			t229 = text("\r\n            you break up each section and put each section’s code into individual files with PHP. \r\n            ");
    			br170 = element("br");
    			t230 = space();
    			br171 = element("br");
    			t231 = space();
    			img30 = element("img");
    			t232 = space();
    			br172 = element("br");
    			t233 = space();
    			br173 = element("br");
    			t234 = text("\r\n            If you use PHP and restructure the code (also called refactoring/ refactor the code), you can break it down into smaller files spread out in separate folders, which makes it easier to manage the code. Each file is called by the PHP 'include' function.         \r\n            ");
    			br174 = element("br");
    			t235 = space();
    			br175 = element("br");
    			t236 = space();
    			img31 = element("img");
    			t237 = space();
    			br176 = element("br");
    			t238 = space();
    			br177 = element("br");
    			t239 = text(" \r\n            It is a common naming practice for PHP developers to have an 'includes' folder where all of the components are organized. Note ** You don't have to explicity call the file 'includes', you could name it 'cat' and so long as the file path is correct, it will work. **\r\n            ");
    			br178 = element("br");
    			t240 = space();
    			br179 = element("br");
    			t241 = text("\r\n            So now the head, the header, the navbar, and the footer have their own separate files which makes it easier to manage. And you can simply use the PHP include function in each of the pages for your website.\r\n            ");
    			br180 = element("br");
    			t242 = space();
    			br181 = element("br");
    			t243 = space();
    			img32 = element("img");
    			t244 = space();
    			img33 = element("img");
    			t245 = space();
    			img34 = element("img");
    			t246 = space();
    			img35 = element("img");
    			t247 = space();
    			br182 = element("br");
    			t248 = space();
    			br183 = element("br");
    			t249 = text("\r\n            By componentizing this example, you go from 950+ lines of code and lot of repeated code to around 450 unique lines of code for just the page content and 84 lines combined for the head, header, navbar and the footer; the total being around 534 lines. So by componentizing, you reduce the number of lines of code in the project, make the code easier to manage, save hard drive/ server space and improve the performance of your website.\r\n            ");
    			br184 = element("br");
    			t250 = space();
    			br185 = element("br");
    			t251 = text("  \r\n            As a beginner, you may find this awkward, confusing and frustrating because your code is not in one file but once you adopt this practice of breaking up the code into smaller chunks, it makes development a whole lot easier and faster. I really suggest that as soon as you learn HTML, learn the PHP ‘include’ and ‘require’ function and how to “Object Orient” your code as it will help with more advanced things like React, Svelte and C#/ .NET. \r\n            ");
    			br186 = element("br");
    			t252 = space();
    			br187 = element("br");
    			t253 = space();
    			b6 = element("b");
    			u6 = element("u");
    			u6.textContent = "Making Components in Svelte";
    			br188 = element("br");
    			t255 = text("\r\n            1. Lorem Ipsum dolor....\r\n            ");
    			br189 = element("br");
    			t256 = space();
    			br190 = element("br");
    			t257 = space();
    			br191 = element("br");
    			t258 = space();
    			br192 = element("br");
    			attr(h10, "class", "mt-5");
    			add_location(h10, file$3, 17, 12, 285);
    			add_location(br0, file$3, 18, 12, 328);
    			add_location(br1, file$3, 20, 12, 468);
    			add_location(br2, file$3, 21, 12, 489);
    			attr(a0, "href", "https://www.etsy.com/listing/712925864/coasters-svelte-javascript-framework?ref=shop_home_active_9&frs=1");
    			add_location(a0, file$3, 22, 63, 558);
    			add_location(br3, file$3, 23, 12, 837);
    			add_location(br4, file$3, 24, 12, 855);
    			attr(img0, "class", "img1");
    			attr(img0, "src", "ASSETS/IMAGES/svelteCoaster.jpg");
    			attr(img0, "alt", "");
    			add_location(img0, file$3, 25, 12, 873);
    			add_location(br5, file$3, 25, 75, 936);
    			attr(img1, "class", "img1");
    			attr(img1, "src", "ASSETS/IMAGES/mink2.jpg");
    			attr(img1, "alt", "");
    			add_location(img1, file$3, 26, 12, 954);
    			add_location(br6, file$3, 26, 67, 1009);
    			attr(img2, "class", "img1");
    			attr(img2, "src", "ASSETS/IMAGES/mink.jpg");
    			attr(img2, "alt", "");
    			add_location(img2, file$3, 27, 12, 1027);
    			add_location(br7, file$3, 27, 66, 1081);
    			add_location(br8, file$3, 28, 12, 1099);
    			add_location(br9, file$3, 29, 12, 1117);
    			attr(a1, "href", "https://www.etsy.com/listing/712925864/coasters-svelte-javascript-framework?ref=shop_home_active_9&frs=1");
    			add_location(a1, file$3, 30, 21, 1144);
    			add_location(br10, file$3, 31, 12, 1290);
    			add_location(br11, file$3, 32, 12, 1308);
    			attr(p0, "class", "textA");
    			add_location(p0, file$3, 19, 12, 346);
    			attr(h11, "class", "mt-5");
    			add_location(h11, file$3, 34, 12, 1344);
    			attr(div0, "id", "support");
    			attr(div0, "class", "col-sm-12 col-md-12 col-lg-12 col-xl-12 svelte-14u93vd");
    			add_location(div0, file$3, 16, 8, 196);
    			attr(h12, "class", "mt-5");
    			add_location(h12, file$3, 38, 12, 1505);
    			add_location(br12, file$3, 39, 12, 1547);
    			add_location(br13, file$3, 40, 89, 1642);
    			add_location(br14, file$3, 41, 94, 1742);
    			add_location(br15, file$3, 42, 21, 1769);
    			add_location(br16, file$3, 44, 12, 1830);
    			add_location(br17, file$3, 45, 12, 1848);
    			add_location(u0, file$3, 46, 15, 1869);
    			add_location(b0, file$3, 46, 12, 1866);
    			add_location(br18, file$3, 46, 44, 1898);
    			attr(a2, "href", "https://nodejs.org/en/");
    			add_location(a2, file$3, 47, 21, 1925);
    			add_location(br19, file$3, 48, 12, 2042);
    			add_location(br20, file$3, 49, 12, 2060);
    			attr(img3, "class", "img1");
    			attr(img3, "src", "ASSETS/IMAGES/nodeJs.png");
    			attr(img3, "alt", "");
    			add_location(img3, file$3, 50, 12, 2078);
    			add_location(br21, file$3, 51, 12, 2148);
    			add_location(br22, file$3, 52, 12, 2166);
    			add_location(br23, file$3, 54, 12, 2248);
    			add_location(br24, file$3, 55, 12, 2266);
    			add_location(br25, file$3, 57, 12, 2343);
    			add_location(br26, file$3, 58, 12, 2361);
    			add_location(u1, file$3, 59, 15, 2382);
    			add_location(b1, file$3, 59, 12, 2379);
    			add_location(br27, file$3, 59, 55, 2422);
    			attr(a3, "href", "https://code.visualstudio.com/");
    			add_location(a3, file$3, 60, 21, 2449);
    			add_location(br28, file$3, 61, 12, 2593);
    			add_location(br29, file$3, 62, 12, 2611);
    			attr(img4, "class", "img1");
    			attr(img4, "src", "ASSETS/IMAGES/VS_CODE.png");
    			attr(img4, "alt", "");
    			add_location(img4, file$3, 63, 12, 2629);
    			add_location(br30, file$3, 64, 12, 2700);
    			add_location(br31, file$3, 65, 12, 2718);
    			add_location(br32, file$3, 67, 12, 2811);
    			add_location(br33, file$3, 68, 12, 2829);
    			add_location(br34, file$3, 70, 12, 3077);
    			add_location(br35, file$3, 71, 12, 3095);
    			attr(img5, "class", "img1");
    			attr(img5, "src", "ASSETS/IMAGES/extensions.png");
    			attr(img5, "alt", "");
    			add_location(img5, file$3, 72, 12, 3113);
    			add_location(br36, file$3, 73, 12, 3187);
    			add_location(br37, file$3, 74, 12, 3205);
    			add_location(br38, file$3, 76, 12, 3387);
    			add_location(br39, file$3, 77, 12, 3405);
    			attr(img6, "class", "img1");
    			attr(img6, "src", "ASSETS/IMAGES/extensions_2.png");
    			attr(img6, "alt", "");
    			add_location(img6, file$3, 78, 12, 3423);
    			add_location(br40, file$3, 79, 12, 3499);
    			add_location(br41, file$3, 80, 12, 3517);
    			add_location(u2, file$3, 81, 15, 3538);
    			add_location(b2, file$3, 81, 12, 3535);
    			add_location(br42, file$3, 81, 63, 3586);
    			attr(a4, "href", "https://svelte.dev/repl/");
    			add_location(a4, file$3, 82, 21, 3613);
    			add_location(br43, file$3, 83, 12, 3886);
    			add_location(br44, file$3, 84, 12, 3904);
    			attr(img7, "class", "img1");
    			attr(img7, "src", "ASSETS/IMAGES/SvletStarterZip.png");
    			attr(img7, "alt", "");
    			add_location(img7, file$3, 85, 12, 3922);
    			add_location(br45, file$3, 86, 12, 4001);
    			add_location(br46, file$3, 87, 12, 4019);
    			add_location(br47, file$3, 89, 12, 4094);
    			add_location(br48, file$3, 90, 12, 4112);
    			add_location(br49, file$3, 92, 12, 4217);
    			add_location(br50, file$3, 93, 12, 4235);
    			attr(img8, "class", "img1");
    			attr(img8, "src", "ASSETS/IMAGES/Extract.png");
    			attr(img8, "alt", "");
    			add_location(img8, file$3, 94, 12, 4253);
    			add_location(br51, file$3, 95, 12, 4324);
    			add_location(br52, file$3, 96, 12, 4342);
    			add_location(br53, file$3, 98, 12, 4534);
    			add_location(br54, file$3, 99, 12, 4552);
    			attr(img9, "class", "img1");
    			attr(img9, "src", "ASSETS/IMAGES/Hello_World_01a.png");
    			attr(img9, "alt", "");
    			add_location(img9, file$3, 100, 12, 4570);
    			add_location(br55, file$3, 101, 12, 4649);
    			add_location(br56, file$3, 102, 12, 4667);
    			attr(p1, "class", "textA");
    			add_location(p1, file$3, 40, 12, 1565);
    			attr(div1, "id", "setUp");
    			attr(div1, "class", "col-sm-12 col-md-12 col-lg-12 col-xl-12 svelte-14u93vd");
    			add_location(div1, file$3, 37, 8, 1418);
    			attr(h13, "class", "mt-5");
    			add_location(h13, file$3, 109, 12, 4906);
    			add_location(br57, file$3, 110, 12, 4953);
    			add_location(u3, file$3, 113, 15, 5007);
    			add_location(b3, file$3, 113, 12, 5004);
    			add_location(br58, file$3, 113, 48, 5040);
    			add_location(br59, file$3, 115, 12, 5131);
    			add_location(br60, file$3, 116, 12, 5149);
    			attr(img10, "class", "img1");
    			attr(img10, "src", "ASSETS/IMAGES/Hello_World_02.png");
    			attr(img10, "alt", "");
    			add_location(img10, file$3, 117, 12, 5167);
    			add_location(br61, file$3, 118, 12, 5245);
    			add_location(br62, file$3, 119, 12, 5263);
    			add_location(br63, file$3, 121, 12, 5367);
    			add_location(br64, file$3, 122, 12, 5385);
    			attr(img11, "class", "img1");
    			attr(img11, "src", "ASSETS/IMAGES/Hello_World_03.png");
    			attr(img11, "alt", "");
    			add_location(img11, file$3, 123, 12, 5403);
    			add_location(br65, file$3, 124, 12, 5481);
    			add_location(br66, file$3, 125, 12, 5499);
    			add_location(br67, file$3, 127, 12, 5662);
    			add_location(br68, file$3, 128, 12, 5680);
    			attr(img12, "class", "img1");
    			attr(img12, "src", "ASSETS/IMAGES/Hello_World_04.png");
    			attr(img12, "alt", "");
    			add_location(img12, file$3, 129, 12, 5698);
    			add_location(br69, file$3, 130, 12, 5776);
    			add_location(br70, file$3, 131, 12, 5794);
    			add_location(br71, file$3, 133, 12, 5914);
    			add_location(br72, file$3, 134, 12, 5932);
    			attr(img13, "class", "img1");
    			attr(img13, "src", "ASSETS/IMAGES/terminal.png");
    			attr(img13, "alt", "");
    			add_location(img13, file$3, 135, 12, 5950);
    			add_location(br73, file$3, 136, 12, 6022);
    			add_location(br74, file$3, 137, 12, 6040);
    			add_location(br75, file$3, 139, 12, 6441);
    			add_location(br76, file$3, 140, 12, 6459);
    			attr(img14, "class", "img1");
    			attr(img14, "src", "ASSETS/IMAGES/Hello_World_05.png");
    			attr(img14, "alt", "");
    			add_location(img14, file$3, 141, 12, 6477);
    			add_location(br77, file$3, 142, 12, 6555);
    			add_location(br78, file$3, 143, 12, 6573);
    			add_location(br79, file$3, 145, 12, 6718);
    			add_location(br80, file$3, 146, 12, 6736);
    			attr(img15, "class", "img1");
    			attr(img15, "src", "ASSETS/IMAGES/Hello_World_06.png");
    			attr(img15, "alt", "");
    			add_location(img15, file$3, 147, 12, 6754);
    			add_location(br81, file$3, 148, 12, 6832);
    			add_location(br82, file$3, 149, 12, 6850);
    			add_location(br83, file$3, 151, 12, 6925);
    			add_location(br84, file$3, 152, 12, 6943);
    			attr(img16, "class", "img1");
    			attr(img16, "src", "ASSETS/IMAGES/pckgJSON.png");
    			attr(img16, "alt", "");
    			add_location(img16, file$3, 153, 12, 6961);
    			add_location(br85, file$3, 154, 12, 7033);
    			add_location(br86, file$3, 155, 12, 7051);
    			add_location(br87, file$3, 157, 12, 7468);
    			add_location(br88, file$3, 158, 12, 7486);
    			attr(img17, "class", "img1");
    			attr(img17, "src", "ASSETS/IMAGES/Hello_World_08.png");
    			attr(img17, "alt", "");
    			add_location(img17, file$3, 159, 12, 7506);
    			add_location(br89, file$3, 160, 12, 7584);
    			add_location(br90, file$3, 161, 12, 7602);
    			add_location(br91, file$3, 163, 12, 7721);
    			add_location(br92, file$3, 164, 12, 7739);
    			set_style(img18, "border", "2px solid black");
    			attr(img18, "class", "img1");
    			attr(img18, "src", "ASSETS/IMAGES/Hello_World_10.png");
    			attr(img18, "alt", "");
    			add_location(img18, file$3, 165, 12, 7759);
    			add_location(br93, file$3, 166, 12, 7869);
    			add_location(br94, file$3, 167, 12, 7887);
    			attr(p2, "class", "textA");
    			add_location(p2, file$3, 112, 12, 4973);
    			attr(div2, "id", "helloWorld");
    			attr(div2, "class", "col-sm-12 col-md-12 col-lg-12 col-xl-12 svelte-14u93vd");
    			add_location(div2, file$3, 108, 8, 4814);
    			attr(h14, "class", "mt-5");
    			add_location(h14, file$3, 173, 12, 8034);
    			add_location(u4, file$3, 176, 15, 8118);
    			add_location(b4, file$3, 176, 12, 8115);
    			add_location(br95, file$3, 176, 61, 8164);
    			add_location(br96, file$3, 178, 12, 8251);
    			add_location(br97, file$3, 179, 12, 8269);
    			add_location(br98, file$3, 180, 24, 8299);
    			add_location(br99, file$3, 181, 24, 8329);
    			add_location(br100, file$3, 182, 24, 8359);
    			add_location(br101, file$3, 183, 23, 8388);
    			add_location(br102, file$3, 184, 21, 8415);
    			add_location(br103, file$3, 185, 24, 8445);
    			add_location(br104, file$3, 187, 12, 8492);
    			add_location(br105, file$3, 188, 12, 8510);
    			add_location(br106, file$3, 190, 12, 9002);
    			add_location(br107, file$3, 191, 12, 9020);
    			add_location(br108, file$3, 193, 12, 9177);
    			add_location(br109, file$3, 194, 12, 9195);
    			attr(img19, "class", "img1");
    			attr(img19, "src", "ASSETS/IMAGES/SvelteFlowPath.png");
    			attr(img19, "alt", "");
    			add_location(img19, file$3, 195, 12, 9213);
    			add_location(br110, file$3, 196, 12, 9291);
    			add_location(br111, file$3, 197, 12, 9309);
    			add_location(br112, file$3, 199, 12, 9578);
    			add_location(br113, file$3, 200, 12, 9596);
    			attr(img20, "class", "img1");
    			attr(img20, "src", "ASSETS/IMAGES/HIW_01.png");
    			attr(img20, "alt", "");
    			add_location(img20, file$3, 201, 12, 9615);
    			add_location(br114, file$3, 202, 12, 9685);
    			add_location(br115, file$3, 203, 12, 9703);
    			add_location(br116, file$3, 205, 12, 9869);
    			add_location(br117, file$3, 206, 12, 9887);
    			add_location(br118, file$3, 208, 12, 10164);
    			add_location(br119, file$3, 209, 12, 10182);
    			add_location(br120, file$3, 210, 78, 10267);
    			add_location(br121, file$3, 212, 12, 10325);
    			add_location(br122, file$3, 213, 12, 10343);
    			attr(img21, "class", "img1");
    			attr(img21, "src", "ASSETS/IMAGES/HIW_02.png");
    			attr(img21, "alt", "");
    			add_location(img21, file$3, 214, 12, 10361);
    			add_location(br123, file$3, 215, 12, 10431);
    			add_location(br124, file$3, 216, 12, 10449);
    			add_location(br125, file$3, 218, 12, 10769);
    			add_location(br126, file$3, 219, 12, 10787);
    			add_location(br127, file$3, 221, 12, 10874);
    			add_location(br128, file$3, 222, 12, 10892);
    			add_location(br129, file$3, 223, 43, 10942);
    			add_location(br130, file$3, 224, 30, 10978);
    			add_location(br131, file$3, 225, 34, 11018);
    			add_location(br132, file$3, 226, 12, 11036);
    			add_location(br133, file$3, 227, 12, 11054);
    			attr(img22, "class", "img1");
    			attr(img22, "src", "ASSETS/IMAGES/HIW_03.png");
    			attr(img22, "alt", "");
    			add_location(img22, file$3, 228, 12, 11073);
    			add_location(br134, file$3, 229, 12, 11143);
    			add_location(br135, file$3, 230, 12, 11161);
    			add_location(br136, file$3, 232, 12, 11293);
    			add_location(br137, file$3, 233, 12, 11311);
    			add_location(br138, file$3, 235, 12, 11870);
    			add_location(br139, file$3, 236, 12, 11888);
    			attr(img23, "class", "img1");
    			attr(img23, "src", "ASSETS/IMAGES/HIW_04.png");
    			attr(img23, "alt", "");
    			add_location(img23, file$3, 237, 12, 11907);
    			add_location(br140, file$3, 238, 12, 11977);
    			add_location(br141, file$3, 239, 12, 11995);
    			add_location(br142, file$3, 241, 12, 12289);
    			add_location(br143, file$3, 242, 12, 12307);
    			attr(img24, "class", "img1");
    			attr(img24, "src", "ASSETS/IMAGES/HIW_05.png");
    			attr(img24, "alt", "");
    			add_location(img24, file$3, 243, 12, 12325);
    			add_location(br144, file$3, 244, 12, 12395);
    			add_location(br145, file$3, 245, 12, 12413);
    			add_location(br146, file$3, 247, 12, 13177);
    			add_location(br147, file$3, 248, 12, 13195);
    			attr(img25, "class", "img1");
    			attr(img25, "src", "ASSETS/IMAGES/HIW_06.png");
    			attr(img25, "alt", "");
    			add_location(img25, file$3, 249, 12, 13214);
    			add_location(br148, file$3, 250, 12, 13284);
    			add_location(br149, file$3, 251, 12, 13302);
    			attr(p3, "class", "textA");
    			add_location(p3, file$3, 175, 12, 8084);
    			attr(div3, "id", "howItWorks");
    			attr(div3, "class", "col-sm-12 col-md-12 col-lg-12 col-xl-12 svelte-14u93vd");
    			add_location(div3, file$3, 172, 8, 7942);
    			attr(h15, "class", "mt-5");
    			add_location(h15, file$3, 257, 12, 13431);
    			add_location(br150, file$3, 258, 12, 13477);
    			add_location(u5, file$3, 260, 15, 13529);
    			add_location(b5, file$3, 260, 12, 13526);
    			add_location(br151, file$3, 260, 77, 13591);
    			add_location(br152, file$3, 262, 12, 13718);
    			add_location(br153, file$3, 263, 12, 13736);
    			add_location(br154, file$3, 265, 12, 14065);
    			add_location(br155, file$3, 266, 12, 14083);
    			add_location(br156, file$3, 268, 12, 14402);
    			add_location(br157, file$3, 269, 12, 14420);
    			add_location(br158, file$3, 271, 12, 14648);
    			add_location(br159, file$3, 272, 12, 14666);
    			attr(img26, "class", "img1");
    			attr(img26, "src", "ASSETS/IMAGES/y1.png");
    			attr(img26, "alt", "");
    			add_location(img26, file$3, 273, 12, 14698);
    			add_location(br160, file$3, 274, 12, 14768);
    			add_location(br161, file$3, 275, 12, 14786);
    			attr(img27, "class", "img1");
    			attr(img27, "src", "ASSETS/IMAGES/componentA.png");
    			attr(img27, "alt", "");
    			add_location(img27, file$3, 276, 12, 14804);
    			add_location(br162, file$3, 277, 12, 14882);
    			add_location(br163, file$3, 278, 12, 14900);
    			attr(img28, "class", "img1");
    			attr(img28, "src", "ASSETS/IMAGES/componentB.png");
    			attr(img28, "alt", "");
    			add_location(img28, file$3, 279, 12, 14918);
    			add_location(br164, file$3, 280, 12, 14996);
    			add_location(br165, file$3, 281, 12, 15014);
    			add_location(br166, file$3, 283, 12, 15096);
    			add_location(br167, file$3, 284, 12, 15114);
    			attr(img29, "class", "img1");
    			attr(img29, "src", "ASSETS/IMAGES/long.png");
    			attr(img29, "alt", "");
    			add_location(img29, file$3, 285, 12, 15132);
    			add_location(br168, file$3, 286, 12, 15200);
    			add_location(br169, file$3, 287, 12, 15218);
    			add_location(br170, file$3, 289, 12, 15336);
    			add_location(br171, file$3, 290, 12, 15354);
    			set_style(img30, "width", "30%");
    			attr(img30, "src", "ASSETS/IMAGES/w2.png");
    			attr(img30, "alt", "");
    			add_location(img30, file$3, 291, 12, 15372);
    			add_location(br172, file$3, 292, 12, 15445);
    			add_location(br173, file$3, 293, 12, 15463);
    			add_location(br174, file$3, 295, 12, 15755);
    			add_location(br175, file$3, 296, 12, 15773);
    			attr(img31, "class", "img1");
    			attr(img31, "src", "ASSETS/IMAGES/z4.png");
    			attr(img31, "alt", "");
    			add_location(img31, file$3, 297, 12, 15795);
    			add_location(br176, file$3, 298, 12, 15863);
    			add_location(br177, file$3, 299, 12, 15881);
    			add_location(br178, file$3, 301, 12, 16179);
    			add_location(br179, file$3, 302, 12, 16197);
    			add_location(br180, file$3, 304, 12, 16434);
    			add_location(br181, file$3, 305, 12, 16452);
    			attr(img32, "class", "img1");
    			attr(img32, "src", "ASSETS/IMAGES/z6.png");
    			attr(img32, "alt", "");
    			add_location(img32, file$3, 306, 12, 16470);
    			attr(img33, "class", "img1");
    			attr(img33, "src", "ASSETS/IMAGES/z7.png");
    			attr(img33, "alt", "");
    			add_location(img33, file$3, 307, 12, 16536);
    			attr(img34, "class", "img1");
    			attr(img34, "src", "ASSETS/IMAGES/z8.png");
    			attr(img34, "alt", "");
    			add_location(img34, file$3, 308, 12, 16602);
    			attr(img35, "class", "img1");
    			attr(img35, "src", "ASSETS/IMAGES/z9.png");
    			attr(img35, "alt", "");
    			add_location(img35, file$3, 309, 12, 16668);
    			add_location(br182, file$3, 310, 12, 16734);
    			add_location(br183, file$3, 311, 12, 16752);
    			add_location(br184, file$3, 313, 12, 17217);
    			add_location(br185, file$3, 314, 12, 17235);
    			add_location(br186, file$3, 316, 12, 17712);
    			add_location(br187, file$3, 317, 12, 17730);
    			add_location(u6, file$3, 318, 15, 17757);
    			add_location(b6, file$3, 318, 12, 17754);
    			add_location(br188, file$3, 318, 53, 17795);
    			add_location(br189, file$3, 320, 12, 17851);
    			add_location(br190, file$3, 321, 12, 17869);
    			add_location(br191, file$3, 323, 12, 17972);
    			add_location(br192, file$3, 324, 12, 17990);
    			attr(p4, "class", "textA");
    			add_location(p4, file$3, 259, 12, 13495);
    			attr(div4, "id", "components");
    			attr(div4, "class", "col-sm-12 col-md-12 col-lg-12 col-xl-12 svelte-14u93vd");
    			add_location(div4, file$3, 256, 8, 13339);
    			attr(div5, "class", "row svelte-14u93vd");
    			add_location(div5, file$3, 15, 4, 169);
    			attr(div6, "class", "container-fluid mt-5 mb-5 svelte-14u93vd");
    			add_location(div6, file$3, 13, 0, 122);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div6, anchor);
    			append(div6, div5);
    			append(div5, div0);
    			append(div0, h10);
    			append(div0, t1);
    			append(div0, br0);
    			append(div0, t2);
    			append(div0, p0);
    			append(p0, t3);
    			append(p0, br1);
    			append(p0, t4);
    			append(p0, br2);
    			append(p0, t5);
    			append(p0, a0);
    			append(p0, t7);
    			append(p0, br3);
    			append(p0, t8);
    			append(p0, br4);
    			append(p0, t9);
    			append(p0, img0);
    			append(p0, br5);
    			append(p0, t10);
    			append(p0, img1);
    			append(p0, br6);
    			append(p0, t11);
    			append(p0, img2);
    			append(p0, br7);
    			append(p0, t12);
    			append(p0, br8);
    			append(p0, t13);
    			append(p0, br9);
    			append(p0, t14);
    			append(p0, a1);
    			append(p0, t16);
    			append(p0, br10);
    			append(p0, t17);
    			append(p0, br11);
    			append(div0, t18);
    			append(div0, h11);
    			append(div5, t20);
    			append(div5, div1);
    			append(div1, h12);
    			append(div1, t22);
    			append(div1, br12);
    			append(div1, t23);
    			append(div1, p1);
    			append(p1, t24);
    			append(p1, br13);
    			append(p1, t25);
    			append(p1, br14);
    			append(p1, t26);
    			append(p1, br15);
    			append(p1, t27);
    			append(p1, br16);
    			append(p1, t28);
    			append(p1, br17);
    			append(p1, t29);
    			append(p1, b0);
    			append(b0, u0);
    			append(p1, br18);
    			append(p1, t31);
    			append(p1, a2);
    			append(p1, t33);
    			append(p1, br19);
    			append(p1, t34);
    			append(p1, br20);
    			append(p1, t35);
    			append(p1, img3);
    			append(p1, t36);
    			append(p1, br21);
    			append(p1, t37);
    			append(p1, br22);
    			append(p1, t38);
    			append(p1, br23);
    			append(p1, t39);
    			append(p1, br24);
    			append(p1, t40);
    			append(p1, br25);
    			append(p1, t41);
    			append(p1, br26);
    			append(p1, t42);
    			append(p1, b1);
    			append(b1, u1);
    			append(p1, br27);
    			append(p1, t44);
    			append(p1, a3);
    			append(p1, t46);
    			append(p1, br28);
    			append(p1, t47);
    			append(p1, br29);
    			append(p1, t48);
    			append(p1, img4);
    			append(p1, t49);
    			append(p1, br30);
    			append(p1, t50);
    			append(p1, br31);
    			append(p1, t51);
    			append(p1, br32);
    			append(p1, t52);
    			append(p1, br33);
    			append(p1, t53);
    			append(p1, br34);
    			append(p1, t54);
    			append(p1, br35);
    			append(p1, t55);
    			append(p1, img5);
    			append(p1, t56);
    			append(p1, br36);
    			append(p1, t57);
    			append(p1, br37);
    			append(p1, t58);
    			append(p1, br38);
    			append(p1, t59);
    			append(p1, br39);
    			append(p1, t60);
    			append(p1, img6);
    			append(p1, t61);
    			append(p1, br40);
    			append(p1, t62);
    			append(p1, br41);
    			append(p1, t63);
    			append(p1, b2);
    			append(b2, u2);
    			append(p1, br42);
    			append(p1, t65);
    			append(p1, a4);
    			append(p1, t67);
    			append(p1, br43);
    			append(p1, t68);
    			append(p1, br44);
    			append(p1, t69);
    			append(p1, img7);
    			append(p1, t70);
    			append(p1, br45);
    			append(p1, t71);
    			append(p1, br46);
    			append(p1, t72);
    			append(p1, br47);
    			append(p1, t73);
    			append(p1, br48);
    			append(p1, t74);
    			append(p1, br49);
    			append(p1, t75);
    			append(p1, br50);
    			append(p1, t76);
    			append(p1, img8);
    			append(p1, t77);
    			append(p1, br51);
    			append(p1, t78);
    			append(p1, br52);
    			append(p1, t79);
    			append(p1, br53);
    			append(p1, t80);
    			append(p1, br54);
    			append(p1, t81);
    			append(p1, img9);
    			append(p1, t82);
    			append(p1, br55);
    			append(p1, t83);
    			append(p1, br56);
    			append(p1, t84);
    			append(div5, t85);
    			append(div5, div2);
    			append(div2, h13);
    			append(div2, t87);
    			append(div2, br57);
    			append(div2, t88);
    			append(div2, p2);
    			append(p2, b3);
    			append(b3, u3);
    			append(p2, br58);
    			append(p2, t90);
    			append(p2, br59);
    			append(p2, t91);
    			append(p2, br60);
    			append(p2, t92);
    			append(p2, img10);
    			append(p2, t93);
    			append(p2, br61);
    			append(p2, t94);
    			append(p2, br62);
    			append(p2, t95);
    			append(p2, br63);
    			append(p2, t96);
    			append(p2, br64);
    			append(p2, t97);
    			append(p2, img11);
    			append(p2, t98);
    			append(p2, br65);
    			append(p2, t99);
    			append(p2, br66);
    			append(p2, t100);
    			append(p2, br67);
    			append(p2, t101);
    			append(p2, br68);
    			append(p2, t102);
    			append(p2, img12);
    			append(p2, t103);
    			append(p2, br69);
    			append(p2, t104);
    			append(p2, br70);
    			append(p2, t105);
    			append(p2, br71);
    			append(p2, t106);
    			append(p2, br72);
    			append(p2, t107);
    			append(p2, img13);
    			append(p2, t108);
    			append(p2, br73);
    			append(p2, t109);
    			append(p2, br74);
    			append(p2, t110);
    			append(p2, br75);
    			append(p2, t111);
    			append(p2, br76);
    			append(p2, t112);
    			append(p2, img14);
    			append(p2, t113);
    			append(p2, br77);
    			append(p2, t114);
    			append(p2, br78);
    			append(p2, t115);
    			append(p2, br79);
    			append(p2, t116);
    			append(p2, br80);
    			append(p2, t117);
    			append(p2, img15);
    			append(p2, t118);
    			append(p2, br81);
    			append(p2, t119);
    			append(p2, br82);
    			append(p2, t120);
    			append(p2, br83);
    			append(p2, t121);
    			append(p2, br84);
    			append(p2, t122);
    			append(p2, img16);
    			append(p2, t123);
    			append(p2, br85);
    			append(p2, t124);
    			append(p2, br86);
    			append(p2, t125);
    			append(p2, br87);
    			append(p2, t126);
    			append(p2, br88);
    			append(p2, t127);
    			append(p2, img17);
    			append(p2, t128);
    			append(p2, br89);
    			append(p2, t129);
    			append(p2, br90);
    			append(p2, t130);
    			append(p2, br91);
    			append(p2, t131);
    			append(p2, br92);
    			append(p2, t132);
    			append(p2, img18);
    			append(p2, t133);
    			append(p2, br93);
    			append(p2, t134);
    			append(p2, br94);
    			append(div5, t135);
    			append(div5, div3);
    			append(div3, h14);
    			append(div3, t137);
    			append(div3, p3);
    			append(p3, b4);
    			append(b4, u4);
    			append(p3, br95);
    			append(p3, t139);
    			append(p3, br96);
    			append(p3, t140);
    			append(p3, br97);
    			append(p3, t141);
    			append(p3, br98);
    			append(p3, t142);
    			append(p3, br99);
    			append(p3, t143);
    			append(p3, br100);
    			append(p3, t144);
    			append(p3, br101);
    			append(p3, t145);
    			append(p3, br102);
    			append(p3, t146);
    			append(p3, br103);
    			append(p3, t147);
    			append(p3, br104);
    			append(p3, t148);
    			append(p3, br105);
    			append(p3, t149);
    			append(p3, br106);
    			append(p3, t150);
    			append(p3, br107);
    			append(p3, t151);
    			append(p3, br108);
    			append(p3, t152);
    			append(p3, br109);
    			append(p3, t153);
    			append(p3, img19);
    			append(p3, t154);
    			append(p3, br110);
    			append(p3, t155);
    			append(p3, br111);
    			append(p3, t156);
    			append(p3, br112);
    			append(p3, t157);
    			append(p3, br113);
    			append(p3, t158);
    			append(p3, img20);
    			append(p3, t159);
    			append(p3, br114);
    			append(p3, t160);
    			append(p3, br115);
    			append(p3, t161);
    			append(p3, br116);
    			append(p3, t162);
    			append(p3, br117);
    			append(p3, t163);
    			append(p3, br118);
    			append(p3, t164);
    			append(p3, br119);
    			append(p3, t165);
    			append(p3, br120);
    			append(p3, t166);
    			append(p3, br121);
    			append(p3, t167);
    			append(p3, br122);
    			append(p3, t168);
    			append(p3, img21);
    			append(p3, t169);
    			append(p3, br123);
    			append(p3, t170);
    			append(p3, br124);
    			append(p3, t171);
    			append(p3, br125);
    			append(p3, t172);
    			append(p3, br126);
    			append(p3, t173);
    			append(p3, br127);
    			append(p3, t174);
    			append(p3, br128);
    			append(p3, t175);
    			append(p3, br129);
    			append(p3, t176);
    			append(p3, br130);
    			append(p3, t177);
    			append(p3, br131);
    			append(p3, t178);
    			append(p3, br132);
    			append(p3, t179);
    			append(p3, br133);
    			append(p3, t180);
    			append(p3, img22);
    			append(p3, t181);
    			append(p3, br134);
    			append(p3, t182);
    			append(p3, br135);
    			append(p3, t183);
    			append(p3, br136);
    			append(p3, t184);
    			append(p3, br137);
    			append(p3, t185);
    			append(p3, t186);
    			append(p3, t187);
    			append(p3, br138);
    			append(p3, t188);
    			append(p3, br139);
    			append(p3, t189);
    			append(p3, img23);
    			append(p3, t190);
    			append(p3, br140);
    			append(p3, t191);
    			append(p3, br141);
    			append(p3, t192);
    			append(p3, br142);
    			append(p3, t193);
    			append(p3, br143);
    			append(p3, t194);
    			append(p3, img24);
    			append(p3, t195);
    			append(p3, br144);
    			append(p3, t196);
    			append(p3, br145);
    			append(p3, t197);
    			append(p3, br146);
    			append(p3, t198);
    			append(p3, br147);
    			append(p3, t199);
    			append(p3, img25);
    			append(p3, t200);
    			append(p3, br148);
    			append(p3, t201);
    			append(p3, br149);
    			append(div5, t202);
    			append(div5, div4);
    			append(div4, h15);
    			append(div4, t204);
    			append(div4, br150);
    			append(div4, t205);
    			append(div4, p4);
    			append(p4, b5);
    			append(b5, u5);
    			append(p4, br151);
    			append(p4, t207);
    			append(p4, br152);
    			append(p4, t208);
    			append(p4, br153);
    			append(p4, t209);
    			append(p4, br154);
    			append(p4, t210);
    			append(p4, br155);
    			append(p4, t211);
    			append(p4, br156);
    			append(p4, t212);
    			append(p4, br157);
    			append(p4, t213);
    			append(p4, br158);
    			append(p4, t214);
    			append(p4, br159);
    			append(p4, t215);
    			append(p4, img26);
    			append(p4, t216);
    			append(p4, br160);
    			append(p4, t217);
    			append(p4, br161);
    			append(p4, t218);
    			append(p4, img27);
    			append(p4, t219);
    			append(p4, br162);
    			append(p4, t220);
    			append(p4, br163);
    			append(p4, t221);
    			append(p4, img28);
    			append(p4, t222);
    			append(p4, br164);
    			append(p4, t223);
    			append(p4, br165);
    			append(p4, t224);
    			append(p4, br166);
    			append(p4, t225);
    			append(p4, br167);
    			append(p4, t226);
    			append(p4, img29);
    			append(p4, t227);
    			append(p4, br168);
    			append(p4, t228);
    			append(p4, br169);
    			append(p4, t229);
    			append(p4, br170);
    			append(p4, t230);
    			append(p4, br171);
    			append(p4, t231);
    			append(p4, img30);
    			append(p4, t232);
    			append(p4, br172);
    			append(p4, t233);
    			append(p4, br173);
    			append(p4, t234);
    			append(p4, br174);
    			append(p4, t235);
    			append(p4, br175);
    			append(p4, t236);
    			append(p4, img31);
    			append(p4, t237);
    			append(p4, br176);
    			append(p4, t238);
    			append(p4, br177);
    			append(p4, t239);
    			append(p4, br178);
    			append(p4, t240);
    			append(p4, br179);
    			append(p4, t241);
    			append(p4, br180);
    			append(p4, t242);
    			append(p4, br181);
    			append(p4, t243);
    			append(p4, img32);
    			append(p4, t244);
    			append(p4, img33);
    			append(p4, t245);
    			append(p4, img34);
    			append(p4, t246);
    			append(p4, img35);
    			append(p4, t247);
    			append(p4, br182);
    			append(p4, t248);
    			append(p4, br183);
    			append(p4, t249);
    			append(p4, br184);
    			append(p4, t250);
    			append(p4, br185);
    			append(p4, t251);
    			append(p4, br186);
    			append(p4, t252);
    			append(p4, br187);
    			append(p4, t253);
    			append(p4, b6);
    			append(b6, u6);
    			append(p4, br188);
    			append(p4, t255);
    			append(p4, br189);
    			append(p4, t256);
    			append(p4, br190);
    			append(p4, t257);
    			append(p4, br191);
    			append(p4, t258);
    			append(p4, br192);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div6);
    			}
    		}
    	};
    }

    let string_001 = '< abcxyz />';

    class BodyBootstrap extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$3, safe_not_equal, []);
    	}
    }

    /* src\Footer.svelte generated by Svelte v3.6.9 */

    const file$4 = "src\\Footer.svelte";

    function create_fragment$4(ctx) {
    	var div4, div1, div0, a0, img0, t, div3, div2, a1, img1;

    	return {
    		c: function create() {
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t = space();
    			div3 = element("div");
    			div2 = element("div");
    			a1 = element("a");
    			img1 = element("img");
    			attr(img0, "src", "ASSETS/FOOTER/LOGO_ALT3.png");
    			attr(img0, "alt", "");
    			attr(img0, "class", "svelte-fkawt3");
    			add_location(img0, file$4, 24, 64, 374);
    			attr(a0, "href", "http://www.jsnetware.com/");
    			attr(a0, "alt", "JSNETware");
    			add_location(a0, file$4, 24, 12, 322);
    			attr(div0, "class", "col-sm-12 col-md-3 col-lg-3 col-xl-3 svelte-fkawt3");
    			add_location(div0, file$4, 22, 8, 256);
    			attr(div1, "class", "row svelte-fkawt3");
    			add_location(div1, file$4, 20, 4, 227);
    			attr(img1, "src", "ASSETS/FOOTER/DH2c.png");
    			attr(img1, "alt", "");
    			attr(img1, "class", "svelte-fkawt3");
    			add_location(img1, file$4, 34, 86, 638);
    			attr(a1, "href", "http://www.darkhorsedp.com/");
    			attr(a1, "alt", "DarkHorse Digital Performance");
    			add_location(a1, file$4, 34, 12, 564);
    			attr(div2, "class", "col-sm-12 col-md-3 col-lg-3 col-xl-3 svelte-fkawt3");
    			add_location(div2, file$4, 32, 8, 498);
    			attr(div3, "class", "row svelte-fkawt3");
    			add_location(div3, file$4, 30, 4, 469);
    			attr(div4, "class", "container-fluid mt-5 svelte-fkawt3");
    			add_location(div4, file$4, 18, 0, 185);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div1);
    			append(div1, div0);
    			append(div0, a0);
    			append(a0, img0);
    			append(div4, t);
    			append(div4, div3);
    			append(div3, div2);
    			append(div2, a1);
    			append(a1, img1);
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
