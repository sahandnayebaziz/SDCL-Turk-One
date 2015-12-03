/**
 * Created by sahand on 11/8/15.
 */
if (Meteor.isServer) {
	Meteor.methods({
		createDecisionPoint: function (name, id, type, description) {
			DecisionPoints.insert({
				name: name,
				_id: id,
				type: type,
				description: description
			}, function (error) {
				if (!error) {
					console.log("created decision point");
				}
			});
		},
		updateDecisionPoint: function (name, id, type, description) {
			DecisionPoints.update(id, {
				$set: {
					name: name,
					type: type,
					description: description
				}
			}, function (e) {
				if (!error) {
					console.log("updated decision point");
				}
			});
		},
		deleteDecisionPoint: function (id) {
			DecisionPoints.remove(id);
		}
	})
}

if (Meteor.isClient) {

	Meteor.subscribe("exitSurveys");
	Meteor.subscribe("quitSurveys");

	Template.adminDecisionPointsInterior.helpers({
		decisionPoints: function () {
			// find all decisions, sorted by id
			return DecisionPoints.find({}, {sort: {_id: 1}});
		}
	});

	Template.adminDecisionPointsMarkdownPreview.helpers({
		currentDescription: function () {
			return Session.get("currentDescription");
		}
	})

	Template.adminDecisionPointsCreate.events({
		"submit #createForm": function (event) {
			event.preventDefault();
			var form = event.target;
			Meteor.call("createDecisionPoint", form.name.value, form.id.value, form.type.value, form.description.value,
					function (e, r) {
						if (!e) {
							Router.go("/admin/DecisionPoints")
						}
					});
		},
		"keyup #descriptionInput": function (event) {
			console.log($(event.target).val());
			var value = $(event.target).val();
			Session.set("currentDescription", value);
		}
	});

	Template.adminDecisionPointsEdit.events({
		"submit #editForm": function (event) {
			event.preventDefault();
			var form = event.target;
			Meteor.call("updateDecisionPoint", form.name.value, form.id.value, form.type.value, form.description.value,
					function (e, r) {
						if (!e) {
							Router.go("/admin/DecisionPoints")
						}
					});
		},
		"keyup #descriptionInput": function (event) {
			console.log($(event.target).val());
			var value = $(event.target).val();
			Session.set("currentDescription", value);
		},
		"click .delete": function () {
			var idToDelete = this._id;
			bootbox.dialog({
				message: "Are you sure you want to delete this decision point?",
				title: "Delete decision point",
				buttons: {
					cancel: {
						label: "Cancel",
						className: "btn-secondary",
					},
					danger: {
						label: "Yes, delete",
						className: "btn-danger",
						callback: function() {
							Meteor.call("deleteDecisionPoint", idToDelete,
									function (e, r) {
										if (!e) {
											Router.go("/admin/DecisionPoints")
										}
									});
						}
					}
				}
			});
		}
	});

	Template.adminDecisionPointsMarkdownPreview.onRendered(function () {
		Session.set("currentDescription", "");
	});
}