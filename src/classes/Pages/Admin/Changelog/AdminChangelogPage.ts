import Page from "../../Page";

import "../Admin.css";
import "./AdminChangelogPage.css";
import AdminCreateNewConfigPage from "../Config/AdminCreateNewConfigPage";
import AdminCreateChangelogPage from "./AdminCreateChangelogPage";

export default class AdminChangelogPage extends Page {
    public get pageType(): "Normal" | "Authorised" | "Admin" {
        return "Admin";
    }

    public get url(): string {
        return `/admin/changelog`;
    }

    private readonly _renderChangelogs = () => {
        const changelogs = this.manager.changelogDataManager
            .getChangelogs()
            .sort((first, second) => (first.release < second.release ? 1 : -1));

        let toView = "";

        toView += `
            <div id="admin-changelog-new">
                <div id="admin-changelog-new-text">
                    Add new
                </div>
            </div>
            `;

        changelogs.forEach((changelog) => {
            toView += `
            <div class="admin-changelog-item-container">
                <div class="admin-changelog-item">
                    <div class="admin-changelog-item-title"><span>${changelog.release.toDateString()}</span></div>
                    <div id="admin-changelog-item-garbage-${
                        changelog.id
                    }" class="admin-changelog-item-garbage"><span>Remove</span></div>
                </div>
            </div>
            `;
        });

        this.displayOnRoot(toView);

        const configButtonsCollection = document.getElementsByClassName(
            "config-select-button"
        );

        for (let changelog of changelogs) {
            this.registerClickEventListener(
                `admin-changelog-item-garbage-${changelog.id}`,
                async () => {
                    var succeeded =
                        await this.manager.changelogDataManager.removeChangelog(
                            changelog.id
                        );
                    if (succeeded) this.render();
                }
            );
        }
        for (let i = 0; i < configButtonsCollection.length; i++) {
            configButtonsCollection[i].addEventListener("click", () => {});
        }

        this.registerClickToNavigateEventListener(
            "admin-changelog-new",
            new AdminCreateChangelogPage(this.manager)
        );
    };

    public override render() {
        if (this.manager.changelogDataManager.dataLoaded) {
            this._renderChangelogs();
        } else {
            this.manager.changelogDataManager.loadData();
            this.displayOnRoot("Loading");
            this.manager.changelogDataManager.addToQueue(
                this._renderChangelogs
            );
        }

        super.render();
    }

    public override onDestroy() {
        this.manager.draftConfigDataManager.removeFromQueue(
            this._renderChangelogs
        );
    }
}
