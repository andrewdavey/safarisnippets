var AudiencePage = function(app, match) {
  var audienceName = decodeURIComponent(match[1]);
  var snippets = ko.observableArray();
  app.sendMessage({ getSnippets: audienceName }, function(response) {
    snippets(response.snippets.map(function(data, index) {
      return new SnippetViewModel(data, index);
    }));
  });

  function onMessage(event) {
    if (event.data.snippetAdded) {
      var snippet = event.data.snippetAdded;
      var endIndex = snippets().length;
      snippets.push(new SnippetViewModel(snippet, endIndex));
      // TODO: re-sort if sorted
    }
  }

  window.addEventListener("message", onMessage, false);

  return {
    template: "audience",

    nav: [
      { url: "#home", text: "Sales Safari Snippets" },
      { url: false, text: audienceName }
    ],

    name: audienceName,

    snippets: snippets,

    sortByType: function() {
      var reversed = this.currentSort === "type";
      this.currentSort = (reversed ? "-" : "") + "type";
      snippets.sort(function(a,b) { return ((a.type < b.type) ? -1 : (a.type > b.type) ? 1 : 0) * (reversed ? -1 : 1); });
    },

    deleteSnippet: function(snippetIndex) {
      snippets.splice(snippetIndex, 1);
      app.sendMessage({
        deleteSnippet: {
          audienceName: audienceName,
          snippetIndex: snippetIndex
        }
      });
    },

    dispose: function() {
      window.removeEventListener("message", onMessage);
    }
  };
};
