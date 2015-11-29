/**
 * Created by sahand on 11/23/15.
 */
if (Meteor.isClient) {
	Template.solutionVisualImage.onRendered(function () {

		var canvasID = this.data._id;
		var canvasState = this.data.state;

		function createCanvasElement(shouldUseRealSize, realWidth) {
			var idForNewCanvas = "canvas" + canvasID;
			var element = $("#" + idForNewCanvas);

			if (shouldUseRealSize) {
				var canvasHeightShouldBe = 500;
				var canvasWidthShouldBe = realWidth;
				$(element).attr({"height": canvasHeightShouldBe, "width": canvasWidthShouldBe});
			} else {
				$(element).attr({"height": 1, "width": 1});
			}

			var canvas = new fabric.Canvas(idForNewCanvas);
			canvas.loadFromJSON(canvasState, canvas.renderAll.bind(canvas));

			return canvas
		}

		function determineCanvasContentWidth() {
			var canvas = createCanvasElement(false, 0);
			var objs = canvas.getObjects().map(function(o) {
				return o.set('active', true);
			});
			var group = new fabric.Group(objs, {
				originX: 'center',
				originY: 'center'
			});
			canvas._activeObject = null;
			canvas.setActiveGroup(group.setCoords()).renderAll();
			var detectedWidth = canvas.getActiveGroup().getWidth();
			cleanUpCanvasDebris(canvas, false);
			if (detectedWidth < 1000) {
				 return 1000;
			} else {
				return detectedWidth
			}
		}
		function cleanUpCanvasDebris(canvas, shouldRemoveFromDOM) {
			canvas.clear();
			canvas.dispose();
		}

		var detectedWidth = determineCanvasContentWidth();
		var canvas = createCanvasElement(true, detectedWidth);

		canvas.isDrawingMode = false;
		canvas.setBackgroundColor("white").renderAll();

		var imageElement = document.getElementById('image' + this.data._id);
		imageElement.src = canvas.toDataURL({
			format: 'jpeg',
			quality: 1 // this could probably stand to go much lower! Maybe if performance slows
		});

		canvas.clear();
		canvas.dispose();
		$(canvas.wrapperEl).remove();
		canvas = null;

		// trying this out below to clear references, push objects to garbage collection to keep DOM light. Not sure
		// how great the effect is or if this happens automatically yet.

	});

	Template.solutionVisualImage.events({
		"click .solutionImage": function () {
			changeSizeClass();
		},
		"click .solutionImageTargetOverlay": function () {
			if (selectedTargetCanvas) {
				setFlashingSolutionImageViews(false, "");
				selectedTargetCanvas.resolve(this.canvasNumber);
			}
		}
	})
}