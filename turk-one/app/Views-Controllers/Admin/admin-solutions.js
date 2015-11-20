/**
 * Created by sahand on 11/8/15.
 */
/**
 * Created by sahand on 10/11/15.
 */
if (Meteor.isServer) {
	Meteor.methods({
		deleteSolution: function (id) {
			Solutions.remove(id);
		}
	})
}

if (Meteor.isClient) {
	Template.adminSolutionsInterior.helpers({
		solutions: function () {
			return Solutions.find({complexity: {$gt: 1}}, {sort: {dateUpdated: -1}});
		}
	});
	Template.adminSolutionsInterior.events({
		"click .deleteSolution": function () {
			var idToDelete = this._id;
			bootbox.dialog({
				message: "Are you sure you want to delete this solution?",
				title: "Delete solution",
				buttons: {
					cancel: {
						label: "Cancel",
						className: "btn-secondary",
					},
					danger: {
						label: "Yes, delete",
						className: "btn-danger",
						callback: function() {
							Meteor.call("deleteSolution", idToDelete);
						}
					}
				}
			});
		}
	});

	Template.decisionPreview.events({
		"click .delete": function () {
			Meteor.call("deleteDecisionPoint", this._id);
		}
	});
}