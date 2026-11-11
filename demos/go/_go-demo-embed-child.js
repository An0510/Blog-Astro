(function () {
	"use strict";

	var PROTOCOL = "go-demo-embed";
	var id = document.documentElement.getAttribute("data-go-demo-id") || "";
	var embedded = window.parent !== window;

	if (embedded) {
		document.documentElement.classList.add("go-demo-is-embed");
	}
	if (!embedded || !id) {
		return;
	}

	var lastSent = -1;
	var frame = 0;

	function measure() {
		var doc = document.documentElement;
		var body = document.body;
		var wrap =
			document.querySelector("[data-go-demo-measure-root]") ||
			document.querySelector(".wrap") ||
			body;
		var values = [];
		if (wrap) {
			values.push(wrap.scrollHeight);
			values.push(Math.ceil(wrap.getBoundingClientRect().height));
		}
		if (body) {
			var cs = window.getComputedStyle(body);
			var margin =
				(parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0);
			values.push(body.scrollHeight + margin);
			values.push(body.offsetHeight + margin);
		}
		values.push(doc.scrollHeight);
		values.push(doc.offsetHeight);
		var h = 0;
		for (var i = 0; i < values.length; i++) {
			if (values[i] > h) h = values[i];
		}
		return Math.ceil(h);
	}

	function send(reason) {
		var h = measure();
		if (!isFinite(h) || h === lastSent) return;
		lastSent = h;
		window.parent.postMessage(
			{
				protocol: PROTOCOL,
				type: "go-demo-height",
				id: id,
				height: h,
				reason: reason || "",
			},
			"*",
		);
	}

	function schedule(reason) {
		if (frame) cancelAnimationFrame(frame);
		frame = requestAnimationFrame(function () {
			frame = 0;
			send(reason);
		});
	}

	window.addEventListener("message", function (event) {
		if (event.source !== window.parent) return;
		var data = event.data;
		if (!data || typeof data !== "object") return;
		if (data.protocol !== PROTOCOL || data.type !== "go-demo-measure") return;
		if (data.id && data.id !== id) return;
		lastSent = -1;
		send("parent-request");
	});

	window.parent.postMessage(
		{ protocol: PROTOCOL, type: "go-demo-ready", id: id },
		"*",
	);
	schedule("init");
	window.addEventListener("load", function () {
		schedule("load");
	});
	if (document.fonts && document.fonts.ready) {
		document.fonts.ready.then(function () {
			schedule("fonts");
		});
	}
	window.addEventListener("resize", function () {
		schedule("window-resize");
	});

	if (typeof ResizeObserver !== "undefined") {
		var ro = new ResizeObserver(function () {
			schedule("resize-observer");
		});
		ro.observe(document.documentElement);
		if (document.body) ro.observe(document.body);
		var wrap = document.querySelector(".wrap");
		if (wrap && wrap !== document.body) ro.observe(wrap);
	}

	if (typeof MutationObserver !== "undefined" && document.body) {
		var mo = new MutationObserver(function () {
			schedule("dom");
		});
		mo.observe(document.body, {
			subtree: true,
			childList: true,
			attributes: true,
			characterData: true,
		});
	}
})();
