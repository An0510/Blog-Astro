const PROTOCOL = "go-demo-embed";
const MIN_HEIGHT = 80;
const MAX_HEIGHT = 16000;

type GoDemoMessage = {
	protocol?: unknown;
	type?: unknown;
	id?: unknown;
	height?: unknown;
	reason?: unknown;
};

type BoundIframe = {
	el: HTMLIFrameElement;
	onLoad: () => void;
};

let started = false;
const bound = new Map<HTMLIFrameElement, BoundIframe>();

function isGoDemoMessage(data: unknown): data is GoDemoMessage {
	return typeof data === "object" && data !== null;
}

function findIframeBySource(source: MessageEvent["source"]): HTMLIFrameElement | null {
	const frames = document.querySelectorAll<HTMLIFrameElement>("iframe[data-go-demo-iframe]");
	for (const iframe of frames) {
		if (source === iframe.contentWindow) {
			return iframe;
		}
	}
	return null;
}

function requestMeasure(iframe: HTMLIFrameElement): void {
	const id = iframe.dataset.goDemoId;
	const win = iframe.contentWindow;
	if (!id || !win) return;
	win.postMessage(
		{
			protocol: PROTOCOL,
			type: "go-demo-measure",
			id,
		},
		"*",
	);
}

function applyHeight(iframe: HTMLIFrameElement, height: number): void {
	const next = `${Math.round(height)}px`;
	if (iframe.style.height === next) return;
	iframe.style.height = next;
	iframe.style.minHeight = "0";
	iframe.style.maxHeight = "none";
}

function onMessage(event: MessageEvent): void {
	if (!isGoDemoMessage(event.data)) return;
	const data = event.data;
	if (data.protocol !== PROTOCOL) return;
	if (data.type !== "go-demo-height" && data.type !== "go-demo-ready") return;

	const iframe = findIframeBySource(event.source);
	if (!iframe) return;

	const expectedId = iframe.dataset.goDemoId;
	if (!expectedId || data.id !== expectedId) return;

	if (data.type === "go-demo-ready") {
		requestMeasure(iframe);
		return;
	}

	const height = typeof data.height === "number" ? data.height : Number(data.height);
	if (!Number.isFinite(height) || height < MIN_HEIGHT || height > MAX_HEIGHT) return;
	applyHeight(iframe, height);
}

function bindIframe(iframe: HTMLIFrameElement): void {
	if (bound.has(iframe)) return;
	const onLoad = (): void => {
		requestMeasure(iframe);
	};
	iframe.addEventListener("load", onLoad);
	bound.set(iframe, { el: iframe, onLoad });
	if (iframe.contentWindow) {
		requestMeasure(iframe);
	}
}

function unbindIframe(iframe: HTMLIFrameElement): void {
	const item = bound.get(iframe);
	if (!item) return;
	iframe.removeEventListener("load", item.onLoad);
	bound.delete(iframe);
}

function syncIframes(): void {
	const live = new Set<HTMLIFrameElement>(
		document.querySelectorAll<HTMLIFrameElement>("iframe[data-go-demo-iframe]"),
	);
	for (const iframe of [...bound.keys()]) {
		if (!live.has(iframe) || !iframe.isConnected) {
			unbindIframe(iframe);
		}
	}
	for (const iframe of live) {
		bindIframe(iframe);
	}
}

function onSwupReplace(): void {
	syncIframes();
}

export function initGoDemoEmbeds(): void {
	if (started) {
		syncIframes();
		return;
	}
	started = true;
	window.addEventListener("message", onMessage);

	syncIframes();
	window.addEventListener("resize", () => {
		for (const iframe of bound.keys()) {
			requestMeasure(iframe);
		}
	});

	const swup = window.swup;
	if (swup?.hooks) {
		swup.hooks.on("content:replace", onSwupReplace);
		swup.hooks.on("page:view", onSwupReplace);
	} else {
		document.addEventListener("swup:enable", () => {
			const next = window.swup;
			if (!next?.hooks) return;
			next.hooks.on("content:replace", onSwupReplace);
			next.hooks.on("page:view", onSwupReplace);
		});
	}
}
