import { Specie } from "../../../Managers/DataManagers.ts/SpecieDataManager";
import {
    enableEventListenersOnSpecieDisplay,
    getSpecieDisplay,
} from "../../../components/SpecieDisplay";
import Page from "../../Page";

import AdminSpeciesEditPage from "./AdminSpeciesEditPage";

import "./AdminSpeciesPage.css";

export default class AdminSpeciesPage extends Page {
    public get pageType(): "Normal" | "Authorised" | "Admin" {
        return "Admin";
    }

    public get url(): string {
        return `/admin/species`;
    }

    private readonly _showSpecieName = (event: MouseEvent, specie: Specie) => {
        const target = event.currentTarget as HTMLElement;
        const locX = target.getBoundingClientRect().left;
        const locY = target.getBoundingClientRect().top;

        const viewPortWidth = document
            .querySelector<HTMLDivElement>(`#body`)!
            .getBoundingClientRect().width;
        const viewPortHeight = document
            .querySelector<HTMLDivElement>(`#body`)!
            .getBoundingClientRect().height;

        const left = locX > viewPortWidth / 2;

        const locationLeft = left
            ? `left: ${locX - viewPortWidth * 0.11}px`
            : `left: ${locX + 100}px`;
        const locationTop = `top: ${locY + 80 / 8}px`;

        const style = `
        style="
            width: ${viewPortWidth * 0.1}px; 
            height: ${viewPortHeight * 0.06}px; 
            ${locationLeft};
            ${locationTop};
        "
        `;

        document.querySelector<HTMLDivElement>(`#overlay`)!.innerHTML = `
                    <div id="admin-species-overlay-box" ${style}>
                        <div id="admin-species-overlay-box-internal">
                            <div id="admin-species-overlay-box-display">
                            ${specie.displayName}
                            </div>
                        </div>
                    </div>`;
    };

    private readonly _hideSpecieName = () => {
        document.querySelector<HTMLDivElement>(`#overlay`)!.innerHTML = ``;
    };

    private readonly _clickSpecieIcon = (event: MouseEvent, specie: Specie) => {
        event.preventDefault();
        this.manager.pageManager.setPage(
            new AdminSpeciesEditPage(this.manager, specie.name),
            "push"
        );
    };

    private readonly _renderClasses = () => {
        let html = `<div id="admin-specie-display">`;

        const species = this.manager.specieDataManager.getAllSpecies();

        if (species.length > 0) {
            html += getSpecieDisplay(species);

            html += `<div id="overlay"></div>`;
            html += `</div>`;
        }

        html += `<button id="admin-specie-new">Create new specie</button>`;

        this.displayOnRoot(html);

        if (species.length > 0)
            enableEventListenersOnSpecieDisplay(
                species,
                this._showSpecieName,
                this._hideSpecieName,
                this._clickSpecieIcon
            );

        document
            .getElementById("admin-specie-new")
            ?.addEventListener("click", () => {
                this.manager.pageManager.setPage(
                    new AdminSpeciesEditPage(this.manager, "new"),
                    "push"
                );
            });
    };

    public override render() {
        if (this.manager.specieDataManager.dataLoaded) {
            this._renderClasses();
        } else {
            this.manager.specieDataManager.loadData();
            this.displayOnRoot("Loading");
            this.manager.specieDataManager.addToQueue(this._renderClasses);
        }

        super.render();
    }

    public override onDestroy() {
        this.manager.specieDataManager.removeFromQueue(this._renderClasses);
    }
}
