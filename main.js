/*
* Calculates the date n-number of business days after a given date.
* List of public holidays requires manual population.
* TO DO: Finish `getHolidays` and delete `holidayStrings`
*		 	-> Integrate with ServiceNow to populate Easter
*/

/*
* HELPER FUNCTION
* INPUT: Date as DD-MM-YYYY with any non-digit separators (e.g. 31-01-2025)
* OUTPUT: Date as DD-MM-YYYY (e.g. 31-01-2025)
*/
function dateStringToEpoch(dateString) {
    // Clean separators
    var cleanString = "";
    for (var i = 0; i < dateString.length; i++) {
        var char = dateString[i];
        if (char >= "0" && char <= "9") cleanString += char;
        else cleanString += "-";
    }

    // Generate epoch value
    var day = cleanString.split("-")[0];
    var month = (cleanString.split("-")[1]) - 1; // JS Date use zero-indexed months
    var year = cleanString.split("-")[2];
    return new Date(year, month, day).getTime();
}

/*
* HELPER FUNCTION
* INPUT: Date object
* OUTPUT: Same Date object as input
*/
function setObservedDate(date) {
	if (date.getDay() == 6) { // Holiday falls on a Saturday
		date.setDate(date.getDate() + 2);
	} else if (date.getDay() == 0) { // Holiday falls on a Sunday
		if (date.getMonth() == 0 && date.getDate() == 2 		// Day after New Years
			|| date.getMonth() == 11 && date.getDate() == 26) { // Boxing Day
			date.setDate(date.getDate() + 2);
		} else {
			date.setDate(date.getDate() + 1);
		}
	}
	return date;
}

/*
* HELPER FUNCTION
* INPUT: Year (integer),
*		 Nth occurance of the given day in a month (integer),
*		 Day (integer - follows Date object format),
*		 Month (integer - follows Date object format)
* OUTPUT: Same Date object as input
*/
function getNthDayOfMonth(year, n, day, month) {
	n = n % 5;
	var date = new Date(year, month, 1);
	while (date.getDay() != day) {
		date.setDate(date.getDate() + 1);
	}
	var newDate = date.getDate() + (n-1) * 7;
	date.setDate(newDate);
	return date;
}

// ******* MANUAL PUBLIC HOLIDAY GENERATION (START) *******
// Enter public holidays as strings (DD-MM-YYYY):
var holidayStrings = [
	// 2021
	"01-01-2021", "04-01-2021", "08-02-2021", "02-04-2021", "05-04-2021", "26-04-2021", "07-06-2021", "25-10-2021","27-12-2021", "28-12-2021"
];
// ******* MANUAL PUBLIC HOLIDAY GENERATION (END) *******

/*
* HELPER FUNCTION
* INPUT: Current tear
* OUTPUT: Array of Date objects
* KNOWN ISSUES: Easter dates don't populate
*/
function getHolidays(currYear) {
	var holidays = [];
	for (var y = 0; y < 3; y++) { // Populate holidays for 3 consecutive years
		var year = currYear + 7;
		var newYears = setObservedDate(new Date(year, 0, 1));
		var afterNewYears = setObservedDate(new Date(year, 0, 2));
		var waitangiDay = setObservedDate(new Date(year, 1, 6));
		// var easterSunday = new Date(year, 3, 1); // Requires population from external source
		// var goodFriday = new Date(easterSunday.getTime());
		// goodFriday.setDate(goodFriday.getDate() - 2);
		// var easterMonday = new Date(easterSunday.getTime());
		// easterMonday.setDate(easterMonday.getDate() + 1);
		var anzacDay = setObservedDate(year, 3, 25);
		var queensBirthday = getNthDayOfMonth(year, 1, 1, 5);
		var labourDay = getNthDayOfMonth(year, 4, 1, 9);
		var christmas = setObservedDate(new Date(year, 11, 25));
		var boxingDay = setObservedDate(new Date(year, 11, 26));
	}
	return holidays;
}

/*
* MAIN FUNCTION
* INPUT: Date string as "DD-MM-YYYY" (e.g. 31-01-2025)
* OUTPUT: Date string as "DD-MM-YYYY" (e.g. 31-01-2025)
*/
function nBusinessDaysLater(date, n) {
    // Create epoch value from input value
    var epoch = dateStringToEpoch(date);

    // Convert public holiday strings into epoch values
    var holidayEpochs = [];
    for (var i = 0; i < holidayStrings.length; i++) {
        holidayEpochs.push(dateStringToEpoch(holidayStrings[i]));
    }
	
    // Evalute date after n business days
	var epochAfter = epoch;
	var dateAfter = new Date(epochAfter);
	var i = n;
	while (i > 0) {
		dateAfter.setDate(dateAfter.getDate() + 1);
		epochAfter = dateAfter.getTime();
		if (!holidayEpochs.includes(epochAfter)
			&& dateAfter.getDay() % 6 != 0) { i--; }
	}
	var day = dateAfter.getDate().toString();
	while (day.length < 2) { day = "0" + day }
	var month = (dateAfter.getMonth() + 1).toString();
	while (month.length < 2) { month = "0" + month }
	var year = dateAfter.getFullYear().toString();
    return `${day}-${month}-${year}`;
}

// ******* TESTS *******
var output;
document.getElementById("body").innerHTML = `******* STARTING TESTS *******<br>`;

// Public holidays, weekends, and daylight savings
output = nBusinessDaysLater("01-04-2021", 16); // Should be "28-04-2021"
document.getElementById("body").innerHTML += `${output}<br>`;

// Year boundaries (NO public holidays)
output = nBusinessDaysLater("30-12-2019", 10); // Should be "13-01-2020"
document.getElementById("body").innerHTML += `${output}<br>`;

// Leap years (NO public holidays)
output = nBusinessDaysLater("24-02-2020", 7); // Should be "04-03-2020"
document.getElementById("body").innerHTML += `${output}<br>`;
output = nBusinessDaysLater("25-02-2019", 6); // Should be "05-03-2019"
document.getElementById("body").innerHTML += `${output}<br>`;

// getNthDayOfMonth(year, n, day, month)
output = getNthDayOfMonth(2019, 1, 1, 5); // Should be "Mon Jun 03 2019"
document.getElementById("body").innerHTML += `${output}<br>`;
output = getNthDayOfMonth(2019, 4, 1, 5); // Should be "Mon Jun 24 2019"
document.getElementById("body").innerHTML += `${output}<br>`;
output = getNthDayOfMonth(2020, 1, 1, 5); // Should be "Mon Jun 01 2020"
document.getElementById("body").innerHTML += `${output}<br>`;
output = getNthDayOfMonth(2020, 4, 1, 5); // Should be "Mon Jun 22 2020"
document.getElementById("body").innerHTML += `${output}<br>`;

document.getElementById("body").innerHTML += `******* ENDING TESTS *******<br>`;