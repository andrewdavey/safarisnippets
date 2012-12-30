var db = (function() {
  var storage = chrome.storage.local;

  function audienceKey(name) {
    return "audience:" + name;
  }

  function getAudience(name, callback) {
    var key = audienceKey(name);
    storage.get(key, function(data) {
      callback(data[key]);
    });
  }

  function saveAudience(audience, callback) {
    var key = audienceKey(audience.name);
    var data = {};
    data[key] = audience;
    storage.set(data, callback);
  }

  return {
    getAudiences: function(callback) {
      storage.get(null, function(data) {
        var activeName = data.activeAudience;
        var audiences = Object
          .keys(data)
          .map(function(key) {
            var match = key.match(/^audience:(.*)$/);
            if (match) {
              return {
                name: data[key].name,
                isActive: data[key].isActive
              };
            }
          })
          .filter(function(x) { return x; });
        callback(audiences);
      });
    },

    getAudience: getAudience,

    createAudience: function(audience, callback) {
      var audience = {
        name: audience.name,
        isActive: audience.isActive,
        snippets: []
      };
      var dataToSave = {};
      dataToSave[audienceKey(audience.name)] = audience;
      storage.set(dataToSave, callback);
    },

    deleteAudience: function(audienceName, callback) {
      storage.remove(audienceKey(audienceName), callback);
    },

    addSnippet: function(audienceName, snippet) {
      getAudience(audienceName, function(audience) {
        audience.snippets.push(snippet);
        saveAudience(audience);
      });
    },

    deleteSnippet: function(audienceName, snippetIndex) {
      getAudience(audienceName, function(audience) {
        audience.snippets.splice(snippetIndex, 1);
        saveAudience(audience);
      });
    },

    activateAudience: function(audienceName, callback) {
      getAudience(audienceName, function(audience) {
        audience.isActive = true;
        saveAudience(audience, callback);
      });
    },

    deactivateAudience: function(audienceName, callback) {
      getAudience(audienceName, function(audience) {
        audience.isActive = false;
        saveAudience(audience, callback);
      });
    }
  };
}());
