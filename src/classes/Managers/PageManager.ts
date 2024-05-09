import EmptyPage from "../Pages/EmptyPage";
import HomePage from "../Pages/HomePage";
import Page from "../Pages/Page";
import Manager from "./Manager";

export default class PageManager {
    private _currentPage: Page;

    get currentPage(): Page {
        return this._currentPage;
    }

    private _setPageImmediatly(
        page: Page,
        setType: "none" | "push" | "replace"
    ) {
        this._currentPage = page;
        this._currentPage.render();
        if (setType === "push")
            history.pushState(null, "", this._currentPage.url);
        if (setType === "replace")
            history.replaceState(null, "", this._currentPage.url);
    }

    private _setAuthorisedPage(
        page: Page,
        setType: "none" | "push" | "replace"
    ) {
        if (this.manager.firebaseManager.user) {
            this._setPageImmediatly(page, setType);
        } else {
            this._setPageImmediatly(new HomePage(this.manager), "replace");
        }
    }

    private _setAdminPage(page: Page, setType: "none" | "push" | "replace") {
        if (
            this.manager.firebaseManager.user &&
            this.manager.firebaseManager.user.admin
        ) {
            this._setPageImmediatly(page, setType);
        } else {
            this._setPageImmediatly(new HomePage(this.manager), "replace");
        }
    }

    public setPage(page: Page, setType: "none" | "push" | "replace" = "none") {
        document.querySelector<HTMLDivElement>(`#app`)!.innerHTML = "";

        switch (page.pageType) {
            case "Normal":
                this._setPageImmediatly(page, setType);
                break;
            case "Authorised":
                if (!this.manager.firebaseManager.loadingUser) {
                    this._setAuthorisedPage(page, setType);
                } else {
                    this.manager.firebaseManager.onUserLoaded.push(() => {
                        this._setPageImmediatly(page, setType);
                    });
                }
                break;
            case "Admin":
                if (!this.manager.firebaseManager.loadingUser) {
                    this._setAdminPage(page, setType);
                } else {
                    this.manager.firebaseManager.onUserLoaded.push(() => {
                        this._setAdminPage(page, setType);
                    });
                }
                break;
        }
    }

    constructor(private manager: Manager) {
        this._currentPage = new EmptyPage(manager);
    }
}
