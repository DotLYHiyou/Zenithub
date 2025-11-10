<script lang="ts">
    import proxyManager from "./proxy.svelte";
    import { onEnterKeyPressed } from "./util";
    import { History } from "./history";

    let { iframe }: { iframe: HTMLIFrameElement } = $props();

    let isNavbarOpen = $state(false);
    let urlBar: HTMLInputElement = $state();

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

<svelte:window onblur={() => (isNavbarOpen = false)} />

<div
    class="fixed top-0 {isNavbarOpen
        ? 'w-screen'
        : 'right-0 pointer-events-none'} flex flex-row gap-1 z-50 p-2"
>
    {#if isNavbarOpen}
        <div>
            <button
                class="btn btn-square"
                title="Back"
                onclick={() => setUrl(proxyHistory.goBackward())}
            >
                ￩
            </button>
            <button
                class="btn btn-square"
                title="Forward"
                onclick={() => setUrl(proxyHistory.goForward())}
            >
                ￫
            </button>
            <button
                class="btn btn-square"
                title="Reload"
                onclick={() => iframe.contentWindow.location.reload()}
            >
                ⟳
            </button>
        </div>
        <input
            type="text"
            class="input flex grow-1"
            value={proxyManager.url}
            onkeydown={onEnterKeyPressed(() => {
                proxyManager.setDestination(urlBar.value);
                proxyManager.reloadIframe();
            })}
            {@attach (urlBar: HTMLInputElement) => {
                urlBar.focus();
                urlBar.select();
            }}
            bind:this={urlBar}
            placeholder="Enter a URL or search the web"
            title="URL Bar"
        />
        <div>
            <button
                class="btn btn-square"
                title="Close proxy"
                onclick={() => (proxyManager.isProxyOpen = false)}
            >
                ×
            </button>
            <button
                class="btn btn-square"
                title="Close navbar"
                onclick={() => (isNavbarOpen = false)}
            >
                ↑
            </button>
        </div>
    {:else}
        <button
            class="btn btn-square pointer-events-auto"
            title="Open navbar"
            onclick={() => {
                isNavbarOpen = true;
            }}
        >
            ↓
        </button>
    {/if}
</div>
