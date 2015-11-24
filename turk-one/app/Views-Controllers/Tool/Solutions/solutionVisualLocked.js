/**
 * Created by sahand on 11/23/15.
 */
if (Meteor.isClient) {
	Template.solutionVisualLocked.onRendered(function () {
		var idForNewCanvas = "canvas" + this.data._id;
		var element = $("#" + idForNewCanvas);
		var canvas = new fabric.Canvas(idForNewCanvas);
		var canvasHeightShouldBe = 500;
		var canvasWidthShouldBe = $("#colsketch" + this.data._id).width();
		console.log(canvasWidthShouldBe);
		$(element).attr({"height": canvasHeightShouldBe, "width": canvasWidthShouldBe});

		var canvas = new fabric.Canvas(idForNewCanvas);
		canvas.isDrawingMode = false;
		canvas.setBackgroundColor("white").renderAll();
		canvas.loadFromJSON(this.data.state, canvas.renderAll.bind(canvas));
	});
}