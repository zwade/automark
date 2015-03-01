
$(window).load(function() {
	i = new indexer();
	cards = {};
	chrome.storage.sync.get(function(p) {
		chrome.storage.local.get(function(urls) {
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
				addCard(page[1],urls[p.pages[k]],"http://"+p.pages[k])
				cards[page[1]] = [urls[p.pages[k]],"http://"+p.pages[k]]
				
			}
			i.lsi();
			$("#search-term").keypress(function(e) {
				if (e.keyCode == 32 || e.keyCode == 13) {
					var c = i.query($("#search-term").val().split(" "));
					removeCards();
					for (var t in c) {
						var v = c[t];
						if (v[1] > 0.25) {
							addCard(v[0],cards[v[0]][0],cards[v[0]][1]);
						}
					}	
				}
			})
			$(".mdi-action-search").click(function(e) {
				removeCards();
				for (var t in cards) {
					addCard(t,cards[t][0],cards[t][1]);
				}
			})
		})
	})

})
