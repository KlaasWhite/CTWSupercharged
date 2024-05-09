import Page from "../Page";

import "./Admin.css";
import AdminChangelogPage from "./Changelog/AdminChangelogPage";
import AdminClassesGamePage from "./Species/AdminSpeciesPage";
import AdminStartGamePage from "./AdminStartGamePage";

export default class AdminPage extends Page {
    public get pageType(): "Normal" | "Authorised" | "Admin" {
        return "Admin";
    }

    public get url(): string {
        return `/admin`;
    }

    public override render() {
        let mainHtmlString = `
            <div id="admin">
                <button id="admin-edit-species-button" style="grid-column: 1; grid-row: 1">
                    Edit species
                </button>
                <button id="admin-changelog-button" style="grid-column: 2; grid-row: 1">
                    Changelog
                </button>
                <button id="admin-start-game-button" style="grid-column: 1; grid-row: 2">
                    Start game
                </button>
                <button id="admin-users-button" style="grid-column: 2; grid-row: 2">
                    Users
                </button>
            </div>
        `;

        this.displayOnRoot(mainHtmlString);

        super.render();
    }

    public override registerEventListeners(): void {
        this.registerClickToNavigateEventListener(
            "admin-start-game-button",
            new AdminStartGamePage(this.manager)
        );
        this.registerClickToNavigateEventListener(
            "admin-edit-species-button",
            new AdminClassesGamePage(this.manager)
        );
        this.registerClickToNavigateEventListener(
            "admin-changelog-button",
            new AdminChangelogPage(this.manager)
        );
    }

    public onDestroy(): void {
        throw new Error("Method not implemented.");
    }
}
