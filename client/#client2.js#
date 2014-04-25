/* stub for implementing friends on the client side */
Meteor.subscribe("friends");

/* Send data from friends list */
Template.account_tab.friendListFinal = function() {
    /*
    if(Meteor.user().services!=undefined) {
	
	//get the current user
	var currentUser = Meteor.user().services.facebook.first_name
		+ " " + Meteor.user().services.facebook.last_name;
	
	//get the current user's email
	var currentEmail = Meteor.user().services.facebook.email;
	
	//fetch this user's friend list from his email
	var output = Friends.findOne({}, currentEmail);

	//store them in friends array before sending to html
	var friendsArray = new Array();
	var count = 0;
	output.forEach(function(data) {
	    console.log(data); //test
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
//	    return Friends.findOne({}, currentEmail).friendList;
//	});
  //  }
    myTest = new Array();
    myTest[0] = "Help";
    return myTest;//Friends.findOne({}).friendList;
    //return Friends.find({}, currentEmail)[0];
}


/* autp set of user info with login, friends contain the databse of user */
Template.account_tab.userInfo = function() {
    /*
    if(Meteor.user()) {

	//check if the user is already in the database
    
	//if not
 	Meteor.subscribe("facebook_info");	
	var first = Meteor.user().services.facebook.first_name;
	var last = Meteor.user().services.facebook.last_name;
	var email = Meteor.user().services.facebook.email;
	var gender = Meteor.user().services.facebook.gender;
	var locale = Meteor.user().services.facebook.locale;
	var id = Meteor.user().services.facebook.id;
	myPerson = new person(first, last, email, 8675309, gender, locale, id);

	var img = document.getElementById("prof");
	img.src = "http://graph.facebook.com/" + id + "/picture/?type=large";
	
    
 
	document.getElementById("outputfirst").innerHTML = myPerson.firstname;
	document.getElementById("outputlast").innerHTML = myPerson.lastname;
	document.getElementById("outputemail").innerHTML = myPerson.email;
	document.getElementById("outputphone").innerHTML = myPerson.phoneNumber;
	document.getElementById("outputgender").innerHTML = myPerson.gender;
	
	document.getElementById("changefirst").value = myPerson.firstname;
	document.getElementById("changelast").value = myPerson.lastname;
	document.getElementById("changeemail").value = myPerson.email;
	document.getElementById("changephone").value = myPerson.phoneNumber;
	document.getElementById("changegender").value = myPerson.gender;
	
	
	friendName = "null"; //null at this time
	///These need to be stored in friend list at time of sign in
	Friends.insert({
	    myEmail: email,
	    firstName: first,
	    lastName: last,
	    myGender: gender,
	    myId: id,
	    friendList: [{name: friendName}]
	});
	
	var alti = new Array();
	alti[0] = "User"
	alti[1] = "Login!"
	alto[2] = "Getting his info!"
	return alti;
   


    } else {*/
	var alti = new Array();
	alti[0] = "No Account"
	alti[1] = "Login!"
	return alti;
   // }

}



/*
  Constructor for the person object
  Holds person's information
*/
function person(firstname, lastname, email, phoneNumber, gender, loc, idNum)
{
    this.firstname = firstname;
    this.lastname = lastname;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.gender = gender;
    this.loc = loc;
    this.idNum = idNum;
}


