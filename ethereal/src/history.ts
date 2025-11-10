export class History {
    history: string[] = [];
    idx: number = -1;

    addToHistory(url: string) {
        if (this.getCurrent() === url) return;
        this.idx += 1;
        if (this.history.length !== 0) this.history = this.history.slice(0, this.idx);
        this.history.push(url);
    }

    getCurrent(): string | null {
        return this.history[this.idx];
    }

    goForward(): string | null {
        if (this.idx >= this.history.length - 1) return null;
        this.idx += 1;
        return this.getCurrent();
    }

    goBackward(): string | null {
        if (this.idx <= 0) return null;
        this.idx -= 1;
        return this.getCurrent();
    }
}