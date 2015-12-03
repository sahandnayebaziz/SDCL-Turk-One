/**
 * Created by sahand on 11/23/15.
 */
if (Meteor.isClient) {
	Template.solutionVisualLocked.onRendered(function () {
		var idForNewCanvas = "canvas" + this.data._id;
		var element = $("#" + idForNewCanvas);
		var canvas = new fabric.Canvas(idForNewCanvas);
		var canvasHeightShouldBe = 500;
		var canvasWidthShouldBe = $("#toolView1ImageContainer").width();
		$(element).attr({"height": canvasHeightShouldBe, "width": canvasWidthShouldBe});

		var canvas = new fabric.Canvas(idForNewCanvas);
		canvas.isDrawingMode = false;
		canvas.setBackgroundColor("white").renderAll();
		canvas.loadFromJSON(this.data.state, canvas.renderAll.bind(canvas));
		canvas.CDID = this.data._id;



		// zoom canvas if necessary
		function determineCanvasContentWidth() {
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
			return detectedWidth;
		}
		var contentWidth = determineCanvasContentWidth();
		canvas.clear().renderAll();
		canvas.loadFromJSON(this.data.state, canvas.renderAll.bind(canvas));

		if (contentWidth > canvasWidthShouldBe) {
			canvas.setZoom(canvasWidthShouldBe / contentWidth).renderAll();
		}


		// add references to this canvas
		for (var i = 0; i < otherWorkCanvases.length; i++) {
			if (otherWorkCanvases[i].CDID === canvas.CDID) {
				otherWorkCanvases.splice(i, 1);
			}
		}
		otherWorkCanvases.push(canvas);

		$.each(canvas.getObjects(), function () {
			this.lockMovementX = this.lockMovementY = this.lockScalingX = this.lockScalingY = this.lockRotation = this.lockUniScaling = true;
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

			applyDuplicate = function (state, referenceId) {
				return function () {
					return {
						state: state,
						id: referenceId,
						type: "duplicate"
					}
				}
			}(this.state, this._id);

			selectedTargetCanvas.done(function (canvasNumber) {
				Session.set("isRequestingTargetSelection", false);
				var canvas = canvases[canvasNumber - 1];
				var data = applyDuplicate();
				var state = data.state;
				if (data.id) {
					Meteor.call("addSolutionAsReferenceToNewSolution", data.id, canvases[canvasNumber - 1].CDID, data.type, function (e, r) {
						if (!e) {

						}
					});
				}
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
			applyObjectOrGroup = function (activeObject, activeGroup, referenceId) {
				return function () {
					return {
						object: activeObject,
						group: activeGroup,
						id: referenceId,
						type: "copy"
					}
				}
			}(canvas.getActiveObject(), canvas.getActiveGroup(), targetID);
			selectedTargetCanvas.done(function (canvasNumber) {
				Session.set("isRequestingTargetSelection", false);
				var data = applyObjectOrGroup();
				var numberToCopy = 0;
				var numberCopied = 0;

				function returnIfFinished() {
					if (numberCopied == numberToCopy) {
						changeSizeClass();
						// pass numberToCopy to new canvas and select the n last elements
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

				if (data.id) {
					Meteor.call("addSolutionAsReferenceToNewSolution", data.id, canvases[canvasNumber - 1].CDID, data.type, function (e, r) {
						if (!e) {

						}
					});
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