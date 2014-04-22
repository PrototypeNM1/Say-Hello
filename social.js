//Author: Soumya Kumar
//Date: 21st April 2014

Friends = new Meteor.Collection("friends");

/************* Friend List **********************/
Friends.allow({
    insert: function(userId, friendName) {
	return true;
    },
    update: function(userId, friendName) {
	return true;
    }, //update the friend list 
    remove: function(userId, friendName) {
	return false;
	//Sprint 3
    }

});
/***********************************************/

