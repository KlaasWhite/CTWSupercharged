import Page from "../../Page";

import "../Admin.css";
import AdminChangelogPage from "./AdminChangelogPage";
import "./AdminChangelogPage.css";

export default class AdminCreateChangelogPage extends Page {
    public get pageType(): "Normal" | "Authorised" | "Admin" {
        return "Admin";
    }

    public get url(): string {
        return `/admin/changelog/create`;
    }

    private readonly onSubmit = async () => {
        const textarea = document.querySelector<HTMLTextAreaElement>(
            "#admin-changelog-create-textarea"
        );
        if (!textarea?.value) return;

        var succeeded = await this.manager.changelogDataManager.addChangelog(
            textarea.value
        );
        if (succeeded)
            this.manager.pageManager.setPage(
                new AdminChangelogPage(this.manager)
            );
    };

    public override render() {
        let toView = `
            <textarea id="admin-changelog-create-textarea" rows="40" cols="100"></textarea>
            <button id="admin-changelog-create-submit">Submit</button>
        `;

        this.displayOnRoot(toView);

        this.registerClickEventListener(
            `admin-changelog-create-submit`,
            this.onSubmit
        );

        super.render();
    }

    public override onDestroy() {}
}
