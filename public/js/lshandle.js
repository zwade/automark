
$(window).load(function() {
	i = new indexer();
	cards = {};
	dateStored = []
	chrome.storage.sync.get(function(p) {
		chrome.storage.local.get(function(urls) {
			for (var k in p.pages) {
				var terms = [];
				var weights = [];
				var page = p[p.pages[k]];
				for (var t in page[0]) {
					var term = page[0][t].split(":");
					terms.push(term[0])
					weights.push(parseFloat(term[1]))
				}
				i.add(page[1],terms,weights)
				addCard(page[1],urls[p.pages[k]],"http://"+p.pages[k])
				var d = new Date(page[3])
				cards[page[1]] = [urls[p.pages[k]],"http://"+p.pages[k],d.getTime(),page[3]]
				
			}
			i.changeApproxRank(Math.floor(p.pages.length*.8))
			i.lsi();

			cats = i.folderize(5);
			for (var n in cats) {
				addCategory(n,"categories");
			}
			$(".categories").click(function() {
				//$(".category").css("background-color","#fff");
				//$(this).css("background-color","#ddd");
				removeCards();
				var tab = $(this).attr("type");
				for (var name in cats[tab]) {
					var title = cats[tab][name]
					addCard(title,cards[title][0],cards[title][1]) 
				}
			})
			var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
			for (var name in cards) {
				var tmp = cards[name]
				tmp.push(name);
				dateStored.push(tmp);
			}
			dateStored.sort(function(a,b) {
				return b[2] - a[2];
			})
			dates = {}
			for (var c in dateStored) {
				var month = monthNames[parseInt(dateStored[c][3].split("/")[0])-1]
				var year = 2000+parseInt(dateStored[c][3].split("/")[2])
				var str = month + " - "+year
				if (!dates[str]) {
					dates[str] = []
					addCategory(str, "dates");
				}
				dates[str].push(dateStored[c][4])
			}

			$(".dates").click(function() {
				removeCards();
				var tab = $(this).attr("type");
				for (var name in dates[tab]) {
					var title = dates[tab][name]
					addCard(title,cards[title][0],cards[title][1])
				}
			})


			


			$(".sort").click(function() {
				var type = $(this).attr("type");
				$(".list-acc").hide()
				$("#"+type+"-list").show()
				if (type == "categories") {
					removeCards();
					for (var t in cards) {
						addCard(t,cards[t][0],cards[t][1]);
					}
				}
				if (type == "name") {
					removeCards()
					var w = Object.keys(cards).sort()
					for (var c in w) {
						addCard(w[c],cards[w[c]][0],cards[w[c]][1])
					}
				}
				if (type == "date") {
					removeCards()
					for (var c in dateStored) {
						addCard(dateStored[c][4],cards[dateStored[c][4]][0],cards[dateStored[c][4]][1])
					}
				}
			})
			
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
