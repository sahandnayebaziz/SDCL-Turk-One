/**
 * Created by sahand on 10/7/15.
 */
if (Meteor.isClient) {
	Template.tool.rendered = function() {
		if(!this._rendered) {

			this._rendered = true;

			$(".canvas-sketch").each(function(index) {
				var canvasHeightShouldBe = 500;
				var canvasWidthShouldBe = $("#col-sketch").width();
				$(this).attr({"height":canvasHeightShouldBe, "width":canvasWidthShouldBe});

				canvas = new fabric.Canvas($(this).attr('id'));
				console.log($(this).attr('id'));
				canvas.isDrawingMode = true;
				canvas.freeDrawingBrush.width = 6;
				canvas.freeDrawingBrush.color = "black";
				canvas.setBackgroundColor("white").renderAll();
			});

			$(".form-description").each(function(index) {
				var canvasWidthShouldBe = $("#col-sketch").width();
				$(this).attr({"height":canvasHeightShouldBe, "width":canvasWidthShouldBe});
			});



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