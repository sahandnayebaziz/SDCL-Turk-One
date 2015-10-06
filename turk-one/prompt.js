/**
 * Created by sahand on 10/6/15.
 */
if (Meteor.isClient) {
	Template.prompt.events({
		'click .btn-continue': function () {
			Router.go('/help');
		}
	});
}