import Page from "../Page";

import "./Admin.css";
import AdminCreateNewConfigPage from "./Config/AdminCreateNewConfigPage";

export default class AdminStartGamePage extends Page {
    public get pageType(): "Normal" | "Authorised" | "Admin" {
        return "Admin";
    }

    public get url(): string {
        return `/admin/start`;
    }

    private readonly _renderConfigs = () => {
        let htmlString = "<table>";
        const configs = this.manager.draftConfigDataManager.getAllConfigs();

        configs.forEach((config) => {
            htmlString += `
                <tr>
                    <td>
                        <button id="config-select-button-${config.uid}" class="config-select-button">
                            ${config.name}
                        </button>
                    </td>
                </tr>
            `;
        });

        htmlString += `
                <tr>
                    <td>
                        <button id="config-create-button">
                            Create new config
                        </button>
                    </td>
                </tr>
            `;
        htmlString += "</table>";

        this.displayOnRoot(htmlString);

        const configButtonsCollection = document.getElementsByClassName(
            "config-select-button"
        );
        for (let i = 0; i < configButtonsCollection.length; i++) {
            configButtonsCollection[i].addEventListener("click", () => {});
        }

        this.registerClickToNavigateEventListener(
            "config-create-button",
            new AdminCreateNewConfigPage(this.manager)
        );
    };

    public override render() {
        if (this.manager.draftConfigDataManager.dataLoaded) {
            this._renderConfigs();
        } else {
            this.manager.draftConfigDataManager.loadData();
            this.displayOnRoot("Loading");
            this.manager.draftConfigDataManager.addToQueue(this._renderConfigs);
        }

        super.render();
    }

    public override onDestroy() {
        this.manager.draftConfigDataManager.removeFromQueue(
            this._renderConfigs
        );
    }
}
