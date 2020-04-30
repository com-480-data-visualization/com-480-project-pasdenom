$(document).ready(function() {
  var sideslider = $('[data-toggle=collapse-side]');
  var sel = sideslider.attr('data-target');
  var sel2 = sideslider.attr('data-target-2');

  $(".viz").hide();
  $(".viz").first().show();

  sideslider.click(function(event){
      $(sel).toggleClass('in');
      $(sel2).toggleClass('out');
  });

  $(".btn_left_pane").click(function(event){
    $(".viz").hide();

    var id = $(this).attr("id")

    $("#" + id + "_viz").show();
  });
});
