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
		}
	});

	Template.home.events({
		"click .btn-continue": function() {
			Router.go("/help/" + Session.get("ticket"));
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
					}
				})
			}
		}
	}
}