'use strict';

const htmlElement = document.documentElement;
const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

if (sessionStorage.getItem("theme")) {
    htmlElement.dataset.theme = sessionStorage.getItem("theme");
} else {
    htmlElement.dataset.theme = isDark ? "dark" : "light";
}

let isPressed = false;

const changeTheme = function () {
    isPressed = !isPressed;
    const newTheme = (htmlElement.dataset.theme === "light") ? "dark" : "light";
    htmlElement.dataset.theme = newTheme;
    sessionStorage.setItem("theme", newTheme);
}

window.addEventListener('load', function () {
    const themeBtn = this.document.querySelector("[data-theme-btn]");
    themeBtn.addEventListener("click", changeTheme);
});
