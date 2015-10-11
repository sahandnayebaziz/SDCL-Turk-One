/**
 * Created by sahand on 10/6/15.
 */
Router.route('/', function () {
	this.render('Home');
});

Router.route('/help', function () {
	this.render('Help');
});

Router.route('/tool', function () {
	this.render('Tool');
});

Router.route('/tool/:_id', function () {
	this.render('Tool', {
		data: function () {
			return Decisions.findOne({_id: this.params._id});
		}
	});
});

Router.route('/admin', function () {
	this.render('Admin');
});
