import SpecieDataManager from "./DataManagers.ts/SpecieDataManager";
import DraftConfigDataManager from "./DataManagers.ts/DraftConfigDataManager";
import FirebaseManager from "./FirebaseManager";
import HeaderManager from "./HeaderManager";
import PageManager from "./PageManager";
import ChangelogDataManager from "./DataManagers.ts/ChangelogDataManager";

export default class Manager {
    private _pageManager: PageManager;
    private _headerManager: HeaderManager;
    private _firebaseManager: FirebaseManager;
    private _specieDataManager: SpecieDataManager;
    private _draftConfigDataManager: DraftConfigDataManager;
    private _changelogDataManager: ChangelogDataManager;

    constructor() {
        this._pageManager = new PageManager(this);
        this._firebaseManager = new FirebaseManager(this);
        this._headerManager = new HeaderManager(this);
        this._specieDataManager = new SpecieDataManager(this);
        this._draftConfigDataManager = new DraftConfigDataManager(this);
        this._changelogDataManager = new ChangelogDataManager(this);
    }

    get pageManager() {
        return this._pageManager;
    }

    get headerManager() {
        return this._headerManager;
    }

    get firebaseManager() {
        return this._firebaseManager;
    }

    get specieDataManager() {
        return this._specieDataManager;
    }

    get draftConfigDataManager() {
        return this._draftConfigDataManager;
    }

    get changelogDataManager() {
        return this._changelogDataManager;
    }
}
