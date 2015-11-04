/**
 * Created by sahand on 10/7/15.
 */
if (Meteor.isClient) {

	Template.home.helpers({
		existingWorkerTicket: function () {
			return WorkerTickets.findOne({
				sessionId: this.sessionId,
				workerId: this.workerId,
				decisionPointId: this.decisionPointId
			});
		},
		decisionPointText : function() {
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
			Meteor.call("updateWorkerHomeTime", homeStopwatch.getElapsed().seconds);
		}
	});

	Template.home.rendered = function() {

		if(!this._rendered) {
			this._rendered = true;

			var w = this.data.workerId;
			var s = this.data.sessionId;
			var d = this.data.decisionPointId;
			var v = new Date();
			Meteor.call("determineWorkerTicketId", w, s, d, v); //worker, session, decsion, visited

		}
	}
}

Meteor.methods({
	determineWorkerTicketId: function (w, s, d, v) {
		if (Session.get("ticketedFor" + w)) {
			Session.setPersistent("ticket", Session.get("ticketedFor" + w));
			console.log("ticket exists and was set");
			console.log("tutorial status is:" + Session.get("tutorialDone"));
		} else {
			WorkerTickets.insert({
				workerId: w,
				sessionId: s,
				decisionPointId: d,
				visited: v
			}, function(error, id) {
				if (!error) {
					console.log("created a worker ticket successfully with id: " + id);
					Session.setPersistent("ticket", id);
					Session.setPersistent("ticketedFor" + w, id);
					Session.setPersistent("tutorialDone", false);
					Session.setPersistent("tipsToggled", false);
					console.log("tutorial status was set to:" + Session.get("tutorialDone"));
				}
			})
		}
	},
	updateWorkerHomeTime: function(time) {
		WorkerTickets.update(Session.get("ticket"), {
			$inc: {
				homeTime: time
			}
		}, function () {
			homeStopwatch.reset();
		})
	}
});