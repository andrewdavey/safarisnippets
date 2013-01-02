(function() {

  var App = function() {
    this.audiences = ko.observableArray();
    this.page = ko.observable();
    this.pages = [
      { url: /^#home/, page: HomePage },
      { url: /^#new-audience/, page: NewAudiencePage },
      { url: /^#audience\/(.+)/, page: AudiencePage }
    ];

    this.responseCallbacks = {};
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

    var oldPage = this.page();
    if (oldPage && typeof oldPage.dispose === "function") {
      oldPage.dispose();
    }

    this.page(page);
  };

  App.prototype.onMessage = function(event) {
    var message = event.data;
    if (message.init) {
      this.init(event.source, message.init.audiences);
    } else if (message.callback) {
      this.dispatchCallback(message);
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

  App.prototype.dispatchCallback = function(message) {
    var callback = this.responseCallbacks[message.callback];
    delete this.responseCallbacks[message.callback];
    if (callback) {
      callback(message);
    }
  };

  App.prototype.getSnippets = function(audienceName, callback) {
    this.sendMessage({ getSnippets: audienceName }, function(response) {
      callback(response.snippets);
    });
  };

  App.prototype.sendMessage = function(data, responseCallback) {
    data._callbackId = (new Date()).getTime().toString();
    this.responseCallbacks[data._callbackId] = responseCallback;
    this.parent.postMessage(data, "*");
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

  

  ko.applyBindings(new App());

}());
