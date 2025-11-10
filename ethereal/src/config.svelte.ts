class SaveableConfig {
    configVersion: number;
    useBare: boolean;
    wispSelectedProxy: string;
    wispCustomProxy: string;
    bareSelectedProxy: string;
    bareCustomProxy: string;
    probeTimeout: number;
    adblock: boolean;
}

export class Config {
    // config version (incrementing forces a config rewrite)
    public configVersion: number = $state(2);
    // whether to use bare or wisp
    public useBare: boolean = $state(false);
    // these 4 are pretty self explanatory
    public wispSelectedProxy: string = $state("auto");
    public wispCustomProxy: string = $state("");
    public bareSelectedProxy: string = $state("auto");
    public bareCustomProxy: string = $state("");
    public tabTitle: string = $state("")
    public theme: string = $state("")
    // auto detect proxy timeout (ms)
    public probeTimeout: number = $state(5000);
    public adblock: boolean = $state(true);
}

export function saveConfig(cfg: Config): void {
    localStorage.setItem("config", JSON.stringify({
        configVersion: cfg.configVersion,
        useBare: cfg.useBare,
        wispSelectedProxy: cfg.wispSelectedProxy,
        wispCustomProxy: cfg.wispCustomProxy,
        bareSelectedProxy: cfg.bareSelectedProxy,
        bareCustomProxy: cfg.bareCustomProxy,
        probeTimeout: cfg.probeTimeout,
        adblock: cfg.adblock,
    }));
}

function loadConfig(): Config {
    const ret = new Config();
    let str = localStorage.getItem("config");
    if (str == null) {
        return ret;
    }
    let tmp = JSON.parse(str) as SaveableConfig;
    // overwrite old configs
    if (
        tmp.configVersion == undefined ||
        tmp.configVersion < ret.configVersion
    ) {
        return ret;
    }
    for (const prop in tmp) {
        ret[prop] = tmp[prop];
    }
    return ret;
}

const config = $state(loadConfig());
export default config;
