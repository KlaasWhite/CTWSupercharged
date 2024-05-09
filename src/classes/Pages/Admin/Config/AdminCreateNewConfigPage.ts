import Page from "../../Page";

import "../Admin.css";

export default class AdminCreateNewConfigPage extends Page {
    public get pageType(): "Normal" | "Authorised" | "Admin" {
        return "Admin";
    }
    public get url(): string {
        return "/admin/config/create";
    }

    private readonly renderConfig = () => {};

    public override render() {
        if (this.manager.specieDataManager.dataLoaded) {
            this.renderConfig();
        } else {
            this.manager.draftConfigDataManager.loadData();
            this.displayOnRoot("Loading");
            this.manager.draftConfigDataManager.addToQueue(this.renderConfig);
        }

        super.render();
    }

    public override onDestroy() {
        this.manager.specieDataManager.removeFromQueue(this.renderConfig);
    }
}
