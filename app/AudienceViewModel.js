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
