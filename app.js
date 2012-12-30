(function() {

  var HomePage = function(app) {
    return {
      template: "home",
      nav: [{ url: false, text: "Sales Safari" }],
      audiences: app.audiences
    };
  };
  
  var NewAudiencePage = function(app) {
    return {
      template: "new-audience",
      nav: [{ url: "#home", text: "Sales Safari" }, { url: false, text: "New Audience" }],
      name: ko.observable(),
      create: function() {
        var audience = new Audience(this.name());
        app.audiences.push(audience);
        window.location = "#home";
      },
      cancel: function() {
        history.back();
      }
    };
  };

  var AudiencePage = function(app, match) {
    var audience = app.audiences()[parseInt(match[1], 10)];
    return {
      template: "audience",
      nav: [{ url: "#home", text: "Sales Safari" }, { url: false, text: audience.name }],
      name: audience.name
    };
  };

  var App = function() {
    // app data
    this.audiences = ko.observableArray();

    // pages
    this.page = ko.observable();
    this.pages = [
      { url: /^#home/, page: HomePage },
      { url: /^#new-audience/, page: NewAudiencePage },
      { url: /^#audience\/(\d+)/, page: AudiencePage }
    ];

    window.addEventListener("hashchange", this.onHashChange.bind(this), false);
    this.onHashChange();
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
        .filter(function(m) { return m; })
        [0];
    this.page(page);
  };

  ko.applyBindings(new App());

}());
