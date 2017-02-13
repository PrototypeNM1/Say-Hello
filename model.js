CurrentEvents = new Meteor.Collection("current_events");
PastEvents = new Meteor.Collection("past_events");
Sign = new Meteor.Collection("Sign");

CurrentEvents.allow({
  insert: function(userId, myEvent) {
    return false;
  },
  update: function(userId, myEvent, fields, modifier) {
    if (userId !== myEvent.owner) {
      return false;
    }
    var allowed = ["name", "description", "x", "y"];
    if (_.difference(fields, allowed).length)
      return false;
  },
  remove: function(userId, myEvent) {
    return true;
  }
});

Sign.allow ({
  insert: function() {
    return true;
  }
});

PastEvents.allow({
  insert: function(userId, hisEvent) {
    return true; 
  },
  remove: function(userId, hisEvent) {
    return true;
  }
});

attending = function(myEvent) {
  return myEvent.attendees.length;
};

createEvent = function(options) {
  var id = Random.id();
  Meteor.call('createEvent', _.extend({_id: id}, options));
  return id;
};

createPastEvent = function(options) {
  Meteor.call('createPastEvent', options);
}

Meteor.methods({ 
  createEvent: function(options) {
    check(options, {
      name: String,
      description: String,
      _id: String,
      x: Number,
      y: Number
    });

    var id = options._id || Random.id();
    console.log("this.userId: " + this.userId);
    var uName = displayName(Meteor.users.findOne(this.userId));
    var uFID = Meteor.user().services.facebook.id;	   

    var uEmail = Meteor.user().services.facebook.email;
    console.log("Username of creator: " + uName);
    CurrentEvents.insert({
      _id: id,
      owner: this.userId,
      x: options.x,
      y: options.y,
      name: options.name,
      description: options.description,
      attendees: [{name: uName, email: uEmail, fbook_id: uFID}]
    });
    return id;
  },

  createPastEvent: function(options) {

  },

  sign_: function(eventId, signing_in) {
    check(eventId, String);
    if (! this.userId)
      throw new Meteor.Error(403, "You must be logged in to sign " + 
        (signing_in ? "in" : "out") + "!");

    var myEvent = CurrentEvents.findOne(eventId);
    if (! myEvent)
      throw new Meteor.Error(404, "There is no such event!");

    var attendIndex = _.indexOf(this.userId);
    var uName = displayName(Meteor.users.findOne(this.userId));

    var uEmail = null;
    var uFID = null;

    if(Meteor.user().services.facebook) {
      uEmail = Meteor.user().services.facebook.email;
      uFID = Meteor.user().services.facebook.id;
    } else {
      uEmail = user.emails[o].address;
      console.log("Email login: " + uEmail);
    }

    var updateTable = {name: uName, email: uEmail, fbook_id: uFID};
    check(updateTable, {
      name: String,
      email: String,
      fbook_id: String
    });
    check(this.userId, String);
    if (attendIndex === -1) {
      if (signing_in) {
        CurrentEvents.update(eventId,
          {$push: {attendees: updateTable}});

      } else {
        CurrentEvents.update(eventId,
          {$pull: {attendees: updateTable}});

        var userPastEvents = PastEvents.findOne({user: this.userId});
        if (userPastEvents) {
          console.log("User has past event entry");
          PastEvents.update({user: this.userId}, {$addToSet: {events: eventId}});
        } else {
          PastEvents.insert({user: this.userId, events: [eventId]});
          console.log("User did not have past event entry. Created new");
        }

      }
    }
  },
  invite: function(partyId, userId) {

  }
});

displayName = function(user) {
  if (user.profile && user.profile.name)
    return user.profile.name;
  return user.emails[0].address;
};

contactEmail = function(user) {
  if (user.emails && user.emails.length)
    return user.emails[0].address;
  if (user.services && user.services.facebook && user.services.facebook.email)
    return user.services.facebook.email;
  return null;
}
