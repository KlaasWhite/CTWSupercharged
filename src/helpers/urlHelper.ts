import Manager from "../classes/Managers/Manager";
import AdminSpeciesEditPage from "../classes/Pages/Admin/Species/AdminSpeciesEditPage";
import AdminSpeciesPage from "../classes/Pages/Admin/Species/AdminSpeciesPage";
import AdminPage from "../classes/Pages/Admin/AdminPage";
import AdminStartGamePage from "../classes/Pages/Admin/AdminStartGamePage";
import HomePage from "../classes/Pages/HomePage";
import AdminChangelogPage from "../classes/Pages/Admin/Changelog/AdminChangelogPage";
import AdminCreateChangelogPage from "../classes/Pages/Admin/Changelog/AdminCreateChangelogPage";

const evaluateAdminUrl = (manager: Manager, pathSegments: string[]) => {
    switch (pathSegments[1]) {
        case "startgame":
            manager.pageManager.setPage(new AdminStartGamePage(manager));
            break;
        case "species":
            if (pathSegments[2]) {
                manager.pageManager.setPage(
                    new AdminSpeciesEditPage(manager, pathSegments[2])
                );
            } else {
                manager.pageManager.setPage(new AdminSpeciesPage(manager));
            }

            break;
        case "start":
            manager.pageManager.setPage(new AdminStartGamePage(manager));
            break;
        case "changelog":
            if (pathSegments[2] && pathSegments[2].toLowerCase() === "create") {
                manager.pageManager.setPage(
                    new AdminCreateChangelogPage(manager)
                );
                break;
            }
            manager.pageManager.setPage(new AdminChangelogPage(manager));
            break;
        default:
            manager.pageManager.setPage(new AdminPage(manager));
            break;
    }
};

export const evaluateUrl = (manager: Manager) => {
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split("/").slice(1);
    const parameters = new Map<string, string>();
    window.location.search
        ?.split("?")[1]
        ?.split("&")
        ?.forEach((parameter) => {
            parameters.set(parameter.split("=")[0], parameter.split("=")[1]);
        });

    switch (pathSegments[0]) {
        case "":
            const changelog =
                parameters.has("changelog") &&
                parameters.get("changelog") === "true";
            manager.pageManager.setPage(new HomePage(manager, changelog));
            break;
        case "admin":
            evaluateAdminUrl(manager, pathSegments);
            break;
    }
};
