/**
 * Created by sahand on 10/7/15.
 */
if (Meteor.isClient) {
	Template.help.events({
		'click .btn-continue': function () {
			Router.go('/tool');
		}
	});
}