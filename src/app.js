const path = require('path');
const express = require('express');
const hbs = require('hbs');
const stringSimilarity = require('string-similarity');

var fs = require('fs');

const app = express();
// Heroku will use this to start the app
const port = process.env.PORT || 3000;

const viewsFolderPath = path.join(__dirname, '../templates/views');
const publicFolderPath = path.join(__dirname, '../public');
const partialsFolderPath = path.join(__dirname, '../templates/partials');

// Set handlerbar engine and views location
app.set('view engine', 'hbs');
app.set('views', viewsFolderPath);
hbs.registerPartials(partialsFolderPath);

app.use(express.static(publicFolderPath));

// The following codes process all records in the csv file.
// Define the variables
let allRecords = [];
let duplicates = [];
let nonDuplicates = [];

// Read in the data in Sync way.
// const contents = fs.readFileSync('./normal.csv', 'utf8');
const contents = fs.readFileSync(`${__dirname}/normal.csv`, 'utf8');

// split the file content into lines and store them in an Array
// I tested the new line character '\n' on Fedora and windows. But I do not have a mac to test it.
// If you are running this on Mac and does not work. Maybe the new line character on your system is different.
allRecords = contents.split('\n').filter(Boolean);
if(allRecords.length<2){
	allRecords = contents.split('\r').filter(Boolean);
}

if(allRecords.length>1){
	// Remove the first title line row
	allRecords.shift();

	let pointer=0;
	allRecords.forEach(arow =>{
		let similarity = 0.0;

		//Store the current record for comparison
		arow = arow.replace(/^(\d+\,)*/, '');
		arow = arow.trim();

		let locationsForSimilarRecords = [];

		for(let j=pointer+1; j<allRecords.length; j++){
			let other = allRecords[j];
			other = other.replace(/^(\d+\,)*/, '');
			other = other.trim();

			// Compare two strings with compareTwoStrings function in string-similarity package 
			similarity = stringSimilarity.compareTwoStrings(arow, other);

			// I set the threshold as 0.618 here. It is with experience.
			// the similarity threshold can be higher or lower
			const threshold = 0.618;
			if(similarity > threshold){
				const similarDetails = {
					originalRecord: allRecords[pointer],
					similarRecord:  allRecords[j],
					similarity: similarity.toFixed(3)
				}
				duplicates.push(similarDetails);

				locationsForSimilarRecords.push(j);
			}
		}

		// Remove the similar records from the array variable
		if(locationsForSimilarRecords.length > 0){
			locationsForSimilarRecords = locationsForSimilarRecords.reverse();
		
			// Reverse the locations array so that elemenets at the tail of record array are removed first
			locationsForSimilarRecords.forEach(index=>{
				const removed = allRecords.splice(index,1);
			});
		}else{
			if(arow.length>1){
				nonDuplicates.push(allRecords[pointer]);
			}
		}

		pointer++;
	});

	// use stdio to out put the data as required
	console.log(JSON.stringify(duplicates));
	console.log(JSON.stringify(nonDuplicates));
}
	
app.get('', (req, res)=>{
	AllDuplicates = "<ul>";

	duplicates.forEach(elem=>{
		AllDuplicates += `<li> ${elem.originalRecord}<br/>With similarity of ${elem.similarity} to, <br/>${elem.similarRecord}<br/><br/> </li>`;
	});
	AllDuplicates += "</ul>";

	AllNonDuplicates = "<ul>";
	nonDuplicates.forEach(elem=>{
		AllNonDuplicates  += `<li> ${elem} </li>`;
	});
	AllNonDuplicates += "</ul>";
	
	res.render('index', {
		title: 'Validity Test',
		name: 'Yonglin',
		duplicates: AllDuplicates,
		nonduplicates: AllNonDuplicates
	});
});

app.get('*', (req, res)=>{
	res.render('404', {title: 'Page is not found!'});
});

app.listen(port, ()=>{
	console.log(`Server is up on port ${port}`);
});

