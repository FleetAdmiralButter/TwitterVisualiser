const fs = require('fs');
const chicagoDataFactory = require('./chicagoDataFactory');

exports.getTweetMap = function(req, res)
{
    let chicagoTestData = JSON.parse(fs.readFileSync('poc_chicago.json'));

    res.render('tweetmap', {
        chicagoTestData: chicagoTestData,
    })
};

exports.getChicagoTweetsPOC = async (req, res) => {
    let sortedTrajectoryData = await 
        chicagoDataFactory.getDummyData({"2017" : 100, "2018" : 100}).catch((e) => console.log(e));
    // console.log(sortedTrajectoryData);
    
    let crimeCategories = new Map();
    let crimeTrajectories = new Array();

	// let defaultRegion = new google.maps.LatLng( 41.881832, -87.623177);
	// let n = 48;
	let tTimeThreshold = 180;
	let tDistThreshold = 1000;

	for(const i in sortedTrajectoryData) {
		if (!(crimeCategories.get(sortedTrajectoryData[i].Primary_Type))) {
			crimeCategories.set(sortedTrajectoryData[i].Primary_Type, [sortedTrajectoryData[i]]);
		} else
		{
			crimeCategories.set(sortedTrajectoryData[i].Primary_Type, 
				Array.from(crimeCategories.get(sortedTrajectoryData[i].Primary_Type)).concat(sortedTrajectoryData[i]));
		}
	}

	var count = 0;
	var noCount = 0;
	for(const i of crimeCategories.keys()) {
		var prevData = {};
		var firstTime = true;
		for(const c of crimeCategories.get(i)) {
			if (firstTime) {
				prevData = c;
				firstTime = false;
			} else {
				let timeDiff = getTimeDifferenceBetweenPoints(prevData, c);
				let distDiff = getDistanceBetweenPoints(prevData, c);
				
				if ((timeDiff >= tTimeThreshold ? false : distDiff >= tDistThreshold ? false : true)) {
                    crimeTrajectories.push([prevData, c]);
				} else {
					crimeTrajectories.push([c]);
				}
				
				prevData = c;
			}
		}
    }
}

getDistanceBetweenPoints = (point1, point2) => {
	let lat1 = point1.Latitude;
	let lon1 = point1.Longitude;
	let lat2 = point2.Latitude;
	let lon2 = point2.Longitude;

	//Calc Distance in terms of metres between Two Points
	let R = 6371e3;
	let φ1 = lat1 * Math.PI / 180;
	let φ2 = lat2 * Math.PI / 180;
	let λ1 = (lat2 - lat1) * Math.PI / 180;
	let λ2 = (lon2 - lon1) * Math.PI / 180;
	let a = Math.sin(λ1/2) * Math.sin(λ1/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(λ2) * Math.sin(λ2);
	let c = 2 * Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
		
	return R*c;		
}

getTimeDifferenceBetweenPoints = (a,b) => {
	let time1 = new Date(a.Date);
	let time2 = new Date(b.Date);

	return (((((time2 - time1) / 60) / 60) / 1000) * 60);
}
