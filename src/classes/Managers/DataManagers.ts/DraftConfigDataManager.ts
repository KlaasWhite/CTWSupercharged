import { getDocs, query, where } from "firebase/firestore";
import Manager from "../Manager";
import DataManager from "./DataManager";

export class DraftConfig {
    constructor(
        public name: string,
        public selectedClasses: string[],
        public amountOfRemovesPerTeam: number,
        public removeOrder: string[],
        public pickOrder: string[],
        public forcedClasses: string[],
        public amountOfDraftableClasses: number,
        public owner: string,
        public uid: string
    ) {}
}

const draftConvertor = {
    toFirestore: (draftConfig: DraftConfig) => {
        return {
            name: draftConfig.name,
            selectedClasses: draftConfig.selectedClasses,
            amountOfRemovesPerTeam: draftConfig.amountOfRemovesPerTeam,
            removeOrder: draftConfig.removeOrder,
            pickOrder: draftConfig.pickOrder,
            forcedClasses: draftConfig.forcedClasses,
            amountOfSelectedableClasses: draftConfig.amountOfDraftableClasses,
            owner: draftConfig.owner,
            uid: draftConfig.uid,
        };
    },
    fromFirestore: (snapshot: any, options: any) => {
        const data = snapshot.data(options);
        return new DraftConfig(
            data.name,
            data.selectedClasses,
            data.amountOfRemovesPerTeam,
            data.removeOrder,
            data.pickOrder,
            data.forcedClasses,
            data.amountOfDraftableClasses,
            data.owner,
            data.uid
        );
    },
};

export default class DraftConfigDataManager extends DataManager<DraftConfig> {
    private draftConfigs: DraftConfig[] = [];

    public getAllConfigs(): DraftConfig[] {
        return this.draftConfigs;
    }

    public override loadData(): void {
        if (!this.collectionRef) return;

        const q = query(
            this.collectionRef,
            where("owner", "==", this.manager.firebaseManager.user?.uid)
        );

        getDocs(q).then((querySnapshot) => {
            this.draftConfigs = [];
            querySnapshot.forEach((doc) => {
                const draftConfig = doc.data();
                this.draftConfigs.push(draftConfig);
            });

            this.runOnLoaded.forEach((runnable) => {
                runnable();
            });

            this.dataLoaded = true;

            this.runOnLoaded = [];
        });
    }

    constructor(manager: Manager) {
        super(manager, "configs", draftConvertor);
    }
}
