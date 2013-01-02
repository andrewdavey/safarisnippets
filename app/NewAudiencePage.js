var NewAudiencePage = function(app) {
  return {
    template: "new-audience",

    nav: [
      { url: "#home", text: "Sales Safari Snippets" },
      { url: false, text: "New Audience" }
    ],

    name: ko.observable(),

    isCreating: false,

    create: function() {
      if (this.isCreating) return;
      this.isCreating = true;

      var name = this.name();
      var data = { name: name, isActive: true };

      app.sendMessage({ createAudience: data }, function() {
        var audience = new AudienceViewModel(data);
        app.audiences.push(audience);
        app.audiences.sort(function(a, b) {
          a = a.name.toLowerCase();
          b = b.name.toLowerCase();
          return (a < b) ? -1 : (a > b) ? 1 : 0;
        });
        window.location = "#audience/" + encodeURIComponent(name);
      });
    },

    cancel: function() {
      history.back();
    }
  };
};
