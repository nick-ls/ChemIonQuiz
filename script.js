var ions = {};
var questionSet = {};
var mappings = {
	"1": "₁",
	"2": "₂",
	"3": "₃",
	"4": "₄",
	"5": "₅",
	"6": "₆",
	"7": "₇",
	"8": "₈",
	"9": "₉",
	"0": "₀",
	"!": "¹",
	"@": "²",
	"#": "³",
	"$": "⁴",
	"%": "⁵",
	"^": "⁶",
	"&": "⁷",
	"*": "⁸",
	"(": "⁹",
	")": "⁰",
	"+": "⁺",
	"-": "⁻"
}
var currentAnswer;
var currentQuestion;
var currentAlt;
var right = 0;
var wrong = 0;
var questions = 0;
var endgame = false;

String.prototype.cap = function() {
	let first = this.slice(0, 1).toUpperCase();
	let rest = this.slice(1);
	return first + rest;
};

document.addEventListener("click", e => {
	if (e.target.id === "ok") {
		let options = document.getElementsByName('mode');
		for (var i = 0; i < options.length; i++) {
			if (options[i].checked) {
				start(options[i].value);
				return;
			} else if (i === options.length - 1) {
				console.log(options[i])
				alert("Please choose an option");
			}
		}
	}
});
document.addEventListener("keyup", e => {
	let elem = document.activeElement;
	if (elem.type === "text" && elem.id === "answer" && !document.getElementById("ionname").innerHTML.includes("Name")) {
		if (elem.value.replace(/[1234567890!@#$%^&*\(\)\-\+]/g,"Ǝ").includes("Ǝ")) {
			let newstr = "";
			for (var i = 0; i < elem.value.length; i++) {
				if (mappings[elem.value[i]]) {
					newstr += mappings[elem.value[i]];
				} else {
					newstr += elem.value[i];
				}
			}
			elem.value = newstr;
		}
	}
});
document.addEventListener("click", e => {
	if (e.target.id === "restart") {
		window.location.reload();
	}
});
document.addEventListener("keydown", e => {
	if (e.key.toLowerCase() === "enter") {
		document.getElementById("submit").click();
	}
});
document.addEventListener("click", e => {
	if (e.target.id === "submit") {
		let ans = document.getElementById("answer");
		let alt = document.getElementById("altans");
		if (document.getElementById("altname").style.display==="none") {
			if (ans.value.toLowerCase().replace(" ", "") === currentAnswer.toLowerCase().replace(" ", "")) {
				right++;
				writeInfocard(true);
			} else {
				wrong++;
				writeInfocard(false);
			}
		} else {
			if (ans.value.toLowerCase().replace(" ", "") === currentAnswer.toLowerCase().replace(" ","") && alt.value.toLowerCase().replace(" ","") === currentAlt.toLowerCase().replace(" ", "")) {
				right++;
				writeInfocard(true);
			} else {
				wrong++;
				writeInfocard(false);
			}
		}
		ans.value = "";
		alt.value = "";
		updateScoreboard();
		makeQuestion();
	}
});
function init() {
	fetch(window.location.href + "ions.json").then(async res => {
		ions = await res.json();
	});
}
function start(mode) {
	document.getElementById("settings").style.display = "none";
	document.getElementById("creator").remove();
	document.getElementById("q").style.display = "flex";
	document.getElementById("a").style.display = "flex";
	while (infocard.firstChild) {
		infocard.removeChild(infocard.firstChild);
	}
	switch(mode) {
		case "anions":
			questionSet = JSON.parse(JSON.stringify(ions.anions));
			questions = Object.keys(ions.anions).length;
		break;
		case "cations":
			questionSet = JSON.parse(JSON.stringify(ions.cations));
			questions = Object.keys(ions.cations).length;
		break;
		case "both":
			questionSet = JSON.parse(JSON.stringify(ions));
			questions = Object.keys(ions.cations).length + Object.keys(ions.anions).length;
		break;
	}
	if (!document.getElementById("useAlt").checked) {
		if (questionSet.anions) {
			Object.keys(questionSet.cations).forEach(ion => {
				if (typeof questionSet.cations[ion] !== "string") {
					questionSet.cations[ion] = questionSet.cations[ion].formula;
				}
			});
			Object.keys(questionSet.anions).forEach(ion => {
				if (typeof questionSet.anions[ion] !== "string") {
					questionSet.anions[ion] = questionSet.anions[ion].formula;
				}
			});
		} else {
			Object.keys(questionSet).forEach(ion => {
				if (typeof questionSet[ion] !== "string") {
					questionSet[ion] = questionSet[ion].formula;
				}
			});
		}
	}
	makeQuestion();
	updateScoreboard();
}
function makeQuestion() {
	let subset;
	let subname;
	if (questionSet.cations ? Object.keys(questionSet.cations).length === 0 : false) {
		delete questionSet.cations;
	}
	if (questionSet.anions ? Object.keys(questionSet.anions).length === 0 : false) {
		delete questionSet.anions;
	}
	if (questionSet.cations || questionSet.anions) {
		// wow this is a mess of a ternary operator
		subname = questionSet.cations ? 
					questionSet.anions ? 
						Math.floor(Math.random()*2) === 1 ?
							"cations" :
						"anions" :
					"cations" :
				"anions";
		subset = questionSet[subname];
	} else {
		if (Object.keys(questionSet).length === 0) {
			console.log(questionSet);
			endgame = true;
			displayEndgame();
			return;
		}
		subset = questionSet;
	}
	let keys = Object.keys(subset);
	let key = keys[Math.floor(Math.random() * keys.length)];
	let altname = document.getElementById("altname");
	currentAlt = "";
	if (typeof subset[key] === "string") {
		altname.style.display = "none";
		let q = Math.floor(Math.random() * 2) === 1 ? subset[key] : key;
		let a = q === subset[key] ? key : subset[key];
		currentAnswer = a;
		currentQuestion = q;
		if (q === subset[key]) {
			document.getElementById("ionname").innerHTML = "Ion Name:";
		} else {
			document.getElementById("ionname").innerHTML = "Ion Formula:";
		}
		let qcard = document.getElementById("qcard");
		while (qcard.firstChild) {
			qcard.removeChild(qcard.firstChild);
		}
		qcard.appendChild(document.createTextNode(q.cap()));
		if (subname) {
			delete questionSet[subname][key];
		} else {
			delete questionSet[key];
		}
	} else {
		altname.style.display = "flex";
		let q = Math.floor(Math.random() * 2) === 1 ? subset[key].formula : key;
		let a = q === subset[key].formula ? key : subset[key].formula;
		currentAlt = subset[key].alt;
		currentAnswer = a;
		currentQuestion = q;
		if (q === subset[key].formula) {
			document.getElementById("ionname").innerHTML = "Ion Name:";
		} else {
			document.getElementById("ionname").innerHTML = "Ion Formula:";
		}
		let qcard = document.getElementById("qcard");
		while (qcard.firstChild) {
			qcard.removeChild(qcard.firstChild);
		}
		qcard.appendChild(document.createTextNode(q.cap()));
		if (subname) {
			delete questionSet[subname][key];
		} else {
			delete questionSet[key];
		}
	}
	document.querySelector("#acard>input").focus();
}
function writeInfocard(isright) {
	let infocard = document.getElementById("infocard");
	while (infocard.firstChild) {
		infocard.removeChild(infocard.firstChild);
	}
	let correct = document.createElement("div");
	let explain = document.createElement("div");
	let spantitle1 = document.createElement("span");
	let spantitle2 = document.createElement("span");
	let spanswer1 = document.createElement("span");
	let spanswer2 = document.createElement("span");
	let holder1 = document.createElement("div");
	let holder2 = document.createElement("div");
	let spantitle3;
	let spanswer3;
	let holder3;
	explain.setAttribute("class","explain");
	spantitle1.setAttribute("class", "acenter");
	spantitle2.setAttribute("class", "acenter");
	spanswer1.setAttribute("class", "anscenter");
	spanswer2.setAttribute("class", "anscenter");
	spantitle1.appendChild(document.createTextNode("Formula"));
	spanswer1.appendChild(document.createTextNode(currentAnswer.replace(/[₁₂₃₄₅₆₇₈₉₀¹²³⁴⁵⁶⁷⁸⁹⁰⁺⁻]/g,"Ǝ").includes("Ǝ") ? currentAnswer.cap() : currentQuestion.cap()));
	holder1.appendChild(spantitle1);
	holder1.appendChild(spanswer1);
	spantitle2.appendChild(document.createTextNode("Name"));
	spanswer2.appendChild(document.createTextNode(currentAnswer.replace(/[₁₂₃₄₅₆₇₈₉₀¹²³⁴⁵⁶⁷⁸⁹⁰⁺⁻]/g,"Ǝ").includes("Ǝ") ? currentQuestion.cap() : currentAnswer.cap()));
	holder2.appendChild(spantitle2);
	holder2.appendChild(spanswer2);

	correct.setAttribute("class", isright ? "correct" : "incorrect");
	correct.appendChild(document.createTextNode(isright ? "Correct" : "Incorrect"));
	explain.appendChild(correct);
	explain.appendChild(holder1);
	explain.appendChild(holder2);
	if (currentAlt) {
		spantitle3 = document.createElement("span");
		spanswer3 = document.createElement("span");
		holder3 = document.createElement("div");
		spantitle3.setAttribute("class", "acenter");
		spanswer3.setAttribute("class", "anscenter");
		spantitle3.appendChild(document.createTextNode("Alternate Name"));
		spanswer3.appendChild(document.createTextNode(currentAlt.cap()));
		holder3.appendChild(spantitle3);
		holder3.appendChild(spanswer3);
		explain.appendChild(holder3);
	}
	infocard.appendChild(explain);
}
function updateScoreboard() {
	if (right + wrong + 1 > questions) {
		return;
	}
	let scoreboard = document.getElementById("scoreboard");
	scoreboard.style = "";
	while (scoreboard.firstChild) {
    	scoreboard.removeChild(scoreboard.firstChild);
	}
	let tn1 = document.createTextNode(`Question ${right + wrong + 1}/${questions}`);
	let tn2 = document.createTextNode(`Correct: ${right}`);
	let tn3 = document.createTextNode(`Incorrect: ${wrong}`);
	scoreboard.appendChild(tn1);
	scoreboard.appendChild(document.createElement("br"));
	scoreboard.appendChild(tn2);
	scoreboard.appendChild(document.createElement("br"));
	scoreboard.appendChild(tn3);
}
function displayEndgame() {
	document.getElementById("q").style.display = "none";
	document.getElementById("a").style.display = "none";
	document.getElementById("scoreboard").style.display = "none";
	let explain = document.createElement("div");
	explain.setAttribute("class", "explain");
	let acenter = document.createElement("span");
	acenter.setAttribute("class", "acenter");
	acenter.appendChild(document.createTextNode("Final Score"));
	let percent = document.createElement("span");
	percent.style.color = right / questions >= 0.8 ? "#74E274" : "#FF5F5F";
	percent.style.fontSize = "3em";
	percent.setAttribute("class", "anscenter");
	percent.appendChild(document.createTextNode((Math.floor((right / questions) * 1000) / 10) + "%"));
	let correctnum = document.createElement("span");
	correctnum.setAttribute("class", "anscenter");
	correctnum.appendChild(document.createTextNode(right + " Correct"));
	let incorrectnum = document.createElement("span");
	incorrectnum.setAttribute("class", "anscenter");
	incorrectnum.appendChild(document.createTextNode(wrong + " Incorrect"));
	let restart = document.createElement("div");
	restart.id = "restart";
	restart.appendChild(document.createTextNode("Restart"));
	explain.appendChild(acenter);
	explain.appendChild(percent)
	explain.appendChild(correctnum);
	explain.appendChild(incorrectnum);
	explain.appendChild(restart);
	document.getElementsByClassName("card")[0].appendChild(explain);
}
init();
