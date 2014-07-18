(function() {
	var _ = require('underscore');
	// hack: use synchronous http requests for the tests
	var httpSync = require('http-sync');
	// use XML to JS object parser (for USPS)
	var parseString = require('xml2js').parseString;

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
			var tracking_result = {}; // save your result to this object

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
	new Courier().usps('9405903699300184125060');
}());

