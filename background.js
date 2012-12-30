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
    db.addSnippet(audienceName, snippet);

    snippet.audienceName = audienceName;
    chrome.extension.sendMessage({ snippetAdded: snippet });
  };
}

initContextMenus();

chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.create({url: "tab.html"});
});


chrome.extension.onMessage.addListener(function(message) {
  if ("audienceActivated" in message || "audienceDeactivated" in message) {
    initContextMenus();
  } else if (message.audienceCreated || message.audienceDeleted) {
    initContextMenus();
  }
});
