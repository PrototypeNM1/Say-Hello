Template.event_list.event_list_past = function() {
  return null; //PastEvents.find(); 
}

Template.event_list.rendered = function() {
  $('#event-list').listview('refresh');
  $('.event-item').click(function() {
    Session.set("selected", $(this).attr('name'));
  });
};

Template.event_list.event_list = function() {
  if (Session.get("event-type") == "current") {
    return CurrentEvents.find();
  } else {
    console.log("User Id: " + Meteor.userId());
    var pastEvents = PastEvents.findOne({user: Meteor.userId()});
    if (pastEvents) {
      return CurrentEvents.find({_id: {$in: pastEvents.events}}); // find events that are in past events array
    } else {
      return CurrentEvents.find("Empty"); // No past events (no event will have an _id of 'Empty'
    }
  }
};
