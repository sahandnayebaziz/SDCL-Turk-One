/**
 * Created by sahand on 10/11/15.
 */
if (Meteor.isServer) {
	Meteor.publish("exitSurveys", function() {
		return ExitSurveys.find();
	});

	Meteor.publish("quitSurveys", function() {
		return QuitSurveys.find();
	});

	Meteor.methods({
		createDecisionPoint: function(name, id, descr, req, type) {
			DecisionPoints.insert({
				name: name,
				_id: id,
				description: descr,
				requirements: req,
				decisionPointType: type
			}, function(error) {
				if (!error) {
					console.log("created decision point");
				}
			});
		},
		deleteSolution: function (id) {
			Solutions.remove(id);
		},
		deleteDecisionPoint: function (id) {
			DecisionPoints.remove(id);
		}
	})
}

if (Meteor.isClient) {

	Meteor.subscribe("exitSurveys");
	Meteor.subscribe("quitSurveys");

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

			Meteor.call("createDecisionPoint", form.name.value, form.id.value, form.description.value, form.requirements.value, form.type.value);
		},
		"click .deleteSolution": function () {
			Meteor.call("deleteSolution", this._id);
		}
	});

	Template.decisionPreview.events({
		"click .delete": function () {
			Meteor.call("deleteDecisionPoint", this._id);
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