/**
 * Created by edgar on 02/12/15.
 */
if (Meteor.isServer) {
}

if (Meteor.isClient) {

    reviewNumber = 2;

    Template.adminQualityReviewInterior.helpers({

        solutions: function () {
            var workers = WorkerTickets.find({
                decisionPointId: this._id
            }).fetch();

            var tickets = _.chain(workers)
                .pluck('_id')
                .flatten()
                .uniq()
                .value();

            var results = Solutions.find({
                    status: "accepted",
                    workerId: {$in: tickets}
                },
                {
                    sort: {_id: -1} //sort of random sorting
                }).fetch();

            console.log("results: " +results);

            return results;
        },

        decisionPoints: function () {
            // find all decisions, sorted by id
            return DecisionPoints.find({}, {sort: {_id: 1}});
        },

        reviewNumber: function () {
            console.log('reviewNumber: ' +reviewNumber);
            reviewNumber += 1;
            return reviewNumber;
        },

        resetNumbering: function () {
            reviewNumber=2;
        }
    });
}