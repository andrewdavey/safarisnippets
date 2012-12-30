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
        var audience = { name: name, isActive: ko.observable(true) };
        app.audiences.push(audience);
        window.location = "#audience/" + (app.audiences().length-1);
        app.sendMessage({ createAudience: {name: name, isActive: true} });
      },
      cancel: function() {
        history.back();
      }
    };
  };

  var AudiencePage = function(app, match) {
    var id = parseInt(match[1], 10);
    var audienceName = app.audiences()[id].name;
    app.sendMessage({ getSnippets: audienceName });

    return {
      template: "audience",
      nav: [
        { url: "#home", text: "Sales Safari" },
        { url: false, text: audienceName }
      ],
      name: audienceName,
      snippets: app.snippets
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
      { url: /^#audience\/(\d+)/, page: AudiencePage }
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
      this.parent = event.source;
      this.audiences(event.data.init.audiences.map(function(a) {
        return { name: a.name, isActive: ko.observable(a.isActive) };
      }));
      this.onHashChange();
    } else if (message.snippets) {
      this.updateSnippets(event.data.snippets);
    } else if (message.snippetAdded) {
      if (this.page().name === message.snippetAdded.audienceName) {
        this.snippets.push(this.snippet(message.snippetAdded));
      }
    }
  };

  App.prototype.sendMessage = function(data) {
    this.parent.postMessage(data, "*");
  };

  App.prototype.updateSnippets = function(snippets) {
    this.snippets(snippets.map(this.snippet));
  };

  App.prototype.snippet = function(data) {
    var date = new Date(Date.parse(data.time));
    function pad(number) {
      return number<10 ? ("0" + number.toString()) : number.toString();
    }
    data.time = [date.getFullYear(), pad(1+date.getMonth()), pad(date.getDate())].join("-") +
             " " + pad(date.getHours()) + ":" + pad(date.getMinutes());
    return data;
  };

  ko.applyBindings(new App());

}());
