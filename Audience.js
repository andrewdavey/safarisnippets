var Audience = function(name) {
  this.name = name;
  this.captures = [];
};

Audience.prototype.addCapture = function(capture) {
  this.captures.push(capture);
};
