/**
 * Created by sahand on 10/7/15.
 */
if (Meteor.isClient) {
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
		numberOfCanvasesToShow: function () {
			var numberOfIndexesToReturn = Session.get("numberOfCanvasesToShow");
			var arrayOfIndexes = [];
			for (var x = 1; x <= numberOfIndexesToReturn; x++) {
				arrayOfIndexes.push(x);
			}
			return arrayOfIndexes;
		},
		shouldShowAddCanvasButton: function () {
			if (Session.get("numberOfCanvasesToShow") == 5) {
				return false;
			} else {
				return true;
			}
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
				console.log(canvas._objects.length);
				return canvas._objects.length > 0;
			}

			return canvases.filter(isCanvasComplex).length;
		}
	});

	Template.tool.events({
		"click .addCanvas": function (event) {
			event.preventDefault();
			Session.set("numberOfCanvasesToShow", Session.get("numberOfCanvasesToShow") + 1);
		},
		"change input[name=quitReason]": function () {
			$("#quitSubmit").removeClass("disabled");
			$("#quitSubmit").prop("disabled", false);
		},
		"submit #quitForm": function (event) {
			event.preventDefault();

			var reason = $("#quitForm input[name=quitReason]:checked").val()
			var feedback = $("#quitText").val();

			QuitSurveys.insert({
				reason: reason,
				feedback: feedback
			});

			$('#quitModal').on('hidden.bs.modal', function () {
				window.location.href = 'http://www.google.com';
			}).modal('hide')
		},
		"click #finishConfirm": function () {
			$('#finishModal').on('hidden.bs.modal',
				function () {
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
				}).modal('hide');
		},
		"click #finishCancel": function () {
			Session.set("shouldGenerateReviews", false);
		}
	});

	Template.decisionPointInformationPanel.events({
		"click #finishRequest": function () {
			Session.set("shouldGenerateReviews", true);
		}
	});

	Template.tool.rendered = function () {
		if (!this._rendered) {
			this._rendered = true;

			console.log("rendering");

			// create persistent objects in database for these sketches
			function createPersistSelf(canvasNumber) {
				if (Session.get("insertedSolutionFor" + Session.get("ticket") + canvasNumber)) { //TODO: make this worker-id dependent

				} else {
					Solutions.insert({
						workerId: Session.get("ticket"),
						createdAt: new Date(),
						dateUpdated: new Date(),
						canvasNumber: canvasNumber,
						accepted: false
					}, function (error, id) {
						Session.setPersistent("objectId" + Session.get("ticket") + canvasNumber, id);
						Session.setPersistent("insertedSolutionFor" + Session.get("ticket") + canvasNumber, "true");
						console.log("set persistence for user" + Session.get("ticket") + " canvas: " + canvasNumber);
					});
				}
			}

			createPersistSelf(1);
			createPersistSelf(2);
			createPersistSelf(3);
			createPersistSelf(4);
			createPersistSelf(5);
		}
	}
}
;