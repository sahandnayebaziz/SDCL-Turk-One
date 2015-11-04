/**
 * Created by sahand on 10/11/15.
 */
if (Meteor.isClient) {

	Template.admin.helpers({
		decisionPoints: function () {
			// find all decisions, sorted by id
			return DecisionPoints.find({}, {sort: {_id: 1}});
		},
		solutions: function () {
			return Solutions.find({}, {sort: {_id: 1}});
		},
		solutionsWithSketch: function () {
			return Solutions.find({complexity: {$gt: 0}});
		},
		decisionBeingPreviewed: function () {
			if (Session.get("IDRequestedForPreview")) {
				return DecisionPoints.findOne(Session.get("IDRequestedForPreview"));
			}
		},
		hashForDecisionBeingPreviewed: function () {
			if (Session.get("IDRequestedForPreview")) {
				var id = Session.get("IDRequestedForPreview");
				var key = "1234567890ABCDEF";

				console.log("id is " + id);
				console.log("key is " + key);

				var encrypted = CryptoJS.AES.encrypt(id, key);
				var hash = encrypted.toString().replace("/", "_");

				console.log("hash is " + hash);
				console.log("unfiltered hash is " + encrypted.toString());

				return hash;
			}
		}
	});

	Template.admin.events({
		"submit #createDecision": function (event) {

			event.preventDefault();

			var form = event.target;

			DecisionPoints.insert({
				name: form.name.value,
				_id: form.id.value,
				description: form.description.value,
				requirements: form.requirements.value,
				decisionPointType: form.type.value
			});
		},
		"click .update": function () {

			var form = $("#createDecision");

			DecisionPoints.update(form.id.value, {
				name: form.name.value,
				_id: form.id.value,
				description: form.description.value,
				requirements: form.requirements.value,
				decisionPointType: form.type.value
			});
		},
		"click .deleteSolution": function () {
			Solutions.remove(this._id);
		}
	});

	Template.decisionPreview.events({
		"click .delete": function () {
			DecisionPoints.remove(this._id);
		},
		"click .preview": function () {
			Session.set("IDRequestedForPreview", this._id);
			console.log("requesting id " + Session.get("IDRequestedForPreview"));
		}
	});


	Template.solutionVisual.rendered = function() {
		if(!this._rendered) {
			this._rendered = true;

			canvasArray = [];

			var idForNewCanvas = "canvas" + this.data._id;
			var element = $("#" + idForNewCanvas);
			var canvas = new fabric.Canvas(idForNewCanvas);
			canvas.isDrawingMode = true;
			canvas.freeDrawingBrush.width = 5;
			canvas.setBackgroundColor("white").renderAll();
			canvasArray.push(canvas);

			canvas.loadFromJSON(this.data.state, canvas.renderAll.bind(canvas));
		}
	};
}