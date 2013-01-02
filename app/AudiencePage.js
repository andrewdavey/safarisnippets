var AudiencePage = function(app, match) {
  var audienceName = decodeURIComponent(match[1]);
  var snippets = ko.observableArray();
  app.sendMessage({ getSnippets: audienceName }, function(response) {
    snippets(response.snippets.map(function(data, index) {
      return new SnippetViewModel(data, index);
    }));
  });

  var page = {
    template: "audience",

    nav: [
      { url: "#home", text: "Sales Safari Snippets" },
      { url: false, text: audienceName }
    ],

    name: audienceName,

    snippets: snippets,

    sort: {
      property: ko.observable(),
      reversed: ko.observable(false)
    },

    sortByType: function() {
      this.sortBy("type");
    },

    sortBySnippet: function() {
      this.sortBy("text");
    },

    sortByPageTitle: function() {
      this.sortBy("pageTitle");
    },

    sortByTime: function() {
      this.sortBy("time");
    },

    sortBy: function(property) {
      if (this.sort.property() === property) {
        this.sort.reversed(!this.sort.reversed());
      } else {
        this.sort.property(property);
        this.sort.reversed(false);
      }
      this.applySort();
    },

    applySort: function() {
      var property = this.sort.property();
      var reverse = this.sort.reversed() ? -1 : 1;
      snippets.sort(function(s1, s2) {
        var v1 = s1[property];
        var v2 = s2[property];
        if (typeof v1 === "string") v1 = v1.toLowerCase();
        if (typeof v2 === "string") v2 = v2.toLowerCase();
        return ((v1 < v2) ? -1 : (v1 > v2) ? 1 : 0) * reverse;
      });
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

  function onMessage(event) {
    if (event.data.snippetAdded) {
      var snippet = event.data.snippetAdded;
      var endIndex = snippets().length;
      snippets.push(new SnippetViewModel(snippet, endIndex));
      page.applySort();
    }
  }

  window.addEventListener("message", onMessage, false);

  return page;
};
