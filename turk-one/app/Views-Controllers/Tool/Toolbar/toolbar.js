/**
 * Created by sahand on 11/14/15.
 */
if (Meteor.isClient) {
	Template.toolbar.rendered = function () {

		memberAgents = []

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
	};
}