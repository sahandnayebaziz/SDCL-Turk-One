/**
 * Created by sahand on 10/7/15.
 */
if (Meteor.isClient) {
	Template.tool.helpers({
		decisionPoint: function () {
			return DecisionPoints.findOne(this.decisionPointId);
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
		}
	});

	Template.tool.events({
		"click .addCanvas": function (event) {
			event.preventDefault();
			Session.set("numberOfCanvasesToShow", Session.get("numberOfCanvasesToShow") + 1);
		},
		"submit #quitForm": function (event) {
			event.preventDefault();

			var reason = $("#quitForm input[name=quitReason]:checked").val()
			var feedback = $("#quitText").val();

			QuitSurveys.insert({
				reason: reason,
				feedback: feedback
			});

			$('#quitModal').modal('hide')

			Router.go("/");
		}
	});

	Template.tool.rendered = function() {
		if(!this._rendered) {
			this._rendered = true;

			// data check
			console.log(this.data);

			// setting the default number of canvases to show
			Session.set("numberOfCanvasesToShow", 1);

			// this array will hold references to each Fabric canvas instance, and is looped through in the below toolbar
			// actions to 'broadcast' the toolbar selects across the canvases
			canvasArray = [];

			// Set Black as default color in toolbar (set for each canvas at initialization in tool.html
			Session.set("currentColor", "#414141");
			$("#buttonBlack").addClass("selectedTool");

			// setting toolbar active tool
			function setSelectedTool(tool) {
				$(".selectedTool").removeClass("selectedTool").addClass("deselectedTool");
				$(tool).addClass("selectedTool");
			}

			// toolbar color clicked
			$(".buttonColor").click(function () {
				setSelectedTool(this);
				var colorChosen = this.getAttribute("data-color");

				Session.set("currentColor", colorChosen);
				$.each(canvasArray, function() {
					this.freeDrawingBrush.color = colorChosen;
					this.isDrawingMode = true;
				});

				disableEraser();
			});

			// toolbar eraser clicked
			$("#buttonEraser").click(function () {
				setSelectedTool(this);
				enableEraser();
			})

			function disableEraser() {
				$.each(canvasArray, function() {
					this.off("mouse:down");
					this.isDrawingMode = true;
				});
			}

			function enableEraser() {
				$.each(canvasArray, function() {
					this.isDrawingMode = false;
					this.on("mouse:down", function (e) {
						if (this.getActiveGroup()) {
							recordingStates = false;
							this.getActiveGroup().forEachObject(function (a) {
								this.remove(a);
							});
							this.discardActiveGroup();
							recordingStates = true;
						} else {
							this.remove(canvas.getActiveObject());
						}
						this.renderAll();
					});
				});
			}

			// toolbar move controls clicked
			$("#buttonMove").click(function() {
				setSelectedTool(this);

				$.each(canvasArray, function() {
					this.isDrawingMode = false;
				})
			});

			// UNDO AND REDO
			canvasStateStack = [];
			canvasRedoStack = [];
			recordingStates = true;

			$("#buttonUndo").click(function () {
				if (canvasStateStack.length > 1) {
					recordingStates = false;
					var currentState = canvasStateStack.pop();
					canvasRedoStack.push(currentState);

					var stateToReturnTo = canvasStateStack[canvasStateStack.length - 1];
					canvas = stateToReturnTo[0];
					canvas.loadFromJSON(stateToReturnTo[1]);
					canvas.renderAll();
					recordingStates = true;
				}
			});

			$("#buttonRedo").click(function () {
				if (canvasRedoStack.length > 0) {
					recordingStates = false;
					var stateToReturnTo = canvasRedoStack.pop();
					canvasStateStack.push(stateToReturnTo);
					canvas = stateToReturnTo[0];
					canvas.loadFromJSON(stateToReturnTo[1]);
					canvas.renderAll();
					recordingStates = true;
				}
			});

			// enables the "submit" button in the quit survey once a reason is selected
			$('input:radio').change(
				function(){
					$("#quitSubmit").removeClass("disabled");
					$("#quitSubmit").prop("disabled",false);
				}
			);

		}
	}
}