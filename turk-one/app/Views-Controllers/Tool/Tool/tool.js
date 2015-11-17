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
					console.log("upped explain time")
				} else {
					console.log(error);
				}
			})
		},
		updateInfoModalTime: function (ticket, time) {
			WorkerTickets.update(ticket, {
				$inc: {
					infoModalTime: time,
					infoModalNumber: 1
				}
			}, function (e, n) {
				console.log("upped info modal");
			})
		},
		submitQuitSurvey: function (ticket, reason, feedback) {
			QuitSurveys.insert({
				workerTicket: ticket,
				reason: reason,
				feedback: feedback
			}, function (error) {
				if (!error) {
					console.log("created quit survey");
				} else {
					console.log(error);
				}
			})
		},
		setTicketFlagQuit: function (ticket) {
			WorkerTickets.update(ticket, {
				$set: {
					quit: true
				}
			}, function (error) {
				if (!error) {
					console.log("set flag quit");
				}
			})
		},
		setTicketFlagSubmitted: function (ticket) {
			WorkerTickets.update(ticket, {
				$set: {
					submitted: true
				}
			}, function (error) {
				if (!error) {
					console.log("set flag submitted");
				}
			})
		}
	});

	Meteor.publish("solutions", function () {
		return Solutions.find();
	});

	Meteor.publish("decisionPoints", function () {
		return DecisionPoints.find();
	});
}


if (Meteor.isClient) {

	Meteor.subscribe("solutions");
	Meteor.subscribe("decisionPoints");

	tutorialSteps = [
		{
			element: '#intro1',
			intro: "This is the problem you are trying to solve. Please, do not worry about coming up with a perfect solution. We want you to explore the problem at a high level and offer a few different ideas you think could work!",
			position: 'bottom'
		},
		{
			element: '#intro2',
			intro: "Sketch out your ideas. We are looking for high level sketches like you would make on a whiteboard. You can keep your sketches simple, but please keep them understandable. Don't forget to give each sketch a name and a description!",
			position: 'bottom'
		},
		{
			element: "#intro1",
			intro: "Your controls are here as well. When you are finished, you can review and submit your ideas. If you'd like to quit the HIT, you can click quit. Take your time and click one of these when finished. Each gives you a chance to cancel!",
			position: 'bottom'
		}
	];


	Template.tool.helpers({
		shouldShow: function () {
			return !this.submitted && !this.quit;
		},
		workerTicket: function () {
			return WorkerTickets.findOne(this._id);
		},
		decisionPoint: function () {
			return DecisionPoints.find({_id: this.decisionPointId.toString()}).fetch()[0];
		},
		solutions: function () {
			return Solutions.find({workerId: Session.get("ticket")}, {sort: {canvasNumber: 1}});
		},
		hasAtLeastOneSolution: function () {
			return Solutions.findOne({workerId: Session.get("ticket")});
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

			Meteor.call("submitQuitSurvey", Session.get("ticket"), reason, feedback, function (e, r) {
				if (!e) {
					// set workerticket
					// nav away
					Meteor.call("setTicketFlagQuit", Session.get("ticket"), function (e, r) {
						if (!e) {
							$('#quitModal').on('hidden.bs.modal', function () {
								window.location.href = 'http://www.google.com'; // TODO: take to thank you page
							}).modal('hide')
						}
					});
				}
			});

		},
		"click #quitRequest": function () {
			hideAllTooltips();
		},
		"click #infoRequest": function () {
			hideAllTooltips();
		},
		"click #tutorialRequest": function () {
			hideAllTooltips();
			introJs().setOptions({
				"scrollToElement": true,
				"showStepNumbers": false,
				"showProgress": true,
				"showBullets": false,
				"exitOnOverlayClick": false,
				steps: tutorialSteps
			}).start();
		},
		"click #tipsRequest": function () {

			$('[data-toggle="tooltip"]').tooltip('toggle');
			$('#tutorialRequest').toggle();

			// TODO: Tooltip isn't finding the help button in the toolbar correctly


		},
		"click #finishConfirm": function () {


			$('#finishModal').on('hidden.bs.modal', function () {
				Meteor.call("setTicketFlagSubmitted", Session.get("ticket"), function (e, r) {
					if (!e) {
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
					}
				});
			}).modal('hide');
		},
		"click #finishCancel": function () {
			Session.set("shouldGenerateReviews", false);
		}
	});

	Template.decisionPointInformationPanel.rendered = function () {
		introJs().setOptions({
			"scrollToElement": true,
			"showStepNumbers": false,
			"showProgress": true,
			"showBullets": false,
			"exitOnOverlayClick": false,
			steps: tutorialSteps
		}).start();
	};

	Template.decisionPointInformationPanel.events({
		"click #finishRequest": function () {
			hideAllTooltips();
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
					text: 'One or more of the sketches you made is missing a name or an explanation! Fill it in and try again :)',
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

	// GLOBAL HELPER METHODS
	hideAllTooltips = function () {
		$('[data-toggle="tooltip"]').tooltip('hide');
		$('#tutorialRequest').toggle(false);
	};
}
;


