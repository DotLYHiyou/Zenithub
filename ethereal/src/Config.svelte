<script lang="ts">
    import config, { saveConfig } from "./config.svelte";
    import { bareProxyUrls, wispProxyUrls, themes } from "./ethereal";
    import proxyManager, { ServiceWorkerConfig } from "./proxy.svelte";

    let { isConfigOpen = $bindable() }: { isConfigOpen: boolean } = $props();
    let modalElement: HTMLDialogElement = $state();

    $effect(() => {
        saveConfig(config);
    });

    $effect(() => {
        if (isConfigOpen) {
            modalElement.showModal();
        } else {
            modalElement.close();
        }
    });

    $effect(() => {
        proxyManager.updateSWConfig(new ServiceWorkerConfig(config.adblock));
    });

    if (document.title) {
        document.title = localStorage.getItem("tabTitle") || "ethereal";
    }

    const faviconElement =
        document.querySelector<HTMLLinkElement>('link[rel="icon"]');

    if (faviconElement) {
        faviconElement.href = localStorage.getItem("faviconUrl") || "logo.png";
    }

    let titleInput;
    let faviconInput;

    if (titleInput && faviconInput) {
        titleInput.value = localStorage.getItem("tabTitle");
        faviconInput.value = localStorage.getItem("faviconUrl");
    }

    if (document) {
        window.document.documentElement.style.setProperty("--color-blue-500", localStorage.getItem("theme") || "#2b7fff")
        window.document.documentElement.style.setProperty("--color-slate-950", localStorage.getItem("bgColor") || "#0d1117")
    }
</script>

<dialog
    class="modal z-50 rounded-2xl"
    bind:this={modalElement}
    onclose={() => (isConfigOpen = false)}
>
    <div
        class="modal-box flex flex-col items-center gap-5 h-7/8 rounded-3xl bg-zinc-900"
    >
        <p class="text-4xl font-extrabold mt-4">preferences</p>
        <div class="flex flex-col items-center grow-1 justify-center w-1/1">
            <div class="grid grid-cols-2 gap-5 w-1/1">
                <p class="flex items-center justify-center">wisp or bare?</p>
                <div class="dropdown rounded-xl">
                    <div
                        tabindex="0"
                        role="button"
                        class="btn w-1/1 rounded-xl bg-zinc-800 shadow-none border-none hover:shadow-none hover:border-none hover:bg-zinc-700 transition-all"
                    >
                        {config.useBare ? "Bare" : "Wisp"}
                    </div>
                    <ul
                        class="dropdown-content menu bg-zinc-800 rounded-xl p-2 shadow-transparent w-1/1"
                    >
                        <li>
                            <button
                                onclick={() => {
                                    config.useBare = false;
                                    (
                                        document.activeElement as HTMLElement
                                    ).blur();
                                }}>wisp</button
                            >
                        </li>
                        <li>
                            <button
                                onclick={() => {
                                    config.useBare = true;
                                    (
                                        document.activeElement as HTMLElement
                                    ).blur();
                                }}>bare</button
                            >
                        </li>
                    </ul>
                </div>
                <p class="flex items-center justify-center">wisp/bare server</p>
                <div class="dropdown rounded-xl shadow-transparent bg-zinc-800 shadow-none border-none hover:shadow-none hover:border-none transition-all">
                    <div
                        tabindex="0"
                        role="button"
                        class="btn w-1/1 shadow-transparent rounded-xl bg-zinc-800 shadow-none border-none hover:shadow-none hover:border-none hover:bg-zinc-700 transition-all"
                    >
                        {config.useBare
                            ? bareProxyUrls[config.bareSelectedProxy]
                            : wispProxyUrls[config.wispSelectedProxy]}
                    </div>
                    <ul
                        class="dropdown-content rounded-xl menu bg-zinc-800 rounded-box p-2 w-1/1 block overflow-y-scroll max-h-30"
                    >
                        {#each Object.entries(config.useBare ? bareProxyUrls : wispProxyUrls) as [proxyUrl, proxyName]}
                            <li>
                                <button
                                    onclick={() => {
                                        if (config.useBare) {
                                            config.bareSelectedProxy = proxyUrl;
                                        } else {
                                            config.wispSelectedProxy = proxyUrl;
                                        }
                                        (
                                            document.activeElement as HTMLElement
                                        ).blur();
                                    }}>{proxyName}</button
                                >
                            </li>
                        {/each}
                    </ul>
                </div>
                {#if (config.useBare ? config.bareSelectedProxy : config.wispSelectedProxy) === "custom"}
                    <p class="flex items-center justify-center">
                        custom proxy url
                    </p>
                    <input
                        class="input w-1/1 text-center bg-zinc-800 rounded-xl"
                        bind:value={
                            () =>
                                config.useBare
                                    ? config.bareCustomProxy
                                    : config.wispCustomProxy,
                            (v) => {
                                if (config.useBare) {
                                    config.bareCustomProxy = v;
                                } else {
                                    config.wispCustomProxy = v;
                                }
                            }
                        }
                    />
                {/if}
                <p class="flex items-center justify-center">adblock</p>
                <div class="flex items-center justify-center">
                    <input
                        type="checkbox"
                        class="checkbox outline-2 outline-white"
                        bind:checked={config.adblock}
                    />
                </div>
                <p class="flex items-center justify-center">custom tab title</p>
                <div class="flex items-center justify-center">
                    <input
                        class="input w-1/1 text-center bg-zinc-800 rounded-xl"
                        onkeyup={(e) => {
                            document.title = (
                                e.target as HTMLInputElement
                            ).value;
                            localStorage.setItem(
                                "tabTitle",
                                (e.target as HTMLInputElement).value,
                            );
                        }}
                        bind:this={titleInput}
                    />
                </div>
                <p class="flex items-center justify-center">favicon url</p>
                <div class="flex items-center justify-center">
                    <input
                        class="input w-1/1 text-center bg-zinc-800 rounded-xl"
                        onkeyup={(e) => {
                            if (faviconElement) {
                                faviconElement.href = (
                                    e.target as HTMLInputElement
                                ).value;
                            }
                            localStorage.setItem(
                                "faviconUrl",
                                (e.target as HTMLInputElement).value,
                            );
                        }}
                        bind:this={faviconInput}
                    />
                </div>
                <p class="flex items-center justify-center">about:blank</p>
                <div class="flex items-center justify-center">
                    <button
                        class="btn rounded-xl bg-zinc-800 w-full shadow-none border-none hover:shadow-none hover:border-none hover:bg-zinc-700 transition-all"
                        onclick={() => {
                            var win = window.open()
                            const url = window.location.href || "https://etherealproxy.netlify.app"

                            win.document.body.style.margin = 0
                            win.document.body.style.height = "100vh"
                            var iframe = win.document.createElement('iframe')
                            iframe.style.border = "none"
                            iframe.style.width = "100%"
                            iframe.style.height = "100vh"
                            iframe.style.margin = 0
                            iframe.src = url 
                            win.document.body.appendChild(iframe)
                        }}>open a:b</button
                    >
                </div>
                <p class="flex items-center justify-center">theme</p>
                <div class="dropdown rounded-xl shadow-transparent bg-zinc-800 shadow-none border-none hover:shadow-none hover:border-none transition-all">
                    <div
                        tabindex="0"
                        role="button"
                        class="btn w-1/1 shadow-transparent rounded-xl bg-zinc-800 shadow-none border-none hover:shadow-none hover:border-none hover:bg-zinc-700 transition-all"
                    >
                        { localStorage.getItem("themeName") || "default blue" }
                    </div>
                    <ul
                        class="dropdown-content rounded-xl menu bg-zinc-800 rounded-box p-2 w-1/1 block overflow-y-scroll max-h-30"
                    >
                        {#each Object.entries(themes) as [name, [hex, bg]]}
                            <li>
                                <button
                                    onclick={() => { 
                                        window.document.documentElement.style.setProperty("--color-blue-500", hex);
                                        window.document.documentElement.style.setProperty("--color-slate-950", bg);
                                        localStorage.setItem("theme", hex)
                                        localStorage.setItem("themeName", name)
                                        localStorage.setItem("bgColor", bg)
                                        window.location.reload()
                                    }}>{name}</button
                                >
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>
        </div>
        <button
            class="btn rounded-xl bg-zinc-800 shadow-none border-none hover:shadow-none hover:border-none hover:scale-105 transition-all"
            onclick={() => (isConfigOpen = false)}>close</button
        >
    </div>
    <form method="dialog" class="modal-backdrop">
        <button onclick={() => (isConfigOpen = false)}>close</button>
    </form>
</dialog>
