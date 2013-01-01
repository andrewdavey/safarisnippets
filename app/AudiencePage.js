var AudiencePage = function(app, match) {
  var audienceName = decodeURIComponent(match[1]);
  app.sendMessage({ getSnippets: audienceName });

  return {
    template: "audience",

    nav: [
      { url: "#home", text: "Sales Safari Snippets" },
      { url: false, text: audienceName }
    ],

    name: audienceName,

    snippets: app.snippets,

    sortByType: function() {
      var reversed = this.currentSort === "type";
      this.currentSort = (reversed ? "-" : "") + "type";
      this.snippets.sort(function(a,b) { return ((a.type < b.type) ? -1 : (a.type > b.type) ? 1 : 0) * (reversed ? -1 : 1); });
    },

    deleteSnippet: function(snippet) {
      app.snippets.splice(snippet.id, 1);
      app.sendMessage({
        deleteSnippet: {
          audienceName: audienceName,
          snippetIndex: snippet.id
        }
      });
    }
  };
};
