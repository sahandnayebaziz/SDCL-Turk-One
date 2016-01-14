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
		workerTicketsQuit: function () {
			return WorkerTickets.find({"quit": true}, {sort: {visited: -1}});
		},
		workerTicketsExit: function () {
			return WorkerTickets.find({"submitted": true}, {sort: {visited: -1}});
		}
	});

	Template.quitSurveyRow.helpers({
		quitSurvey: function () {
			return QuitSurveys.findOne({workerTicket: this._id});
		},
		timeFormatted: function () {
			moment.tz.setDefault("America/Los_Angeles");
			return moment(this.visited.toString()).format("MM/DD/YYYY HH:mm:ss");
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

	Template.exitSurveyRow.helpers({
		exitSurvey: function () {
			return ExitSurveys.findOne({workerTicket: this._id});
		},
		timeFormatted: function () {
			moment.tz.setDefault("America/Los_Angeles");
			return moment(this.visited.toString()).format("MM/DD/YYYY HH:mm:ss");
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