/**
 * Created by edgar on 02/12/15.
 */
if (Meteor.isServer) {
}

if (Meteor.isClient) {

    Template.adminQualityReviewInterior.helpers({

        solutions: function () {
            return Solutions.find({
                    submitted: true,
                    status: "accepted",
                    decisionPointId: this._id
                },
                {
                    sort: {_id: -1} //sort of random sorting
                });
        },

        decisionPoints: function () {
            // find all decisions, sorted by id
            return DecisionPoints.find({}, {sort: {_id: 1}});
        }
    });
}