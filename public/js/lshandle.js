
$(window).load(function() {
	i = new indexer();
	chrome.storage.sync.get(function(p) {
		console.log(p.pages);
		for (var k in p.pages) {
			console.log(k)
			var terms = [];
			var weights = [];
			var page = p[p.pages[k]];
			for (var t in page[0]) {
				var term = page[0][t].split(":");
				terms.push(term[0])
				weights.push(parseFloat(term[1]))
			}
			console.log(terms)
			console.log(weights)
			i.add(page[1],terms,weights)
		}
		i.lsi();
	})
})
