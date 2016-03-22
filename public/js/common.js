var previewFile = function (event) {
    var preview = $(event.target).parent().find('#preview'); //selects the query named img
    var file = event.target.files[0]; //sames as here
    var photo = $(event.target).parent().find('#photo');
    var reader = new FileReader();

    reader.onloadend = function () {
        preview.attr('src', reader.result);
        photo.val(reader.result);
    }

    if (file) {
        reader.readAsDataURL(file); //reads the data as a URL
    } else {
        preview.attr('src', '');
    }
}

$(function () {
    function getParameterByName(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
            results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    $('.add-btn').click(function () {
        var that = $(this);

        if (that.attr('disabled')) {
            return;
        }

        that.attr('disabled', true);

        $.post('/myplaces/add', {id: that.data('pid')}, function (result) {
            if (result.success) {
                that.text(' ' + result.message);
                $('<a></a>').html('进入我的景点')
                    .addClass('text-danger')
                    .attr('href', '/myplaces')
                    .insertAfter(that);
            } else {
                that.attr('disabled', false);
            }
        });
    });

    $('#destination').click(function () {
        $(this).find('i').addClass('fa-check-circle');
        $('#guide').find('i').removeClass('fa-check-circle');
        $('#mode').val('destination');
    });

    $('#guide').click(function () {
        $(this).find('i').addClass('fa-check-circle');
        $('#destination').find('i').removeClass('fa-check-circle');
        $('#mode').val('guide');
    });

    var page = getParameterByName('p') || 1;

    if (page) {
        $('.pagination a:contains(' + page + ')').attr('href', null).parent('li').addClass('active');
    }

    $('.input-date').each(function () {
        var date = $(this).attr('value');

        if (date) {
            $(this).attr('value', moment.utc(date).format('YYYY-MM-DDThh:mm'));
        } else {
            $(this).attr('value', moment().format('YYYY-MM-DDThh:mm'));
        }

        $(this).attr('min', moment().format('YYYY-MM-DDThh:mm'));
    });

    $('.display-date').each(function () {
        var date = $(this).text();

        if (date) {
            $(this).text(moment.utc(date).format('YYYY-MM-DD hh:mm:ss A'));
        }
    });

    $(document).ajaxComplete(function (event, request, settings) {
        try {
            $.parseJSON(request.responseText);
        } catch (error) {
            if (request.status == 200 && request.responseText.indexOf('login') > -1) {
                window.location = '/?r=' + window.location.pathname + '#login';
            }
        }
    });

    if (window.location.hash == '#login') {
        $('[data-target=#login_popup]').first().trigger('click');
    } else if (window.location.hash == '#register') {
        $('[data-target=#register_popup]').first().trigger('click');
    }

    $('#registerform').validate({
        rules: {
            username: {
                required: true,
                minlength: 6
            },
            password: {
                required: true,
                minlength: 6
            },
            confirmpassword: {
                required: true,
                minlength: 6,
                equalTo: "#password"
            },
            firstname: {
                required: true,
                minlength: 3
            },
            lastname: {
                required: true,
                minlength: 3
            },
            phone: {
                required: true,
                digits: true,
                minlength: 10
            },
            wechat: {
                required: true,
                minlength: 3
            },
            alipay: {
                required: true,
                email: true
            },
            agree: {
                required: true
            }
        },
        highlight: function (element) {
            $(element).closest('.form-group').addClass('has-error');
        },
        unhighlight: function (element) {
            $(element).closest('.form-group').removeClass('has-error');
        },
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function (error, element) {

        }
    });

    $('#registerbutton').on('click', function (event) {
        event.preventDefault();

        if ($('#registerform').valid()) {
            $('#registerform').submit();
        }

        return false;
    });
});

// Suneel's JavaScript

$('.carousel-inner').magnificPopup({
    delegate: '.magnific-popup-item',
    type: 'image',
    tLoading: 'Loading image #%curr%...',
    mainClass: 'mfp-img-mobile',
    gallery: {
        enabled: true,
        navigateByImgClick: true,
        preload: [0,1] // Will preload 0 - before current, and 1 after the current image
    },
    image: {
        tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
        titleSrc: function(item) {
            return item.el.attr('title');
        }
    }
});

$('#checkall').click(function () {
    if ($(this).is(':checked')) {
        $('input.select').prop('checked', true);
        $('.myplaces-btn').removeClass('disabled');
    } else {
        $('input.select').prop('checked', false);
        $('.myplaces-btn').addClass('disabled');
    }
});

$('input.select').click(function () {
    var elem = $("input.select:checked");

    if(elem.length > 0){
        $('.myplaces-btn').removeClass('disabled');
    }else{
        $('.myplaces-btn').addClass('disabled');

    }
});

var checkmarkIdPrefix = "loadingCheckSVG-";
var checkmarkCircleIdPrefix = "loadingCheckCircleSVG-";
var verticalSpacing = 50;

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function createSVG(tag, properties, opt_children) {
    var newElement = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for(prop in properties) {
        newElement.setAttribute(prop, properties[prop]);
    }
    if (opt_children) {
        opt_children.forEach(function(child) {
            newElement.appendChild(child);
        })
    }
    return newElement;
}

function createPhraseSvg(phrase, yOffset) {
    var text = createSVG("text", {
        fill: "white",
        x: 50,
        y: yOffset,
        "font-size": 18,
        "font-family": "Arial"
    });
    text.appendChild(document.createTextNode(phrase + "..."));
    return text;
}
function createCheckSvg(yOffset, index) {
    var check = createSVG("polygon", {
        points: "21.661,7.643 13.396,19.328 9.429,15.361 7.075,17.714 13.745,24.384 24.345,9.708 ",
        fill: "rgba(255,255,255,1)",
        id: checkmarkIdPrefix + index
    });
    var circle_outline = createSVG("path", {
        d: "M16,0C7.163,0,0,7.163,0,16s7.163,16,16,16s16-7.163,16-16S24.837,0,16,0z M16,30C8.28,30,2,23.72,2,16C2,8.28,8.28,2,16,2 c7.72,0,14,6.28,14,14C30,23.72,23.72,30,16,30z",
        fill: "white"
    })
    var circle = createSVG("circle", {
        id: checkmarkCircleIdPrefix + index,
        fill: "rgba(255,255,255,0)",
        cx: 16,
        cy: 16,
        r: 15
    })
    var group = createSVG("g", {
        transform: "translate(10 " + (yOffset - 20) + ") scale(.9)"
    }, [circle, check, circle_outline]);
    return group;
}

function addPhrasesToDocument(phrases) {
    phrases.forEach(function(phrase, index) {
        var yOffset = 30 + verticalSpacing * index;
        document.getElementById("phrases").appendChild(createPhraseSvg(phrase, yOffset));
        document.getElementById("phrases").appendChild(createCheckSvg(yOffset, index));
    });
}

function easeInOut(t) {
    var period = 200;
    return (Math.sin(t / period + 100) + 1) /2;
}

document.addEventListener("DOMContentLoaded", function(event) {
    var phrases = shuffleArray(["Picking Berries", "Configuring Quasar Beams", "Generating Trip", "Optimizing Route", "Notifying Guides", "Hammering Bytes", "Finding Tour Guides", "Sampling Jelly Beans", "Generating Better Phrases", "Spinning Gears", "Calling The Professor", "Cooking Calzones", "Buying Soy Milk", "Folding A Crane", "Watching The Sunset", "Going To The Beach"]);
    addPhrasesToDocument(phrases);
    var start_time = new Date().getTime();
    var upward_moving_group = document.getElementById("phrases");
    upward_moving_group.currentY = 0;
    var checks = phrases.map(function(_, i) {
        return {check: document.getElementById(checkmarkIdPrefix + i), circle: document.getElementById(checkmarkCircleIdPrefix + i)};
    });
    function animateLoading() {
        var now = new Date().getTime();
        upward_moving_group.setAttribute("transform", "translate(0 " + upward_moving_group.currentY + ")");
        upward_moving_group.currentY -= 1.35 * easeInOut(now);
        checks.forEach(function(check, i) {
            var color_change_boundary = - i * verticalSpacing + verticalSpacing + 15;
            if (upward_moving_group.currentY < color_change_boundary) {
                var alpha = Math.max(Math.min(1 - (upward_moving_group.currentY - color_change_boundary + 15)/30, 1), 0);
                check.circle.setAttribute("fill", "rgba(255, 255, 255, " + alpha + ")");
                var check_color = [Math.round(255 * (1-alpha) + 120 * alpha), Math.round(255 * (1-alpha) + 154 * alpha)];
                check.check.setAttribute("fill", "rgba(255, " + check_color[0] + "," + check_color[1] + ", 1)");
            }
        })
        if (now - start_time < 30000 && upward_moving_group.currentY > -710) {
            requestAnimationFrame(animateLoading);
        }
    }
    //animateLoading();
});