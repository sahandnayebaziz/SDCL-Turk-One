/**
 * Created by sahand on 10/29/15.
 */
if (Meteor.isClient) {
	Template.adminSurveys.helpers({
		exitSurveys: function () {
			return ExitSurveys.find({}, {sort: {_id: 1}});
		},
		quitSurveys: function () {
			return QuitSurveys.find({}, {sort: {_id: 1}});
		}
	});
}