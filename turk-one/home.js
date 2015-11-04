/**
 * Created by sahand on 10/7/15.
 */
if (Meteor.isServer) {
	// This code only runs on the server
	Meteor.publish("workerTickets", function () {
		return WorkerTickets.find();
	});

	Meteor.methods({
		createWorkerTicketId: function (w, s, d, v) {
			var newDoc = WorkerTickets.insert({
				workerId: w,
				sessionId: s,
				decisionPointId: d,
				visited: v
			});
			console.log("created new workerTicket");
			return newDoc;
		},
		updateWorkerHomeTime: function (time, ticket) {
			WorkerTickets.update(ticket, {
				$inc: {
					homeTime: time
				}
			})
		}
	});
}

if (Meteor.isClient) {

	Meteor.subscribe("WorkerTickets");

	Template.home.helpers({
		decisionPointText: function () {
			if (DecisionPoints.findOne(this.decisionPointId)) {
				if (DecisionPoints.findOne().decisionPointType == 'UI') {
					return "The decision point on which you are asked to work concerns the user interface of the simulator. That is, you will need to design the visual elements and interaction that the user has with the program for that decision point."
				} else {
					return "The decision point on which you are asked to work concerns the implementation of the simulator. That is, you will need to design the classes and interfaces that the programmer will need to implement for that decision point."
				}
			}
		}

	});

	Template.home.events({
		"click .btn-continue": function () {
			Meteor.call("updateWorkerHomeTime", homeStopwatch.getElapsed().seconds, Session.get("ticket"), function(e, r) {
				if (!e) {
					homeStopwatch.reset();
					Router.go("/tool/" + Session.get("ticket"));
				}
			});
		}
	});
}

