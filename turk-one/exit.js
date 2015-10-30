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
		},
		"submit #exitForm": function (event) {
			console.log("submitting form");
			event.preventDefault();

			var taskDifficulty = $("#exitForm input[name=taskDifficulty]:checked").val();
			var decisionDifficulty = $("#exitForm input[name=decisionPointDifficulty]:checked").val();
			var toolDifficulty = $("#exitForm input[name=toolDifficulty]:checked").val();
			var feedback = $("#feedbackText").val();

			ExitSurveys.insert({
				workerTicket: Session.get("ticket"),
				task: taskDifficulty,
				decision: decisionDifficulty,
				tool: toolDifficulty,
				feedback: feedback
			}, function() {
				$('#finalModal').modal("show");
			});
		}
	});
}