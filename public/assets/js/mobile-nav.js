function checkWidth(init){
  var nav = $('.navbar');

if ($(window).width() < 514) {
  $('.navbar').removeClass('navbar-inverse');
  $('.navbar').addClass('navbar-default');
} else {
  $('#menu2').removeClass('navbar-default');
  $('#menu2').addClass('navbar-inverse');
}