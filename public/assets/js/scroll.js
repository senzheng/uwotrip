/**
 * Listen to scroll to change header opacity class
 */
function checkScroll() {
  var startY = $('.navbar').height() * 4; //The point where the navbar changes in px

  if ($(window).scrollTop() > startY) {
    $('.navbar').removeClass("navbar-inverse");
    $('.navbar').addClass("navbar-default");
  } else {
    $('.navbar').addClass("navbar-inverse");
    $('.navbar').removeClass("navbar-default");
  }
}

if ($('.navbar').length > 0) {
  $(window).on("scroll load resize", function () {
    checkScroll();
  });
}
