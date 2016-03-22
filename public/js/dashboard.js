$(function () {
    resizeDiv();

    var contentHeight = $('#dashboard').height();

    setInterval(function () {
        if (contentHeight != $('#dashboard').height()) {
            resizeDiv();
            contentHeight = $('#dashboard').height();
        }
    }, 100);

    window.onresize = function (event) {
        resizeDiv();
    };

    function resizeDiv() {
        if ((window.innerHeight - $('.mastfoot').height() - $('.navbar-header').height() - 1) > $('#dashboard').height()) {
            $('#page-content-wrapper').css('margin-bottom', 0);
            $('#page-content-wrapper').css('height', window.innerHeight - $('.mastfoot').height() - $('.navbar-header').height() - (parseInt($('#dashboard').css('margin-bottom').replace(/[^-\d\.]/g, '')) * 2) - 1);

        } else {
            $('#page-content-wrapper').css('margin-bottom', $('.mastfoot').height());
            $('#page-content-wrapper').css('height', $('#dashboard').height() + (parseInt($('#dashboard').css('margin-bottom').replace(/[^-\d\.]/g, '')) * 2 + 10));
        }

        $('.logout').css('bottom', $('.mastfoot').height() + 10);

        $('.splash').css('width', window.innerWidth - 220);
        $('.splash').css('height', window.innerHeight - $('.navbar-header').height() - 1)
    }

    var trigger = $('.hamburger'),
        overlay = $('.overlay'),
        isClosed = true;

    trigger.click(function () {
        hamburger_cross();
    });
 $('#wrapper').toggleClass('toggled');
    function hamburger_cross() {
        if (isClosed == false) {
            overlay.addClass('curtain');
            trigger.removeClass('is-closed');
            trigger.addClass('is-open');
            isClosed = true;
        } else {
            overlay.removeClass('curtain');
            trigger.removeClass('is-open');
            trigger.addClass('is-closed');
            isClosed = false;
        }

       
    }

    $('.logout').click(function() {
        window.location = '/logout';
    });
});