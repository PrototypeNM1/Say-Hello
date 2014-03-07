

Accounts.ui.config({
	requestPermissions: {
		facebook: [ 'bio', 'email', 'user_birthday']
	}
});



Template.getInfo.events = {
	'click input.get': function () {
		var name = Meteor.user().profile.name;
		Meteor.subscribe("facebook_info");
		var email = Meteor.user().services.facebook.email;
		var gender = Meteor.user().services.facebook.gender;
		var locale = Meteor.user().services.facebook.locale
		var id = Meteor.user().services.facebook.id;
	    	document.getElementById("outputUser").value = name;
	    	document.getElementById("outputEmail").value = email;
	 	document.getElementById("outputGender").value = gender;
		document.getElementById("outputLocale").value = locale;
		document.getElementById("outputID").value = id;
			    
        }
};


