<script lang="ts">
    // App.svelte -- basically index.html
    import Config from "./Config.svelte";
    import Proxy from "./Proxy.svelte";
    import config from "./config.svelte";
    import proxyManager from "./proxy.svelte";
    import { onEnterKeyPressed } from "./util";
    import autoProxyProber from "./prober.svelte";
    import { History } from "./history";
    import {
        Search,
        Settings2,
        MessageCircleQuestionMark,
        RotateCw,
        ArrowRight,
        ArrowLeft,
        X
    } from "@lucide/svelte";

    $effect(() => {
        if (config.useBare && config.bareSelectedProxy === "auto") {
            autoProxyProber.probeBare();
        } else if (config.wispSelectedProxy === "auto") {
            autoProxyProber.probeWisp();
        }
    });

    let urlBar: HTMLInputElement = $state();

    $effect(() => {
        proxyManager.setProxyServer(proxyManager.proxyUrl);
    });

    let destinationInput = $state("");

    let isConfigOpen = $state(false);

    function startProxy() {
        if (proxyManager.startProxy(destinationInput)) {
            destinationInput = "";
            console.log("proxy started")
        }
    }

    let iframeHasLoaded = $state(false);
    let isProxyOpen = $state(false)

    let iframe: HTMLIFrameElement = $state();

    let searchbar: HTMLInputElement = $state()

    const iframeAllow =
        "accelerometer ambient-light-sensor attribution-reporting autoplay bluetooth browsing-topics camera compute-pressure " +
        "cross-origin-isolated display-capture document-domain encrypted-media fullscreen gamepad geolocation gyroscope hid " +
        "identity-credentials-get idle-detection local-fonts magnetometer microphone midi otp-credentials payment " +
        "picture-in-picture publickey-credentials-create publickey-credentials-get screen-wake-lock serial speaker-selection " +
        "storage-access usb web-share window-management xr-spatial-tracking";

    const iframeSandbox =
        "allow-popups allow-downloads allow-forms allow-modals allow-orientation-lock " +
        "allow-pointer-lock allow-presentation allow-same-origin allow-scripts allow-storage-access-by-user-activation";

    function onIframeLoad() {
        // idek how this can happen but apparently it can
        if (iframe == undefined) return;
        // do not set proxyManager.url if the iframe hasn't hooked into the manager yet
        const src = iframe.contentWindow.location.pathname;
        if (!src.includes(proxyManager.uvConfig.prefix)) return;

        iframeHasLoaded = true;
                    
        if (searchbar) {
            searchbar.value = proxyManager.url
            console.log("Set Value: " + proxyManager.url)
        }

        proxyManager.url = proxyManager.uvConfig.decodeUrl(
            src.slice(proxyManager.uvConfig.prefix.length),
        );
    }

    let proxyHistory = new History();
    $effect(() => {
        proxyHistory.addToHistory(proxyManager.url);
    });

    function setUrl(url: string | null) {
        if (url == null) return;
        proxyManager.url = url;
        proxyManager.reloadIframe();
    }
</script>

{#if proxyManager.isProxyOpen}
    <div>
        <iframe
            bind:this={iframe}
            title="Proxy"
            class="w-full h-[91vh] bg-transparent rounded-b-2xl shadow-lg shadow-black/20"
            src={proxyManager.iframeUrl}
            onload={onIframeLoad}
            allow={iframeAllow}
            sandbox={iframeSandbox}
        ></iframe>
    </div>
    <Config bind:isConfigOpen></Config>

    <div
        class="flex grow-1 bottom-0 fixed w-full bg-transparent h-[9%] items-center justify-center"
    >
    <button
            class="btn-circle bg-blue-500 p-2 text-sm m-0 ml-0 mr-2 cursor-pointer pointer-events-auto hover:brightness-75 transition-all"
            title="Previous Page"
            onclick={() => setUrl(proxyHistory.goBackward())}
            ><ArrowLeft class="scale-95 transition-all" /></button
        > 
    <button
            class="btn-circle bg-blue-500 p-2 text-sm m-0 ml-0 mr-2 cursor-pointer pointer-events-auto hover:brightness-75 transition-all"
            title="Next Page"
            onclick={() => setUrl(proxyHistory.goForward())}
            ><ArrowRight class="scale-95 transition-all" /></button
        >    
    <button
            class="btn-circle bg-blue-500 p-2 text-sm m-0 ml-0 mr-2 cursor-pointer pointer-events-auto hover:brightness-75 transition-all"
            title="Refresh Page"
            onclick={() => iframe.contentWindow.location.reload()}
            ><RotateCw class="scale-95 transition-all" /></button
        >
        <input
            type="text"
            class="input max-w-2/3 h-8 min-w-2/3 rounded-full focus:shadow-none focus:border-none focus:brightness-125 transition-all p-5 focus:outline-none outline-none border-none shadow-none"
            title="Destination URL"
            id="searchbar"
            placeholder="loading, please wait. this may take some time."
            bind:value={destinationInput}
            bind:this={searchbar}
            onkeydown={onEnterKeyPressed(startProxy)}
        />
        <span
            class="loading loading-spinner scale-75 loading-xl ml-[-3.5%] mb-[0%] mr-1.5 z-1000 transition-all" style="display: none;" bind:this={loader}>
        </span>
        <button
            class="btn-circle bg-blue-500 p-2 text-sm m-0 ml-2 cursor-pointer pointer-events-auto hover:brightness-75 transition-all"
            title="Start proxy"
            onclick={startProxy}
            disabled={proxyManager.proxyUrl === "" ||
                !proxyManager.serviceWorker}><Search class="scale-95" /></button
        >
        <button
            class="btn-circle bg-blue-500 p-2 text-sm m-0 ml-2 cursor-pointer pointer-events-auto hover:brightness-75 transition-all"
            title="Open Settings"
            onclick={() => (isConfigOpen = true)}
            ><Settings2 class="scale-95" /></button
        >
        <button
            class="btn-circle bg-blue-500 p-2 text-sm m-0 ml-2 cursor-pointer pointer-events-auto hover:brightness-75 transition-all"
            title="Get Help"
            onclick={window.open.bind(
                window,
                "https://github.com/adurite-network/ethereal/issues/new",
            )}><MessageCircleQuestionMark class="scale-95" /></button
        >
        <button
        class="btn-circle bg-red-500 p-2 text-sm m-0 ml-2 cursor-pointer pointer-events-auto hover:brightness-75 transition-all"
        title="End Proxy"
        onclick={() => (proxyManager.isProxyOpen = false)}><X class="scale-95" /></button
    >
    </div>
{:else}
    <Config bind:isConfigOpen></Config>

    <div
        class="flex grow-1 bottom-0 fixed w-full bg-transparent h-[9%] items-center justify-center"
    >
    <button
            class="btn-circle bg-blue-500 p-2 text-sm m-0 ml-0 mr-2 cursor-pointer pointer-events-auto hover:brightness-75 transition-all"
            title="Previous Page"
            onclick={() => setUrl(proxyHistory.goBackward())}
            ><ArrowLeft class="scale-95 transition-all" /></button
        > 
    <button
            class="btn-circle bg-blue-500 p-2 text-sm m-0 ml-0 mr-2 cursor-pointer pointer-events-auto hover:brightness-75 transition-all"
            title="Next Page"
            onclick={() => setUrl(proxyHistory.goForward())}
            ><ArrowRight class="scale-95 transition-all" /></button
        >    
    <button
            class="btn-circle bg-blue-500 p-2 text-sm m-0 ml-0 mr-2 cursor-pointer pointer-events-auto hover:brightness-75 transition-all"
            title="Refresh Page"
            onclick={() => iframe.contentWindow.location.reload()}
            ><RotateCw class="scale-95 transition-all" /></button
        >
        <input
            type="text"
            class="input max-w-2/3 h-8 min-w-2/3 rounded-full p-5 focus:outline-none focus:shadow-none focus:border-none focus:brightness-125 transition-all outline-none shadow-none border-none"
            title="Destination URL"
            placeholder="search anything..."
            onkeydown={onEnterKeyPressed(startProxy)}
            {@attach (urlBar: HTMLInputElement) => {
                urlBar.focus();
            }}
            bind:value={destinationInput}
        />
        <span
            class="loading loading-spinner scale-75 loading-xl ml-[-3.5%] mb-[0%] mr-1.5 z-1000 transition-all" style="display: none;" bind:this={loader}>
        </span>
        <button
            class="btn-circle bg-blue-500 p-2 text-sm m-0 ml-2 cursor-pointer pointer-events-auto hover:brightness-75 transition-all"
            title="Start proxy"
            onclick={startProxy}
            disabled={proxyManager.proxyUrl === "" ||
                !proxyManager.serviceWorker}><Search class="scale-95" /></button
        >
        <button
            class="btn-circle bg-blue-500 p-2 text-sm m-0 ml-2 cursor-pointer pointer-events-auto hover:brightness-75 transition-all"
            title="Open Settings"
            onclick={() => (isConfigOpen = true)}
            ><Settings2 class="scale-95" /></button
        >
        <button
            class="btn-circle bg-blue-500 p-2 text-sm m-0 ml-2 cursor-pointer pointer-events-auto hover:brightness-75 transition-all"
            title="Get Help"
            onclick={window.open.bind(
                window,
                "https://github.com/tenclips/ethereal/issues/new?template=bug-report.md",
            )}><MessageCircleQuestionMark class="scale-95" /></button
        >
    </div>
    <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-4/5 items-center text-center">
        <h1 class="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-300">ethereal</h1>
        <p>a sleek proxy with speed, design, and usability in mind.</p>
    </div>

{/if}
