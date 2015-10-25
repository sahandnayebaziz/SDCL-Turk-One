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
		},
		"click #finishConfirm": function () {
			Router.go("/review/" + Session.get("ticketId"));
			// save each sketch
			// move the user to the review phase where she will be able to mark each one as selected or not
		}
	});

	Template.tool.rendered = function() {
		if(!this._rendered) {
			this._rendered = true;

			// data check
			console.log(this.data);

			// setting the default number of canvases to show
			Session.set("numberOfCanvasesToShow", 5);

			// this array will hold references to each Fabric canvas instance, and is looped through in the below toolbar
			// actions to 'broadcast' the toolbar selects across the canvases
			canvases = [];

			// focusedCanvas
			canvasWithFocus = null;

			// last canvas drawn on
			lastCanvas = null;

			// used for maintaing sanity while drawing straight or free-form lines
			isDrawing = false;

			// state object for undo/redo stacks
			canvasHistory = {};

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
				$.each(canvases, function() {
					this.freeDrawingBrush.color = colorChosen;
					this.isDrawingMode = true;
				});
				disableEraser();
			});

			// toolbar eraser clicked
			$("#buttonEraser").click(function () {
				setSelectedTool(this);
				enableEraser();
			});

			function disableEraser() {
				$.each(canvases, function() {
					this.off("mouse:down");
				});
			}

			function enableEraser() {
				$.each(canvases, function() {
					var canvas = this;

					canvas.isDrawingMode = false;
					canvas.on("mouse:down", function (e) {
						if (this.getActiveGroup()) {
							recordingStates = false;
							canvas.getActiveGroup().forEachObject(function (a) {
								canvas.remove(a);
							});
							canvas.discardActiveGroup();
							recordingStates = true;
						} else {
							canvas.remove(canvas.getActiveObject());
						}
						canvas.renderAll();
					});
				});
			}

			// toolbar move controls clicked
			$("#buttonMove").click(function() {
				setSelectedTool(this);
				disableEraser();

				$.each(canvases, function() {
					this.isDrawingMode = false;
				})
			});

			// text button clicked
			$("#buttonText").click(function() {
				setSelectedTool(this);
				disableEraser();
				$.each(canvases, function() {
					this.isDrawingMode = false;
				});

				lastCanvas.on("mouse:down", function (e) {
					var pointer = canvas.getPointer(event.e);

					lastCanvas.add(new fabric.IText('Enter Text', {
						fontFamily: 'times black',
						left: pointer.x,
						top: pointer.y,
						fontSize: 16
					}));

					var textObject = lastCanvas.item(lastCanvas.getObjects().length - 1);
					lastCanvas.setActiveObject(textObject);
					textObject.enterEditing()
					textObject.selectAll()
					$.each(canvases, function() {
						this.off("mouse:down");
					});

					setSelectedTool("#buttonMove");
				});
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

			// drawing straight lines when pressing shift
			Mousetrap.bind('shift', function () {

				var line, isDown;

				lastCanvas.isDrawingMode = false;
				lastCanvas.selection = false;
				lastCanvas.forEachObject(function(o) {
					o.selectable = false;
				});

				lastCanvas.on('mouse:down', function(o){
					isDown = true;
					isDrawing = true;
					var pointer = lastCanvas.getPointer(o.e);
					var points = [ pointer.x, pointer.y, pointer.x, pointer.y ];
					line = new fabric.Line(points, {
						strokeWidth: 5,
						fill: 'black',
						stroke: 'black',
						originX: 'center',
						originY: 'center',
					});
					lastCanvas.add(line);
				});

				lastCanvas.on('mouse:move', function(o){
					if (!isDown) return;
					var pointer = lastCanvas.getPointer(o.e);
					line.set({ x2: pointer.x, y2: pointer.y });
					lastCanvas.renderAll();
					line.selectable = true;
				});

				lastCanvas.on('mouse:up', function(o){
					isDown = false;
					isDrawing = false;
					//lastCanvas.remove(lastCanvas.item(lastCanvas.getObjects().length - 1));
				});
			}, 'keydown');

			Mousetrap.bind('shift', function () {
				if (!isDrawing) {
					c = lastCanvas;
					c.off('mouse:down');
					c.off('mouse:move');
					c.off('mouse:up');

					c.isDrawingMode = false;
					c.selection = true;
					c.forEachObject(function(o) {
						o.selectable = true;
					});

					console.log("ran unbind");
				}
			}, 'keyup');

			// enables the "submit" button in the quit survey once a reason is selected
			$('input:radio').change(
				function(){
					$("#quitSubmit").removeClass("disabled");
					$("#quitSubmit").prop("disabled",false);
				}
			);


			// guessing focus
			function findFocus() {

				var scrollPosition = $(window).scrollTop();
				var focusDistance = 9999;
				var focusGuess = null;
				var focusGuessIndex = 0;

				$.each($(".canvasContainer"), function() {
					var positionAtTopOfCanvas = $(this).offset().top;
					var distanceFromScrollPosition = Math.abs(scrollPosition - positionAtTopOfCanvas);
					if ((scrollPosition < positionAtTopOfCanvas + 250) && (distanceFromScrollPosition < focusDistance)) {
						focusDistance = distanceFromScrollPosition;
						focusGuess = this;
					}
				});

				$.each($(".canvasContainer"), function() {
					if (this == focusGuess) {
						$(this).removeClass("unfocusedCanvas");
						$(this).addClass("focusedCanvas");
						focusGuessIndex = parseInt($(this).attr("data-CDIndex"));
					} else {
						$(this).removeClass("focusedCanvas");
						$(this).addClass("unfocusedCanvas");
					}
				});

				$.each(canvases, function () {
					if (this.CDIndex == focusGuessIndex) {
						canvasWithFocus = this;
					}
				});
			}

			// attach focus guessing to window scrolling
			$(window).scroll(findFocus);

			// provide method for forcing focus
			function forceFocus(index, canvasContainer) {

				$.each($(".canvasContainer"), function() {
					if (this == canvasContainer) {
						$(this).removeClass("unfocusedCanvas");
						$(this).addClass("focusedCanvas");
					} else {
						$(this).removeClass("focusedCanvas");
						$(this).addClass("unfocusedCanvas");
					}
				});

				$.each(canvases, function () {
					if (this.CDIndex == index) {
						canvasWithFocus = this;
					}
				});

			}

			$("#col-sketch").on("mousedown", ".canvasContainer", function () {
				var index = parseInt($(this).attr("data-CDIndex"));
				forceFocus(index, this);
			});

		}
	}
}