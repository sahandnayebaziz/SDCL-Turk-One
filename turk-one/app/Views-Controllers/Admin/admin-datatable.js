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

	Template.adminDataTable.helpers({
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

	Template.workerDataTableRow.helpers({
		numberOfSolutionsComplexEnough: function () {
			return Solutions.find({workerId: this._id, complexity: {$gt: 0}}).count();
		},
		numberOfSolutionsAccepted: function () {
			return Solutions.find({workerId: this._id, status: "accepted"}).count();
		},
		numberOfSolutionsRejected: function () {
			return Solutions.find({workerId: this._id, status: "rejected"}).count();
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
			return moment(this.visited.toString()).format("MM/DD/YYYY HH:mm:ss");
		},
		solutions: function () {
			return Solutions.find({workerId: this._id}, {sort: {canvasNumber: 1}});
		},
		timeInToolFormatted: function () {
			// Assuming workerTicket.timeInTool is the total time a worker spends anywhere on the tool
			return moment.duration(this.timeInTool, "seconds").format("hh:mm:ss", { trim: false });
		},
		homeTimeFormatted: function () {
			return moment.duration(this.homeTime, "seconds").format("hh:mm:ss", { trim: false });
		},
		totalSketchingTimeFormatted: function () {
			var solutions = Solutions.find({workerId: this._id}, {sort: {canvasNumber: 1}});

			var totalSolutionTime = 0;

			// Assuming solution.time is the total time a worker spends using the solution sketch editor
			solutions.forEach(function(solution) {
				if (solution.time > 0) {
					totalSolutionTime += solution.time;
				}
			});

			return moment.duration(totalSolutionTime, "seconds").format("hh:mm:ss", { trim: false });
		},
		infoModalTimeFormatted: function () {
			return moment.duration(this.infoModalTime, "seconds").format("hh:mm:ss", { trim: false });
		},
		averageSolutionTime: function () {
			var solutions = Solutions.find({workerId: this._id}, {sort: {canvasNumber: 1}});

			var totalSolutionTime = 0;
			var validSketchesCount = 0;

			// Solutions where no time was spent sketching are discarded from the average calculation
			solutions.forEach(function(solution) {
				if (solution.time > 0) {
					totalSolutionTime += solution.time;
					validSketchesCount++;
				}
			});

			return moment.duration(totalSolutionTime / validSketchesCount, "seconds").format("hh:mm:ss", { trim: false });
		},
		averageSketchComplexity: function () {
			var solutions = Solutions.find({workerId: this._id}, {sort: {canvasNumber: 1}});

			var complexitySum = 0;
			var validSketchesCount = 0;

			// Solutions with complexity = 0 (empty) are discarded from the average calculation
			solutions.forEach(function(solution) {
				if (solution.complexity > 0) {
					complexitySum += solution.complexity;
					validSketchesCount++;
				}
			});

			return complexitySum / validSketchesCount;
		},
		averageExplanationLength: function () {
			var solutions = Solutions.find({workerId: this._id}, {sort: {canvasNumber: 1}});

			var explanationLength = 0;
			var validSketchesCount = 0;

			// Solutions with no description are discarded from the average calculation
			solutions.forEach(function(solution) {
				if (solution.explain != null && solution.explain.length > 0) {
					explanationLength += solution.explain.length;
					validSketchesCount++;
				}
			});

			return explanationLength / validSketchesCount;
		},
		quitSurvey: function () {
			return QuitSurveys.findOne({workerTicket: this._id});
		},
		exitSurvey: function () {
			return ExitSurveys.findOne({workerTicket: this._id});
		},
	});

	Template.workerDataTableControls.helpers({
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

	Template.workerDataTableControls.events({
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
}