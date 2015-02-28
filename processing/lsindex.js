/**
 * Created by Lucas on 2/28/15.
 */

var indexer = (function () {

	// Private variables and functions
	var approxRank;
	var keywords;
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

	// Query with keywords
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
			newVector[binaryIndexOf(querywords[j])] = 1;
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
			}
		}
		sort();
		var newDoc = [];
		for (var k = 0; k < keywords.length; k++) {
			newDoc.push(0);
		}
		for (var j = 0; j < docwords.length; j++) {
			newDoc[binaryIndexOf(docwords[j])] = weights[j];
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
	};

	var rowSwap = function (r1, r2) {
		for (var i = 0; i < contentmatrix.length; i++) {
			var temp = contentmatrix[i][r1];
			contentmatrix[i][r1] = contentmatrix[i][r2];
			contentmatrix[i][r2] = temp;
		}
	};

	// Constructor
	var indexer = function () {
		keywords = [];
		contentmatrix = [];
		docDict = {};
		approxRank = 2; // Defaults to 2;
	};

	// Alter Settings
	var changeApproxRank = function (rank) {
		approxRank = rank;
		lsi();
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
		changeApproxRank: changeApproxRank,
		printKeywords: printKeywords,
		printContentmatrix: printContentmatrix,
		printDocVectors: printDocVectors
	};

	return indexer;
})();