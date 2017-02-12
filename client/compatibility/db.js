var subscribeToAllTables = function() {
  Meteor.subscribe("directory");
  Meteor.subscribe("current_events");
  Meteor.subscribe("past_events");
  Meteor.subscribe("facebook_info");
  Meteor.subscribe("friends");
  Meteor.subscribe("sign");
}
