/*
	** Auto Cookie v.1.0403
	** Maker: Rini (rinirihiriro@gmail.com)
*/

if (typeof auto_cookie_version != "undefined")
	throw 'Already loaded.';

// Variables
var auto_cookie_version = "v.1.0413";
var rec_id = 0;
var all_price = 0;

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

// Expand Store Title
document.getElementById("storeTitle").style.height = "3.0em";
var store_element = document.getElementById("store");

// Recommended Product Button 
var rec_btn = document.createElement("a");
store_element.appendChild(rec_btn);
rec_btn.className = "option";
rec_btn.style.cssText = "position:absolute;right:5px;top:40px;";
rec_btn.onclick = function(){
	Game.ObjectsById[rec_id].buy();
};

// Buy All Product Button
var buyall_btn=document.createElement("a");
store_element.appendChild(buyall_btn);
buyall_btn.style.cssText = "position:absolute;right:5px;top:70px;";
buyall_btn.className = "option";
buyall_btn.onclick = function(){
	if(Game.cookies >= all_price){
		for(var i in Game.ObjectsById){
			Game.ObjectsById[i].buy();
		}
	}
};

// Button update
setInterval(function(){
	var most_eff = 0, o;
	rec_id = 0;
	all_price = 0;
	for(var i in Game.ObjectsById){
		o = Game.ObjectsById[i];
		var eff = o.storedCps / o.getPrice();
		if(eff > most_eff){
			most_eff = eff;
			rec_id = i;
		}
		all_price += o.getPrice();
	}
	o = Game.ObjectsById[rec_id];
	rec_btn.innerText = "Buy "+o.name+" ("+Beautify(o.getPrice())+")";
	buyall_btn.innerText = "Buy All ("+Beautify(all_price)+")";
}, 100);

// Beautify number
var T = ["","M","B","Tr","Qa","Qi","Sx","Sp","Oc","No","Dc"];
function Beautify(what, floats){
	if(!isFinite(what)) return "Infinity";
	var lv = 0;
	var n = what;
	if(n >= 1000000){
		lv += 1;
		n = Math.round(n/1000)/1000;
		while(n >= 1000){
			lv += 1;
			n = Math.round(n)/1000;
		}
	}else if(n >= 1000){
		var d = Math.round(n%1000).toString();
		while (d.length < 3) d = '0'+d;
		return Math.floor(n/1000)+","+d;
	}else{
		floats = floats || 0;
		var _10 = Math.pow(10, floats);
		return Math.round(n*_10)/_10;
	}
	return n+T[lv];
}

// Reset
Game.RebuildStore();
Game.RebuildUpgrades();

// All Over
Game.Popup("Auto Cookie "+auto_cookie_version+" Start!");