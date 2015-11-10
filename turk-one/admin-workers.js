/**
 * Created by sahand on 10/28/15.
 */
if (Meteor.isServer) {
	Meteor.methods({
		deleteTicket: function (id) {
			WorkerTickets.remove(id);
		},
		updateTicketReviewed: function (id, reviewedFlag) {
			WorkerTickets.update(id, {
				$set: {
					reviewed: reviewedFlag
				}
			}, function (error) {
				if (!error) {
					console.log("set reviewed " + reviewedFlag);
				}
			})
		},
		updateSolutionStatus: function (id, newStatus) {
			Solutions.update(id, {
				$set: {
					status: newStatus
				}
			}, function (error) {
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
	function createMongoSelectorFromConditionals(arrayOfConditionals) {
		if (arrayOfConditionals.length > 0) {
			return {$or: arrayOfConditionals};
		} else {
			return {}
		}
	}

	Template.adminWorkers.helpers({
		workerTickets: function () {
			// TODO: Store session keys someplace so we don't have to remember the keys specifically each time
			var statusesSelected = Session.get("shouldShowStatuses");

			if (!statusesSelected) {
				return WorkerTickets.find({}, {sort: {visited: -1}});
			}
			else {
				var conditionalsToAllow = [];

				$.each(statusesSelected, function (i, status) {
					switch (status) {
						case "reviewed":
							conditionalsToAllow.push({"reviewed": true});
							break;
						case "submitted":
							conditionalsToAllow.push({
								$and: [
									{$or: [{"reviewed": false}, {"reviewed": {$exists: false}}]},
									{$or: [{"quit": false}, {"quit": {$exists: false}}]},
									{"submitted": true}
								]
							});
							break;
						case "in-progress":
								conditionalsToAllow.push({
									$and: [
										{"reviewed": {$exists: false}},
										{"submitted": {$exists: false}},
										{"quit": {$exists: false}}
									]
								});
							break;
						case "quit":
							conditionalsToAllow.push({"quit": true});
							break;
						default:
							break;
					}
				});

				var filters = createMongoSelectorFromConditionals(conditionalsToAllow);
				return WorkerTickets.find(filters, {sort: {visited: -1}});
			}
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
		timeFormatted: function () {
			moment.tz.setDefault("America/Los_Angeles");
			return moment(this.visited.toString()).calendar();
		}
	});

	Template.workerTableControls.helpers({
		filterShownClass: function (filter) {
			var existingFilters = Session.get("shouldShowStatuses");
			if (existingFilters) {
				if ($.inArray(filter, existingFilters) == -1) {
					return "hidden-filter";
				} else {
					return "shown-filter";
				}
			} else {
				return "hidden-filter";
			}
		}
	});

	Template.workerTableControls.events({
		"click .filter-control": function (e) {
			var statusFilterToggled = $(e.target).attr('data-filter');
			var newFilters = [];
			if (Session.get("shouldShowStatuses")) {
				var existingFilters = Session.get("shouldShowStatuses");
				newFilters = existingFilters;
			}

			var index = $.inArray(statusFilterToggled, newFilters)
			if (index != -1) {
				newFilters.splice(index, 1);
			} else {
				newFilters.push(statusFilterToggled);
			}

			Session.set("shouldShowStatuses", newFilters);
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
		isComplexEnough: function () {
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
		"click .reviewed": function () {
			Meteor.call("updateTicketReviewed", this._id, true, function (e, r) {
				if (!e) {
					Router.go("/admin");
				}
			});
		},
		"click .cancelReviewed": function () {
			Meteor.call("updateTicketReviewed", this._id, false, function (e, r) {
				if (!e) {
					Router.go("/admin");
				}
			});
		}
	});

	Template.solutionReviewModule.helpers({
		viewStatus: function () {
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
		"click .cancel": function () {
			Meteor.call("updateSolutionStatus", this._id, "pending");
		},
		"click .accept": function () {
			Meteor.call("updateSolutionStatus", this._id, "accepted");
		},
		"click .reject": function () {
			Meteor.call("updateSolutionStatus", this._id, "rejected");
		}

	});
}