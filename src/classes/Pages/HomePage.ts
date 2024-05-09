import Page from "./Page";

import "./Home.css";
import {
    enableEventListenersOnSpecieDisplay,
    getSpecieDisplay,
    getDisplayForSpecie,
} from "../components/SpecieDisplay";
import {
    Specie,
    specieTypeToColour,
} from "../Managers/DataManagers.ts/SpecieDataManager";
import Manager from "../Managers/Manager";

export default class HomePage extends Page {
    public get pageType(): "Normal" | "Authorised" | "Admin" {
        return "Normal";
    }

    public get url(): string {
        return `/`;
    }

    public override render() {
        if (this.manager.specieDataManager.dataLoaded) {
            this._renderSpecies();
        } else {
            this.manager.specieDataManager.loadData();
            this.displayOnRoot("Loading");
            this.manager.specieDataManager.addToQueue(this._renderSpecies);
        }

        super.render();
    }

    public override registerEventListeners(): void {}

    public override onDestroy() {
        this.manager.specieDataManager.removeFromQueue(this._renderSpecies);
        this.manager.changelogDataManager.removeFromQueue(
            this._displayChangeLog
        );
    }

    constructor(manager: Manager, private _changelogExpanded = false) {
        super(manager);
    }

    private readonly _showSpecieData = (event: MouseEvent, specie: Specie) => {
        const target = event.currentTarget as HTMLElement;
        const locX = target.getBoundingClientRect().left;
        const viewPortWidth = document
            .querySelector<HTMLDivElement>(`#body`)!
            .getBoundingClientRect().width;
        const viewPortHeight = document
            .querySelector<HTMLDivElement>(`#body`)!
            .getBoundingClientRect().height;

        const left = locX > viewPortWidth / 2;

        const locationLeft = left
            ? `left: ${locX - viewPortWidth * 0.4 - 100}px`
            : `left: ${locX + 150}px`;
        const locationTop = `top: ${viewPortHeight * 0.1}px`;

        const style = `
        style="
            width: ${viewPortWidth * 0.4}px; 
            height: ${viewPortHeight * 0.8}px;
            ${locationLeft};
            ${locationTop};
            border-color: ${specieTypeToColour(specie.type)};
        "
        `;

        document.querySelector<HTMLDivElement>(`#overlay`)!.innerHTML = `
                    <div id="overlay-box" ${style}>
                        <div id="overlay-box-internal">
                            ${getDisplayForSpecie(specie)}
                        </div>
                    </div>`;
    };

    private readonly _hideSpecieData = () => {
        document.querySelector<HTMLDivElement>(`#overlay`)!.innerHTML = ``;
    };

    private readonly _evaluateChangelog = (animation: boolean = true) => {
        document
            .querySelector<HTMLDivElement>(`#changelogs`)!
            .classList.add(
                this._changelogExpanded
                    ? "changelogs-expanded"
                    : "changelogs-collapsed"
            );
        document
            .querySelector<HTMLDivElement>(`#changelogs`)!
            .classList.remove(
                this._changelogExpanded
                    ? "changelogs-collapsed"
                    : "changelogs-expanded"
            );

        if (animation) {
            if (this._changelogExpanded) {
                document
                    .querySelector<HTMLDivElement>(`#changelogs`)!
                    .classList.add("changelogs-expanding");
                document
                    .querySelector<HTMLDivElement>(`#changelogs`)!
                    .classList.remove("changelogs-collapsing");
            } else {
                document
                    .querySelector<HTMLDivElement>(`#changelogs`)!
                    .classList.remove("changelogs-expanding");
                document
                    .querySelector<HTMLDivElement>(`#changelogs`)!
                    .classList.add("changelogs-collapsing");
            }

            !this._changelogExpanded &&
                document
                    .querySelector<HTMLDivElement>(`#changelogs`)!
                    .classList.add("changelogs-collapsing");
        }

        document.querySelector<HTMLDivElement>(
            `#changelogs-container`
        )!.innerHTML = "";

        document.querySelector<HTMLDivElement>(
            `#changelogs-container`
        )!.style.visibility = this._changelogExpanded ? "visible" : "hidden";

        if (this._changelogExpanded) {
            if (!this.manager.changelogDataManager.dataLoaded)
                this.manager.changelogDataManager.loadData();
            setTimeout(() => {
                this.manager.changelogDataManager.dataLoaded
                    ? this._displayChangeLog()
                    : this.manager.changelogDataManager.addToQueue(
                          this._displayChangeLog
                      );
            }, 500);
        }
    };

    private readonly _displayChangeLog = () => {
        const changelogs = this.manager.changelogDataManager
            .getChangelogs()
            .sort((first, second) => (first.release < second.release ? 1 : -1));

        let toShow = ``;

        changelogs.forEach((changelog) => {
            toShow += `
                <div class="changelog">
                    <span>${changelog.release.toDateString()}</span>
                    <div class="changelog-content">
                        ${changelog.changelog}
                    </div>
                </div>
            `;
        });

        document.querySelector<HTMLDivElement>(
            `#changelogs-container`
        )!.innerHTML = toShow;
    };

    private readonly _renderSpecies = () => {
        const species = this.manager.specieDataManager.getAllSpecies();

        const specieDisplay = getSpecieDisplay(species);

        let display = "";
        display += `
        <div id="changelogs" class="changelogs-collapsed">
            <div id="changelogs-button"><span>Changelog</span></div>
            <div id="changelogs-container"></div>
        </div>`;
        display += specieDisplay;
        display += `<div id="overlay"></div>`;

        this.displayOnRoot(display);

        enableEventListenersOnSpecieDisplay(
            species,
            this._showSpecieData,
            this._hideSpecieData,
            () => {}
        );

        this.registerClickEventListener("changelogs-button", () => {
            this._changelogExpanded = !this._changelogExpanded;
            this._evaluateChangelog();
        });

        this._evaluateChangelog(false);
    };
}
