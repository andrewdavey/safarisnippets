var types = ["Pain", "Recommendation", "Jargon", "Keyword", "World View"];

var createHandler = function(type) {
  return function(info, tab) {
    var capture = {
      type: type,
      snippet: info.selectionText,
      pageUrl: tab.url,
      pageTitle: tab.title,
      time: new Date().toString()
    };

    chrome.storage.local.get("captures", function(data) {
      var captures = data.captures || [];
      captures.push(capture);
      chrome.storage.local.set({captures: captures});
    });
  }
};

types.forEach(function(type) {
  chrome.contextMenus.create({
    title: type,
    contexts: ["selection"],
    onclick: createHandler(type)
  });
});

chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.create({url: "tab.html"});
});
