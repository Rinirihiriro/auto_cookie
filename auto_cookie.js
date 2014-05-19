/*
	** auto_cookie
	** Maker: Rini (rinirihiriro@gmail.com)
*/

if (typeof auto_cookie_version != "undefined") {
	Game.Notify("auto_cookie was already loaded.", "", "", 2);
	throw "auto_cookie was already loaded.";
}
	
function cl(tag, className) { var e = document.createElement(tag); e.className = className; return e; };	

// Variables
var auto_cookie_version = "v.1.0464b";
var product_recommend = [], upgrade_recommend = [];
var upgrade_zero_eff_num = 0;
var best_id = 0;
var all_price = 0;

var sheet = document.styleSheets[0];

// Insert Style

function addStyle(selector, rules, index) {
	if(sheet.insertRule) {
		sheet.insertRule(selector + "{" + rules + "}", index);
	}
	else {
		sheet.addRule(selector, rules, index);
	}
}

addStyle(".best .price", "color:#f6f;");
addStyle(".recommend .price", "color:#6ff;");
addStyle(".disapproval .price", "color:#d33;");

addStyle("#timers>div#timer-gold", "background-position:0px -8px;");

addStyle(".upgrade.best", "box-shadow:0 0 20px 5px #f6f inset;");
addStyle(".upgrade.recommend", "box-shadow:0 0 20px 5px #6ff inset;");
addStyle(".upgrade.disapproval", "box-shadow:0 0 20px 5px #d33 inset;");

// var parser = new DOMParser();
// document.body.appendChild(parser.parseFromString("<style>@import url('http://rini.ssut.me/auto_cookie.css')</style>", "text/xml").firstChild);
// document.head.appendChild(parser.parseFromString("<link rel='stylesheet' type='text/css' href='http://rini.ssut.me/auto_cookie.css'/>", "text/xml").firstChild);


// Auto Cookie Click
setInterval(Game.ClickCookie, 16);

// Auto Gold Cookie & Wrinkler Popping & Reindeer
setInterval(function(){
	// Gold cookie. Not wrath cookie.
	if(Game.goldenCookie.life > 100 && Game.goldenCookie.wrath != 1){
		Game.goldenCookie.click();
	}
	// Wrinkler POP
	for(var i in Game.wrinklers){
		var w = Game.wrinklers[i];
		if(w.hp>0&&w.phase>0&&w.sucked>0.5)
			w.hp = 0;
	}
	// Reindeer hunting
	if(Game.seasonPopup.toDie == 0 && Game.seasonPopup.life > 0)
		Game.seasonPopup.click();
}, 500);


// Beautify shortnumber change
function Beautify(value)
{
	var negative = (value < 0);
	value = Math.abs(value);
	var formatter = numberFormatters[Game.prefs.format?0:2];
	var output = formatter(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return negative ? '-' + output : output;
}


// Expand Store Title
l("storeTitle").style.height = "3.0em";
var store_element = l("store");

// Recommended Product Button 
var rec_btn = cl("a", "option");
store_element.appendChild(rec_btn);
rec_btn.style.cssText = "position:absolute;right:5px;top:40px;";
rec_btn.onclick = function(){
	Game.ObjectsById[best_id].buy();
};

// Buy All Product Button
var buyall_btn = cl("a", "option");
store_element.appendChild(buyall_btn);
buyall_btn.style.cssText = "position:absolute;right:5px;top:70px;";
buyall_btn.onclick = function(){
	if(Game.cookies >= all_price){
		for(var i in Game.ObjectsById){
			Game.ObjectsById[i].buy();
		}
	}
};


// Update Efficiency
function UpdateProductEfficiency() {
	var o;
	var eff_arr = [], id_arr = [];
	all_price = 0;
	
	for(var i in Game.ObjectsById){
		o = Game.ObjectsById[i];
		
		var eff = o.efficiency();
		var insert = false;
		for (var j in eff_arr) {
			if (eff_arr[j] < eff) {
				insert = true;
				eff_arr.splice(j, 0, eff);
				id_arr.splice(j, 0, o.id);
				break;
			}
		}
		if (!insert) {
			eff_arr.push(eff);
			id_arr.push(o.id);
		}
		
		all_price += o.getPrice();
		product_recommend[i] = 0;
	}
	
	for (var i in id_arr) {
		product_recommend[id_arr[i]] = 1 + parseInt(i);
	}
	
	best_id = id_arr[0];
	
	o = Game.ObjectsById[best_id];
	rec_btn.innerText = "Buy "+o.name+" ("+Beautify(o.getPrice())+")";
	buyall_btn.innerText = "Buy All ("+Beautify(all_price)+")";	
}

function UpdateUpgradeEfficiency() {
	var eff_arr = [], id_arr = [], id = 0;
	upgrade_zero_eff_num = 0;
	for (var i in Game.UpgradesInStore) {
		var item = Game.UpgradesInStore[i];
		var old_cps, new_cps, eff;
		
		Game.CalculateGains();
		old_cps = Game.cookiesPs + Game.computedMouseCps * 60;
		
		item.bought = 1;
		Game.CalculateGains();
		new_cps = Game.cookiesPs + Game.computedMouseCps * 60;
		
		item.bought = 0;
		Game.CalculateGains();
		
		eff = (new_cps - old_cps) / item.getPrice();
		if (eff == 0) upgrade_zero_eff_num += 1;
		
		if (eff > 0) {
			item.desc = BeautifyInText(item.baseDesc);
			item.desc += '</div><div class="data">';
			if (eff < 1)
				item.desc += '&bull; You need <b>' + Beautify(1/eff) + '</b> ' + (Math.floor(1/eff)==1?'cookie':'cookies') + " to get 1 CpS (The smaller the better)";
			else
				item.desc += '&bull; You\'ll get <b>' + Beautify(eff) + '</b> CpS per cookie (The bigger the better)';
		}
		
		var insert = false;
		for (var j in eff_arr) {
			if (eff_arr[j] < eff) {
				insert = true;
				eff_arr.splice(j,0,eff);
				id_arr.splice(j,0,id);
				break;
			}
		}
		if (!insert) {
			eff_arr.push(eff);
			id_arr.push(id);
		}
		id += 1;
	}
	
	upgrade_recommend = [];
	for (var i in id_arr) {
		upgrade_recommend[id_arr[i]] = (eff_arr[i] != 0) ? 1 + parseInt(i) : 0;
	}
}


// Golden cookie timer
var timer_gold = cl("div", "");
timer_gold.id = "timer-gold";
timer_gold.style.textAlign = "center";
l('timers').appendChild(timer_gold);
Game.timersEl['gold'] = timer_gold;

var timer_gold_rate = cl("span", "");
timer_gold_rate.style.color = "#000";
timer_gold_rate.style.position = "relative";
timer_gold_rate.style.top = "-3px";
timer_gold_rate.style.fontSize = "8px";
timer_gold_rate.style.textShadow = "0px 0px 2px #000";
timer_gold.appendChild(timer_gold_rate);


// Menu Upgrade
var original_UpdateMenu = Game.UpdateMenu;
Game.UpdateMenu = function () {
	original_UpdateMenu();

	if (Game.onMenu == "stats")
	{
		var menu = l('menu');
		var subsections = menu.getElementsByClassName("subsection");
		for (var i = 0; i < subsections.length; i += 1) {
			var sub = subsections[i];
			var title = sub.getElementsByClassName("title")[0];
			
			if (title.innerText == "General") {
				var child = sub.lastChild;
				var luckymax = Game.cookiesPs*60*20;
				if (Game.frenzy>0) luckymax /= Game.frenzyPower;

				child = child.previousSibling;
				
				var el = cl("br", "");
				sub.insertBefore(el, child);

				el = cl("div", "listing");
				el.innerHTML = '<b>To get maximum Lucky :</b> <div class="price plain">'+Beautify(luckymax * 10)+'</div>';
				sub.insertBefore(el, child);

				el = cl("div", "listing");
				el.innerHTML = '<b>Maximum Lucky :</b> <div class="price plain">'+Beautify(luckymax + 13)+'</div>';
				sub.insertBefore(el, child);

				el = cl("div", "listing");
				el.innerHTML = '<b>To get maximum Lucky with Frenzy :</b> <div class="price plain">'+Beautify(luckymax * 10 * 7)+'</div>';
				sub.insertBefore(el, child);

				el = cl("div", "listing");
				el.innerHTML = '<b>Maximum Lucky with Frenzy :</b> <div class="price plain">'+Beautify(luckymax * 7 + 13)+'</div>';
				sub.insertBefore(el, child);

				el = cl("div", "listing");
				el.innerHTML = '<b>auto_cookie version :</b> '+auto_cookie_version;
				sub.appendChild(el);
			}

			if (title.innerText == "Prestige") {
				var el = cl("div", "listing");
				var tmp = Game.HowMuchPrestige(Game.cookiesEarned+Game.cookiesReset);
				el.innerHTML = '<b>When reset now :</b> '+Beautify(tmp)+' heavenly chip'+((tmp==1)?'':'s')+' (+'+tmp*2+'% CpS)';
				sub.appendChild(el);

				el = cl("div", "listing");
				el.innerHTML = '<b>To next :</b> <div class="price plain">'+Beautify(Game.HowManyCookiesReset(tmp+1) - (Game.cookiesEarned+Game.cookiesReset))+'</div>';
				sub.appendChild(el);
			}
			
		}
	}
}



// Object function redef
for (var i in Game.Objects) {
	var o = Game.Objects[i];
	
	o.original_rebuild = o.rebuild;
	o.rebuild = function() {
		this.original_rebuild();
		var me = this;
		
		if (product_recommend[me.id] == 1) {
			me.l.className += " best";
		} else if (product_recommend[me.id] <= 3) {
			me.l.className += " recommend";
		} else if (product_recommend[me.id] >= product_recommend.length - 2) {
			me.l.className += " disapproval";
		}
	};

	o.original_tooltip = o.tooltip;
	o.tooltip = function() {
		var me = this;
		var out = this.original_tooltip();

		var eff = me.efficiency();
		if (me.totalCookies > 0) {
			out = out.slice(0, -12) + "<br>";
		} else {
			out = out.slice(0, -6) + "<div class='data'>";
		}

		if (eff < 1)
			out += '&bull; You need <b>' + Beautify(1/eff) + '</b> ' + (Math.floor(1/eff)==1?'cookie':'cookies') + " to get 1 CpS (The smaller the better)";
		else
			out += '&bull; You\'ll get <b>' + Beautify(eff) + '</b> CpS per cookie (The bigger the better)';

		out += "</div></div>";
			

		if (product_recommend[me.id] == 1) {
			out = "<span class=best>" + out + "</span>";
		} else if (product_recommend[me.id] <= 3) {
			out = "<span class=recommend>" + out + "</span>";
		} else if (product_recommend[me.id] >= product_recommend.length - 2) {
			out = "<span class=disapproval>" + out + "</span>";
		}
		
		return out;
	};
	
	o.efficiency = function() { return this.storedCps / this.getPrice(); };
	
}


var original_RefreshStore = Game.RefreshStore;
Game.RefreshStore = function() {
	UpdateProductEfficiency();

	original_RefreshStore();
}


var original_RebuildUpgrades = Game.RebuildUpgrades;
Game.RebuildUpgrades = function() {
	original_RebuildUpgrades();

	UpdateUpgradeEfficiency();

	original_RebuildUpgrades();
}


var original_Draw = Game.Draw;
Game.Draw = function() {
	UpdateProductEfficiency();
	UpdateUpgradeEfficiency();
	
	original_Draw();
	
	var e = cl("div","");
	e.innerText = "auto click : " + Beautify(Game.computedMouseCps * 60);
	e.style.fontSize = "50%";
	l('cookies').appendChild(e);
	
	if (Game.drawT % 2 == 1)
	{
		for (var i in Game.Objects)
		{
			var me = Game.Objects[i];
			if (product_recommend[me.id] == 1) {
				me.l.className += " best";
			} else if (product_recommend[me.id] <= 3) {
				me.l.className += " recommend";
			} else if (product_recommend[me.id] >= product_recommend.length - 2) {
				me.l.className += " disapproval";
			}
		}

		var upgrades = l("upgrades").getElementsByClassName("upgrade");
		for (var i = 0; i < upgrades.length; i++) {
			var item = upgrades[i];
			item.onmouseover
			if (upgrade_recommend[i] == 1) {
				item.className += " best";
			} else if (upgrade_recommend[i] > 1 && upgrade_recommend[i] <= 3) {
				item.className += " recommend";
			} else if (upgrade_recommend[i] >= upgrade_recommend.length - upgrade_zero_eff_num - 2) {
				item.className += " disapproval";
			} 
		}
	}
	
	
}


var original_DrawBackground = Game.DrawBackground;
Game.DrawBackground = function() {
	original_DrawBackground();
	var gold = Game.goldenCookie;
	
	if (gold.life <= 0) {
		Game.timersEl['gold'].style.width = Math.min(gold.time/(0.25 * (gold.maxTime - gold.minTime) + gold.minTime), 1)*100+'%';
		var rate = Math.round(Math.pow(Math.max(0,(gold.time-gold.minTime)/(gold.maxTime-gold.minTime)),5) * 1000) / 10;
		if (rate > 0) {
			timer_gold_rate.innerText = rate + '%';
			timer_gold_rate.style.display = 'inline';
		} else {
			timer_gold_rate.style.display = 'none';
		}
	}
	else
		Game.timersEl['gold'].style.width=(1 - gold.life/Math.ceil(Game.fps*this.dur))*100+'%';
	Game.timersEl['gold'].style.display='block';
}


// All Over
Game.RefreshStore();
UpdateUpgradeEfficiency();
Game.RebuildUpgrades();

Game.Notify("auto_cookie "+auto_cookie_version+" Start!", "", "", 10);