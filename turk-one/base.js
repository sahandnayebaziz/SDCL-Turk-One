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

		DecisionPointText : function() {
			console.log("the dp type is:" +DecisionPoints.findOne(this.decisionPointId).type);

			if (DecisionPoints.findOne(this.decisionPointId).type == 'UI') {
				return "The decision point on which you are asked to work concerns the user interface of the simulator. That is, you will need to design the visual elements and interaction that the user has with the program for that decision point."
			} else {
				return "The decision point on which you are asked to work concerns the implementation of the simulator. That is, you will need to design the classes and interfaces that the programmer will need to implement for that decision point."
			}
		}

	});

	Template.home.events({
		"click .btn-continue": function() {
			Router.go("/tool/" + Session.get("ticket"));
		}
	});

	Template.home.rendered = function() {

		if(!this._rendered) {
			this._rendered = true;

			workerId = this.data.workerId;
			//console.log(this.data);
			this.data["visited"] = new Date();
			if (Session.get("ticketedFor" + workerId)) {
				Session.setPersistent("ticket", Session.get("ticketedFor" + workerId));
				console.log("ticket exists and was set");
				console.log("tutorial status is:" +Session.get("tutorialDone"));
			} else {
				WorkerTickets.insert({
					workerId: this.data.workerId,
					sessionId: this.data.sessionId,
					decisionPointId: this.data.decisionPointId,
					visited: this.data.visited
				}, function(error, id) {
					if (!error) {
						console.log("created a worker ticket successfully with id: " + id);
						Session.setPersistent("ticket", id);
						Session.setPersistent("ticketedFor" + workerId, id);
						Session.setPersistent("tutorialDone", false);
						console.log("tutorial status was set to:" +Session.get("tutorialDone"));
					}
				})
			}
		}
	}
}