(function() {
	var _ = require('underscore');
	// hack: use synchronous http requests for the tests
	var httpSync = require('http-sync');
	// use XML to JS object parser (for USPS)
	var parseString = require('xml2js').parseString;
	// use html string to DOM object parser (for HKP)
	var cheerio = require('cheerio');

	function Courier() {
		this.usps = function(tracking_number) {
			var tracking_result = {};

			// options for USPS http request
			var options = {
			  host: 'production.shippingapis.com',
			  path: '/ShippingAPITest.dll?API=TrackV2&XML=%3CTrackFieldRequest%20USERID=%22519MYCOM6991%22%3E%3CTrackID%20ID=%22' +
			    tracking_number + '%22%3E%3C/TrackID%3E%3C/TrackFieldRequest%3E'
			};

			//synchronous (blocking) http request
			var request = httpSync.request(options);
			//get response from request
			var response = request.end();

			//parse the response XML body; function is synchronous
			parseString(response.body, function(err, result){
				var trackSummary = result.TrackResponse.TrackInfo[0].TrackSummary[0];

				//fixit: need to accommodate multiple events
				tracking_result.checkpoints = [];
				tracking_result.checkpoints.push({
				  country_name: trackSummary.EventCountry[0],
				  message: trackSummary.Event[0],
				  //fixit: need to reformat time
				  checkpoint_time: trackSummary.EventDate[0] + ' ' + trackSummary.EventTime[0]
				});
			});

			return tracking_result;
		};

		this.hkpost = function(tracking_number) {
			var tracking_result = {};

			// options for HKP http request
			var options = {
			  host: 'app3.hongkongpost.hk',
			  path: '/CGI/mt/mtZresult.jsp?tracknbr=' + tracking_number
			};

			// synchronous (blocking) http request
			var request = httpSync.request(options);
			// get response from request
			var response = request.end();

			// use cheerio to convert response body to 'DOM object'
			var $ = cheerio.load(String(response.body));

			// get text from #clfContent div and split into array
			var htmlData = _.filter($('#clfContent').text().split('  '), function(el){
				return el.length;
			});
			var data = htmlData[3].split('\r\n');
			
			// get destination string from data
			var destinationData = data[data.length - 2].split(' ');
			var destination = destinationData[destinationData.length - 1];

			// slice out appropriate message from data
			var messageData = data[data.length - 1];
			// hack: use trick to slice off tracking number from message
			var numberSlicePos = messageData.indexOf(tracking_number);
			var message = messageData.slice(0, numberSlicePos - 1) +
				messageData.slice(numberSlicePos + tracking_number.length + 2, messageData.length - 1);

			// fixit: add checkpoint_time

			tracking_result.checkpoints = [];
			tracking_result.checkpoints.push({
				country_name: destination,
				message: message
				// fixit: add checkpoint_time
			});

			console.log(tracking_result);

			// do your job here
			return tracking_result;

		};

		this.dpduk = function(tracking_number) {
			var tracking_result = {}; // save your result to this object

			// do your job here
			return tracking_result;

		};
	}

	module.exports = new Courier();
	new Courier().hkpost('RC933607107HK');
}());

