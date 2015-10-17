/**
 * Created by sahand on 10/11/15.
 */
if (Meteor.isClient) {
	Template.admin.helpers({
		workerTickets: function () {
			return WorkerTickets.find({}, {sort: {_id: 1}});
		},
		decisionPoints: function () {
			// find all decisions, sorted by id
			return DecisionPoints.find({}, {sort: {_id: 1}});
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
		},
		exitSurveys: function () {
			return ExitSurveys.find({}, {sort: {_id: 1}});
		},
		quitSurveys: function () {
			return QuitSurveys.find({}, {sort: {_id: 1}});
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
				requirements: form.requirements.value
			});
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

	Template.workerTicketRow.events({
		"click .delete": function () {
			WorkerTickets.remove(this._id);
		}
	})
}

