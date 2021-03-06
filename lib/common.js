parseMeteorUser = function(user) {
  return {
    userID: function() {
      return Meteor.userId();
    },
    username: function() {
      return (user.username) ? user.username : false;
    },
    email: user.emails[0].address,
    fullname: function() {
      if (user.profile) {
        return user.profile.name;
      } else {
        return false;
      }
    },
    fname: function() {
      if (user.profile.fname) {
        return user.profile.fname;
      } else if (user.fullname) {
        return user.fullname.split(" ")[0];
      } else {
        return false;
      };
    },
    lname: function() {
      if (user.profile.lname) {
        return user.profile.lname;
      } else if (user.fullname) {
        return user.fullname.split(" ")[1];
      } else {
        return false;
      };
    },
    gender: function() {
      return (user.profile.gender) ? user.profile.gender : false;
    },
    phone: function() {
      return (user.profile.phone) ? user.profile.phone : false;
    }
  };
};

createEverything = function() {
  destroyEverythingWrapper('block');
};

destroyEverything = function() {
  destroyEverythingWrapper('none');
};

destroyEverythingWrapper = function(value) {
  var elements = document.getElementsByClassName('secure');
  for (var i=0; i<elements.length; i++) {
    elements[i].style.display = value;
  }
  if (Meteor.user()) {
    var eventTab = DOM.getID('eventTab');
    if (eventTab) {
      eventTab.click();
    }
  }
}

initializeEverything = function() {
  //initSession();
  subscribeToAllTables();
  LoadMapEvents();
}
