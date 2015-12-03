/**
 * Created by sahand on 10/6/15.
 */
Router.configure({
	trackPageView: true
});

// main app flow
Router.route('/:_sessionId/:_workerId/:_decisionPointId', function () {
	this.render('Home', {
		data: function () {
			return {
				sessionId: this.params._sessionId,
				workerId: this.params._workerId,
				decisionPointId: this.params._decisionPointId
			}
		}
	});
	document.title = "Introduction";
});

Router.route('/tool/:_id', function () {
	this.render('Tool', {
		data: function () {
			return WorkerTickets.findOne(this.params._id);
		}
	});
	document.title = "Crowd Design Tool";
});

Router.route('/exit/:_id', function () {
	this.render('exit', {
		data: function () {
			return WorkerTickets.findOne(this.params._id);
		}
	});
	document.title = "Exit Questionnaire";
});

Router.route('/end/:_id', function () {
	this.render('end', {
		data: function () {
			return WorkerTickets.findOne(this.params._id);
		}
	});
	document.title = "Thank you for your participation";
});

// admin
Router.route('/admin', function () {
	if (Meteor.user() && Meteor.user().username === 'admin') {
		this.render('Admin');
	} else {
		this.render("unauth");
	}
	document.title = "Crowd Design Admin";
});

Router.route('/admin/:innerName', function () {
	if (Meteor.user() && Meteor.user().username === 'admin') {
		this.render('admin' + this.params.innerName);
	} else {
		this.render("unauth");
	}
	document.title = "Crowd Design Admin " + this.params.innerName;
});

Router.route('/admin/DecisionPoints/edit/:_id', function () {
	if (Meteor.user() && Meteor.user().username === 'admin') {
		this.render('adminDecisionPointsEdit', {
			data: function () {
				return DecisionPoints.findOne(this.params._id);
			}
		});
		document.title = "Worker Review";
	} else {
		this.render("unauth");
	}
	document.title = "Crowd Design Admin " + this.params.innerName;
});

Router.route('/secretlogin', function () {
	this.render('secretlogin');
	document.title = "Crowd Design Admin";
});

Router.route('/worker/:_id', function () {
	this.render('worker', {
		data: function () {
			return WorkerTickets.findOne(this.params._id);
		}
	});
	document.title = "Worker Review - " + this.params._id;
});
