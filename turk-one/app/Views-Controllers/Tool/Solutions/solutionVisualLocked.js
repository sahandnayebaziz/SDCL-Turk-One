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
		$(element).attr({"height": canvasHeightShouldBe, "width": canvasWidthShouldBe});

		var canvas = new fabric.Canvas(idForNewCanvas);
		canvas.isDrawingMode = false;
		canvas.setBackgroundColor("white").renderAll();
		canvas.loadFromJSON(this.data.state, canvas.renderAll.bind(canvas));

		$.each(canvas.getObjects(), function() {
			this.lockMovementX = this.lockMovementY = true;
		});

		// Really terrible hack to fix unknown rendering bug when clicking the top left corner
		// of a solutionVisualLocked canvas.
		$.each($('.canvas-container'), function() {
			$.each($(this).siblings('.upper-canvas'), function() {
				$(this).remove();
			})
		});

		markSelected = function(id) {
			return function() {
				Session.set("didSelectOnCanvas" + id, true);
			}
		}(this.data._id);

		markUnselected = function(id) {
			return function() {
				Session.set("didSelectOnCanvas" + id, false);
			}
		}(this.data._id);

		canvas.on("object:selected", markSelected);
		canvas.on("selection:cleared", markUnselected);
	});

	Template.solutionVisualLocked.helpers({
		didSelectOnCanvasId: function () {
			return Session.get("didSelectOnCanvas" + this._id);
		}
	});

	Template.solutionVisualLocked.events({
		"click .duplicate": function() {
			var didPlaceDuplicate = false;
			for (var i = 0; i < canvases.length; i++) {
				if (canvases[i]._objects.length == 0 && !didPlaceDuplicate) {
					didPlaceDuplicate = true;
					var canvas = canvases[i];
					canvas.loadFromJSON(this.state, canvas.renderAll.bind(canvas));
					changeSizeClass();
					scrollToolViewsToCanvas(canvas.CDIndex);
					notify("Duplicated to your " + stringifyNumber(canvas.CDIndex) + " canvas.", "info");
				}
			}
			if (!didPlaceDuplicate) {
				console.log("determined all canvases to have work");
			}
		}
	})
}