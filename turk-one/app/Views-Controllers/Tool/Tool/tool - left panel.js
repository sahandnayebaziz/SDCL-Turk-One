/**
 * Created by sahand on 11/22/15.
 */
if (Meteor.isClient) {
	Template.decisionPointInformationPanel.rendered = function () {
		introJs().setOptions({
			"scrollToElement": true,
			"showStepNumbers": false,
			"showProgress": true,
			"showBullets": false,
			"exitOnOverlayClick": false,
			"disableInteraction": true,
			"skipLabel": "",
			steps: tutorialSteps
		}).start();

		$(".introjs-tooltiptext").css("text-align", "center");

		Session.set("showingOthersWork", false);
	};

	Template.decisionPointInformationPanel.helpers({
		allowShowingOthersWork: function () {
			if (Configurations.findOne(1)) {
				var mainConfiguration = Configurations.findOne(1);
				return mainConfiguration.shouldShowOthersWork
			}
		},
		showingOthersWork: function () {
			return Session.get("showingOthersWork") == true;
		}
	});

	Template.decisionPointInformationPanel.events({
		"click #finishRequest": function () {
			hideAllTooltips();
			Session.set("shouldGenerateReviews", true);

			function completedTextFieldsForUsedSketches() {
				var allFieldsAreFilled = true;
				$.each(canvases, function () {
					var canvasNumber = this.CDIndex;
					if (this._objects.length > 0) {
						var nameForThisCanvas = $("#name-" + canvasNumber);
						var explainForThisCanvas = $("#explain-" + canvasNumber);
						if (nameForThisCanvas.val() == "" || explainForThisCanvas.val() == "") {
							allFieldsAreFilled = false;
						}
					}
				});
				return allFieldsAreFilled;
			}

			if (completedTextFieldsForUsedSketches()) {
				$('#finishModal').modal('show');
			} else {
				var n = noty({
					text: 'One or more of your sketches are missing a name or an explanation! Please provide the missing text and try again',
					layout: 'topLeft',
					theme: 'relax', // or 'relax'
					type: 'warning',
					timeout: 10000,
					animation: {
						open: 'animated bounceInLeft', // Animate.css class names
						close: 'animated bounceOutLeft', // Animate.css class names
						easing: 'swing', // unavailable - no need
						speed: 500 // unavailable - no need
					}
				});
				if (Session.get("hasBeenWarned")) {
					var n = noty({
						text: 'Solutions submitted without name and/or explanation will be rejected',
						layout: 'topLeft',
						theme: 'relax', // or 'relax'
						type: 'warning',
						timeout: 10000,
						animation: {
							open: 'animated bounceInLeft', // Animate.css class names
							close: 'animated bounceOutLeft', // Animate.css class names
							easing: 'swing', // unavailable - no need
							speed: 500 // unavailable - no need
						}
					});
					$('#finishModal').modal('show');
				}
				Session.set("hasBeenWarned", true);
			}
		},
		"click #requestShowOthersWork": function () {
			Session.set("showingOthersWork", !Session.get("showingOthersWork"));
		}
	});

	Template.othersWork.helpers({
		// TODO: Turn this helper and the solutions helper on tool into smaller, more specified subscribes instead of subscribes to all of the Solutions collection
		otherSolutions: function () {
			return Solutions.find({
					decisionPointId: Session.get("decisionPoint"),
					complexity: {$gt: 1},
					workerId: {$ne: Session.get("ticket")},
				},
				{
					sort: {dateUpdated: -1}
				});
		}
	});
}