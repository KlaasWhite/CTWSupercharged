import { doc, getDocs, setDoc } from "firebase/firestore";
import Manager from "../Manager";
import DataManager from "./DataManager";
import {
    FirebaseStorage,
    getDownloadURL,
    getStorage,
    ref,
    uploadBytesResumable,
} from "firebase/storage";

export const specieTypeToColour = (type: SpecieType) => {
    switch (type) {
        case SpecieType.combat:
            return "#DF56A6";
        case SpecieType.movement:
            return "#FE8E45";
        case SpecieType.support:
            return "#32C1DA";
        case SpecieType.tank:
            return "#B047F9";
        case SpecieType.utility:
            return "#9FEF00";
    }
};

export enum SpecieType {
    "combat",
    "movement",
    "support",
    "tank",
    "utility",
}

export class Specie {
    constructor(
        public name: string,
        public displayName: string,
        public healthValue: number,
        public description: string,
        public positives: string[],
        public negatives: string[],
        public icon: string,
        public type: SpecieType
    ) {}
}

const specieConverter = {
    toFirestore: (specie: Specie) => {
        return {
            name: specie.name,
            displayName: specie.displayName,
            healthValue: specie.healthValue,
            description: specie.description,
            positives: specie.positives,
            negatives: specie.negatives,
            icon: specie.icon,
            type: specie.type,
        };
    },
    fromFirestore: (snapshot: any, options: any) => {
        const data = snapshot.data(options);
        return new Specie(
            data.name,
            data.displayName,
            data.healthValue,
            data.description,
            data.positives,
            data.negatives,
            data.icon,
            SpecieType[data.type as keyof typeof SpecieType]
        );
    },
};

export default class SpecieDataManager extends DataManager<Specie> {
    private _species = new Map<string, Specie>();
    private _storage: FirebaseStorage;

    public getAllSpecies(): Specie[] {
        return Array.from(this._species.values()).sort(
            (specie1, specie2) => specie1.type - specie2.type
        );
    }

    public getSpecificSpecie(specieName: string): Specie | undefined {
        return this._species.get(specieName);
    }

    public async uploadSpecieImage(
        file: File | null,
        specieName: string
    ): Promise<string> {
        return new Promise((resolve) => {
            if (!file) {
                resolve("");
                return;
            }

            const storageRef = ref(this._storage, "specieIcons/" + specieName);
            const uploadTask = uploadBytesResumable(storageRef, file, {
                contentType: file.type,
            });

            uploadTask.on(
                "state_changed",
                () => {},
                () => {
                    resolve("");
                },
                () => {
                    // Upload completed successfully, now we can get the download URL
                    getDownloadURL(uploadTask.snapshot.ref).then(
                        (downloadURL) => {
                            resolve(downloadURL);
                        }
                    );
                }
            );
        });
    }

    public pushSpecies(specie: Specie): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            if (!specie) return resolve(false);
            if (!this.collectionRef) return resolve(false);

            setDoc(doc(this.collectionRef, specie.name), specie)
                .then(() => {
                    this._species.clear();
                    this.dataLoaded = false;
                    resolve(true);
                })
                .catch(() => resolve(false));
        });
    }

    public override loadData(): void {
        if (!this.collectionRef) return;

        getDocs(this.collectionRef).then((querySnapshot) => {
            this._species.clear();
            querySnapshot.forEach((doc) => {
                const specie = doc.data();
                this._species.set(specie.name, specie);
            });

            this.dataLoaded = true;

            this.runOnLoaded.forEach((runnable) => {
                try {
                    runnable();
                } catch (e) {
                    console.error(e);
                }
            });

            this.runOnLoaded = [];
        });
    }

    constructor(manager: Manager) {
        super(manager, "species", specieConverter);
        this._storage = getStorage();
    }
}
