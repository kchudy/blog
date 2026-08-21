/**
 * Post index live filter — progressive enhancement over the server-rendered post list.
 *
 * Tag filtering and sorting are plain links handled by the server (see blog/views.py's
 * PostListView), so they work with this script disabled. This script only adds the "no submit
 * button" free-text quick filter, matching substring against each row's title/author/tags and
 * hiding non-matches on the current page — it never talks to the server.
 */
(function () {
  var input = document.getElementById("post-filter");
  var list = document.getElementById("post-list");
  if (!input || !list) {
    return;
  }

  var rows = Array.prototype.slice.call(list.querySelectorAll(".post-row"));
  var resultCount = document.getElementById("result-count");
  var total = resultCount ? resultCount.getAttribute("data-total") : null;
  var jsEmptyState = document.getElementById("js-empty-state");
  var clearButton = document.getElementById("js-clear-filter");

  function applyFilter() {
    var query = input.value.trim().toLowerCase();
    var visibleCount = 0;

    rows.forEach(function (row) {
      var matches = !query || row.getAttribute("data-search").toLowerCase().indexOf(query) !== -1;
      row.hidden = !matches;
      if (matches) {
        visibleCount += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = "showing " + visibleCount + " / " + total;
    }
    if (jsEmptyState) {
      jsEmptyState.hidden = visibleCount !== 0;
    }
    list.hidden = visibleCount === 0;
  }

  input.addEventListener("input", applyFilter);

  if (clearButton) {
    clearButton.addEventListener("click", function () {
      input.value = "";
      applyFilter();
      input.focus();
    });
  }
})();
