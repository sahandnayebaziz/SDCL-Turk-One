/**
 * Created by sahand on 10/29/15.
 */
if (Meteor.isServer) {
	Meteor.methods({
		deleteExitSurvey: function(id) {
			ExitSurveys.remove(id);
		},
		deleteQuitSurvey: function(id) {
			QuitSurveys.remove(id);
		}
	});
}

if (Meteor.isClient) {
	Template.adminSurveys.helpers({
		exitSurveys: function () {
			return ExitSurveys.find({}, {sort: {_id: 1}});
		},
		quitSurveys: function () {
			return QuitSurveys.find({}, {sort: {_id: 1}});
		}
	});

	Template.quitSurveyRow.events({
		"click .delete": function() {
			var idToDelete = this._id;
			bootbox.dialog({
				message: "Are you sure you want to delete this survey?",
				title: "Delete quit survey",
				buttons: {
					cancel: {
						label: "Cancel",
						className: "btn-secondary",
					},
					danger: {
						label: "Yes, delete",
						className: "btn-danger",
						callback: function() {
							Meteor.call("deleteQuitSurvey", idToDelete);
						}
					}
				}
			});
		}
	});

	Template.exitSurveyRow.events({
		"click .delete": function() {
			var idToDelete = this._id;
			bootbox.dialog({
				message: "Are you sure you want to delete this survey?",
				title: "Delete exit survey",
				buttons: {
					cancel: {
						label: "Cancel",
						className: "btn-secondary",
					},
					danger: {
						label: "Yes, delete",
						className: "btn-danger",
						callback: function() {
							Meteor.call("deleteExitSurvey", idToDelete);
						}
					}
				}
			});
		}
	})

}