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
		canvas.CDID = this.data._id;

		// add references to this canvas
		for (var i = 0; i < otherWorkCanvases.length; i++) {
			if (otherWorkCanvases[i].CDID === canvas.CDID) {
				otherWorkCanvases.splice(i, 1);
			}
		}
		otherWorkCanvases.push(canvas);

		$.each(canvas.getObjects(), function () {
			this.lockMovementX = this.lockMovementY = true;
		});

		// Really terrible hack to fix unknown rendering bug when clicking the top left corner
		// of a solutionVisualLocked canvas.
		$.each($('.canvas-container'), function () {
			$.each($(this).siblings('.upper-canvas'), function () {
				$(this).remove();
			})
		});

		markSelected = function (id) {
			return function () {
				Session.set("didSelectOnCanvas" + id, true);
			}
		}(this.data._id);

		markUnselected = function (id) {
			return function () {
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
		"click .duplicate": function () {

			selectedTargetCanvas = new $.Deferred();

			applyDuplicate = function (state) {
				return function () {
					return state;
				}
			}(this.state);

			selectedTargetCanvas.done(function (canvasNumber) {
				var canvas = canvases[canvasNumber - 1];
				var state = applyDuplicate();
				canvas.loadFromJSON(state, canvas.renderAll.bind(canvas));
				changeSizeClass();
				scrollToolViewsToCanvas(canvas.CDIndex);
			});

			setFlashingSolutionImageViews(true, "");
			Session.set("isRequestingTargetSelection", true);

		},
		"click .copy": function () {
			selectedTargetCanvas = new $.Deferred();
			var targetID = this._id;
			var canvas = null;
			$.each(otherWorkCanvases, function () {
				if (this.CDID == targetID) {
					canvas = this;
				}
			});
			applyObjectOrGroup = function (activeObject, activeGroup) {
				return function () {
					return {
						object: activeObject,
						group: activeGroup
					}
				}
			}(canvas.getActiveObject(), canvas.getActiveGroup());
			selectedTargetCanvas.done(function (canvasNumber) {
				var data = applyObjectOrGroup();
				var numberToCopy = 0;
				var numberCopied = 0;

				function returnIfFinished() {
					if (numberCopied == numberToCopy) {
						changeSizeClass()
					}
				}

				function addToCanvas(object, options) {
					if (options) {
						object.set({
							top: options.top,
							left: options.left
						});
					}
					canvases[canvasNumber - 1].add(object).renderAll();
					numberCopied++;
					returnIfFinished();
				}

				if (data.object) {
					numberToCopy = 1;
					var object = data.object;
					if (fabric.util.getKlass(object.get("type")).async) {
						object.clone(function (c) {
							addToCanvas(c);
						});
					} else {
						addToCanvas(object.clone());
					}
				} else if (data.group) {
					var group = data.group;
					numberToCopy = group._objects.length;
					$.each(group._objects, function () {
						var object = this;
						var options = {
							top: object.originalState.top,
							left: object.originalState.left
						};
						if (fabric.util.getKlass(object.get("type")).async) {
							object.clone(function (c) {
								addToCanvas(c, options);
							});
						} else {
							addToCanvas(object.clone(), options);
						}
					});
				}

			});

			setFlashingSolutionImageViews(true, "");
			Session.set("isRequestingTargetSelection", true);
		}
	});
}