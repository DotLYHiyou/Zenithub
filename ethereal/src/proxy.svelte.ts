import { BareMuxConnection } from "@mercuryworkshop/bare-mux";
import ProxyComponent from "./Proxy.svelte";
import config from "./config.svelte";
import { httpUrlToWebSocket } from "./util";
import autoProxyProber from "./prober.svelte";
import { adBlocklist } from "./adBlocklist";

let iframeHasLoaded = $state(true);
let proxyStarted = $state(false);

interface UvConfig {
    prefix: string;
    encodeUrl: (s: string) => string;
    decodeUrl: (s: string) => string;
    handler: string;
    client: string;
    bundle: string;
    config: string;
    sw: string;
    stockSW: string;
    loc: string;
}

export class ServiceWorkerConfig {
    blocklist: Set<string> = new Set();

    constructor(adblock: boolean) {
        if (adblock) this.blocklist = new Set(adBlocklist);
    }
}

export class ProxyManager {
    // set in index.html
    uvConfig: UvConfig;
    bareMuxConnection: BareMuxConnection;
    swBroadcastChannel: BroadcastChannel;
    serviceWorker: ServiceWorker | null = $state(null);

    constructor() {
        this.swBroadcastChannel = new BroadcastChannel("UvServiceWorker");
        this.swBroadcastChannel.addEventListener("message", (() => {
            navigator.serviceWorker.getRegistration(this.uvConfig.sw).then(((sw: ServiceWorkerRegistration) => {
                this.serviceWorker = sw.active;
                this.updateSWConfig(new ServiceWorkerConfig(config.adblock));
            }).bind(this));
        }).bind(this));
    }

    async initializeProxy() {
        this.bareMuxConnection = new BareMuxConnection(this.uvConfig.loc + "/baremux/worker.js");
        await this.registerSW();
        await this.setProxyServer(this.proxyUrl);
    }

    async setProxyServer(proxyUrl: string) {
        if (proxyUrl == "") return;
        const loc = this.uvConfig.loc;

        if (config.useBare) {
            this.bareMuxConnection.setTransport(loc + "/baremod/index.mjs", [
                proxyUrl
            ]);
        } else {
            // set to websocket protocol
            this.bareMuxConnection.setTransport(loc + "/libcurl/index.mjs", [
                { wisp: httpUrlToWebSocket(proxyUrl) },
            ]);
        }
    }

    // set when ProxyComponent loads
    proxyComponent: ProxyComponent | undefined;

    isProxyOpen: boolean = $state(false);
    
    url: string = $state("");
    iframeUrl: string = $state("");
    reloadIframe() {
        this.iframeUrl = this.uvConfig.prefix + this.uvConfig.encodeUrl(this.url);
    }

    proxyUrl = $derived.by(() => {
        if (config.useBare) {
            if (config.bareSelectedProxy === "auto") return autoProxyProber.bareUrl;
            else if (config.bareSelectedProxy === "custom") return config.bareCustomProxy;
            else return config.bareSelectedProxy;
        } else {
            if (config.wispSelectedProxy === "auto") return autoProxyProber.wispUrl;
            else if (config.wispSelectedProxy === "custom") return config.wispCustomProxy;
            else return config.wispSelectedProxy;
        }
    });

    setDestination(destination: string) {
        if (destination === "") {
            this.url = "https://duckduckgo.com";
            return;
        }
        if (!destination.includes(".") || destination.includes(" ")) {
            this.url =
                "https://duckduckgo.com/?q=" + destination;
            return;
        }
        if (
            !destination.startsWith("https://") &&
            !destination.startsWith("http://")
        ) {
            this.url = "https://" + destination;
            return;
        }
        this.url = destination;
    }

    async registerSW() {
        if (!navigator.serviceWorker) {
            if (
                location.protocol !== "https:" &&
                !["localhost", "127.0.0.1"].includes(location.hostname)
            )
                throw new Error(
                    "Service workers cannot be registered without https.",
                );

            throw new Error("Your browser doesn't support service workers.");
        }

        let sw = await navigator.serviceWorker.register(this.uvConfig.stockSW);
        if (sw.active) {
            this.serviceWorker = sw.active;
            this.updateSWConfig(new ServiceWorkerConfig(config.adblock));
        }
    }

    async updateSWConfig(cfg: ServiceWorkerConfig) {
        if (!this.serviceWorker) return;
        this.serviceWorker.postMessage(cfg);
    }

    startProxy(destinationInput: string): boolean {
        if (proxyManager.proxyUrl === "" || !proxyManager.serviceWorker)
            return false;
    
        proxyManager.setDestination(destinationInput);
        proxyManager.isProxyOpen = true;
        console.log("States updated")
        proxyManager.reloadIframe();
    
        return true;
    }
}

const proxyManager = $state(new ProxyManager());
export default proxyManager;