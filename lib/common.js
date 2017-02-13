parseMeteorUser = function(user) {
  return {
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
      if (this.fullname) {
        return fullname.split(" ")[0];
      } else {
        return false;
      };
    },
    lname: function() {
      if (this.fullname) {
        return fullname.split(" ")[1];
      } else {
        return false;
      };
    }
  };
};
