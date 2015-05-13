$(document).ready(function() {

  $("#close-sota").click(function() {
    console.log("closed the sota updates box");
    if ($("#updates").hasClass("open")) {
      $("#updates").removeClass("open").addClass("hidden");
    }

  });

  $("#close-sota").click(function() {
    console.log("closed the sota confirmation box");
    if ($("#sota-complete").hasClass("open")) {
      $("#sota-complete").removeClass("open").addClass("hidden");
    }

  });

});
