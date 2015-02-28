/**
 * Created by Lucas on 2/28/15.
 */

var indexer = (function () {

	// Private variables and functions
	var keywords;
	var contentmatrix; //Stores by column
	var docDict;

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
		for (var i = 0; i < indexer.length; i++) {
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
	};

	// Debugging
	var printKeywords = function () {
		console.log(keywords.toString());
	};

	var printContentmatrix = function () {
		for (var i = 0; i < contentmatrix.length; i++) {
			console.log(contentmatrix[i].toString());
		}
	};

	// Prototype
	indexer.prototype = {
		constructor: indexer,
		add: addDocument,
		printKeywords: printKeywords,
		printContentmatrix: printContentmatrix
	};

	return indexer;
})();