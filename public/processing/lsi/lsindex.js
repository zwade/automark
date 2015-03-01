 /**
 * Created by Lucas on 2/28/15.
 */

var indexer = (function () {

	// Private variables and functions
	var approxRank;
	var keywords;
	var keywordvectors;
	var keywordweight;
	var keywordfreqs;
	var keywordtopfreq;
	var keywordtopfreqnum;
	var areKeywordVectorsUpdated = false;
	var contentmatrix; //Stores by column
	var rkapproxuk;
	var rkapproxsk;
	var docvectors;
	var docDict;

	// Create the indexing matrices
	var lsi = function () {
		var svd = numeric.svd(numeric.transpose(contentmatrix));
		var uk = numeric.transpose(numeric.transpose(svd.U).slice(0, approxRank));
		var sk = numeric.diag(svd.S.slice(0, approxRank));
		var vt = numeric.transpose(numeric.transpose(svd.V).slice(0, approxRank));
		rkapproxuk = uk;
		rkapproxsk = sk;
		docvectors = vt;
	};

	/*
		Generates folder structure with a certain number of folders
		Params:
			foldernum: Number of folders to use
		Returns:
			{ "foldername1": [docid, docid, docid, ...],
			  "foldername2": [docid, ...],
			  ...
			}
	 */
	var folderize = function (foldernum) {
		var out = {};
		var foldernames = getFolders(foldernum);
		for (var j = 0; j < foldernames.length; j++) {
			out[foldernames[j][1]] = [];
		}
		for (var i = 0; i < docvectors.length; i++) {
			var infolder = getClosestFolder(docvectors[i], foldernames);
			out[infolder].push(docDict[i]);
		}
		return out;
	};

	var getClosestFolder = function (docvector, foldernames) {
		var closest;
		for (var i = 0; i < foldernames.length; i++) {
			var dist = cosim(keywordvectors[foldernames[i][0]], docvector);
			if (typeof closest == 'undefined') {
				closest = [foldernames[i][1], dist];
			}
			else if (dist > closest[1]) {
				closest = [foldernames[i][1], dist];
			}
		}
		return closest[0];
	};

	var getFolders = function (foldernum) {
		if (!areKeywordVectorsUpdated) {
			keywordvectors = [];
			computeKeywordVectors();
		}
		updateTopFreqKeywords();

		// Greedy Algorithm
		var bestset;
		for (var i = 0; i < keywordtopfreq.length; i++) {
			var iset = [];
			var bindex = binaryIndexOf(keywordtopfreq[0]);
			iset.push([bindex, keywordvectors[bindex]]);
			for (var k = 1; k < foldernum; k++) {
				var maxvalue = 0;
				var bestindex = -1;
				for (var j = 0; j < keywordvectors.length; j++) {
					var tempvalue = calculateValue(iset, keywordvectors[j]);
					if (tempvalue > maxvalue) {
						maxvalue = tempvalue;
						bestindex = j;
					}
				}
				iset.push([bestindex, keywordvectors[bestindex]]);
			}
			var isettotal = calculateValue(iset);
			isettotal += 10*foldernum*containsTopFreqs(iset);
			if (typeof bestset == 'undefined') {
				bestset = [isettotal, iset];
			}
			else if (isettotal > bestset[0]) {
				bestset = [isettotal, iset];
			}
		}

		// Replace index of keywords with the keywords
		var folders = [];
		for (var l = 0; l < bestset[1].length; l++) {
			folders.push([bestset[1][l][0], keywords[bestset[1][l][0]]]);
		}
		return folders;
	};

	var containsTopFreqs = function (iset) {
		var count = 0;
		for (var i = 0; i < iset.length; i++) {
			for (var j = 0; j < keywordtopfreq[j]; j++) {
				if (iset[i][1] == keywordtopfreq[j]) {
					count++;
				}
			}
		}
		return count;
	};

	var updateTopFreqKeywords = function () {
		keywordtopfreq = [];
		for (var i = 0; i < keywords.length; i++) {
			if (keywordtopfreq.length < keywordtopfreqnum) {
				keywordtopfreq.push(keywords[i]);
				sortf();
			}
			else if (keywordfreqs[i] > keywordtopfreq[keywordtopfreqnum - 1]) {
				keywordtopfreq[keywordtopfreqnum - 1] = keywords[i];
				sortf();
			}
		}
	};

	 var sortf = function (left, right) {
		 left = typeof left !== 'undefined' ? left : 0;
		 right = typeof right !== 'undefined' ? right : keywordtopfreq.length - 1;
		 var index;
		 if (keywordtopfreq.length > 1) {
			 index = partitionf(left, right);
			 if (left < index - 1) {
				 sortf(left, index - 1);
			 }
			 if (index < right) {
				 sortf(index, right);
			 }
		 }
	 };

	 var partitionf = function (left, right) {
		 var pivot = keywordtopfreq[Math.floor((right + left) / 2)],
			 i = left,
			 j = right;

		 while (i <= j) {
			 while (keywordtopfreq[i] < pivot) {
				 i++;
			 }
			 while (keywordtopfreq[j] > pivot) {
				 j--;
			 }
			 if (i <= j) {
				 swapf(i, j);
				 i++;
				 j--;
			 }
		 }
		 return i;
	 };

	 var swapf = function (k1, k2) {
		 var temp = keywordtopfreq[k1];
		 keywordtopfreq[k1] = keywordtopfreq[k2];
		 keywordtopfreq[k2] = temp;
	 };

	var calculateValue = function (iset, newvector) {
		var tempiset = iset;
		var value = 0;
		for (var i = 0; i < tempiset.length; i++) {
			for (var j = i; j < tempiset.length; j++) {
				value = value + distanceBetween(tempiset[i][1], tempiset[j][1]);
			}
			if (typeof newvector !== 'undefined') {
				value = value + distanceBetween(tempiset[i][1], newvector);
			}
		}
		return value;
	};

	var distanceBetween = function (v1, v2) {
		return mag(numeric.sub(v2, v1));
	};

	var computeKeywordVectors = function () {
		var vector = [];
		for (var k = 0; k < keywords.length; k++) {
			vector.push(0);
		}
		for (var i = 0; i < keywords.length; i++) {
			vector[i] = keywordweight;
			keywordvectors.push(numeric.dot(numeric.dot(vector, rkapproxuk), numeric.inv(rkapproxsk)));
			vector[i] = 0;
		}
	};

	/*
		Queries using keywords
		Params:
			querywords: Array of keywords
			numtoreturn: Specifies how many to return
		Returns sorted array of [docID, distance] of length numtoreturn
	 */
	var query = function (querywords, numtoreturn) {
		var ovector = getQueryVector(querywords);
		var tvector = numeric.dot(numeric.dot(ovector, rkapproxuk), numeric.inv(rkapproxsk));
		var dists = [];
		for (var i = 0; i < docvectors.length; i++) {
			dists.push([i, cosim(tvector, docvectors[i])]);
		}
		var sorted = getClosestDocs(dists, numtoreturn);
		var docs = [];
		for (var j = 0; j < sorted.length; j++) {
			docs.push([docDict[sorted[j][0]], sorted[j][1]]);
		}
		return docs;
	};

	var getQueryVector = function (querywords) {
		var newVector = [];
		for (var k = 0; k < keywords.length; k++) {
			newVector.push(0);
		}
		for (var j = 0; j < querywords.length; j++) {
			newVector[binaryIndexOf(querywords[j])] = keywordweight;
		}
		return newVector;
	};

	var cosim = function (v1, v2) {
		return numeric.dot(v1, v2)/(mag(v1)*mag(v2));
	};

	var mag = function (v) {
		var out = 0;
		for (var i = 0; i < v.length; i++) {
			out = out + Math.pow(v[i], 2);
		}
		return Math.pow(out, 1/2);
	};

	var getClosestDocs = function (dists, numtoreturn) {
		dists.sort(function (a, b) {
			if (a[1] == b[1]) {
				return 0;
			}
			else {
				return (a[1] > b[1]) ? -1 : 1;
			}
		});
		return dists.slice(0, numtoreturn);
	};

	// Add a new document to content matrix
	var addDocument = function (id, docwords, weights) {
		for (var i = 0; i < docwords.length; i++) {
			if (keywords.indexOf(docwords[i]) == -1) {
				addKeyword(docwords[i]);
				keywordfreqs.push(weights[i]);
			}
		}
		sort();
		var newDoc = [];
		for (var k = 0; k < keywords.length; k++) {
			newDoc.push(0);
		}
		for (var j = 0; j < docwords.length; j++) {
			var bindex = binaryIndexOf(docwords[j]);
			newDoc[bindex] = weights[j];
			keywordfreqs[bindex] += weights[j];
		}
		contentmatrix.push(newDoc);
		docDict[contentmatrix.length - 1] = id;
	};

	var addKeyword = function (word) {
		keywords.push(word);
		for (var i = 0; i < contentmatrix.length; i++) {
			contentmatrix[i].push(0);
		}
	};

	var binaryIndexOf = function (searchElement) {
		'use strict';

		var minIndex = 0;
		var maxIndex = keywords.length - 1;
		var currentIndex;
		var currentElement;

		while (minIndex <= maxIndex) {
			currentIndex = (minIndex + maxIndex) / 2 | 0;
			currentElement = keywords[currentIndex];

			if (currentElement < searchElement) {
				minIndex = currentIndex + 1;
			}
			else if (currentElement > searchElement) {
				maxIndex = currentIndex - 1;
			}
			else {
				return currentIndex;
			}
		}
		return -1;
	};

	var sort = function (left, right) {
		left = typeof left !== 'undefined' ? left : 0;
		right = typeof right !== 'undefined' ? right : keywords.length - 1;
		var index;
		if (keywords.length > 1) {
			index = partition(left, right);
			if (left < index - 1) {
				sort(left, index - 1);
			}
			if (index < right) {
				sort(index, right);
			}
		}
	};

	var partition = function (left, right) {
		var pivot = keywords[Math.floor((right + left) / 2)],
			i = left,
			j = right;

		while (i <= j) {
			while (keywords[i] < pivot) {
				i++;
			}
			while (keywords[j] > pivot) {
				j--;
			}
			if (i <= j) {
				keywordSwap(i, j);
				rowSwap(i, j);
				i++;
				j--;
			}
		}
		return i;
	};

	var keywordSwap = function (k1, k2) {
		var temp = keywords[k1];
		keywords[k1] = keywords[k2];
		keywords[k2] = temp;

		// Simultaneously sort keywordfreqs
		var temp2 = keywordfreqs[k1];
		keywordfreqs[k1] = keywordfreqs[k2];
		keywordfreqs[k2] = temp2;
	};

	var rowSwap = function (r1, r2) {
		for (var i = 0; i < contentmatrix.length; i++) {
			var temp = contentmatrix[i][r1];
			contentmatrix[i][r1] = contentmatrix[i][r2];
			contentmatrix[i][r2] = temp;
		}
	};

	// Save/load
	var save = function () {
		return {
			"approxRank": approxRank,
			"keywords": keywords,
			"keywordvectors": keywordvectors,
			"keywordweight": keywordweight,
			"keywordfreqs": keywordfreqs,
			"keywordtopfreq": keywordtopfreq,
			"keywordtopfreqnum": keywordtopfreqnum,
			"areKeywordVectorsUpdated": areKeywordVectorsUpdated,
			"contentmatrix": contentmatrix,
			"rkapproxuk": rkapproxuk,
			"rkapproxsk": rkapproxsk,
			"docvectors": docvectors,
			"docDict": docDict
		};
	};

	var load = function (savestate) {
		approxRank = savestate["approxRank"];
		keywords = savestate["keywords"];
		keywordvectors = savestate["keywordvectors"];
		keywordweight = savestate["keywordweight"];
		keywordfreqs = savestate["keywordfreqs"];
		keywordtopfreq = savestate["keywordtopfreq"];
		keywordtopfreqnum = savestate["keywordtopfreqnum"];
		areKeywordVectorsUpdated = savestate["areKeywordVectorsUpdated"];
		contentmatrix = savestate["contentmatrix"];
		rkapproxuk = savestate["rkapproxuk"];
		rkapproxsk = savestate["rkapproxsk"];
		docvectors = savestate["docvectors"];
		docDict = savestate["docDict"];
	};

	// Constructor
	var indexer = function () {
		keywords = [];
		contentmatrix = [];
		keywordfreqs = [];
		docDict = {};
		approxRank = 2; // Defaults to 2
		keywordweight = 50; // Defaults to 50
		keywordtopfreqnum = 10; // Defaults to 10
	};

	// Alter Settings
	var changeApproxRank = function (rank) {
		approxRank = rank;
		lsi();
	};

	var changeKeywordweight = function (weight) {
		keywordweight = weight;
		areKeywordVectorsUpdated = false;
	};

	var changeKeywordtopfreqnum = function (num) {
		keywordtopfreqnum = num;
	};

	// Debugging
	var printKeywords = function () {
		console.log(keywords.toString());
	};

	var printContentmatrix = function () {
		console.log(contentmatrix);
	};

	var printDocVectors = function () {
		console.log(docvectors);
	};

	// Prototype
	indexer.prototype = {
		constructor: indexer,
		add: addDocument,
		lsi: lsi,
		query: query,
		folderize: folderize,
		save: save,
		load: load,
		changeApproxRank: changeApproxRank,
		changeKeywordweight: changeKeywordweight,
		changeKeywordtopfreqnum: changeKeywordtopfreqnum,
		printKeywords: printKeywords,
		printContentmatrix: printContentmatrix,
		printDocVectors: printDocVectors
	};

	return indexer;
})();