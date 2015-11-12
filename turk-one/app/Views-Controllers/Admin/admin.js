/**
 * Created by sahand on 10/11/15.
 */
if (Meteor.isServer) {
	Meteor.publish("exitSurveys", function() {
		return ExitSurveys.find();
	});

	Meteor.publish("quitSurveys", function() {
		return QuitSurveys.find();
	});
}

if (Meteor.isClient) {

	Meteor.subscribe("exitSurveys");
	Meteor.subscribe("quitSurveys");

	Template.admin.helpers({
		decisionPoints: function () {
			// find all decisions, sorted by id
			return DecisionPoints.find({}, {sort: {_id: 1}});
		},
		solutions: function () {
			return Solutions.find({}, {sort: {_id: 1}});
		}
	});
}