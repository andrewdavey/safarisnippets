var HomePage = function(app) {
  return {
    template: "home",

    nav: [
      { url: false, text: "Sales Safari Snippets" }
    ],

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
