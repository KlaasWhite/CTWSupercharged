import Manager from "../Managers/Manager";

export default abstract class Page {
    constructor(protected manager: Manager) {}

    public abstract get url(): string;
    public abstract get pageType(): "Normal" | "Authorised" | "Admin";

    public render(): void {
        this.registerEventListeners();
    }

    public registerEventListeners(): void {}

    public abstract onDestroy(): void;

    protected registerClickToNavigateEventListener(
        elementId: string,
        page: Page,
        setType: "none" | "push" | "replace" = "push"
    ) {
        this.registerClickEventListener(elementId, () =>
            this.manager.pageManager.setPage(page, setType)
        );
    }

    protected registerClickEventListener(
        elementId: string,
        callBack: (event: Event) => void
    ): boolean {
        return this.registerEventListener(elementId, "click", callBack);
    }

    protected registerEventListener(
        elementId: string,
        method: string,
        callBack: (event: Event) => void
    ): boolean {
        const element = document.getElementById(elementId);
        if (!element) return false;
        element.addEventListener(method, callBack);
        return true;
    }

    protected displayOnRoot(htmlString: string): void {
        this.displayOnCertainElement(htmlString, "app");
    }

    protected displayOnPopup(htmlString: string): void {
        this.displayOnCertainElement(htmlString, "popup");
    }

    protected displayOnCertainElement(
        htmlString: string,
        elementId: string
    ): void {
        document.getElementById(elementId)!.innerHTML = htmlString;
    }
}
