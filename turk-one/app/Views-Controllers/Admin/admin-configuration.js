/**
 * Created by sahand on 11/22/15.
 */
if (Meteor.isServer) {
	Meteor.publish("configurations", function() {
		return Configurations.find();
	});

	Meteor.methods({
		updateConfiguration: function (shouldShowOthersWork) {
			Configurations.upsert(
					{
						_id: 1
					},
					{
						$set: {
							shouldShowOthersWork: shouldShowOthersWork
						}
					}
			)
		},
		deleteSolutions: function () {
			var workers = WorkerTickets.find({}).fetch();
			var tickets = _.chain(workers)
					.pluck('_id')
					.flatten()
					.uniq()
					.value();
			console.log("All known worker tickets: " +tickets);

			var ownerlessSolutions = Solutions.find({workerId: {$nin: tickets}}).count();
			console.log("ownerless solutions deleted: " +ownerlessSolutions);

			Solutions.remove({workerId: {$nin: tickets}})
		}

	});
}

if (Meteor.isClient) {
	Meteor.subscribe("configurations");

	Template.adminConfiguration.events({
		"change #configurationForm": function () {
			var form = document.getElementById("configurationForm");
			Meteor.call("updateConfiguration", form.showOthersWork.checked, function (e, r) {
				console.log(e);
				console.log(r);
				if (!e) {
					notify("Configuration saved.", "success");
				}
			});
		},
		"click .delete": function () {
			$("#modalDelete").on('hidden.bs.modal', function () {
				Meteor.call("deleteSolutions");
			}).modal('hide')
		}
	})

	Template.adminConfiguration.helpers({
		mainConfiguration: function () {
			return Configurations.findOne(1);
		}
	})
}