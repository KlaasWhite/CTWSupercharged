import { Specie } from "../Managers/DataManagers.ts/SpecieDataManager";
import "./SpecieDisplay.css";

const svgPlus =
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'><path d='M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z'></path></svg>";
const svgMin =
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'><path d='M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z'></path></svg>";

export const getSpecieDisplay = (species: Specie[]): string => {
    const amountOfFullRows = Math.floor(species.length / 10);
    const amountOnLastRow = species.length % 10;

    let specieDisplayHTML = "<table id='specie-display'>";

    for (let i = 0; i < amountOfFullRows; i++) {
        specieDisplayHTML += "<tr>";
        for (let j = 0; j < 10; j++) {
            const specie = species[i * 10 + j];
            specieDisplayHTML += `
                <td>
                    <div class="specie-display-item" id="specie-display-item-${specie.name}">
                        <img src="../${specie.icon}"/>
                    </div>
                </td>
            `;
        }
        specieDisplayHTML += "</tr>";
    }

    specieDisplayHTML += "<tr>";
    for (let j = 0; j < amountOnLastRow; j++) {
        const specie = species[amountOfFullRows * 10 + j];
        specieDisplayHTML += `
            <td>
                <div class="specie-display-item" id="specie-display-item-${specie.name}">
                    <img src="${specie.icon}"/>
                </div>
            </td>
        `;
    }
    specieDisplayHTML += "</tr></table>";

    return specieDisplayHTML;
};

export const enableEventListenersOnSpecieDisplay = (
    species: Specie[],
    onMouseEnter: (event: MouseEvent, specie: Specie) => void,
    onMouseLeave: (event: MouseEvent, specie: Specie) => void,
    onClick: (event: MouseEvent, specie: Specie) => void
) => {
    for (const specie of species) {
        document
            .querySelector<HTMLDivElement>(
                `#specie-display-item-${specie.name}`
            )!
            .addEventListener("mouseenter", (event: MouseEvent) => {
                onMouseEnter(event, specie);
            });

        document
            .querySelector<HTMLDivElement>(
                `#specie-display-item-${specie.name}`
            )!
            .addEventListener("mouseleave", (event: MouseEvent) => {
                onMouseLeave(event, specie);
            });

        document
            .querySelector<HTMLDivElement>(
                `#specie-display-item-${specie.name}`
            )!
            .addEventListener("click", (event: MouseEvent) => {
                onClick(event, specie);
            });
    }
};

export const getDisplayForSpecie = (specie: Specie) => {
    let html = `<table><tr>`;
    html += `<td><h2 ">${specie.displayName}</h2></td>`;
    html += `<tr><td class="specie-display-health">Health:   `;
    for (let i = 0; i < specie.healthValue / 2; i++) {
        html += `<img src="pictures/hp.png" class="specie-display-health-img"/>`;
    }
    html += `  (${specie.healthValue})`;
    html += `</td></tr><tr><td class="specie-display-description">`;
    html += `${specie.description}`;
    html += `</td></tr>`;
    specie.positives.forEach((modifier) => {
        html += `<tr><td class="modifier-element"><table class="modifier"><tr class="specie-display-modifier-positive"><td class="specie-display-modifier-icon">
        ${svgPlus}</td>`;
        html += `<td class="specie-display-modifier-desc">`;
        html += `${modifier}`;
        html += `</td></tr></table></td></tr>`;
    });
    specie.negatives.forEach((modifier) => {
        html += `<tr><td class="modifier-element"><table class="modifier"><tr class="specie-display-modifier-negative"><td class="specie-display-modifier-icon">
        ${svgMin}</td>`;
        html += `<td class="specie-display-modifier-desc">`;
        html += `${modifier}`;
        html += `</td></tr></table></td></tr>`;
    });
    html += `</table>`;
    return html;
};
