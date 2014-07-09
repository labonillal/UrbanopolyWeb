/**
 Parse Venue

{ name: 'Scuola Elementare Leonardo da Vinci',
  wheel:
   { takePercentage: 10,
     skipPercentage: 5,
     payPercentage: 10,
     advertisePercentage: 75,
     quizPercentage: 0 },
  id: 2315,
  value: 498250,
  lat: 45.4774392,
  lon: 9.2244638,
  mortgaged: false,
  deadTime:
   { year: 2014,
     month: 4,
     dayOfMonth: 9,
     hourOfDay: 16,
     minute: 21,
     second: 15 },
  category: 641,
  ownerId: '703312353',
  ownerName: 'Francesca Trento',
  state: null }
*/
exports.parse = function(json) {
	//If the data is the type string is pased to json
	if ('string' == typeof json){
		json = JSON.parse(json);
	}
  
	//Object declaration
	var venue = {};
	
	//Attributes
	venue.id = json.id;
	venue.name = json.name;
	venue.value = json.value;
	venue.category = json.category;
	venue.lat = json.lat;
	venue.lon = json.lon;
	venue.state = json.state;
	venue.ownerId = json.ownerId;
	venue.ownerName = json.ownerName;
	venue.wheel = json.wheel;
	venue.deadTime = json.deadTime;
	venue.mortgaged = json.mortgaged;
	venue.icon = json.icon;				//icon attribute added to manage the venue graphic representation
	
	return venue;
}