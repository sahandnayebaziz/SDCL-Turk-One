/**
 * Created by sahand on 10/28/15.
 */
if (Meteor.isServer) {
	Meteor.methods({
		deleteTicket: function(id) {
			WorkerTickets.remove(id);
		},
		updateTicketReviewed: function(id, reviewedFlag) {
			WorkerTickets.update(id, {
				$set: {
					reviewed: reviewedFlag
				}
			}, function(error) {
				if (!error) {
					console.log("set reviewed " + reviewedFlag);
				}
			})
		},
		updateSolutionStatus: function(id, newStatus) {
			Solutions.update(id, {
				$set: {
					status: newStatus
				}
			}, function(error) {
				if (!error) {
					console.log("solution status now " + newStatus);
				}
			})
		}
	})
}

if (Meteor.isClient) {

	Meteor.subscribe("workerTickets");

	// worker review page
	Template.adminWorkers.helpers({
		workerTickets: function () {
			return WorkerTickets.find({}, {sort: {visited: -1}});
		}
	});

	Template.workerTicketRow.events({
		"click .delete": function () {
			var id = this._id;
			$("#modal" + this._id).on('hidden.bs.modal', function () {
				Meteor.call("deleteTicket", id);
			}).modal('hide')
		}
	});

	Template.workerTicketRow.helpers({
		numberOfSolutionsComplexEnough: function () {
			return Solutions.find({workerId: this._id, complexity: {$gt: 0}}).count();
		},
		numberOfSolutionsAccepted: function () {
			return Solutions.find({workerId: this._id, status: "accepted"}).count();
		},
		decisionPoint: function () {
			return DecisionPoints.findOne(this.decisionPointId);
		},
		viewStatus: function () {
			if (this.reviewed) {
				return "text-success";
			}
			return "";
		},
		viewStatusLabelClass: function () {
			if (this.quit) {
				return "label-danger"
			}
			if (this.reviewed) {
				return "label-success"
			}
			else if (this.submitted) {
				return "label-primary"
			} else {
				return "label-default"
			}
		},
		viewStatusLabelMessage: function () {
			if (this.quit) {
				return "quit"
			}
			if (this.reviewed) {
				return "reviewed"
			}
			else if (this.submitted) {
				return "submitted"
			} else {
				return "in-progress"
			}
		},
		timeFormatted: function() {
			moment.tz.setDefault("America/Los_Angeles");
			return moment(this.visited.toString()).calendar();
		}
	});

	Template.worker.helpers({
		decisionPoint: function () {
			return DecisionPoints.findOne(this.decisionPointId);
		},
		solutions: function () {
			return Solutions.find({workerId: this._id}, {sort: {canvasNumber: 1}});
		},
		numberOfSolutionsComplexEnough: function () {
			return Solutions.find({workerId: this._id, complexity: {$gt: 0}}).count();
		},
		numberOfSolutionsAccepted: function () {
			return Solutions.find({workerId: this._id, status: "accepted"}).count();
		},
		numberOfSolutionsRejected: function () {
			return Solutions.find({workerId: this._id, status: "rejected"}).count();
		},
		isComplexEnough: function() {
			return this.complexity > 0;
		},
		timeInToolInMinutes: function () {
			return parseInt(this.timeInTool / 60);
		},
		timeOnHomeInMinutes: function () {
			return parseInt(this.homeTime / 60);
		},
		timeOnInfoInMinutes: function () {
			return parseInt(this.infoModalTime / 60);
		}
	});

	// TODO: make this a toggle instead of a set and cancel
	Template.worker.events({
		"click .reviewed": function() {
			Meteor.call("updateTicketReviewed", this._id, true);
		},
		"click .cancelReviewed": function() {
			Meteor.call("updateTicketReviewed", this._id, false);
		}
	});

	Template.solutionReviewModule.helpers({
		viewStatus: function() {
			switch (this.status) {
				case "pending":
					return "";
				case "accepted":
					return "bg-success";
				case "rejected":
					return "bg-danger";
				default:
					return "";
			}
		},
		timeInMinutes: function () {
			return parseInt(this.time / 60);
		}
	});

	Template.solutionReviewModule.events({
		"click .cancel": function() {
			Meteor.call("updateSolutionStatus", this._id, "pending");
		},
		"click .accept": function() {
			Meteor.call("updateSolutionStatus", this._id, "accepted");
		},
		"click .reject": function() {
			Meteor.call("updateSolutionStatus", this._id, "rejected");
		}

	});
}