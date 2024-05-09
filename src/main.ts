import Manager from "./classes/Managers/Manager";
import "./style.css";
import { evaluateUrl } from "./helpers/urlHelper";

const manager = new Manager();

evaluateUrl(manager);

addEventListener("popstate", () => {
    evaluateUrl(manager);
});
