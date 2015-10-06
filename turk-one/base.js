/**
 * Created by sahand on 10/6/15.
 */
if (Meteor.isClient) {
	// counter starts at 0

	Template.prompt.events({
		'click .btn-continue': function () {
			// increment the counter when button is clicked
			console.log("printed");
			Router.go('/onboarding2/');
		}
	});
}

if (Meteor.isServer) {
	Meteor.startup(function () {
		// code to run on server at startup
	});
}
