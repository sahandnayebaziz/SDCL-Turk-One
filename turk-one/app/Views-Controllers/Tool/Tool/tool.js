/**
 * Created by sahand on 10/7/15.
 */
//Send an alert to the user
notify = function (text, type) {
	var n = noty({
		text: text,
		layout: 'topRight',
		theme: 'relax', // or 'relax'
		type: type,
		timeout: 2500,
		animation: {
			open: 'animated bounceInRight', // Animate.css class names
			close: 'animated bounceOutRight', // Animate.css class names
			easing: 'swing', // unavailable - no need
			speed: 500 // unavailable - no need
		}
	});
};

if (Meteor.isServer) {
	Meteor.methods({
		createSolution: function (ticket, canvasNumber, decisionPointId) {
			var newDoc = Solutions.insert({
				workerId: ticket,
				decisionPointId: decisionPointId,
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
	Meteor.subscribe("configurations");

	tutorialSteps = [
		{
			element: '#intro1',
			intro: "Here is your task description, try to cover as many requirements in your solutions. Do not worry about coming up with a perfect solution. We want you to explore the problem at a high level and offer a few different solutions you think could work",
			position: 'bottom-middle-aligned'
		},
		{
			element: '#toolView2',
			intro: "Sketch and explain your ideas in these 5 different canvasses and text fields. We are looking for high level sketches, like you would make on a whiteboard. Your sketches can be simple. However, try to make sketches that help others to understand your solutions",
			position: 'bottom-middle-aligned',

		},
		{
			element: "#intro1",
			intro: "When you are finished, you can review and submit your ideas by clicking on REVIEW & SUBMIT. If you'd like to quit the HIT, please use this quit button and leave some feedback why you feel this HIT is not for you. Each of these buttons gives you a chance to cancel, so feel free to try them out",
			position: 'bottom-middle-aligned'
		}
	];


	Template.tool.helpers({
		allowedToContinueWorking: function () {
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
		sizeClassIsLarge: function (toolViewNumber) {
			return Session.get("sizeClassIsLargeForToolView" + toolViewNumber);
		},
		allowShowingOthersWork: function () {
			if (Configurations.findOne(1)) {
				var mainConfiguration = Configurations.findOne(1);
				return mainConfiguration.shouldShowOthersWork
			}
		},
		showingOthersWork: function () {
			return Session.get("showingOthersWork") == true;
		},
		toolIsRequestingTargetSelection: function () {
			return Session.get("isRequestingTargetSelection");
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
				"disableInteraction": true,
				steps: tutorialSteps
			}).start();


			$(".introjs-tooltiptext").css("text-align", "center");
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
		},
		"click #sizeClassSwitch": function () {
			changeSizeClass();
		},
		"click .cancelTargetSelection": function () {
			selectedTargetCanvas = null;
			setFlashingSolutionImageViews(false, "");
			Session.set("isRequestingTargetSelection", false);
		}
	});

	changeSizeClass = function() {
		var toolView1 = $("#toolView1");
		var toolView2 = $("#toolView2");

		toolView1.one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",
				function () {
					Session.set("sizeClassIsLargeForToolView" + 1, toolView1.hasClass('col-lg-9'));
				});

		toolView2.one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",
				function (event) {
					Session.set("sizeClassIsLargeForToolView" + 2, toolView2.hasClass('col-lg-9'));
					if (toolView2ScrollTarget) {
						//window.scrollTo(0, $($('[data-cdindex=' + toolView2ScrollTarget + ']')[0]).offset().top - 100);
						// could not get this to work yet because of race conditions between the subview of the canvases,
						// and the animation ending. Will calculate the height for now based on what we know about canvases
						window.scrollTo(0, 75 + (647 * (toolView2ScrollTarget - 1)) - 100);
						toolView2ScrollTarget = null;
					}
				});

		$("#sizeClassInnerElementLeft").toggleClass('sizeClassInnerElementSmall sizeClassInnerElementLarge');
		$("#sizeClassInnerElementRight").toggleClass('sizeClassInnerElementSmall sizeClassInnerElementLarge');

		toolView1.toggleClass('col-lg-3 col-lg-9');
		toolView2.toggleClass('col-lg-9 col-lg-offset-3 col-lg-3 col-lg-offset-9');
	};

	scrollToolViewsToCanvas = function(CDIndex) {
		var toolView1 = $("#toolView1");
		toolView1.scrollTop(0);
		toolView2ScrollTarget = CDIndex;
	};

	Template.tool.onRendered(function () {
		//TODO: BRING THESE STOP WATCHES BACK TO TOOL!
		// initialize stopwatch arrays
		interactionStopwatches = [];
		locationStopwatches = [];
		readingStopwatches = []; // these have a higher tolerance for inactivity (160 seconds instead of 10)

		// functions that operate on stopwatches in those arrays
		function resetInteractionTimers() {
			$.each(interactionStopwatches, function () {
				this.reset();
			});
		}
		function resetLocationTimers() {
			$.each(locationStopwatches, function () {
				this.reset();
			});
		}
		function resetReadingTimers() {
			$.each(readingStopwatches, function () {
				this.reset();
			});
		}
		function activateLocationTimers() {
			$.each(locationStopwatches, function () {
				this.start();
			});
		}

		// stopwatch running for canvas with focus
		stopwatchWithFocus = null;

		// stopwatch running for total time on tools page
		pageStopwatch = new Stopwatch();
		locationStopwatches.push(pageStopwatch);
		pageStopwatch.start();

		// stopwatch that will run when writing a name
		typingTimerName = new Stopwatch();
		interactionStopwatches.push(typingTimerName);

		// stopwatch that will run when writing an explanation
		typingTimerExplanation = new Stopwatch();
		interactionStopwatches.push(typingTimerExplanation);

		// initialize idle timers
		idleTime = 0;
		var idleInterval = setInterval(timerIncrement, 1000); // every second
		$(this).mousemove(function (e) {
			idleTime = 0;
		}); // reset the timer
		$(this).keypress(function (e) {
			idleTime = 0;
		});  // reset the timer
		function timerIncrement() {
			idleTime = idleTime + 1;
			if (idleTime <= 10) {
				activateLocationTimers();
			}
			if (idleTime > 10) { // after ten seconds
				resetInteractionTimers();
				resetLocationTimers();
			}
			if (idleTime > 160) { // after 2 minutes
				resetReadingTimers();
			}
		}

		// set up for canvases
		// this array will hold references to each Fabric canvas instance, and is looped through in the below toolbar
		// actions to 'broadcast' the toolbar selects across the canvases
		canvases = [];

		// focusedCanvas
		canvasWithFocus = null;

		// used for maintaing sanity while drawing straight or free-form lines
		isDrawing = false;

		// state object for undo/redo stacks
		canvasHistory = {};

		// focusedText?
		focusedText = false;

		// timer hooks for modals
		infoModalStopwatch = new Stopwatch();
		readingStopwatches.push(infoModalStopwatch);

		$("#infoModal").on('shown.bs.modal', function () {
			infoModalStopwatch.start();
		});

		$("#infoModal").on('hide.bs.modal', function () {
			infoModalStopwatch.stop();
			Meteor.call("updateInfoModalTime", Session.get("ticket"), infoModalStopwatch.getElapsed().seconds);
			infoModalStopwatch.reset();
		});

		// create persistent objects in database for these sketches
		function createSolutionIfNotExits(canvasNumber, ticket, decisionPoint) {
			if (Session.get("insertedSolutionFor" + ticket + canvasNumber)) {
			} else {
				Meteor.call("createSolution", ticket, canvasNumber, decisionPoint, function (e, r) {
					if (!e) {
						Session.setPersistent("objectId" + ticket + canvasNumber, r);
						Session.setPersistent("insertedSolutionFor" + ticket + canvasNumber, "true");
					}
				})
			}
		}

		createSolutionIfNotExits(1, Session.get("ticket"), Session.get("decisionPoint"));
		createSolutionIfNotExits(2, Session.get("ticket"), Session.get("decisionPoint"));
		createSolutionIfNotExits(3, Session.get("ticket"), Session.get("decisionPoint"));
		createSolutionIfNotExits(4, Session.get("ticket"), Session.get("decisionPoint"));
		createSolutionIfNotExits(5, Session.get("ticket"), Session.get("decisionPoint"));

		Session.set("sizeClassIsLargeForToolView" + 1, false);
		Session.set("sizeClassIsLargeForToolView" + 2, true);

		toolView2ScrollTarget = null;

		otherWorkCanvases = [];

	});

	// GLOBAL HELPER METHODS
	hideAllTooltips = function () {
		$('[data-toggle="tooltip"]').tooltip('hide');
		$('#tutorialRequest').toggle(false);
	};
}
;


