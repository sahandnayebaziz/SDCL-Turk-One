/**
 * Created by sahand on 11/23/15.
 */
if (Meteor.isClient) {
	Template.othersWorkImages.helpers({
		// TODO: Turn this helper and the solutions helper on tool into smaller, more specified subscribes instead of subscribes to all of the Solutions collection
		otherSolutions: function () {
			return Solutions.find({
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
					decisionPointId: this._id,
					complexity: {$gt: 1},
					workerId: {$ne: Session.get("ticket")},
				},
				{
					sort: {dateUpdated: -1}
				});
		}
	});

	Template.othersWorkInteractive.onRendered(function(){

	});
}