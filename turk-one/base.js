/**
 * Created by sahand on 10/7/15.
 */
if (Meteor.isClient) {
	Template.home.helpers({

	});

	Template.home.events({

	});

	Template.home.rendered = function() {
		if(!this._rendered) {
			this._rendered = true;

			console.log(this.data);

			// TODO: Check if worker ID already made. Which values here are unique?
			WorkerTickets.insert(this.data, function(error, id) {
				if (!error) {
					console.log("created a worker ticket successfully with id: " + id);
					Session.set("ticketId", id);
				}
			})
		}
	}
}