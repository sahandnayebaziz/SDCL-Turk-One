/**
 * Created by sahand on 10/27/15.
 */
if (Meteor.isClient) {
	Template.exit.events({
		"change input:radio": function () {
			if ($("#exitForm input[name=taskDifficulty]:checked").length > 0 &&
				$("#exitForm input[name=decisionPointDifficulty]:checked").length > 0 &&
				$("#exitForm input[name=toolDifficulty]:checked").length > 0) {
				$("#exitConfirm").removeClass("disabled");
				$("#exitConfirm").prop("disabled", false);
			}
		}
	});
}