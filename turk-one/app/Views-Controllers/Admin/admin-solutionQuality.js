/**
 * Created by edgar on 02/12/15.
 */
if (Meteor.isServer) {
    //Meteor.methods({
    //    deleteQualityReview: function(id) {
    //        QualityReviews.remove(id);
    //    }
    //});
}

if (Meteor.isClient) {
    Template.adminSurveys.helpers({
        qualityReviews: function () {
            return QualityReviews.find({}, {sort: {_id: 1}});
        }
    });

    Template.qualityReviewRow.events({
        //"click .delete": function() {
        //    var idToDelete = this._id;
        //    bootbox.dialog({
        //        message: "Are you sure you want to delete this survey?",
        //        title: "Delete quit survey",
        //        buttons: {
        //            cancel: {
        //                label: "Cancel",
        //                className: "btn-secondary",
        //            },
        //            danger: {
        //                label: "Yes, delete",
        //                className: "btn-danger",
        //                callback: function() {
        //                    Meteor.call("deleteQualityReview", idToDelete);
        //                }
        //            }
        //        }
        //    });
        //}
    });
}