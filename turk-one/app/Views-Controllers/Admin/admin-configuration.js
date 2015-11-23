/**
 * Created by sahand on 11/22/15.
 */
if (Meteor.isServer) {
	Meteor.publish("configurations", function() {
		return Configurations.find();
	});

	Meteor.methods({
		updateConfiguration: function (shouldShowOthersWork) {
			Configurations.remove(1);
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
		}
	})

	Template.adminConfiguration.helpers({
		mainConfiguration: function () {
			return Configurations.findOne(1);
		}
	})
}