import AdminPage from "../Pages/Admin/AdminPage";
import HomePage from "../Pages/HomePage";
import "./Header.css";
import Manager from "./Manager";

export default class HeaderManager {
    public loginStateChanged() {
        if (!this.manager.firebaseManager.user) {
            this._showLoginButton();
        } else {
            if (this.manager.firebaseManager.user.admin) {
                this.secondaryHeaderSlot = `<button id="header-admin">Admin</button><button id="logout">Logout</button>`;

                document
                    .querySelector<HTMLDivElement>(`#header-admin`)!
                    .addEventListener("click", () => {
                        this.manager.pageManager.setPage(
                            new AdminPage(this.manager),
                            "push"
                        );
                    });
            } else {
                this.secondaryHeaderSlot = `<button id="logout">Logout</button>`;
            }

            document
                .querySelector<HTMLDivElement>(`#logout`)!
                .addEventListener("click", () => {
                    this.manager.firebaseManager.logout();
                });
        }
    }

    private _closeLoginPopup() {
        document.querySelector<HTMLDivElement>(`#popup`)!.innerHTML = "";
        document
            .querySelector<HTMLDivElement>(`#popup`)!
            .classList.remove("popup-shown");
    }

    private _getMinecraftName(): string {
        const minecraftName =
            document.querySelector<HTMLInputElement>(`#mc-name-input`)!.value;
        if (minecraftName == null || minecraftName == "") {
            document.querySelector<HTMLInputElement>(
                `#mc-name-input-error`
            )!.innerText = "Please put in a valid minecraft name";
        }
        return minecraftName;
    }

    private _showLoginPopup() {
        document.querySelector<HTMLDivElement>(`#popup`)!.innerHTML = `
                    <div id="popup-background"></div>
                    <div id="popup-content">
                        <table>
                            <tr>
                                <td>
                                    <div>Put in minecraft name:</div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <input id="mc-name-input"/>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div id="mc-name-input-error"></div>
                                </td>
                            </tr>
                            <tr class="login-popup-row"><td>
                                <button id="login-github">
                                    Login with github
                                </button>
                            </td></tr>
                            <tr class="login-popup-row"><td>
                                <button id="login-anon">
                                    Login anonymously
                                </button>
                            </td></tr>
                        </table>
                    </div>
                `;
        document
            .querySelector<HTMLDivElement>(`#popup`)!
            .classList.add("popup-shown");
        document
            .querySelector<HTMLDivElement>(`#popup-background`)!
            .addEventListener("click", () => {
                this._closeLoginPopup();
            });
        document
            .querySelector<HTMLDivElement>(`#login-github`)!
            .addEventListener("click", () => {
                const minecraftName = this._getMinecraftName();
                if (minecraftName !== null && minecraftName !== "") {
                    this.manager.firebaseManager.loginGithub(minecraftName);
                    this._closeLoginPopup();
                }
            });
        document
            .querySelector<HTMLDivElement>(`#login-anon`)!
            .addEventListener("click", () => {
                const minecraftName = this._getMinecraftName();
                if (minecraftName !== null && minecraftName !== "") {
                    this.manager.firebaseManager.loginAnon(minecraftName);
                    this._closeLoginPopup();
                }
            });
    }

    private _showLoginButton() {
        this.secondaryHeaderSlot = `<button id="login">Login</button>`;

        document
            .querySelector<HTMLDivElement>(`#login`)!
            .addEventListener("click", () => {
                this._showLoginPopup();
            });
    }

    set secondaryHeaderSlot(html: string) {
        document.querySelector<HTMLDivElement>(
            `#secondary-header-slot`
        )!.innerHTML = html;
    }

    constructor(private manager: Manager) {
        document.querySelector<HTMLDivElement>(`#header`)!.innerHTML = `
        <table>
            <tr>
            <td id="primary-header-slot">CTW Supercharged</td>
            <td id="secondary-header-slot"></td>
            </tr>
        </table>`;

        document
            .getElementById("primary-header-slot")
            ?.addEventListener("click", () => {
                this.manager.pageManager.setPage(
                    new HomePage(this.manager),
                    "push"
                );
            });

        this._showLoginButton();
    }
}
