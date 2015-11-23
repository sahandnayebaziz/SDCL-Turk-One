/**
 * Created by sahand on 11/8/15.
 */
/**
 * Created by sahand on 10/11/15.
 */
if (Meteor.isServer) {
	Meteor.methods({
		deleteSolution: function (id) {
			Solutions.remove(id);
		}
	})
}

if (Meteor.isClient) {
	Template.adminSolutionsInterior.helpers({
		solutions: function () {
			return Solutions.find({complexity: {$gt: 1}}, {sort: {dateUpdated: -1}});
		}
	});
	Template.adminSolutionsInterior.events({
		"click .deleteSolution": function () {
			var idToDelete = this._id;
			bootbox.dialog({
				message: "Are you sure you want to delete this solution?",
				title: "Delete solution",
				buttons: {
					cancel: {
						label: "Cancel",
						className: "btn-secondary",
					},
					danger: {
						label: "Yes, delete",
						className: "btn-danger",
						callback: function() {
							Meteor.call("deleteSolution", idToDelete);
						}
					}
				}
			});
		}
	});
	Template.solutionVisualImage.onRendered(function () {
		var idForNewCanvas = "canvas" + this.data._id;
		var element = $("#" + idForNewCanvas);
		var canvas = new fabric.Canvas(idForNewCanvas);
		var canvasHeightShouldBe = 500;
		var canvasWidthShouldBe = $("#col-sketch").width();
		$(element).attr({"height": canvasHeightShouldBe, "width": canvasWidthShouldBe});

		var canvas = new fabric.Canvas(idForNewCanvas);
		canvas.isDrawingMode = false;
		canvas.setBackgroundColor("white").renderAll();
		canvas.loadFromJSON(this.data.state, canvas.renderAll.bind(canvas));

		var imageElement = document.getElementById('image' + this.data._id);
		imageElement.src = canvas.toDataURL({
			format: 'jpeg',
			quality: 1 // this could probably stand to go much lower! Maybe if performance slows
		});

		// trying this out below to clear references, push objects to garbage collection to keep DOM light. Not sure
		// how great the effect is or if this happens automatically yet.
		element.remove();
		canvas = null;
		element = null;
		idForNewCanvas = null;
		imageElement = null;
	});
}