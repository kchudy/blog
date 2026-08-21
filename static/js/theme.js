/**
 * Light/dark theme toggle.
 *
 * The initial theme (from localStorage, falling back to the OS preference) is applied inline
 * in templates/base.html before this file loads, so there's no flash of the wrong theme. This
 * script wires up the toggle button — its label is the *target* theme ("Dark" while light,
 * "Light" while dark) — to flip `data-theme` and persist the choice.
 */
(function () {
  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");
  if (!toggle) {
    return;
  }

  function labelFor(theme) {
    return theme === "dark" ? "Light" : "Dark";
  }

  toggle.textContent = labelFor(root.getAttribute("data-theme"));

  toggle.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    toggle.textContent = labelFor(next);
  });
})();
