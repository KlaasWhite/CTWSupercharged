import { deleteDoc, doc, getDocs, query, setDoc } from "firebase/firestore";
import Manager from "../Manager";
import DataManager from "./DataManager";

export class Changelog {
    constructor(
        public id: string,
        public changelog: string,
        public release: Date
    ) {}
}

const changelogConvertor = {
    toFirestore: (changelog: Changelog) => {
        return {
            changelog: changelog.changelog,
            release: changelog.release,
        };
    },
    fromFirestore: (snapshot: any, options: any) => {
        const data = snapshot.data(options);
        return new Changelog(
            snapshot.id,
            data.changelog,
            new Date(data.release.seconds * 1000)
        );
    },
};

export default class ChangelogDataManager extends DataManager<Changelog> {
    private changelogs: Changelog[] = [];

    public getChangelogs(): Changelog[] {
        return this.changelogs;
    }

    public override loadData(): void {
        if (!this.collectionRef) return;

        const q = query(this.collectionRef);

        getDocs(q)
            .then((querySnapshot) => {
                this.changelogs = [];
                querySnapshot.forEach((doc) => {
                    const draftConfig = doc.data();
                    this.changelogs.push(draftConfig);
                });

                this.runOnLoaded.forEach((runnable) => {
                    runnable();
                });

                this.dataLoaded = true;

                this.runOnLoaded = [];
            })
            .catch((error) => console.error(error));
    }

    public async addChangelog(changelog: string): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            if (!changelog) return resolve(false);
            if (!this.collectionRef) return resolve(false);

            setDoc(doc(this.collectionRef), {
                changelog,
                release: new Date(),
                id: "",
            })
                .then(() => {
                    this.changelogs = [];
                    this.dataLoaded = false;
                    resolve(true);
                })
                .catch(() => resolve(false));
        });
    }

    public async removeChangelog(changelogID: string): Promise<boolean> {
        return new Promise((resolve) => {
            if (!this.collectionRef) return resolve(false);

            deleteDoc(doc(this.collectionRef, changelogID))
                .then(() => {
                    this.changelogs = [];
                    this.dataLoaded = false;
                    resolve(true);
                })
                .catch(() => resolve(false));
        });
    }

    constructor(manager: Manager) {
        super(manager, "changelogs", changelogConvertor);
    }
}
