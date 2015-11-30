/**
 * Created by sahand on 11/23/15.
 */
if (Meteor.isClient) {
	Template.othersWorkImages.helpers({
		// TODO: Turn this helper and the solutions helper on tool into smaller, more specified subscribes instead of subscribes to all of the Solutions collection
		otherSolutions: function () {
			return Solutions.find({
						submitted: true,
						decisionPointId: this._id,
						complexity: {$gt: 1},
						workerId: {$ne: Session.get("ticket")},
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