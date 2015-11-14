/**
 * Created by sahand on 11/13/15.
 */
if (Meteor.isClient) {
	Template.solutionCanvas.onRendered(function () {
		var canvasNumber = this.data.canvasNumber;
		var savedCanvasState = this.data.state;


		var idForNewCanvas = "canvas-" + canvasNumber;
		var element = $("#" + idForNewCanvas);
		var canvasHeightShouldBe = 500;
		var canvasWidthShouldBe = $("#col-sketch").width();
		$(element).attr({"height": canvasHeightShouldBe, "width": canvasWidthShouldBe});

		var canvas = new fabric.Canvas(idForNewCanvas);
		canvas.CDIndex = canvasNumber;

		// add references to this canvas
		canvases.push(canvas);
		canvasHistory[canvas.CDIndex] = {backStates: [], forwardStates: [], recording: true};

		var stopwatch = new Stopwatch();
		stopwatch.identifier = "" + canvasNumber;
		interactionStopwatches.push(stopwatch);

		// set canvas defaults
		canvas.isDrawingMode = true;
		canvas.freeDrawingBrush.width = 5;
		canvas.freeDrawingBrush.color = Session.get("currentColor");
		canvas.setBackgroundColor("white").renderAll();

		canvas.loadFromJSON(savedCanvasState).renderAll();
		var index = canvas.CDIndex;
		var recording = canvasHistory[index].recording;

		if (recording) {
			if (canvasHistory[index].backStates.length == 50) {
				canvasHistory[index].backStates.shift();
			}

			canvasHistory[index].forwardStates = [];
			canvasHistory[index].backStates.push(JSON.stringify(canvas));
		}

		var nameForThisCanvas = $("#name-" + canvasNumber);
		var explainForThisCanvas = $("#explain-" + canvasNumber);

		$(function () {
			$(".explain").autosize()
		});

		// set up sanitizer
		function sanitizeText(text) {
			return sanitizeHtml(text, {
				textFilter: function (text) {
					text = text.replace('$', 'dollar');
					text = text.replace('/', '&#x2F');
					text = text.replace('\'', '&#x27'); //TODO: this is not working well maybe remove
					return text;
				},
				allowedTags: [],
				allowedAttributes: []
			})
		}

		saveSelf = (function (canvas, name, explain, stopwatch) {
			return function () {
				var index = canvas.CDIndex;
				var recording = canvasHistory[index].recording;

				if (recording) {
					if (canvasHistory[index].backStates.length == 50) {
						canvasHistory[index].backStates.shift();
					}

					canvasHistory[index].forwardStates = [];
					canvasHistory[index].backStates.push(JSON.stringify(canvas));
				}

				// Meteor call updateSolution(id, stopwatch, state, complexity, updated, name, explain)
				Meteor.call("updateSolution", Session.get("objectId" + Session.get("ticket") + canvas.CDIndex), stopwatch.getElapsed().seconds,
						JSON.stringify(canvas), canvas._objects.length, new Date(), sanitizeText(name.val()), sanitizeText(explain.val()));

				stopwatch.reset();

				Meteor.call("updateToolTime", Session.get("ticket"), pageStopwatch.getElapsed().seconds);
				pageStopwatch.reset();
			}
		})(canvas, nameForThisCanvas, explainForThisCanvas, stopwatch);

		// TODO: give stopwatches a type, and don't repeat myself in these four functions so much
		setNameTimer = (function (canvasNumber) {
			return function () {
				typingTimerName.start();
			}
		})(canvasNumber);

		stopNameTimer = (function (canvasNumber, timer) {
			return function () {
				var timeFound = timer.getElapsed().seconds;
				Meteor.call("updateNameTime", Session.get("objectId" + Session.get("ticket") + canvasNumber), timeFound, function (e, r) {
					if (!e) {
						typingTimerName.stop();
						typingTimerName.reset();
					}
				});
			}
		})(canvasNumber, typingTimerName);

		setExplainTimer = (function (canvasNumber) {
			return function () {
				typingTimerExplanation.start();
			}
		})(canvasNumber);

		stopExplainTimer = (function (canvasNumber, timer) {
			return function () {
				var timeFound = timer.getElapsed().seconds;
				Meteor.call("updateExplainTime", Session.get("objectId" + Session.get("ticket") + canvasNumber), timeFound, function (e, r) {
					if (!e) {
						typingTimerExplanation.stop();
						typingTimerExplanation.reset();
					}
				});
			}
		})(canvasNumber, typingTimerExplanation);

		// event hooks
		canvas.on('object:added', saveSelf);
		canvas.on('object:modified', saveSelf);
		canvas.on('object:removed', saveSelf);

		nameForThisCanvas.on("change", saveSelf);
		explainForThisCanvas.on("change", saveSelf);

		nameForThisCanvas.on("focus", setNameTimer);
		nameForThisCanvas.on("blur", stopNameTimer);
		nameForThisCanvas.on("keydown", function (canvasNumber) {
			return function () {
				forceFocus(canvasNumber);
			}
		}(canvasNumber));
		explainForThisCanvas.on("focus", setExplainTimer);
		explainForThisCanvas.on("blur", stopExplainTimer);
		explainForThisCanvas.on("keydown", function (canvasNumber) {
			return function () {
				forceFocus(canvasNumber);
			}
		}(canvasNumber));

		// initial save state
		saveSelf();

		if (this.data.canvasNumber === 1) {
			forceFocus(this.data.canvasNumber);
		}

	});
}