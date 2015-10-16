/**
 * Created by sahand on 10/7/15.
 */
if (Meteor.isClient) {
	Template.tool.helpers({
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

			// setting the default number of canvases to show
			Session.set("numberOfCanvasesToShow", 1);

			// this array will hold references to each Fabric canvas instance, and is looped through in the below toolbar
			// actions to 'broadcast' the toolbar selects across the canvases
			canvasArray = [];

			// Set Black as default color in toolbar (set for each canvas at initialization in tool.html
			$("#buttonBlack").addClass("selectedTool");

			// toolbar color clicked
			$(".buttonColor").click(function () {
				$(".selectedTool").removeClass("selectedTool");
				$(this).addClass("selectedTool");
				var colorChosen = this.getAttribute("data-color");

				$.each(canvasArray, function() {
					this.freeDrawingBrush.color = colorChosen;
				});
				disableEraser();
			});

			// toolbar eraser clicked
			$("#buttonEraser").click(function () {
				$(".selectedTool").removeClass("selectedTool");
				$(this).addClass("selectedTool");
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




			// enables the "submit" button in the quit survey once a reason is selected
			$('input:radio').change(
				function(){
					$("#quitSubmit").removeClass("disabled");
					$("#quitSubmit").prop("disabled",false);
				}
			);

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






			//$.each(canvasArray, function() {
			//	this.off("mouse:down");
			//	this.isDrawingMode = true;
			//});
			//
			//saveState();
			//var recordingStates = true;
			//
			//canvas.on('object:added', function (e) {
			//	//if (recordingStates) {
			//	//	saveState();
			//	//}
			//})
			//
			//canvas.on('object:modified', function (e) {
			//	//if (recordingStates) {
			//	//	saveState();
			//	//}
			//})
			//
			//canvas.on('object:removed', function (e) {
			//	//if (recordingStates) {
			//	//	saveState();
			//	//}
			//})






			/*
			 // MARK: Create Canvas and add hooks
			 canvas = new fabric.Canvas('practiceSketch');
			 canvas.isDrawingMode = true;
			 canvas.freeDrawingBrush.width = 6
			 canvas.freeDrawingBrush.color = "black"

			 var canvasStateStack = [];
			 var canvasRedoStack = [];

			 function saveState() {

			 if (canvasStateStack.length == 30) {
			 canvasStateStack.shift();
			 }
			 if (canvasRedoStack.length != 0) {
			 canvasRedoStack = [];
			 }
			 canvasStateStack.push(JSON.stringify(canvas));
			 }

			 saveState();
			 var recordingStates = true;

			 canvas.on('object:added', function (e) {
			 if (recordingStates) {
			 saveState();
			 }
			 })

			 canvas.on('object:modified', function (e) {
			 if (recordingStates) {
			 saveState();
			 }
			 })

			 canvas.on('object:removed', function (e) {
			 if (recordingStates) {
			 saveState();
			 }
			 })

			 // selecting colors
			 $(".colorSelector").click(function () {
			 $("img.selectedTool").removeClass("selectedTool");
			 $(this).addClass("selectedTool");
			 canvas.freeDrawingBrush.color = this.getAttribute("data-color");
			 disableEraser();
			 });

			 // selecting the eraser
			 $(".eraserTool").click(function () {
			 $("img.selectedTool").removeClass("selectedTool");
			 $(this).addClass("selectedTool");
			 enableEraser();
			 })

			 function disableEraser() {
			 canvas.off("mouse:down");
			 canvas.isDrawingMode = true;
			 }

			 function enableEraser() {
			 canvas.isDrawingMode = false;
			 canvas.on("mouse:down", function (e) {
			 if (canvas.getActiveGroup()) {
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
			 }

			 $(".undoSelector").click(function () {
			 if (canvasStateStack.length > 1) {
			 recordingStates = false;
			 var currentState = canvasStateStack.pop();
			 canvasRedoStack.push(currentState);

			 var stateToReturnTo = canvasStateStack[canvasStateStack.length - 1];
			 canvas.loadFromJSON(stateToReturnTo);
			 canvas.renderAll();
			 recordingStates = true;
			 }
			 });

			 $(".redoSelector").click(function () {
			 if (canvasRedoStack.length > 0) {
			 recordingStates = false;
			 var stateToReturnTo = canvasRedoStack.pop();
			 canvasStateStack.push(stateToReturnTo);
			 canvas.loadFromJSON(stateToReturnTo);
			 canvas.renderAll();
			 recordingStates = true;
			 }
			 });

			 $(".clearSelector").click(function () {
			 if (canvas.getObjects().length > 0) {
			 canvas.clear().renderAll();
			 saveState();
			 }
			 });
			 */

		}
	}
}