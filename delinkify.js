(function() {

  var links = document.getElementsByTagName("a");
  links = [].slice.call(links);
  links.forEach(function(link) {
    var href = link.getAttribute("href");
    if (href) {
      link.removeAttribute("href");
    }
  });

}());
