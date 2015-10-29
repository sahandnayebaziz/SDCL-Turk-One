/**
 * Created by sahand on 10/28/15.
 */
if (Meteor.isClient) {
	// worker review page
	Template.adminWorkers.helpers({
		workerTickets: function () {
			return WorkerTickets.find({}, {sort: {workerId: -1}});
		}
	});

	Template.workerTicketRow.events({
		"click .delete": function () {
			WorkerTickets.remove(this._id);
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
			if (this.reviewed) {
				return "reviewed"
			}
			else if (this.submitted) {
				return "submitted"
			} else {
				return "in-progress"
			}
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
		}
	});

	Template.worker.events({
		"click .reviewed": function() {
			WorkerTickets.update(this._id, {
				$set: {
					reviewed: true
				}
			})
		},
		"click .cancelReviewed": function() {
			WorkerTickets.update(this._id, {
				$set: {
					reviewed: false
				}
			})
		}
	})

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
		}
	});

	Template.solutionReviewModule.events({
		"click .cancel": function() {
			Solutions.update(this._id, {
				$set: {
					status: "pending"
				}
			})
		},
		"click .accept": function() {
			Solutions.update(this._id, {
				$set: {
					status: "accepted"
				}
			})
		},
		"click .reject": function() {
			Solutions.update(this._id, {
				$set: {
					status: "rejected"
				}
			})
		}

	});
}