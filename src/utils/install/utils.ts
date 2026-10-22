// How this device can put Faísca on the home screen. prompt: the browser offers its own install dialog (Chromium).
// share-menu: Safari and the other iOS browsers, through Share → «Adicionar ao ecrã principal». browser-menu: an
// Android browser that has not offered the dialog yet. none: already installed, or a desktop without the dialog.
export type InstallMethod = "prompt" | "share-menu" | "browser-menu" | "none";

export interface InstallContext {
    isStandalone: boolean;
    isInstalled: boolean;
    canPrompt: boolean;
    userAgent: string;
    maxTouchPoints: number;
}

export class InstallUtils {
    public static getMethod(context: InstallContext): InstallMethod {
        if (context.isStandalone || context.isInstalled) {
            return "none";
        }
        if (context.canPrompt) {
            return "prompt";
        }
        if (this.isAppleMobile(context.userAgent, context.maxTouchPoints)) {
            return "share-menu";
        }
        if (context.userAgent.includes("Android")) {
            return "browser-menu";
        }
        return "none";
    }

    // iPadOS asks for desktop sites by default, so an iPad reports itself as a Mac that has a touch screen.
    public static isAppleMobile(userAgent: string, maxTouchPoints: number): boolean {
        if (/iPhone|iPad|iPod/.test(userAgent)) {
            return true;
        }
        return userAgent.includes("Macintosh") && maxTouchPoints > 1;
    }
}
