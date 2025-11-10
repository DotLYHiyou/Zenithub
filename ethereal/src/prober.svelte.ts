import { bareProxyUrls, wispProxyUrls } from "./ethereal";
import config from "./config.svelte";

class Prober {
    public wispUrl: string = $state("");
    public bareUrl: string = $state("");

    public async probeBare() {
        let proxyDetectPromises: Promise<string>[] = [];
        for (const proxy in bareProxyUrls) {
            let url = proxy;
            if (url === "auto" || url === "custom") continue;
            proxyDetectPromises.push(
                new Promise((res, rej) => {
                    setTimeout(() => {
                        rej("Failed to fetch bare on " + url);
                    }, config.probeTimeout);
                    fetch(url).then((rsp) => {
                        if (rsp.status == 200) {
                            res(url);
                        } else {
                            rej(
                                "Bare returned error code " +
                                    rsp.status +
                                    " on url " +
                                    url,
                            );
                        }
                    });
                }),
            );
        }
        await Promise.any(proxyDetectPromises).then((res) => {
            this.bareUrl = res;
        });
    }

    public async probeWisp() {
        let proxyDetectPromises: Promise<string>[] = [];
        for (const proxy in wispProxyUrls) {
            let url = proxy;
            if (url === "auto" || url === "custom") continue;
            proxyDetectPromises.push(
                new Promise((res, rej) => {
                    const socket = new WebSocket(url);
                    setTimeout(() => {
                        if (socket.readyState == WebSocket.OPEN) {
                            socket.close();
                            res(url);
                        } else {
                            socket.close();
                            rej("Failed to open websocket on " + url);
                        }
                    }, config.probeTimeout);
                    socket.onopen = () => {
                        socket.close();
                        res(url);
                    };
                }),
            );
        }
        await Promise.any(proxyDetectPromises).then((res) => {
            this.wispUrl = res;
        });
    }
}

const autoProxyProber = $state(new Prober());
export default autoProxyProber;