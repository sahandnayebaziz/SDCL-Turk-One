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
			return Solutions.find({workerId: Session.get("ticket")});
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
		existingSolution: function (canvasNumber) {
			console.log("trying to find existing solution");
			return Solutions.findOne({workerId: Session.get("ticket"), canvasNumber: canvasNumber});
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

			// create persistent objects in database for these sketches
			function createPersistSelf(canvasNumber) {
				if (Session.get("insertedSolutionFor" + canvasNumber)) {

				} else {
					Solutions.insert({
						workerId: Session.get("ticket"),
						state: "",
						createdAt: new Date(),
						dateUpdated: new Date(),
						canvasNumber: canvasNumber
					}, function(error, id) {
						Session.setPersistent("objectId" + canvasNumber, id);
						Session.setPersistent("insertedSolutionFor" + canvasNumber, "true");
						console.log("set persistence for " + canvasNumber);
					});
				}
			}

			createPersistSelf(1);
			createPersistSelf(2);
			createPersistSelf(3);
			createPersistSelf(4);
			createPersistSelf(5);


			// setting the default number of canvases to show
			Session.set("numberOfCanvasesToShow", 5);

			// this array will hold references to each Fabric canvas instance, and is looped through in the below toolbar
			// actions to 'broadcast' the toolbar selects across the canvases
			canvases = [];

			// focusedCanvas
			canvasWithFocus = null;

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

				if ($(tool).attr("id") != "buttonEraser") {
					disableEraser();
				}
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
			});

			// toolbar eraser clicked
			$("#buttonEraser").click(function () {
				setSelectedTool(this);
				enableEraser();
			});

			function disableEraser() {
				console.log("disabling eraser");

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

				$.each(canvases, function() {
					this.isDrawingMode = false;
				})
			});

			// text button clicked
			$("#buttonText").click(function() {

				setSelectedTool(this);
				$.each(canvases, function() {
					this.isDrawingMode = false;
				});

				canvasWithFocus.on("mouse:down", function (e) {
					var pointer = canvasWithFocus.getPointer(event.e);

					canvasWithFocus.add(new fabric.IText('Enter Text', {
						fontFamily: 'times black',
						left: pointer.x,
						top: pointer.y,
						fontSize: 16
					}));

					var textObject = canvasWithFocus.item(canvasWithFocus.getObjects().length - 1);
					canvasWithFocus.setActiveObject(textObject);

					//textObject.enterEditing(); this line was temporarily removed because it was causing the window to scroll

					textObject.selectAll();
					$.each(canvases, function() {
						this.off("mouse:down");
					});

					setSelectedTool("#buttonMove");
				});
			});

			// UNDO AND REDO
			$("#buttonUndo").click(function () {

				var index = canvasWithFocus.CDIndex;
				var back = canvasHistory[index].backStates;

				if (back.length > 1) {
					canvasHistory[index].recording = false;
					var fromState = back.pop();
					canvasHistory[index].forwardStates.push(fromState);
					var toState = back[back.length - 1];
					canvasWithFocus.loadFromJSON(toState);
					canvasWithFocus.renderAll();
					canvasHistory[index].recording = true;
				}
			});

			$("#buttonRedo").click(function () {
				var index = canvasWithFocus.CDIndex;
				var forward = canvasHistory[index].forwardStates;

				if (forward.length > 0) {
					canvasHistory[index].recording = false;
					var toState = forward.pop();
					canvasHistory[index].backStates.push(toState);

					canvasWithFocus.loadFromJSON(toState);
					canvasWithFocus.renderAll();
					canvasHistory[index].recording = true;
				}
			});

			// drawing straight lines when pressing shift
			Mousetrap.bind('shift', function () {

				var line, isDown;

				canvasWithFocus.isDrawingMode = false;
				canvasWithFocus.selection = false;
				canvasWithFocus.forEachObject(function(o) {
					o.selectable = false;
				});

				canvasWithFocus.on('mouse:down', function(o){
					isDown = true;
					isDrawing = true;
					var pointer = canvasWithFocus.getPointer(o.e);
					var points = [ pointer.x, pointer.y, pointer.x, pointer.y ];
					line = new fabric.Line(points, {
						strokeWidth: 5,
						fill: 'black',
						stroke: 'black',
						originX: 'center',
						originY: 'center',
					});
					canvasWithFocus.add(line);
				});

				canvasWithFocus.on('mouse:move', function(o){
					if (!isDown) return;
					var pointer = canvasWithFocus.getPointer(o.e);
					line.set({ x2: pointer.x, y2: pointer.y });
					canvasWithFocus.renderAll();
					line.selectable = true;
				});

				canvasWithFocus.on('mouse:up', function(o){
					isDown = false;
					isDrawing = false;
					//canvasWithFocus.remove(canvasWithFocus.item(canvasWithFocus.getObjects().length - 1));
				});
			}, 'keydown');

			Mousetrap.bind('shift', function () {
				if (!isDrawing) {
					c = canvasWithFocus;
					c.off('mouse:down');
					c.off('mouse:move');
					c.off('mouse:up');

					c.isDrawingMode = false;
					c.selection = true;
					c.forEachObject(function(o) {
						o.selectable = true;
					});
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
			forceFocus = function(index) {

				$.each($(".canvasContainer"), function() {
					if (parseInt($(this).attr("data-cdindex")) == index) {
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

			};

			$("#col-sketch").on("mousedown", ".canvasContainer", function () {
				var index = parseInt($(this).attr("data-cdindex"));
				forceFocus(index);
			});

			$('[data-toggle="tooltip"]').tooltip("show");
		}
	}
}