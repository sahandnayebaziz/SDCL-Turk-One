/**
 * Created by sahand on 10/6/15.
 */
if (Meteor.isClient) {
	Template.home.events({
		'click .btn-continue': function (event, template, doc) {
			Router.go('/help/' + Session.get("ticketId"));
		}
	});
}