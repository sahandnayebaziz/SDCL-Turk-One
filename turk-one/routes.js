/**
 * Created by sahand on 10/6/15.
 */
Router.route('/:_sessionId/:_workerId/:_decisionPointId', function () {
	this.render('Home', {
		data: function () {
			return {
				sessionId: this.params._sessionId,
				workerId: this.params._workerId,
				decisionPointId: this.params._decisionPointId
			}
		}
	})
});

Router.route('/help/:_id', function () {
	this.render('Help', {
		data: function () {
			return WorkerTickets.findOne(this.params._id);
		},
		action: function () {
			// render all templates and regions for this route
			if (this.ready()) this.render()
		}
	})
});

Router.route('/tool/:_id', function () {
	this.render('Tool', {
		data: function () {
			return WorkerTickets.findOne(this.params._id);
		}
	})
});

Router.route('/review', function () {
	this.render('Review');
});

Router.route('/exit', function () {
	this.render('Exit');
});


Router.route('/admin', function () {
	this.render('Admin');
});
