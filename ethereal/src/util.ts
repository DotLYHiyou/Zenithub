export function httpUrlToWebSocket(url: string): string {
    if (url === "") return "";
    let urlObj = new URL(url);
    urlObj.protocol = urlObj.protocol === "http:" ? "ws:" : "wss:";
    return urlObj.toString();
}

export function onEnterKeyPressed(func: () => void): (ev: KeyboardEvent) => void {
    return (ev: KeyboardEvent) => {
        if (ev.key === "Enter") {
            func();
        }
    };
}