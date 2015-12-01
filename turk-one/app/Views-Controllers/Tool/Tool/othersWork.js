/**
 * Created by sahand on 11/23/15.
 */
if (Meteor.isClient) {
	Template.othersWorkImages.helpers({
		// TODO: Turn this helper and the solutions helper on tool into smaller, more specified subscribes instead of subscribes to all of the Solutions collection
		otherSolutions: function () {
			return Solutions.find({
					submitted: true,
					status: {$ne: "rejected"},
					decisionPointId: this._id,
					complexity: {$gt: 1},
					workerId: {$ne: Session.get("ticket")}
				},
				{
					sort: {dateUpdated: -1}
				});
		}
	});

	Template.othersWorkInteractive.helpers({
		// TODO: Turn this helper and the solutions helper on tool into smaller, more specified subscribes instead of subscribes to all of the Solutions collection
		otherSolutions: function () {
			return Solutions.find({
					submitted: true,
					status: {$ne: "rejected"},
					decisionPointId: this._id,
					complexity: {$gt: 1},
					workerId: {$ne: Session.get("ticket")},
				},
				{
					sort: {dateUpdated: -1}
				});
		}
	});

	Template.othersWorkInteractive.onRendered(function () {
		tourThroughDecisionPoint = {
			id: "dp",
			steps: [
				{
					delay: 500,
					yOffset: 100,
					title: "Using the work of others",
					content: "You can click on the work of others or the grey icon in the top to get a more detailed view of the solutions. Not only can you then read the description and title of the solutions but you can also duplicate the entire canvas, or a selection of objects, to one of your own 5 canvasses.",
					target: "#intro4",
					multipage: true,
					placement: 'bottom',
					fixedElement: true,
					onNext: function () {

						changeSizeClass();
					}
				},
				{
					title: "this does not show"
				}
			]
		};
		if (hopscotch.getState() == "tool:3") {
			hopscotch.endTour(tourWithOthers);
			hopscotch.endTour(tour);
			hopscotch.startTour(tourThroughDecisionPoint);
		}
	});

	Template.othersWorkImages.onRendered(function () {
		if (Session.get("savedSet" + Session.get("ticket")) != true) {
			var solutions = Solutions.find({
					submitted: true,
					decisionPointId: this.data._id,
					complexity: {$gt: 1},
					workerId: {$ne: Session.get("ticket")}
				},
				{
					sort: {dateUpdated: -1}
				}).fetch();
			var solutionIds = $.map(solutions, function (s) {
				return s._id
			});
			Meteor.call("logAllSolutionIdsAvailableToWorker", Session.get("ticket"), solutionIds, function (e, r) {
				if (!e) {
					Session.setPersistent("savedSet" + Session.get("ticket"), true);
				} else {
					console.log(e);
				}
			})
		}
		if (hopscotch.getState() == "dp:1") {
			hopscotch.endTour(tourThroughDecisionPoint);
			hopscotch.startTour(tourFinishControls);
		}
	});

	setFlashingSolutionImageViews = function (flashing, message) {
		$.each($(".solutionImageTargetOverlay"), function () {
			if (flashing) {
				$(this).addClass('animated flash infinite');
				$(this).css("display", "block");
			} else {
				$(this).removeClass('animated flash infinite');
				$(this).css("display", "none");
			}
		});
	};

}