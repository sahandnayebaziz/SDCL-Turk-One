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
			return Solutions.find({workerId: this._id, accepted: true}).count();
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
			return Solutions.find({workerId: this._id, accepted: true}).count();
		}
	})
}