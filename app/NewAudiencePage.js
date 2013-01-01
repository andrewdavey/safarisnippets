var NewAudiencePage = function(app) {
  return {
    template: "new-audience",

    nav: [
      { url: "#home", text: "Sales Safari Snippets" },
      { url: false, text: "New Audience" }
    ],

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
