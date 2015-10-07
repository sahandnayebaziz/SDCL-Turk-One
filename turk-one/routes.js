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
