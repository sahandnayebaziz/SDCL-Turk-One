/**
 * Created by sahand on 11/2/15.
 */
if (Meteor.isClient) {
	Accounts.ui.config({
		passwordSignupFields: "USERNAME_ONLY"
	});
}