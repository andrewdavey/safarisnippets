var sandbox = document.getElementById("sandbox").contentWindow;

function updateSandbox() {
  chrome.storage.local.get("captures", function(data) {
    var captures = data.captures || [];
    sandbox.postMessage({captures: captures}, "*");
  });
}

function save(captures) {
  chrome.storage.local.set({captures: captures});
}

setTimeout(updateSandbox, 500);

window.addEventListener("message", function(event) {
  if ("clear" in event.data) {
    chrome.storage.local.remove("captures", updateSandbox);
  } else if ("remove" in event.data) {
    chrome.storage.local.get("captures", function(data) {
      data.captures.splice(event.data.remove, 1);
      save(data.captures);
    });
  } else if ("open" in event.data) {
    window.open(event.data.open, "_blank");
  }
}, false);

chrome.storage.onChanged.addListener(function() {
  updateSandbox();
});
