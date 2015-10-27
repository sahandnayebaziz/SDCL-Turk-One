/**
 * Created by sahand on 10/7/15.
 */
if (Meteor.isClient) {
	Template.tool.helpers({
		workerTicket: function () {
			return WorkerTickets.findOne(this._id);
		},
		decisionPoint: function () {
			return DecisionPoints.findOne(this.decisionPointId);
		},
		solutions: function () {
			return Solutions.find({workerId: Session.get("ticket")});
		},
		numberOfCanvasesToShow: function () {
			var numberOfIndexesToReturn = Session.get("numberOfCanvasesToShow");
			var arrayOfIndexes = [];
			for (var x = 1; x <= numberOfIndexesToReturn; x++) {
				arrayOfIndexes.push(x);
			}
			return arrayOfIndexes;
		},
		shouldShowAddCanvasButton: function () {
			if (Session.get("numberOfCanvasesToShow") == 5) {
				return false;
			} else {
				return true;
			}
		},
		existingSolution: function (canvasNumber) {
			console.log("trying to find existing solution");
			return Solutions.findOne({workerId: Session.get("ticket"), canvasNumber: canvasNumber});
		}
	});

	Template.tool.events({
		"click .addCanvas": function (event) {
			event.preventDefault();
			Session.set("numberOfCanvasesToShow", Session.get("numberOfCanvasesToShow") + 1);
		},
		"submit #quitForm": function (event) {
			event.preventDefault();

			var reason = $("#quitForm input[name=quitReason]:checked").val()
			var feedback = $("#quitText").val();

			QuitSurveys.insert({
				reason: reason,
				feedback: feedback
			});

			$('#quitModal').modal('hide')

			Router.go("/");
		},
		"click #finishConfirm": function () {
			Router.go("/review/" + Session.get("ticketId"));
			// save each sketch
			// move the user to the review phase where she will be able to mark each one as selected or not
		}
	});

	Template.tool.rendered = function() {
		if (!this._rendered) {
			this._rendered = true;

			console.log("rendering");

			// create persistent objects in database for these sketches
			function createPersistSelf(canvasNumber) {
				if (Session.get("insertedSolutionFor" + canvasNumber)) {

				} else {
					Solutions.insert({
						workerId: Session.get("ticket"),
						state: "",
						createdAt: new Date(),
						dateUpdated: new Date(),
						canvasNumber: canvasNumber
					}, function (error, id) {
						Session.setPersistent("objectId" + canvasNumber, id);
						Session.setPersistent("insertedSolutionFor" + canvasNumber, "true");
						console.log("set persistence for " + canvasNumber);
					});
				}
			}

			createPersistSelf(1);
			createPersistSelf(2);
			createPersistSelf(3);
			createPersistSelf(4);
			createPersistSelf(5);
		}
	}
};