/**
 * Created by sahand on 10/7/15.
 */
if (Meteor.isServer) {
	Meteor.methods({
		createSolution: function (ticket, canvasNumber) {
			var newDoc = Solutions.insert({
				workerId: ticket,
				state: "{\"objects\":[],\"background\":\"white\"}",
				createdAt: new Date(),
				dateUpdated: new Date(),
				canvasNumber: canvasNumber,
				status: "pending"
			});
			console.log("created new solution for canvasNumber " + canvasNumber);
			return newDoc;
		},
		updateSolution: function (id, time, state, complexity, updated, name, explain) {
			Solutions.update(id, {
				$inc: {
					time: time
				},
				$set: {
					state: state,
					complexity: complexity,
					dateUpdated: updated,
					name: name,
					explain: explain
				}
			}, function (error, number) {
				if (!error) {
					console.log("upped sketch");
					return true
				}
			});
		},
		updateToolTime: function (id, time) {
			WorkerTickets.update(id, {
				$inc: {
					timeInTool: time
				}
			}, function (error, number) {
				if (!error) {
					console.log("upped tool time");
				}
			});
		},
		updateNameTime: function (id, time) {
			Solutions.update(id, {
				$inc: {
					timeInName: time
				}
			}, function (error, number) {
				if (!error) {
					console.log("upped name time")
				} else {
					console.log(error);
				}
			})
		},
		updateExplainTime: function (id, time) {
			Solutions.update(id, {
				$inc: {
					timeInExplain: time
				}
			}, function (error, number) {
				if (!error) {
					console.log("upped name time")
				} else {
					console.log(error);
				}
			})
		}
	});

	Meteor.publish("solutions", function () {
		return Solutions.find();
	});
}


if (Meteor.isClient) {

	Meteor.subscribe("solutions");

	var tutorialSteps = [
		{
			element: '#intro1',
			intro: "This is your decision point. Read it carefully and try to think of alternative solutions to solve it. We want you to try to come up with multiple solutions for this decision point. We are not looking for the one best design but for a variety of designs that each have their own pros and cons",
			position: 'bottom'
		},
		{
			element: '#intro2',
			intro: "To help others understand your solutions you have to sketch them. In this area you have 5 sketch panels and their respective name and description fields. We are looking for high level sketches like you would make on a whiteboard. You can keep your sketches simple, but please keep them understandable. Also remember that a good sketch complements the textual description and visa versa.",
			position: 'bottom'
		},
		{
			element: '#toolbarContainer',
			intro: "These are your sketching tools. Click on the question mark to toggle on the tips to see how each of the tools work.",
			position: 'bottom'
		},
		{
			element: '#finishRequest',
			intro: "Press REVIEW AND FINISH when you are ready to submit your work. This will give you the opportunity to review your designs one more time before submitting them. After reviewing, you can either submit your work or hit cancel and go back.",
			position: 'bottom'
		},
		{
			element: '#infoRequest',
			intro: "Press TASK INFO if you want to review the general task information and the design criteria from the first page again.",
			position: 'bottom'
		},
		{
			element: '#tutorialRequest',
			intro: "Press TUTORIAL if you want to see this tutorial again.",
			position: 'bottom'
		},
		{
			element: '#quitRequest',
			intro: "Press QUIT whenever you want to quit your task. We would appreciate it greatly if you would give some feedback on the tool, task and a reason for quiting so we can improve it in the future.",
			position: 'bottom'
		}
	];

	Template.tool.rendered = function () {
		if (!this._rendered) {
			this._rendered = true;

			if (!Session.get("tutorialDone")) {
				console.log("start tutorial");

				introJs().setOptions({
					"scrollToElement": true,
					"showStepNumbers": false,
					"showProgress": true,
					"showBullets": false,
					"exitOnOverlayClick": false,
					steps: tutorialSteps
				}).start();
				Session.setPersistent("tutorialDone", true);
			}
		}
	};

	Template.tool.helpers({
		workerTicket: function () {
			return WorkerTickets.findOne(this._id);
		},
		decisionPoint: function () {
			return DecisionPoints.findOne(this.decisionPointId);
		},
		solutions: function () {
			return Solutions.find({workerId: Session.get("ticket")}, {sort: {canvasNumber: 1}});
		},
		shouldGenerateReviews: function () {
			return Session.get("shouldGenerateReviews");
		},
		imageForCanvas: function (canvasNumber) {
			function isCanvasWithIndex(canvas) {
				return canvas.CDIndex == canvasNumber;
			}

			var canvasFound = canvases.filter(isCanvasWithIndex);
			return canvasFound[0].toDataURL({
				format: 'jpeg',
				quality: 0.8
			});
		},
		canvasIsComplexEnough: function () {
			return this.complexity > 0;
		},
		numberComplexEnough: function () {
			function isCanvasComplex(canvas) {
				return canvas._objects.length > 0;
			}

			return canvases.filter(isCanvasComplex).length;
		},
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

	Template.tool.events({
		"change input[name=quitReason]": function () {
			$("#quitSubmit").removeClass("disabled");
			$("#quitSubmit").prop("disabled", false);
		},
		"submit #quitForm": function (event) {
			event.preventDefault();

			var reason = $("#quitForm input[name=quitReason]:checked").val()
			var feedback = $("#quitText").val();

			QuitSurveys.insert({
				workerTicket: Session.get("ticket"),
				reason: reason,
				feedback: feedback
			});

			WorkerTickets.update(Session.get("ticket"), {
				$set: {
					quit: true
				}

			});

			$('#quitModal').on('hidden.bs.modal', function () {
				window.location.href = 'http://www.google.com';
			}).modal('hide')
		},
		"click #tutorialRequest": function () {
			introJs().setOptions({
				"scrollToElement": true,
				"showStepNumbers": false,
				"showProgress": true,
				"showBullets": false,
				"exitOnOverlayClick": false,
				steps: tutorialSteps
			}).start();
		},

		"click #finishConfirm": function () {
			$('#finishModal').on('hidden.bs.modal', function () {
				WorkerTickets.update(Session.get("ticket"), {
					$set: {
						submitted: true
					}
				}, function () {
					var n = noty({
						text: 'Success! Your work has been submitted.',
						layout: 'topRight',
						theme: 'relax', // or 'relax'
						type: 'success',
						timeout: 4000,
						animation: {
							open: 'animated bounceInRight', // Animate.css class names
							close: 'animated bounceOutRight', // Animate.css class names
							easing: 'swing', // unavailable - no need
							speed: 500 // unavailable - no need
						}
					});
					Router.go("/exit/" + Session.get("ticket"));
				});
			}).modal('hide');
		},
		"click #finishCancel": function () {
			Session.set("shouldGenerateReviews", false);
		}
	});

	Template.decisionPointInformationPanel.events({
		"click #finishRequest": function () {
			Session.set("shouldGenerateReviews", true);

			function completedTextFieldsForUsedSketches() {
				var allFieldsAreFilled = true;
				$.each(canvases, function () {
					var canvasNumber = this.CDIndex;
					if (this._objects.length > 0) {
						var nameForThisCanvas = $("#name-" + canvasNumber);
						var explainForThisCanvas = $("#explain-" + canvasNumber);
						if (nameForThisCanvas.val() == "" || explainForThisCanvas.val() == "") {
							allFieldsAreFilled = false;
						}
					}
				});
				return allFieldsAreFilled;
			}

			if (completedTextFieldsForUsedSketches()) {
				$('#finishModal').modal('show');
			} else {
				var n = noty({
					text: 'One of the sketches you made is missing a name or an explanation! Give it one and try again :)',
					layout: 'topLeft',
					theme: 'relax', // or 'relax'
					type: 'warning',
					timeout: 6500,
					animation: {
						open: 'animated bounceInLeft', // Animate.css class names
						close: 'animated bounceOutLeft', // Animate.css class names
						easing: 'swing', // unavailable - no need
						speed: 500 // unavailable - no need
					}
				});
			}
		}
	});
}
;


