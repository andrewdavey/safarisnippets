function SnippetViewModel(data, index) {
  var date = new Date(Date.parse(data.time));
  function pad(number) {
    return number<10 ? ("0" + number.toString()) : number.toString();
  }
  data.time = [date.getFullYear(), pad(1+date.getMonth()), pad(date.getDate())].join("-") +
              " " + pad(date.getHours()) + ":" + pad(date.getMinutes());
  data.id = index;
  return data;
};
