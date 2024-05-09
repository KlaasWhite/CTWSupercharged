import {
    Specie,
    SpecieType,
} from "../../../Managers/DataManagers.ts/SpecieDataManager";
import Manager from "../../../Managers/Manager";
import Page from "../../Page";
import AdminSpeciesPage from "./AdminSpeciesPage";

import "./AdminSpeciesPage.css";

export default class AdminSpeciesEditPage extends Page {
    private _activeSpecie: Specie;
    private _newSpecies = false;
    private _tempFile: File | null = null;

    public get pageType(): "Normal" | "Authorised" | "Admin" {
        return "Admin";
    }

    public get url(): string {
        return `/admin/species/${this._activeSpecie?.name}`;
    }

    private _evaluatePostivesAndNegatives() {
        if (!this._activeSpecie) return;

        this.displayOnCertainElement("", "admin-species-edit-positives");
        let positivesDisplay = document.getElementById(
            "admin-species-edit-positives"
        );
        this._activeSpecie.positives.forEach((positive, index) => {
            if (!positivesDisplay) return;
            positivesDisplay.innerHTML += `
                <div><input id="admin-species-edit-positives-${index}" value="${positive}"/><button id="admin-species-edit-positives-${index}-remove">-</button></div>
            `;
        });

        this.displayOnCertainElement("", "admin-species-edit-negatives");
        let negativesDisplay = document.getElementById(
            "admin-species-edit-negatives"
        );
        this._activeSpecie?.negatives.forEach((positive, index) => {
            if (!negativesDisplay) return;
            negativesDisplay.innerHTML += `
                <div><input id="admin-species-edit-negatives-${index}" value="${positive}"/><button id="admin-species-edit-negatives-${index}-remove">-</button></div>
            `;
        });

        for (let i = 0; i < this._activeSpecie.positives.length; i++) {
            let input = document.getElementById(
                `admin-species-edit-positives-${i}`
            ) as HTMLInputElement;
            input?.addEventListener("change", () => {
                this._activeSpecie.positives[i] = input?.value;
            });
            document
                .getElementById(`admin-species-edit-positives-${i}-remove`)
                ?.addEventListener("click", () => {
                    this._activeSpecie.positives.splice(i, 1);
                    this._evaluatePostivesAndNegatives();
                });
        }

        for (let i = 0; i < this._activeSpecie.negatives.length; i++) {
            let input = document.getElementById(
                `admin-species-edit-negatives-${i}`
            ) as HTMLInputElement;
            input?.addEventListener("change", () => {
                this._activeSpecie.negatives[i] = input?.value;
            });
            document
                .getElementById(`admin-species-edit-negatives-${i}-remove`)
                ?.addEventListener("click", () => {
                    this._activeSpecie.negatives.splice(i, 1);
                    this._evaluatePostivesAndNegatives();
                });
        }
    }

    private _validation(): boolean {
        let valid = true;

        if (this._newSpecies) {
            if (!this._activeSpecie.displayName) {
                valid = false;
            }

            if (!this._tempFile) {
                valid = false;
            }
        }

        if (!this._activeSpecie.description) valid = false;
        if (!this._activeSpecie.type) valid = false;
        if (!this._activeSpecie.healthValue) valid = false;

        return valid;
    }

    private async _submitData() {
        if (!this._validation()) {
            this.displayOnCertainElement(
                "Some fields were not filled in",
                "admin-species-edit-error"
            );

            return;
        }

        const imageURL = await this.manager.specieDataManager.uploadSpecieImage(
            this._tempFile,
            this._activeSpecie.name
        );
        if (!imageURL || imageURL === "") {
            this.displayOnCertainElement(
                "Image did not upload :(",
                "admin-species-edit-error"
            );
        }
        this._activeSpecie.icon = imageURL;

        const succeeded = await this.manager.specieDataManager.pushSpecies(
            this._activeSpecie
        );
        if (succeeded) {
            this.manager.pageManager.setPage(
                new AdminSpeciesPage(this.manager),
                "replace"
            );
        } else {
            this.displayOnCertainElement(
                "Specie did not submit :(",
                "admin-species-edit-error"
            );
        }
    }

    private _createForm(newSpecies: boolean) {
        let html = `<table id="admin-species-edit-table">`;

        if (newSpecies) {
            html += `
                <tr>
                    <td>
                        <div>Name:</div>
                        <input type="text" id="admin-species-edit-displayName"/>
                    </td>
                </tr>
            `;
        } else {
            html += `
                <tr>
                    <td>
                        <h1>${this._activeSpecie?.displayName}</h1>
                    </td>
                </tr>
            `;
        }

        html += ` 
            <tr>
                <td>
                    <div>Description:</div>
                    <textarea cols="40" rows="5" type="text" id="admin-species-edit-description">${
                        this._activeSpecie.description
                    }</textarea>
                </td>
            </tr>
            <tr>
                <td>
                    <div>Type:</div>
                    <select id="admin-species-edit-type">
                        <option value="${SpecieType.combat}">Combat</option>
                        <option value="${SpecieType.movement}">Movement</option>
                        <option value="${SpecieType.support}">Support</option>
                        <option value="${SpecieType.tank}">Tank</option>
                        <option value="${SpecieType.utility}">Utility</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>
                    <div>Amount of health (= hearts * 2):</div>
                    <input type="number" value=${
                        this._activeSpecie.healthValue
                    } id="admin-species-edit-health"/>
                </td>
            </tr>
            <tr>
                <td>
                    <div>${newSpecies ? "Icon:" : "Change icon:"}</div>
                    <input type="file" id="admin-species-edit-icon" name="img" accept="image/*">
                </td>
            </tr>
            <tr>
                <td>
                    <div>Positives</div>
                    <div id="admin-species-edit-positives"></div>
                    <button id="admin-species-edit-positives-add">+</button>
                </td>
            </tr>
            <tr>
                <td>
                    <div>Negatives</div>
                    <div id="admin-species-edit-negatives"></div>
                    <button id="admin-species-edit-negatives-add">+</button>
                </td>
            </tr>
            <tr>
                <td>
                    <button id="admin-species-edit-submit">SUBMIT</button>
                </td>
            </tr>
            <tr>
                <td>
                <div id="admin-species-edit-error"></div>
                </td>
            </tr>
        </table>`;

        this.displayOnRoot(html);

        this._evaluatePostivesAndNegatives();

        if (newSpecies) {
            this.registerEventListener(
                "admin-species-edit-displayName",
                "change",
                (event: Event) => {
                    const target = event.target as HTMLInputElement;
                    this._activeSpecie.displayName = target.value;
                    this._activeSpecie.name = target.value
                        .replace(/[^a-zA-Z0-9]/g, "")
                        .toLowerCase();
                }
            );
        }
        this.registerEventListener(
            "admin-species-edit-description",
            "change",
            (event: Event) => {
                const target = event.target as HTMLInputElement;
                this._activeSpecie.description = target.value;
            }
        );

        this.registerEventListener(
            "admin-species-edit-type",
            "change",
            (event: Event) => {
                const target = event.target as HTMLSelectElement;
                this._activeSpecie.type =
                    SpecieType[target.value as keyof typeof SpecieType];
            }
        );

        (
            document.getElementById(
                "admin-species-edit-type"
            ) as HTMLSelectElement
        ).value = this._activeSpecie.type.toString();

        this.registerEventListener(
            "admin-species-edit-health",
            "change",
            (event: Event) => {
                const target = event.target as HTMLInputElement;
                this._activeSpecie.healthValue = parseInt(target.value);
            }
        );
        this.registerEventListener(
            "admin-species-edit-icon",
            "change",
            (event: Event) => {
                const target = event.target as HTMLInputElement;
                if (!target || !target.files || !target.files[0]) return;
                const file = target.files[0];
                this._tempFile = file;
            }
        );
        this.registerClickEventListener(
            "admin-species-edit-positives-add",
            () => {
                this._activeSpecie?.positives.push("");
                this._evaluatePostivesAndNegatives();
            }
        );
        this.registerClickEventListener(
            "admin-species-edit-negatives-add",
            () => {
                this._activeSpecie?.negatives.push("");
                this._evaluatePostivesAndNegatives();
            }
        );
        this.registerClickEventListener("admin-species-edit-submit", () => {
            this._submitData();
        });
    }

    private _loadNewClassCreator() {
        this._newSpecies = true;
        this._createForm(true);
    }

    private _loadExistingClassCreator() {
        this._createForm(false);
    }

    private _showClassData = () => {
        if (this._specieName === "new") {
            this._loadNewClassCreator();
            return;
        }

        const ctwClass = this.manager.specieDataManager.getSpecificSpecie(
            this._specieName
        );

        if (!ctwClass) {
            this.manager.pageManager.setPage(
                new AdminSpeciesPage(this.manager),
                "replace"
            );
            return;
        }

        this._activeSpecie = JSON.parse(JSON.stringify(ctwClass));

        this._loadExistingClassCreator();
    };

    public override render() {
        if (this.manager.specieDataManager.dataLoaded) {
            this._showClassData();
        } else {
            this.manager.specieDataManager.loadData();
            this.displayOnRoot("Loading");
            this.manager.specieDataManager.addToQueue(this._showClassData);
        }

        super.render();
    }

    public override onDestroy() {
        this.manager.specieDataManager.removeFromQueue(this._showClassData);
    }

    constructor(manager: Manager, protected _specieName: string) {
        super(manager);

        this._activeSpecie = new Specie(
            "new",
            "",
            20,
            "",
            [],
            [],
            "",
            SpecieType.combat
        );
    }
}
