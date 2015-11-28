/**
 * Created by sahand on 11/14/15.
 */
if (Meteor.isClient) {
	Template.toolbar.rendered = function () {

		// Set Black as default color in toolbar (set for each canvas at initialization in tool.html
		Session.set("currentColor", "#414141");
		$("#buttonBlack").addClass("selectedTool");

		// setting toolbar active tool
		function setSelectedTool(tool) {
			$(".selectedTool").removeClass("selectedTool").addClass("deselectedTool");
			$(tool).addClass("selectedTool");
			removeMouseEvents();
		}

		//Remove all mouse events
		function removeMouseEvents() {
			$.each(canvases, function () {
				this.off("mouse:move");
				this.off("mouse:up");
				this.off("mouse:down");
			});
		}

		//Toggle object selection on/off
		function setObjectSelection(toggle){
			$.each(canvases, function () {
				this.isDrawingMode = false;
				this.selection = toggle;
				for (var i = this.getObjects().length-1; i >= 0; i--){
					//check if the last object is set to toggle if and abort it true because then all objects are already set.
					if(this._objects[i].selectable === toggle){
						break;
					}
					this._objects[i].selectable = toggle;
				}
			});
		}



		// -------- NORMAL TOOLBAR TOOLS --------

		// toolbar color clicked
		$(".buttonColor").click(function () {
			setSelectedTool(this);
			var colorChosen = this.getAttribute("data-color");

			Session.set("currentColor", colorChosen);
			$.each(canvases, function () {
				this.freeDrawingBrush.color = colorChosen;
				this.isDrawingMode = true;
			});

			ga('send', {
				hitType: 'event',
				eventCategory: 'Toolbar',
				eventAction: 'Selecting a color',
				eventLabel: Session.get("ticket")
			});
		});

		// toolbar move controls clicked
		$("#buttonMove").click(function () {
			setSelectedTool(this);
			setObjectSelection(true);

			ga('send', {
				hitType: 'event',
				eventCategory: 'Toolbar',
				eventAction: 'Move Controls',
				eventLabel: Session.get("ticket")
			});
		})

		// this is an explicit mod of the above function that can be synthetically run from another click handler
		function simulateMoveClick() {
			setSelectedTool($("#buttonMove"));
			setObjectSelection(true);
		}

		// text button clicked
		$("#buttonText").click(function () {
			removeMouseEvents();
			setSelectedTool(this);

			$.each(canvases, function () {
				this.isDrawingMode = false;
			});

			$.each(canvases, function () {
				this.on("mouse:down", function (e) {
					var locationOnThisCanvas = this.getPointer(event.e);
					this.add(new fabric.IText('Click and Type', {
						fontFamily: 'times black',
						left: locationOnThisCanvas.x,
						top: locationOnThisCanvas.y,
						originX: 'left',
						originY: 'top',
						selectable: false,
						fontSize: 16
					}));

					var newTextObject = this.item(this.getObjects().length - 1);
					this.setActiveObject(newTextObject);
					simulateMoveClick();
					this.renderAll();
				});
			});
			ga('send', {
				hitType: 'event',
				eventCategory: 'Toolbar',
				eventAction: 'Text',
				eventLabel: Session.get("ticket")
			});
		});

		//Adding rectangles to the canvas
		$("#buttonRectangle").click(function () {
			setSelectedTool(this);
			removeMouseEvents();
			setObjectSelection(false);

			$.each(canvases, function () {
				var rect, isUp, isDown, origX, origY;

				this.on('mouse:down', function(o){
					isUp = false;
					isDown = true;
					var pointer = this.getPointer(o.e);
					origX = pointer.x;
					origY = pointer.y;
					var pointer = this.getPointer(o.e);
					rect = new fabric.Rect({
						left: origX,
						top: origY,
						originX: 'left',
						originY: 'top',
						width: pointer.x-origX,
						height: pointer.y-origY,
						angle: 0,
						stroke: Session.get("currentColor"),
						fill: "transparent",
						opacity: 1,
						strokeWidth: 3,
						active: false,
						selectable: false
					});
					rect.setCoords();
					this.add(rect);
				});

				this.on('mouse:move', function(o){
					if (!isDown) return;
					var pointer = this.getPointer(o.e);
					if(origX>pointer.x){
						rect.set({ left: Math.abs(pointer.x) });
					}
					if(origY>pointer.y){
						rect.set({ top: Math.abs(pointer.y) });
					}
					rect.set({ width: Math.abs(origX - pointer.x) });
					rect.set({ height: Math.abs(origY - pointer.y) });
					rect.setCoords();

					this.renderAll();
				});

				this.on('mouse:up', function(o){
					isDown = false;
					this.renderAll();
				});
			});

			ga('send', {
				hitType: 'event',
				eventCategory: 'Toolbar',
				eventAction: 'Rectangle',
				eventLabel: Session.get("ticket")
			});
		});

		//adding circles to the canvas
		$("#buttonCircle").click(function () {
			setSelectedTool(this);
			removeMouseEvents();

			$.each(canvases, function () {
				this.isDrawingMode = false;
			});

			$.each(canvases, function () {
				this.on("mouse:down", function (e) {
					var locationOnThisCanvas = this.getPointer(event.e);
					this.add(new fabric.Circle({
						radius: 100,
						width: 150,
						height: 150,
						stroke: Session.get("currentColor"),
						fill: "transparent",
						opacity: 1,
						strokeWidth: 3,
						left: locationOnThisCanvas.x,
						top: locationOnThisCanvas.y,
						selectable: false
					}));
					var newRectObject = this.item(this.getObjects().length - 1);
					this.setActiveObject(newRectObject);
					simulateMoveClick();
					this.renderAll();
				});
			});

			ga('send', {
				hitType: 'event',
				eventCategory: 'Toolbar',
				eventAction: 'Circle',
				eventLabel: Session.get("ticket")
			});
		});

		// UNDO AND REDO
		$("#buttonUndo").click(function () {

			var index = canvasWithFocus.CDIndex;
			var back = canvasHistory[index].backStates;

			if (back.length > 1) {
				notify("Undo", "information");
				canvasHistory[index].recording = false;
				var fromState = back.pop();
				canvasHistory[index].forwardStates.push(fromState);
				var toState = back[back.length - 1];
				canvasWithFocus.loadFromJSON(toState);
				canvasWithFocus.renderAll();
				canvasHistory[index].recording = true;
			}

			ga('send', {
				hitType: 'event',
				eventCategory: 'Toolbar',
				eventAction: 'Undo',
				eventLabel: Session.get("ticket")
			});
		});

		$("#buttonRedo").click(function () {

			var index = canvasWithFocus.CDIndex;
			var forward = canvasHistory[index].forwardStates;

			if (forward.length > 0) {
				notify("Redo", "information");
				canvasHistory[index].recording = false;
				var toState = forward.pop();
				canvasHistory[index].backStates.push(toState);

				canvasWithFocus.loadFromJSON(toState);
				canvasWithFocus.renderAll();
				canvasHistory[index].recording = true;
			}
			ga('send', {
				hitType: 'event',
				eventCategory: 'Toolbar',
				eventAction: 'Redo',
				eventLabel: Session.get("ticket")
			});
		});

		//Tooltips (Google analytics)
		$("#toolbarTips").click(function () {
			ga('send', {
				hitType: 'event',
				eventCategory: 'Toolbar',
				eventAction: 'Toolbar Tips',
				eventLabel: Session.get("ticket")
			});
		});

		// --------  SELECTION TOOLBAR TOOLS --------

		// TODO: these need to work for a group of selected objects
		// Send to Front
		$("#buttonSendFront").click(function () {

			if (canvasWithFocus.getActiveObject()) {
				notify("Send object to front", "information");
				var target = canvasWithFocus.getActiveObject();
				canvasWithFocus.bringToFront(target);
				canvasWithFocus.deactivateAll();
				canvasWithFocus.renderAll();
			}
			if (canvasWithFocus.getActiveGroup()){
				notify("Only single objects can be sent to front", "warning");
			}

			ga('send', {
				hitType: 'event',
				eventCategory: 'Toolbar',
				eventAction: 'Send front',
				eventLabel: Session.get("ticket")
			});
		});

		// Send to Back
		$("#buttonSendBack").click(function () {
			if (canvasWithFocus.getActiveObject()) {
				notify("Send object to back", "information");
				var target = canvasWithFocus.getActiveObject();
				canvasWithFocus.sendToBack(target);
				canvasWithFocus.deactivateAll();
				canvasWithFocus.renderAll();
			}
			if (canvasWithFocus.getActiveGroup()){
				notify("Only single objects can be sent to back", "warning");
			}

			ga('send', {
				hitType: 'event',
				eventCategory: 'Toolbar',
				eventAction: 'Send back',
				eventLabel: Session.get("ticket")
			});
		});

		// toolbar eraser clicked
		$("#buttonEraser").click(function () {
			notify("Delete object(s)", "information");
			var canvas = canvasWithFocus;
			var index = canvas.CDIndex;
			if (canvas.getActiveGroup()) {
				canvasHistory[index].recording = false;
				canvas.getActiveGroup().forEachObject(function (a) {
					canvas.remove(a);
				});
				canvas.discardActiveGroup();
				canvasHistory[index].recording = true;
				canvasHistory[index].backStates.push(JSON.stringify(canvas));
			} else {
				canvas.remove(canvas.getActiveObject());
			}
			canvas.renderAll();

			ga('send', {
				hitType: 'event',
				eventCategory: 'Toolbar',
				eventAction: 'Eraser',
				eventLabel: Session.get("ticket")
			});
		})

		//Duplicate
		$("#buttonDuplicate").click(function () {
			notify("Duplicating object(s)", "information");
			var canvas = canvasWithFocus;
			var index = canvas.CDIndex;

			if(canvas.getActiveGroup()) {

				if (canvas.getActiveGroup().getObjects().length > 50) {
					ga('send', {
						hitType: 'event',
						eventCategory: 'Toolbar',
						eventAction: 'Tried to duplicate more that 50 objects',
						eventLabel: Session.get("ticket")
					});
					notify("Duplication of many objects can take some time and can slow down your canvas!", "warning");
				}

				canvasHistory[index].recording = false;
				var group = canvas.getActiveGroup();
				canvas.deactivateAll();
				canvas.discardActiveGroup();
				var clonedObjects = new fabric.Group();

				group.forEachObject(function (o) {
					var clonedObject = cloneObject(o);
					clonedObjects.addWithUpdate(clonedObject);
					canvas.add(clonedObject);
				});
				clonedObjects.setCoords();
				canvas.setActiveGroup(clonedObjects);
				canvasHistory[index].recording = true;
				canvasHistory[index].backStates.push(JSON.stringify(canvas));

				ga('send', {
					hitType: 'event',
					eventCategory: 'Toolbar',
					eventAction: 'Duplicate group',
					eventLabel: Session.get("ticket")
				});

			} else if(canvas.getActiveObject()){
				var object = canvas.getActiveObject();
				canvas.deactivateAll();
				canvas.discardActiveGroup();

				var clonedObject = cloneObject(object);
				canvas.setActiveObject(clonedObject);
				canvas.add(clonedObject);

				ga('send', {
					hitType: 'event',
					eventCategory: 'Toolbar',
					eventAction: 'Duplicate single object',
					eventLabel: Session.get("ticket")
				});
			}
			simulateMoveClick();
			canvas.renderAll();
		});

		//Clone objects helper
		function cloneObject(object){
			var clonedObject;
			//check for async objects to determine the way to clone
			if(fabric.util.getKlass(object.get("type")).async) {
				object.clone(function(clone){
					clonedObject = clone;
				});
			} else {
				clonedObject = object.clone();
			}
			clonedObject.set({
				top: clonedObject.top + 25,
				left: clonedObject.left + 25,

				active: true
			}).setCoords();

			return clonedObject;
		}


		// FOCUS

		// guessing focus
		function findFocus() {

			var scrollPosition = $(window).scrollTop();
			var focusDistance = 9999;
			var focusGuess = null;
			var focusGuessIndex = 0;

			$.each($(".canvasContainer"), function () {
				var positionAtTopOfCanvas = $(this).offset().top;
				var distanceFromScrollPosition = Math.abs(scrollPosition - positionAtTopOfCanvas);
				if ((scrollPosition < positionAtTopOfCanvas + 250) && (distanceFromScrollPosition < focusDistance)) {
					focusDistance = distanceFromScrollPosition;
					focusGuess = this;
				}
			});

			$.each($(".canvasContainer"), function () {
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

			$.each(interactionStopwatches, function () {
				if (this.identifier == focusGuessIndex) {
					this.start();
					stopwatchWithFocus = this;
				} else {
					this.stop();
					this.reset();
				}
			});
		}

		// attach focus guessing to window scrolling
		$(window).scroll(findFocus);

		// provide method for forcing focus
		forceFocus = function (index) {

			$.each($(".canvasContainer"), function () {
				if (parseInt($(this).attr("data-cdindex")) == index) {
					$(this).addClass("focusedCanvas");
				} else {
					$(this).removeClass("focusedCanvas");
				}
			});

			$.each(canvases, function () {
				if (this.CDIndex == index) {
					canvasWithFocus = this;
				}

			});

			$.each(interactionStopwatches, function () {
				if (this.identifier == index) {
					this.start();
					stopwatchWithFocus = this;
				} else {
					this.stop();
				}
			});

		};

		$("#toolView2").on("mousedown", ".canvasContainer", function () {
			var index = parseInt($(this).attr("data-cdindex"));
			forceFocus(index);
		});

		memberAgents = [];

		function toolbarMemberAgent(reference, memberType) {
			this.reference = reference;
			this.memberType = memberType;
		}

		memberAgents.push(new toolbarMemberAgent("#buttonBlack", "free"));
		memberAgents.push(new toolbarMemberAgent("#buttonRed", "free"));
		memberAgents.push(new toolbarMemberAgent("#buttonBlue", "free"));
		memberAgents.push(new toolbarMemberAgent("#buttonGreen", "free"));
		memberAgents.push(new toolbarMemberAgent("#buttonYellow", "free"));

		memberAgents.push(new toolbarMemberAgent("#buttonText", "free"));
		memberAgents.push(new toolbarMemberAgent("#buttonRectangle", "free"));
		memberAgents.push(new toolbarMemberAgent("#buttonCircle", "free"));
		memberAgents.push(new toolbarMemberAgent("#buttonMove", "free"));

		memberAgents.push(new toolbarMemberAgent("#buttonSendFront", "selection"));
		memberAgents.push(new toolbarMemberAgent("#buttonSendBack", "selection"));
		memberAgents.push(new toolbarMemberAgent("#buttonEraser", "selection"));
		memberAgents.push(new toolbarMemberAgent("#buttonDuplicate", "selection"));

		$.each(memberAgents, function(index, value) {
			var member = value;
			if (member.memberType !== "free") {
				var DOMObject = $(member.reference);
				DOMObject.css("display","none");
			}
			else {
				var DOMObject = $(member.reference);
				DOMObject.css("display","block");
			}
		});

		console.log("rendered toolbar");
	};
}