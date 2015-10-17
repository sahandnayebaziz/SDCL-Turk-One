/**
 * Created by sahand on 10/7/15.
 */
if (Meteor.isClient) {
	Template.help.events({
		'click .btn-continue': function (event, template, doc) {
			Router.go('/tool/' + template.data._id);
		}
	});

	Template.help.rendered = function() {
		if(!this._rendered) {
			this._rendered = true;

			console.log(this.data);
		}
	}
}