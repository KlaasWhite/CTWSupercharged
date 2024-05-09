import { FirebaseApp, initializeApp } from "firebase/app";
import Manager from "./Manager";
import {
    Auth,
    GithubAuthProvider,
    User,
    getAuth,
    signInAnonymously,
    signInWithPopup,
    signOut,
} from "firebase/auth";
import {
    Firestore,
    collection,
    doc,
    getDoc,
    getFirestore,
    setDoc,
} from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";

export class CtwUser {
    constructor(
        public uid: string,
        public username: string,
        public minecraftName: string,
        public anonymous: boolean,
        public admin: boolean
    ) {}
}

const userConverter = {
    toFirestore: (ctwUser: CtwUser) => {
        return {
            uid: ctwUser.uid,
            username: ctwUser.username,
            minecraftName: ctwUser.minecraftName,
            anonymous: ctwUser.anonymous,
            admin: ctwUser.admin,
        };
    },
    fromFirestore: (snapshot: any, options: any) => {
        const data = snapshot.data(options);
        return new CtwUser(
            data.uid,
            data.username,
            data.minecraftName,
            data.anonymous,
            data.admin
        );
    },
};

export default class FirebaseManager {
    private firebaseConfig = {
        apiKey: "AIzaSyBLGTT7n0TsKJLJm02B0EHd5DR0A-eyjFE",
        projectId: "dengarclasses",
        authDomain: "dengarclasses.firebaseapp.com",
        storageBucket: "gs://dengarclasses.appspot.com",
    };

    public usersColectionRef;

    loadingUser = false;
    onUserLoaded: (() => void)[] = [];

    app: FirebaseApp;
    auth: Auth;
    ghProvider: GithubAuthProvider;
    storage: FirebaseStorage;

    db: Firestore;
    user: CtwUser | null;
    userId: string = "";

    constructor(private manager: Manager) {
        this.app = initializeApp(this.firebaseConfig);
        this.auth = getAuth(this.app);

        this.storage = getStorage(this.app);

        this.ghProvider = new GithubAuthProvider();
        this.db = getFirestore();

        this.usersColectionRef = collection(this.db, "users").withConverter(
            userConverter
        );

        this.user = null;

        this.loadingUser = true;

        this.auth.authStateReady().then(() => (this.loadingUser = false));

        this.auth.onAuthStateChanged((user: User | null) => {
            if (!user) {
                this.user = null;
                this.manager.headerManager.loginStateChanged();
                return;
            }
            this._onUserAuthChanged(user.uid);
        });
    }

    public loginGithub(minecraftName: string) {
        signInWithPopup(this.auth, this.ghProvider)
            .then(async (creds) => {
                const authUser = creds.user;

                const userDocument = await getDoc(
                    doc(this.db, "users", authUser.uid)
                );

                if (!userDocument.exists()) {
                    const newUser = new CtwUser(
                        authUser.uid,
                        authUser.displayName ?? "",
                        minecraftName,
                        false,
                        false
                    );

                    await setDoc(
                        doc(this.usersColectionRef, authUser.uid),
                        newUser
                    );
                }

                this._onUserAuthChanged(authUser.uid);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    public loginAnon(minecraftName: string) {
        signInAnonymously(this.auth)
            .then(async (creds) => {
                const authUser = creds.user;
                const userDocument = await getDoc(
                    doc(this.db, "users", authUser.uid)
                );

                if (!userDocument.exists()) {
                    if (!userDocument.exists()) {
                        const newUser = new CtwUser(
                            authUser.uid,
                            authUser.displayName ?? "",
                            minecraftName,
                            true,
                            false
                        );

                        await setDoc(
                            doc(this.usersColectionRef, authUser.uid),
                            newUser
                        );
                    }
                }

                this._onUserAuthChanged(authUser.uid);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    public logout() {
        signOut(this.auth);
        this.user = null;
        this.manager.headerManager.loginStateChanged();
    }

    private async _onUserAuthChanged(userId: string) {
        this.loadingUser = true;
        const userDocument = await getDoc(
            doc(this.db, "users", userId).withConverter(userConverter)
        );

        if (userDocument.exists()) {
            this.user = userDocument.data();
            this.manager.headerManager.loginStateChanged();
        }

        this.onUserLoaded.forEach((runnable) => {
            runnable();
        });

        this.onUserLoaded = [];

        this.loadingUser = false;
    }
}
