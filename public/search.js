'use strict';
(function() {

  window.addEventListener('load', init);

  /**
   * setup the sign-in button on initial page load
   */
  var students = [];
  var studentLinkMap = new Map();
  function init() {
    getStudents();
    autocomplete(document.getElementById("myInput"), students);
    qs("form").addEventListener('submit', ev => {
      ev.preventDefault();
      getStudentData();
    });
  }

  function getStudentData() {
    console.log(studentLinkMap.get(id("myInput").value));
    fetch(studentLinkMap.get(id("myInput").value))
    .then(statusCheck)
    .then(res => res.json())
    .then(updateTable)
    .catch(console.error);
  }

  function updateTable(res) {
    let entries = res.feed.entry;
    let studentData = [];
    for (let i = 0; i < entries.length; i++) {
      let parsed = parseStudentData(entries[i].content["$t"]);
      let data = {Date: entries[i].title["$t"], Subject: parsed[1], Teacher: parsed[2], LVL: parsed[3], Page: parsed[4], "Num Pages": parsed[5], Time: parsed[6], Score: parsed[7], Comments: parsed[8]};
      // console.log(data);
      studentData.push(data);
    }
    let table = document.querySelector("table");
    table.innerHTML = "";
    let data = Object.keys(studentData[0]);
    generateTableHead(table, data);
    generateTable(table, studentData);
  }

  function parseStudentData(text) {
    //this is really gross, ugly for quickness hope to fix later.
    let res = [];
    let i = 0;
    console.log(text);
    res[i++] = text.substring(text.search(/ /g), text.search(/, subject:/g));
    text = text.substring(text.search(/subject:/g));
    res[i++] = text.substring(text.search(/ /g), text.search(/, teacher:/g));
    text = text.substring(text.search(/teacher:/g));
    res[i++] = text.substring(text.search(/ /g), text.search(/, lvl:/g));
    text = text.substring(text.search(/lvl:/g));
    res[i++] = text.substring(text.search(/ /g), text.search(/, pckt:/g));
    text = text.substring(text.search(/pckt:/g));
    res[i++] = text.substring(text.search(/ /g), text.search(/, pgscmpltd:/g));
    text = text.substring(text.search(/pgscmpltd:/g));
    res[i++] = text.substring(text.search(/ /g), text.search(/, time:/g));
    text = text.substring(text.search(/time:/g));
    res[i++] = text.substring(text.search(/ /g), text.search(/, score:/g));
    text = text.substring(text.search(/score:/g));
    res[i++] = text.substring(text.search(/ /g), text.search(/, comments:/g));
    text = text.substring(text.search(/comments:/g));
    res[i++] = text.substring(text.search(/ /g));
    console.log(res);
    return res;


  }

  function generateTableHead(table, data) {
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let key of data) {
      let th = document.createElement("th");
      let text = document.createTextNode(key);
      th.appendChild(text);
      row.appendChild(th);
    }
  }

  function generateTable(table, data) {
    for (let element of data) {
      let row = table.insertRow();
      for (let key in element) {
        let cell = row.insertCell();
        let text = document.createTextNode(element[key]);
        cell.appendChild(text);
      }
    }
  }

  function getStudents() {
    fetch("https://spreadsheets.google.com/feeds/worksheets/1aUOMO8yrIkk3yVvKCxcKDOkEbo7czzuGauZYnRxWRoc/public/basic?alt=json")
    .then(statusCheck)
    .then(res => res.json())
    .then(parseStudents)
    .catch(console.error);
  }

  function parseStudents(res) {
    for (let i = 2; i < res.feed.entry.length; i++) {
      let name = res.feed.entry[i].content["$t"]
      students.push(name);
      studentLinkMap.set(name, (res.feed.entry[i].link[0].href) + "?alt=json");
    }
  }

  function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
  }
  /* ------------------------------ Helper Functions  ------------------------------ */

  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {object} res - response to check for success/error
   * @return {object} - valid response if response was successful, otherwise rejected
   *                    Promise result
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} id - element ID
   * @return {object} DOM object associated with id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Returns the element that has the matches the selector passed.
   * @param {string} selector - selector for element
   * @return {object} DOM object associated with selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }
})();