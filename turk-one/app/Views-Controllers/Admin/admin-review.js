/**
 * Created by edgar on 02/12/15.
 */
//Send an alert to the user
notify = function (text, type) {
    var n = noty({
        text: text,
        layout: 'topRight',
        theme: 'relax', // or 'relax'
        type: type,
        timeout: 2500,
        animation: {
            open: 'animated bounceInRight', // Animate.css class names
            close: 'animated bounceOutRight', // Animate.css class names
            easing: 'swing', // unavailable - no need
            speed: 500 // unavailable - no need
        }
    });
};

if (Meteor.isServer) {
    //TODO: add the experiment tag to the review
    Meteor.methods({
        submitQualityReview: function (solution, ticket, decisionPointId, understandability, completeness, feasibility, missingContext) {
            QualityReviews.insert({
                solutionId: solution,
                workerTicket: ticket,
                decisionPointId: decisionPointId,
                understandability: understandability,
                completeness: completeness,
                feasibility: feasibility,
                missingContext: missingContext
            }, function (error) {
                if (!error) {
                    console.log("subbed exit survey");
                }
            })
        }
    })
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
        },

        numberOfSolutions: function () {
            return Solutions.find({
                    submitted: true,
                    status: "accepted",
                    decisionPointId: this._id
                }).count();
        }
    });

    Template.adminQualityReviewInterior.events({
        "change input:radio": function (event) {
            // do an additional check here to make sure you cannot enter empty values
            var radioButton = event.target;
            console.log("value: " +radioButton.value);
            console.log("id: " +radioButton.name);

            if (radioButton.value > 0 ) {
                $("#saveReview" + this._id).removeClass("disabled");
                $("#saveReview" + this._id).prop("disabled", false);
                console.log("passed the check");
            }
        },
        "submit #saveReview": function (event) {
            // make this submit fire on everything that is .qualityReviewForm (give them a class)
            // instead of grabbing the form by an id, grab it frmo event ^^^^
            // event.target

            // log event
            // myForm = event.target

            console.log("submitting review");
            event.preventDefault();

            // if we say form = event.target
            // this becomes form.understandability.value
            // form.completeness.value

            var understandability = $("#qualityReviewForm input[name=understandability]:checked").val();
            var completeness = $("#qualityReviewForm input[name=completeness]:checked").val();
            var feasibility = $("#qualityReviewForm input[name=feasibility]:checked").val();
            var missingContext = $("#qualityReviewForm input[name=missingContext]:checked").val();

            console.log("understandability: " +understandability);
            console.log("completeness: " +completeness);
            console.log("feasibility: " +feasibility);
            console.log("missingContext: " +missingContext);
            console.log("this._id: " +this._id);
            console.log("this.workerId: " +this.workerId);
            console.log("this.decisionPointId: " +this.decisionPointId);

            Meteor.call("submitQualityReview", this._id, this.workerId, this.decisionPointId, understandability, completeness, feasibility, missingContext, function(e, r) {
                if (!e) {
                    notify("Quality review submitted", "success");
                    $("#qualityReviewForm").fadeOut( "slow" );
                    //TODO: add solution to reviewed list and remove from current list.
                    //TODO: save button should turn green and say review submitted.
                    //TODO: should have a cancel button to edit/redo/update the review
                }
            });
        }
    });
}