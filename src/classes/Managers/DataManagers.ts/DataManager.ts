import {
    CollectionReference,
    FirestoreDataConverter,
    collection,
} from "firebase/firestore";
import Manager from "../Manager";

export default abstract class DataManager<T> {
    protected collectionRef: CollectionReference<T> | null = null;
    protected runOnLoaded: (() => void)[] = [];
    public dataLoaded = false;

    constructor(
        protected manager: Manager,
        collectionName: string,
        convertor: FirestoreDataConverter<T, any>
    ) {
        this.collectionRef = collection(
            manager.firebaseManager.db,
            collectionName
        ).withConverter(convertor);
    }

    public abstract loadData(): void;

    public addToQueue(toBeRan: () => void): void {
        this.runOnLoaded.push(toBeRan);
    }

    public removeFromQueue(toBeRan: () => void): void {
        const index = this.runOnLoaded.indexOf(toBeRan);
        if (index) {
            this.runOnLoaded.splice(index, 1);
        }
    }
}
