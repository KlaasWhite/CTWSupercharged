import Page from "./Page";

export default class EmptyPage extends Page {
    public get url(): string {
        throw new Error("Method not implemented.");
    }
    public get pageType(): "Normal" | "Authorised" | "Admin" {
        throw new Error("Method not implemented.");
    }

    public override render(): void {
        throw new Error("Method not implemented.");
    }
    public override registerEventListeners(): void {
        throw new Error("Method not implemented.");
    }
    public onDestroy(): void {
        throw new Error("Method not implemented.");
    }
}
