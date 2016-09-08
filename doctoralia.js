var util = require('util');
var fs = require('fs');
var casper = require('casper').create({verbose: true,logLevel: "info", clientScripts: ['jquery.js'], pageSettings: {
	loadImages: false,
	loadPlugins: false
}});

casper.userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36;');

var links = JSON.parse( fs.read('doctors_za.json') );
links = links.slice(0,2000);

var doctors = [];

casper.start().each(links, function(self, link){

	var doctor = {};

	self.thenOpen(link + '?viewPhone');

	self.then(function(){
		console.log('fetchDoctorData');
		doctor.data = this.evaluate(fetchDoctorData);
		console.log('fetchDoctorData finished');
	});

	self.thenOpen(link + '/opiniones', function() {
		console.log('fetchDoctorReviews');
		doctor.reviews = this.evaluate(fetchDoctorReviews);
		console.log('fetchDoctorReviews finished');
	});

	self.then(function(){
		doctors.push(doctor);
	});

});

casper.then(function(){
	console.log('doctor appended');
	fs.write('doctors_data_za.json', JSON.stringify(doctors, null, 4), 'a');
});

function fetchDoctorData() {
	console.log('inside fetchDoctorData');
	var doctor = {};
	doctor.fullname = $('div.title h1').text();
	doctor.profession = $('div.title #doctorSpecialities p').first().text();
	doctor.specialties = $('div.title #doctorSpecialities p.subspecialities').text();
	doctor.cedula = $('div.header-content p.regnum').text();
	doctor.building = $('#main > div > section.box.booking > div.booking-filter.no-bullet > form > div').text();
	doctor.address = $('.booking form span.doctorplacesaddress label a.more').data('full-address');
	doctor.phones = [];
	$('li.phone').each(function(){
		doctor.phones.push( $(this).text().trim() );
	});
	console.log('just before returning from fetchDoctorData');
	return doctor;
}

function fetchDoctorReviews() {
	var reviews = {
		global: $('div.review-overview div h3').text(),
		punctuality: $('p.punctuality').attr('title'),
		attention: $('p.attention').attr('title'),
		facilities: $('p.facilities').attr('title'),
		items: [],
	};

	$('.review-item').each(function(index, element){
		var review = {
			good: $('.good p').text().match(/"(.*?)"/)[1],
			bad: $('.bad p').text().match(/"(.*?)"/)[1],
			motive: $('.motive').text().match(/[^:]*$/)[0].trim(),
			where: $('.review-item:first .reviewer .where').text().trim(),
			how: $('.review-item:first .reviewer .how').text().trim()
		};
		reviews.items.push(review);
	});

	return reviews;
}

casper.run();