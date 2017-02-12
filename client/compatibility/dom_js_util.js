var DOM = {
  getID: function(id) {
    var element = document.getElementById(id);
    return (element) ? element : false;
  },
  setHTML: function(id, data) {
    var element = document.getElementById(id);
    if (element) {
      element.innerHTML = data;
      return true;
    }
    return false;
  }
};

var LOG = { 
  msg: function(msg) {
    console.log(msg  + '(' + Date.now() + ')');
  },
  error: function(msg) {
    console.error(msg + '(' + Date.now() + ')');
  },
  warn: function(msg) {
    console.warn(msg + '(' + Date.now() + ')');
  }
};
