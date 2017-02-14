Template.accountTab.rendered = function() {
  //
}

Template.accountTab.events =  {
  'click #changeAccount': function () {
    var action = DOM.getID('changeAccount').value.toLowerCase();
    var enable = ['fname', 'lname', 'phone', 'gender'];
    if (action === 'edit') {
      LOG.msg('Trying to edit my account ... ');
      $('#changeAccount').prop('value', 'Save').button('refresh');
      DOM.getID('profilePic').style.display = 'inline';
      for (var i=0; i<enable.length; i++) {
        DOM.getID(enable[i]).disabled = false;
        $('#'+enable[i]).parent().removeClass('ui-state-disabled');
      }
    } else if (action === 'save') {
      LOG.msg('Trying to save my account ... ');
      $('#changeAccount').prop('value', 'Edit').button('refresh');
      for (var i=0; i<enable.length; i++) {
        $('#'+enable[i]).parent().addClass('ui-state-disabled');
        DOM.getID(enable[i]).disabled = true;
      }

      var user = {
        profile: {
          fname: DOM.getID('fname').value,
          lname: DOM.getID('lname').value,
          phone: DOM.getID('phone').value,
          gender: DOM.getID('gender').value
        }
      };
      Meteor.users.update({'_id': Meteor.userId()}, {$set: user});
      var files = DOM.getID('profilePic').files;
      _.each(files, function(file) {
        var ext = file.name.split(".")[1];
        var filename = Meteor.userId() + "." + ext;
        Meteor.saveFile(file, filename);
      });
      DOM.getID('profilePic').style.display = 'none';
    };
  }
};

Template.footer.events({
  'click .accountTab': function(){
    LOG.msg('Trying to render account tab ... ');
    var user = parseMeteorUser(Meteor.user());
    var data = ['fname', 'lname', 'email', 'phone', 'gender'];
    for (var i=0; i<data.length; i++) {
      if (_.has(user, data[i])) {
        var value = (_.isFunction(user[data[i]])) ? user[data[i]]() : value = user[data[i]];
        if (value) {
          DOM.getID(data[i]).value = value;
        }
      }
    }
    $('#profile').attr('src', Meteor.userId() + '.jpg');
    //facebook integration
    //Meteor.subscribe("facebook_info");
    //var locale = Meteor.user().services.facebook.locale;
    //var img = document.getElementById("prof");
    //img.src = "http://graph.facebook.com/" + myId + "/picture/?type=large";
  }
});

