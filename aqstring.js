let searchParams = new URLSearchParams(window.location.search);
// https://stackoverflow.com/a/35236900/14169175
// let searchParams = new URLSearchParams(window.location.href.split("?").pop());

var querystrings = {
    qContainers: document.querySelectorAll("[data-ajax-container]"),
    qInputs: document.querySelectorAll("[data-qstring]"),
    qButtons: document.querySelectorAll("[data-qbutton]"),

    // options 
    includeBuffer: false,
    bufferElement: $(".page-buffer-loading"),

    //if (includeBuffer) { bufferElement.classList.toggle("active"); }

    loadInput: function (input) {
        var qfield = input.dataset.qstring;

        // sets inputs value to correct value according to query string
        var qvalue = "";
        var qarray = [];
        if (searchParams.has(qfield)) {
            qvalue = searchParams.get(qfield);
            qarray = qvalue.split(",");
        }

        if (input.matches("select")) { input.value = qvalue; }

        if (input.matches("[type=checkbox]")) {
            if (input.matches("[data-qvalue]")) {
                input.checked = qarray.includes(input.dataset.qvalue);
            }
            else {
                input.checked = qvalue === 'true';
            }
        }

        if (input.matches("[type=text]")) { input.value = qvalue; }

        if (input.matches("[type=radio]")) { input.checked = input.value === qvalue; }
    },

    inputListener: function (input) {
        var autoUpdate = "false";

        if (input.matches("[data-qautoupdate]"))
            autoUpdate = "true";

        var qfield = input.dataset.qstring;

        // add event listeners to qstring inputs
        if (input.matches("select") || input.matches("[type=checkbox]")) {
              input.addEventListener("change", () => {
                  if (input.matches("select")) {
                      searchParams.set(qfield, input.value);
                  }

                  if (input.matches("[type=checkbox]")) {
                      if (input.matches("[data-qvalue]")) {
                          if (searchParams.has(qfield)) {
                              var qvalue = searchParams.get(qfield);
                              var qarray = qvalue.split(",");
                              var isChecked = input.checked;

                              if (isChecked) {
                                  if (!qarray.includes(input.dataset.qvalue)) { qarray.push(input.dataset.qvalue); }
                              } else {
                                  if (qarray.includes(input.dataset.qvalue)) {
                                      var index = qarray.indexOf(input.dataset.qvalue);
                                      qarray.splice(index, 1);
                                  }
                              }

                              qarray = qarray.filter(function (el) {
                                  return el != "";
                              });

                              searchParams.set(qfield, qarray.toString());
                          } else {
                              searchParams.set(qfield, input.dataset.qvalue);
                          }
                      }
                      else { searchParams.set(qfield, input.checked); }
                  }

                  querystrings.updateTrigger(autoUpdate);
              });
        }

        if (input.matches("[type=radio]")) {

            input.addEventListener("click", () => {
                if (searchParams.has(qfield)) {
                    if (searchParams.get(qfield) == input.value) {
                        searchParams.delete(qfield);

                        input.checked = false;
                    } else {
                        searchParams.set(qfield, input.value);
                    }
                } else {
                    searchParams.set(qfield, input.value);
                }

                querystrings.updateTrigger(autoUpdate);
            });
        }

        if (input.matches("[type=text]")) {
            input.addEventListener("input", () => {
                searchParams.set(qfield, input.value);

                querystrings.updateTrigger(autoUpdate);
            });

            input.addEventListener("keypress", (e) => {
                if (e.key === 'Enter')
                    querystrings.updateTrigger("true");
            });
        }
    },

    loadButton: function (button) {
        var qfield = button.dataset.qstring;
        var hasField = searchParams.has(qfield);

        if (button.dataset.qbutton == "radio") {
            var qvalue = button.dataset.qvalue;

            var str = hasField ? searchParams.get(qfield) : "";
            if (str === qvalue) { button.dataset.qstringActive = true; }
        }
    },

    buttonListener: function (button) {
        var qfield = button.dataset.qstring;

        button.addEventListener("click", () => {
            if (button.matches("[data-qoffset]")) {
                var mode = button.dataset.qoffset;

                var offset = 0;
                if (searchParams.has("offset")) { offset = parseInt(searchParams.get("offset")); }
                if (offset == null || Number.isNaN(offset)) { offset = 0; }

                if (mode == "next" || mode == undefined || mode == "") {
                    var max = button.dataset.qoffsetMax;

                    if (max !== 0) { if (!(offset + 1 >= max)) { offset += 1; } }
                    else { offset += 1; }
                }
                else if (mode == "prev") { if (!(offset <= 0)) { offset -= 1; } }
                else { offset = parseInt(mode); }

                searchParams.set("offset", offset);

                querystrings.updateTrigger("true");
            }

            if (button.dataset.qbutton == "radio") {
                $(`button[data-qstring="${qfield}"][data-qstring-active="true"]`).dataset.qstringActive = false;
                button.dataset.qstringActive = true;

                searchParams.set(qfield, qvalue);
                querystrings.updateTrigger("true");
            }

            if (button.dataset.qbutton == "clear") {
                searchParams.delete(qfield);

                qInputs.forEach(input => {
                    loadInput(input);
                });

                querystrings.updateTrigger("true");
            }

            if (button.dataset.qbutton == "submit") {
                querystrings.updateTrigger("true");
            }
        })
    },

    updateTrigger: function (auto) {
        if (querystrings.includeBuffer && auto === "true") { bufferElement.classList.toggle("active"); }

        let returnUrl = window.location.href.split('?')[0];

        let triggers = document.querySelectorAll(".qstring-trigger");
        triggers.forEach(trigger => {
            trigger.setAttribute("href", returnUrl + "?" + decodeURIComponent(searchParams.toString()));
        });

        if (auto === "true")
            triggers[0].click();
    }

};

querystrings.qContainers.forEach(container => {
    if (!$(`[data-ajax-bind="${container.dataset.ajaxContainer}"]`)) {
        var t = document.createElement("a");
        t.href = "#";
        t.classList.add("qstring-trigger");
        t.setAttribute("data-ajax-bind", container.dataset.ajaxContainer);
        t.setAttribute("aria-hidden", "true");
        t.setAttribute("style", "display: none");

        document.body.appendChild(t);
    }
});

querystrings.qInputs.forEach(input => {
    querystrings.loadInput(input);
    querystrings.inputListener(input);
});

querystrings.qButtons.forEach(button => {
    querystrings.loadButton(button);
    querystrings.buttonListener(button);
});
