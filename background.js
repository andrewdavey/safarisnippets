function initContextMenus() {
  chrome.contextMenus.removeAll();
  db.getAudiences(function(audiences) {
    createContextMenus(audiences);
  });
}

function createContextMenus(audiences) {
  audiences
    .filter(function(a) { return a.isActive; })
    .forEach(function(a) { return createContextMenu(a.name); });
}

function createContextMenu(audienceName) {
  var parentMenuId = chrome.contextMenus.create({
    title: audienceName,
    contexts: ["selection"]
  });
  var types = ["Pain", "Recommendation", "Jargon", "Keyword", "World View"];
  types.forEach(function(type) {
    chrome.contextMenus.create({
      parentId: parentMenuId,
      title: type,
      contexts: ["selection"],
      onclick: createMenuHandlerFunction(audienceName, type)
    });
  });
}

function createMenuHandlerFunction(audienceName, snippetType) {
  return function(info, tab) {
    var snippet = {
      type: snippetType,
      text: info.selectionText,
      page: {
        url: tab.url,
        title: tab.title
      },
      time: new Date().toString()
    };

    var counter = (snippetType === "Keyword" || snippetType === "Jargon") ? countTextOccurances : countOne;
    
    function countOne(_, __, callback) {
      callback(1);
    }

    counter(snippet.text, tab.id, function(count) {
      snippet.count = count;
      db.addSnippet(audienceName, snippet);

      snippet.audienceName = audienceName;
      chrome.extension.sendMessage({ snippetAdded: snippet });
    });
  };
}

function countTextOccurances(text, tabId, callback) {
  chrome.tabs.executeScript(
    tabId,
    {
      code: "document.body.innerText"
    },
    function(results) {
      results.forEach(function(result) {
        var matches = result.match(new RegExp(text, "gi"));
        callback(matches.length || 1);
      });
    }
  );
}

initContextMenus();

// Clicking the extension's browser action button
// opens the snippet viewer tab.
chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.create({url: "tab.html"});
});


chrome.extension.onMessage.addListener(function(message) {
  if (message.audienceActivated ||
      message.audienceDeactivated ||
      message.audienceCreated || 
      message.audienceDeleted) {
    initContextMenus();
  }
});
