/**
 * Created by sahand on 10/27/15.
 */
if (Meteor.isServer) {
	Meteor.methods({
		submitExitSurvey: function (ticket, task, decision, tool, feedback) {
			ExitSurveys.insert({
				workerTicket: ticket,
				task: task,
				decision: decision,
				tool: tool,
				feedback: feedback
			}, function (error) {
				if (!error) {
					console.log("subbed exit survey");
				}
			})
		}
	})
}

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

			Meteor.call("submitExitSurvey", Session.get("ticket"), taskDifficulty, decisionDifficulty, toolDifficulty, feedback, function(e, r) {
				if (!e) {
					Router.go("/end/" + Session.get("ticket"));
				}
			});
		}
	});
}