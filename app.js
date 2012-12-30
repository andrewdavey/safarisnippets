ko.bindingHandlers.dropdown = {
  init: function(element) {
    $(".dropdown-toggle", element).dropdown();
  }
};

(function() {

  var HomePage = function(app) {
    return {
      template: "home",
      nav: [{ url: false, text: "Sales Safari" }],
      audiences: app.audiences,
      
      activateAudience: function(audience) {
        audience.isActive(true);
        app.sendMessage({ activateAudience: audience.name });
      },

      deactivateAudience: function(audience) {
        audience.isActive(false);
        app.sendMessage({ deactivateAudience: audience.name });
      },

      deleteAudience: function(audience) {
        if (confirm("Delete '" + audience.name + "'?")) {
          app.audiences.remove(audience);
          app.sendMessage({ deleteAudience: audience.name });
        }
      }
    };
  };
  
  var NewAudiencePage = function(app) {
    return {
      template: "new-audience",
      nav: [{ url: "#home", text: "Sales Safari" }, { url: false, text: "New Audience" }],
      name: ko.observable(),
      create: function() {
        var name = this.name();
        var data = { name: name, isActive: true };
        var audience = new AudienceViewModel(data);
        app.audiences.push(audience);
        app.audiences.sort(function(a, b) {
          a = a.name.toLowerCase();
          b = b.name.toLowerCase();
          return (a < b) ? -1 : (a > b) ? 1 : 0;
        });
        app.sendMessage({ createAudience: data });
        window.location = "#audience/" + encodeURIComponent(name);
      },
      cancel: function() {
        history.back();
      }
    };
  };

  var AudiencePage = function(app, match) {
    var audienceName = decodeURIComponent(match[1]);
    app.sendMessage({ getSnippets: audienceName });

    return {
      template: "audience",
      nav: [
        { url: "#home", text: "Sales Safari" },
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

  var App = function() {
    // app data
    this.audiences = ko.observableArray();
    this.snippets = ko.observableArray();

    // pages
    this.page = ko.observable();
    this.pages = [
      { url: /^#home/, page: HomePage },
      { url: /^#new-audience/, page: NewAudiencePage },
      { url: /^#audience\/(.+)/, page: AudiencePage }
    ];

    window.addEventListener("hashchange", this.onHashChange.bind(this), false);
    window.addEventListener("message", this.onMessage.bind(this), false);
  };
  
  App.prototype.onHashChange = function() {
    var app = this;
    var page = this.pages
        .map(function(route) {
          var match = route.url.exec(location.hash);
          if (match) {
            return route.page(app, match);
          } else {
            return false;
          }
        })
        .filter(function(page) { return page; })
        [0];
    this.page(page);
  };

  App.prototype.onMessage = function(event) {
    var message = event.data;
    if ("init" in message) {
      this.init(event.source, event.data.init.audiences);
    } else if (message.snippets) {
      this.updateSnippets(event.data.snippets);
    } else if (message.snippetAdded) {
      if (this.page().name === message.snippetAdded.audienceName) {
        this.snippets.push(this.snippet(message.snippetAdded, this.snippets().length));
      }
    }
  };

  App.prototype.init = function(parent, audiences) {
    this.parent = parent;
    audiences = audiences.map(function(a) {
      return new AudienceViewModel(a, this);
    }, this);
    audiences.sort(function(a, b) {
      a = a.name.toLowerCase();
      b = b.name.toLowerCase();
      return (a < b) ? -1 : (a > b) ? 1 : 0;
    });
    this.audiences(audiences);
    this.onHashChange();
  };

  App.prototype.sendMessage = function(data) {
    this.parent.postMessage(data, "*");
  };

  App.prototype.updateSnippets = function(snippets) {
    this.snippets(snippets.map(this.snippet));
  };

  App.prototype.snippet = function(data, index) {
    var date = new Date(Date.parse(data.time));
    function pad(number) {
      return number<10 ? ("0" + number.toString()) : number.toString();
    }
    data.time = [date.getFullYear(), pad(1+date.getMonth()), pad(date.getDate())].join("-") +
             " " + pad(date.getHours()) + ":" + pad(date.getMinutes());
    data.id = index;
    return data;
  };

  App.prototype.anyClick = function(_, event) {
    // We're running inside an sandboxed iframe which isn't
    // allowed to target="_blank" hyperlinks. So we must
    // cancel <a> clicks and send a message out to the extension
    // script which is able to open a new tab for us.

    if (event.srcElement.tagName.toUpperCase() !== "A") return true;
    var href = event.srcElement.getAttribute("href") || "";
    if (!href || !href.match(/^https?:/)) return true;

    event.preventDefault();
    this.sendMessage({ openLink: href });
  };

  function AudienceViewModel(data, app) {
    this.name = data.name;
    this.url = "#audience/" + encodeURIComponent(data.name);
    this.isActive = ko.observable(data.isActive);
    this.isActive.subscribe(function(isActive) {
      if (isActive) {
        app.sendMessage({ activateAudience: this.name });
      } else {
        app.sendMessage({ deactivateAudience: this.name });
      }
    }, this);
  }

  ko.applyBindings(new App());

}());
