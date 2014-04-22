/* stub for implementing friends on the client side */
Meteor.subscribe("friends");

/* Send data from friends list */
Template.account_tab.friendListFinal = function() {
    if(Meteor.user() != null) {
	var currentUser = Meteor.user().services.facebook.first_name
		+ " " + Meteor.user().services.facebook.last_name;
	var currentEmail = Meteor.user().services.facebook.email;
	var output = Friends.findOne({}, currentEmail);

	var friendsArray = new Array();
	var count = 0;
	output.forEach(function(data) {
	    console.log(data);
	    //var myArray = data.friendList;
	    console.log("My Friend List Array: " + data.friendList);
	    //go through each element of friends list
	    for(var i=0; i<data.friendList.length; i++) {
	    friendsArray[i] = data.friendList[i];
		console.log("Friend" + i + " " + friendsArray[i]);
	    }
	    /*
	      if(count > 0)
	      friendsArray[count] = data.friendList[count].name;
	      else 
	      friendsArray[count] = "null";
	      count+1;*/
	    
	    //});
	    //console.log("Final Count: " + count);
	    //    count = 0;
	    //console.log( "FriendList Array: " + Friends.findOne({}, currentEmail).friendList );
	    return Friends.findOne({}, currentEmail).friendList;
	});
    }
    myTest = new Array();
    myTest[0] = "Help";
    return myTest;//Friends.findOne({}).friendList;
    //return Friends.find({}, currentEmail)[0];
}
