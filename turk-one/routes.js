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

			var unfilteredHash = this.params._id;
			var correctedHash = this.params._id.replace("_","/");

			console.log("original is " + unfilteredHash);
			console.log("fixed is " + correctedHash);

			var decrypted = CryptoJS.AES.decrypt(correctedHash, "1234567890ABCDEF");
			console.log("decrypted to " + CryptoJS.AES.decrypt(correctedHash, "1234567890ABCDEF"));

			return Decisions.findOne({_id: decrypted.toString(CryptoJS.enc.Utf8)});
		}
	});
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
