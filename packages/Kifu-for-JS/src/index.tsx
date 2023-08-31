import { autorun, reaction, when } from "mobx";
import { observer } from "mobx-react";
import * as React from "react";
import { render } from "react-dom";
import KifuStoreS, { IOptions } from "./common/stores/KifuStore";
import { parseOptionsFromAttributes } from "./common/stores/setupKifuStore";
import KifuLiteComponent from "./lite/KifuLite";
import { registry } from "./lite/KifuRegistry";
import { onDomReady } from "./utils/util";

const mobx = { autorun, when, reaction };
const mobxReact = { observer };
const KifuLite = KifuLiteComponent;
const KifuStore = KifuStoreS;

export { KifuLite, KifuStore, mobx, mobxReact };

/**
 * @deprecated Use load instead
 */
export function loadString(kifu: string, idOrOptions?: string | IOptions, options?: IOptions): Promise<KifuStoreS> {
    let id: string | undefined;
    if (typeof idOrOptions === "object") {
        options = idOrOptions;
        id = undefined;
    } else {
        id = idOrOptions;
        options = options || {};
    }
    options.kifu = kifu;
    return loadCommon(id, options);
}

export function load(options: IOptions, id: string): Promise<KifuStoreS>;
// Below are compatibility with v4 or less
export function load(filePath: string, id: string): Promise<KifuStoreS>;
export function load(filePath: string, id: string, options: IOptions): Promise<KifuStoreS>;
export function load(filePath: string): Promise<KifuStoreS>;
export function load(filePath: string, options: IOptions): Promise<KifuStoreS>;
export function load(
    filePathOrOptions: string | IOptions,
    idOrOptions?: string | IOptions,
    options?: IOptions,
): Promise<KifuStoreS> {
    let id: string | undefined;
    if (typeof filePathOrOptions === "string") {
        if (typeof idOrOptions === "object") {
            options = idOrOptions;
            id = undefined;
        } else {
            id = idOrOptions;
            options = options || {};
        }
        options.src = filePathOrOptions;
    } else {
        options = filePathOrOptions;
        id = idOrOptions as string;
    }
    return loadCommon(id, options);
}

/**
 * Load a kifu into a given container, or create a new container if id is not specified, when DOM is ready.
 */
function loadCommon(id: string | undefined, options: IOptions | undefined): Promise<KifuStoreS> {
    return new Promise((resolve) => {
        if (!id) {
            id = "kifuforjs_" + Math.random().toString(36).slice(2);
            document.write("<div id='" + id + "'></div>");
        }
        onDomReady(() => {
            const container = document.getElementById(id);
            const kifuStore = loadSingle(options, container!);
            registry.register(container!, kifuStore);
            resolve(kifuStore);
        });
    });
}

/**
 * Load a kifu into a container.
 */
function loadSingle(options: IOptions, container: HTMLElement) {
    const kifuStore = new KifuStore(options);
    render(<KifuLite kifuStore={kifuStore} />, container);

    return kifuStore;
}

export function getKifuStore(element: HTMLElement) {
    return registry.getKifuStore(element);
}

// Load kifu from script tags
if (typeof document !== "undefined") {
    onDomReady(() => {
        const scripts = document.getElementsByTagName("script");
        for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            if (script.type === "text/kifu" && !script.dataset.loaded) {
                // ideally svg is directly injected, but it's not possible to do that with React
                // Render svg inside ins element here.
                try {
                    const container = document.createElement("ins");
                    script.insertAdjacentElement("afterend", container);
                    script.dataset.loaded = "true";

                    const options = parseOptionsFromAttributes(script);
                    const kifuStore = loadSingle(options, container);
                    registry.register(script, kifuStore);
                } catch (e) {
                    console.error(e, script);
                }
            }
        }
    });
}
