









//execute when all assets are loaded - images, iframe, fonts, etc
$(window).load(function () {

    //show cover anly when fonts are ready
    $('section#module-cover').css("opacity", "1");
    //execute when DOM is ready
    //$(document).ready(function () {


    ////////////////////////////////////////////////////////////////////////////////////////
    //                                Modernizer tests
    ////////////////////////////////////////////////////////////////////////////////////////
    if (!Modernizr.preserve3d) {
        var font_fb = "@import url('http://fonts.googleapis.com/css?family=Monoton&text=LESMORI')";
        $('<style type="text/css">\n' + font_fb + '</style>').appendTo("head");
    }



    ////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////
    //                   register media-queries with enquire.js first
    ////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////
    

    //DESKTOP
    enquire.register("screen and (min-width:1281px)", {

        match: function () {

            

        },


        //unmatch: function () {
        
        //},


    });

    


    //MOBILE
    enquire.register("screen and (max-width:1280px)", {

        // OPTIONAL
        // If supplied, triggered when a media query matches.
        match: function () {
            
            var sections = $("#container-main section[id^='module']");
            var slidee = $("#container-mobile .slidee");

           
            sections.each(function () {

                var slide = $('<li class="slide"></li>');
                var alignment = $('<div class="alignment"></div>');

                $(this).appendTo(alignment);
                alignment.appendTo(slide);
                slide.appendTo(slidee);    
            })


            var mobileSlider = new Sly('#container-mobile', {

                itemNav: "forceCentered",
                smart: true,
                horizontal: true,
                mouseDragging: true,
                touchDragging: true,
                scrollBy: 1,

                activatePageOn: 'click',
                releaseSwing: true,
                elasticBounds: true,
                pagesBar: '#container-mobile .pages-touch',

                speed: 300,

            });
            mobileSlider.init();


            $(window).bind('resizeEnd', function () {
                mobileSlider.reload();
            });



        },

        unmatch: function () {
            
            var sections = $("#container-mobile section[id^='module']");
            var container = $('#container-main');
            sections.appendTo(container);

            $("#container-mobile .slidee").empty();
            $(window).unbind("resizeEnd");
        },



    });

   


    ////////////////////////////////////////////////////////////////////////////////////////
    //                                        intro animation
    ////////////////////////////////////////////////////////////////////////////////////////

    //setTimeout(function () { $("section[id ^= 'module']").removeClass("intro") }, 500);
    var basedelay = 0,
        randomDelay = 200;

    //setTimeout(function () { $("section#motto").fadeOut(30)}, 400);

    setTimeout(function () { $("section[id = 'module-cover']").removeClass("intro") }, 0);

    
    ////////////////////////////////////////////////////////////////////////////////////////
    //                                    #module-cover
    ////////////////////////////////////////////////////////////////////////////////////////

    $("#module-cover #enter-btn").one("click", function () {

        $("#module-cover").addClass("hidden");
        $('#container-main, #container-mobile .pages-touch').removeClass("hidden").removeClass("transparent");
       

        setTimeout(function () { $("section[id = 'module-no']").removeClass("intro") }, basedelay + randomDelay * Math.random());
        setTimeout(function () { $("section[id = 'module-zoom']").removeClass("intro") }, basedelay + randomDelay * Math.random());
        setTimeout(function () { $("section[id = 'module-hslider']").removeClass("intro") }, basedelay + randomDelay * Math.random());
        setTimeout(function () { $("section[id = 'module-snow']").removeClass("intro") }, basedelay + randomDelay * Math.random());
        setTimeout(function () { $("section[id = 'module-form']").removeClass("intro") }, basedelay + randomDelay * Math.random());
        setTimeout(function () { $("section[id = 'module-dontworry']").removeClass("intro") }, basedelay + randomDelay * Math.random());
        setTimeout(function () { $("section[id = 'module-cube']").removeClass("intro") }, basedelay + randomDelay * Math.random());
        setTimeout(function () { $("section[id = 'module-pixelate']").removeClass("intro") }, basedelay + randomDelay * Math.random());

        //activate hslider only when intro animation finishes
        setTimeout(function () {
            hslider.init().reload();
        }, 400 + 1.2 * randomDelay);

    })


    ////////////////////////////////////////////////////////////////////////////////////////
    //                                    #module-no
    ////////////////////////////////////////////////////////////////////////////////////////

   


    ////////////////////////////////////////////////////////////////////////////////////////
    //                                    #module-zoom 
    ////////////////////////////////////////////////////////////////////////////////////////
    
    $("#module-zoom .trigger-btn").one("click", function () {
        
        var bricks = $("#module-zoom .brick");
        var triggerBtn = $("#module-zoom .trigger-btn").remove();
        var loader = $("#module-zoom .loader");

        
        var href_for_js = "scss/img-sprite.css";
        var href_for_html = "scss/img-sprite.css";

        bricks.addClass("remove-for-intro");
        $("#module-zoom ").addClass("loading");

        $.ajax({
            url: href_for_js,
            dataType: 'text',
            success:  function (data) {
                
                $('<style type="text/css">\n' + data + '</style>').appendTo("head"); 
                loader.remove();
                bricks.removeClass("no-img-yet").removeClass("remove-for-intro");
                $("#module-zoom ").removeClass("loading");

                $(".zoomTarget1").click(function (e) {

                    var clicked_obj = $(this),
                        allzoom_obj = $(".zoomTarget1, .img-wireframe-inner"),
                        info_box  = $("#zoom-info");

                    var zoomDestination = $(this).hasClass("selected") ? $("#body") : $(this);
        
                    //removed zoomedIn class from all items and add zoomedIn class only to current clicked item
                    if (clicked_obj.hasClass("selected")) { clicked_obj=null;; }
                    else { clicked_obj.addClass("selected"); }

                    allzoom_obj.removeClass("selected"); 
                    $(".frame.info-text").removeClass("active");
                    
                    //show hide info box for picture
                    //if (clicked_obj.hasClass("brick") && clicked_obj.hasClass("selected")) { info_box.addClass("active").addClass(  clicked_obj.attr("data-info-class")  ); }
                    //else { info_box.removeClass("active"); }

                    //actual zooming
                    zoomDestination.zoomTo({
                        duration: 600,
                        closeclick: true,
                        root: $(document.body)
                    });


                    e.stopPropagation();

                    //refresh when done zooming - workaround
                    allzoom_obj.removeClass("refresh")
                    setTimeout(function () {
                        allzoom_obj.addClass("refresh");
                        

                        //also scale font size acordingly
                        var element = document.querySelector('#body');
                        var scaleX = element.getBoundingClientRect().width / element.offsetWidth;
                        var scaleX_1 = 1 / scaleX;
                        var multiplyer = 140; //about the final size in pixels
                        var fontScale = Math.round( multiplyer * scaleX_1 * 10) / 10;

                        if (clicked_obj) { 
                            clicked_obj.addClass("selected"); 
                            $( clicked_obj.not('#body')).css("font-size", fontScale + "px").css("line-height", 1.3 * fontScale + "px");
                        }
                        

                        
                    },650)
                });
            
                //prevent .icon and <a> elements to not trigger zoomooz
                $(".icon, .frame .info-text-wrap").click(function (evt) { evt.stopPropagation() });

                //for info-text
                $(".icon .color").hover(
                    function (evt) {
                        $(".frame.img-color", $(this).parent().parent()).addClass("active");
                    },
                    function (evt) {
                        $(".frame.img-color", $(this).parent().parent()).removeClass("active");
                    }
                )


                //for color/bw animation
                $(".icon .info").click(
                    function (evt) {
                        evt.stopPropagation
                        $(".frame.info-text", $(this).parent().parent()).toggleClass("active");
                    }//,
                    //function (evt) {
                    //    $(".frame.info-text", $(this).parent().parent()).removeClass("active");
                    //}
                )

                //for scrolling animation
                $(".icon .anim").hover(
                    function (evt) {
                        $(this).parent().parent().addClass("active");
                    },
                    function (evt) {
                        $(this).parent().parent().removeClass("active");
                    }
                )


                //for links to other items in gallery
                $("#module-zoom .frame .info-text-wrap a[data-link]").click(function (e) {
                    
                    //e.preventDefault();
                    if (!$("." + destination).hasClass("selected")) {
                        e.stopPropagation();
                        var destination = $(this).attr("data-link");
                        $("." + destination).click();
                    }

                })


               

    
            },//END OF succes callback


            error       : function( xhr ) {
                var readyState = {
                    1: "Loading",
                    2: "Loaded",
                    3: "Interactive",
                    4: "Complete"
                };
                if(xhr.readyState !== 0 && xhr.status !== 0 && xhr.responseText !== undefined) {
                    alert("readyState: " + readyState[xhr.readyState] + "\n status: " + xhr.status + "\n\n responseText: " + xhr.responseText);
                }
            }


        }) //END OF ajax

    }) //END OF $("#module-zoom .trigger-btn").one("click"...

    ////////////////////////////////////////////////////////////////////////////////////////
    //                                    #module-colorhover
    ////////////////////////////////////////////////////////////////////////////////////////



    //for (i = 0; i < 400; i++) {
    //    $("#module-hslider #overlay").append('<div class="item"></div>')
    //}

    //$("#module-hslider .item").click(function () {
    //    $(this).toggleClass("active");

    //})

    //$("#module-hslider button.menu").click(function () {
    //    $("#module-hslider #overlay").toggleClass("active");

    //})



    ////////////////////////////////////////////////////////////////////////////////////////
    //                                    #module-hslider
    ////////////////////////////////////////////////////////////////////////////////////////


    //#sidebar-menu
    $("#module-hslider button.menu").click(function () {
    
        $("#module-hslider #outter-container").toggleClass("active");
        $("#module-hslider #overlay").toggleClass("active");
    })

    //define sly
    var hslider = new Sly('#module-hslider .frame', {

        itemNav: "forceCentered",
        smart: true,
        horizontal: true,
        mouseDragging: true,
        touchDragging: true,
        scrollBy: 1,

        pagesBar: '#module-hslider .pages',
        activatePageOn: 'click',
        releaseSwing: true,
        elasticBounds: true,

        speed: 300,

    });

        


    $("#module-hslider #side-menu ul li").click(function(){

        var slide = $(this).attr("data-slideTo");
        hslider.activatePage(slide);
        $("#module-hslider button.menu").click();
             
    })

        
    ////////////////////////////////////////////////////////////////////////////////////////
    //                                    #module-snow
    ////////////////////////////////////////////////////////////////////////////////////////

    $('#module-snow #the-button.tooltip').tooltipster({

        content: 'Brace yourselves !',
        trigger: 'hover',
        delay: 0,
        animation: 'grow',
        position: 'right',
        offsetY: -90,
        offsetX: -130,
    });

    $('#module-snow #the-button.tooltip').tooltipster({

        content: 'Don`t do it bro !',
        trigger: 'hover',
        multiple: true,
        delay: 0,
        animation: 'grow',
        position: 'right',
        offsetY: 78,
        offsetX: -122,
    });
        


    var tooltipsterObjects = $('#module-snow #the-button.tooltip').tooltipster({
        // don't forget to provide content here as the 1st tooltip will have deleted the original title attribute of the element
        content: 'Please, mister !',
        trigger: 'hover',
        multiple: true,
        delay: 0,
        position: 'top-right',
        animation: 'grow',
        offsetY:  50,
        offsetX: 75,
    });

    var tooltipsterObjects = $('#module-snow #the-button.tooltip').tooltipster({
        // don't forget to provide content here as the 1st tooltip will have deleted the original title attribute of the element
        content: 'Meh..',
        trigger: 'hover',
        multiple: true,
        delay: 0,
        position: 'top',
        animation: 'grow',
        offsetY: -120,
        offsetX: 100,
    });




    //on click initiate #starfield animation and make #starfield container vissible
    $("#module-snow #the-button").one("click", function () {
        $('#starfield').starscroll(

                16,         //mode
                3,          //parallax - layers
                150,         //density
                5,          //dimension
                1,       //smoothness
                [255, 255, 255],        //colour
                true,           //colour - varience
                true           //animate
            );
        $('#starfield').addClass("visible");

        $(this).parent().toggleClass("not-snowing");


        $("#module-snow #the-button").on("click", function () {
            $(this).parent().toggleClass("not-snowing");
            $('#starfield').toggleClass("visible");
                    
                    



        })



    });


    
            

    ////////////////////////////////////////////////////////////////////////////////////////
    //                                    #module-form
    ////////////////////////////////////////////////////////////////////////////////////////
    $(".input-field input").on("focus", function () {
        $(this).addClass("active");

    }).on("focusout", function () {

        if (!$(this).val()) {
            $(this).removeClass("active");
        }
    });

    //$('#module-form')
    //    .one("mouseover", function () {
    //        $('#module-form #f2').focus();

    //    }).one("mouseout", function () {
    //        $('#module-form #f2').blur();

    //    });


    ////////////////////////////////////////////////////////////////////////////////////////
    //                                    #module-dontworry
    ////////////////////////////////////////////////////////////////////////////////////////

    var currentS = "#frame1";
    $("#module-dontworry [data-nav-dest]").click(function (e) {

        e.preventDefault();
        if ($(this).attr("data-nav-dest") != currentS) {

            $(currentS).removeClass("active").fadeOut(200);
            currentS = $(this).attr("data-nav-dest");
            $(currentS).addClass("active").fadeIn(200);

            if ($(this).attr("data-add-class")) $("#module-dontworry .image").removeClass("p1 p2 p3").addClass($(this).attr("data-add-class"));

        }
    })


    ////////////////////////////////////////////////////////////////////////////////////////
    //                                    #module-cube
    ////////////////////////////////////////////////////////////////////////////////////////
                
    //populate cube faces with text;
    $('.preserve3d #module-cube figure p').html("That's here. That's home. That's us. On it everyone you love, everyone you know, everyone you ever heard of, every human being who ever was, lived out their lives. The aggregate of our joy and suffering, thousands of confident religions, ideologies, and economic doctrines, every hunter and forager, every hero and coward, every creator and destroyer of civilization, every king and peasant, every young couple in love, every mother and father, hopeful child, inventor and explorer, every teacher of morals, every corrupt politician, every 'superstar', every 'supreme leader', every saint and sinner in the history of our species lived there – on a mote of dust suspended in a sunbeam. That's here. That's home. That's us. On it everyone you love, everyone you know, everyone you ever heard of, every human being who ever was");

    $('.preserve3d #module-cube').one("mouseover", function () {
        $('.preserve3d #module-cube #cube').removeClass("show-front show-back show-right show-left show-top show-bottom").addClass("show-right")

    });

    $('.preserve3d #module-cube').tooltipster({

        trigger: 'hover',
        delay: 100,
        animation: 'grow',
        position: 'top',
        interactive: true,
        arrow: false,
        theme: 'cube-theme',
        minWidth: '150',
        maxWidth: '150',
        offsetY: -300,
        //offsetX: -240,

        //attach navigation ul to tooltip
        content: $(

            '<ul class="tabs">' +
                '<li class="" data-add-class="show-front">1</li>' +
                '<li class="" data-add-class="show-back">2</li>' +
                '<li class="" data-add-class="show-right">3</li>' +
                '<li class="" data-add-class="show-left">4</li>' +
                '<li class="" data-add-class="show-top">5</li>' +
                '<li class="" data-add-class="show-bottom">6</li>' +
            '</ul>'),


        //attach hover triggers for navigation oance tooltipster is initialised
        functionReady: function () {
            $('.cube-theme .tabs [data-add-class]').click(function () {

                //rotate cube by adding css clases
                $("#module-cube #cube").removeClass("show-front show-back show-right show-left show-top show-bottom").addClass($(this).attr("data-add-class"));
            })
        }

    });



    ////////////////////////////////////////////////////////////////////////////////////////
    //                                    #module-card 
    ////////////////////////////////////////////////////////////////////////////////////////
    $("#module-pixelate ").click(function () {
        $("#card").toggleClass("flipped");
    })

                    

    ////////////////////////////////////////////////////////////////////////////////////////
    //                                    #module-pixelate 
    ////////////////////////////////////////////////////////////////////////////////////////


    $("#module-pixelate .pdf-links a").click(function (e) { e.stopPropagation();})

    $("#module-pixelate ").one("click" , function () { $("#module-pixelate canvas").removeClass("intro") })


    /// (C) Ken Fyrstenberg Nilsen, Abdias Software, CC3.0-attribute.
    var ctx = canvas.getContext('2d'),
        img = new Image(),
        play = false;

    /// turn off image smoothing - this will give the pixelated effect
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    //CanvasRenderingContext2D.imageSmoothingEnabled = false;

    /// wait until image is actually available
                    

    /// some image, we are not struck with CORS restrictions as we
    /// do not use pixel buffer to pixelate, so any image will do
    img.src = "data:image/jpg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAyAAD/4QMqaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjUtYzAyMSA3OS4xNTQ5MTEsIDIwMTMvMTAvMjktMTE6NDc6MTYgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RjFCODRCRjFERjZEMTFFNDkxQ0NCNjlGQzM1OUU1NkYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RjFCODRCRjJERjZEMTFFNDkxQ0NCNjlGQzM1OUU1NkYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGMUI4NEJFRkRGNkQxMUU0OTFDQ0I2OUZDMzU5RTU2RiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGMUI4NEJGMERGNkQxMUU0OTFDQ0I2OUZDMzU5RTU2RiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEAAgGBgYGBggGBggMCAcIDA4KCAgK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";

    /// MAIN function
    function pixelate(v) {

        /// if in play mode use that value, else use slider value
        var size = v * 0.01,

            /// cache scaled width and height
            w = canvas.width * size,
            h = canvas.height * size;

        /// draw original image to the scaled size
        ctx.drawImage(img, 0, 0, w, h);

        /// then draw that scaled image thumb back to fill canvas
        /// As smoothing is off the result will be pixelated
        ctx.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
    }

    /// This runs the demo animation to give an impression of
    /// performance.
    function animate() {

        var v = 3,
            dx = 1, /// "speed"
            frames = [2, 4, 5, 6, 8, 9, 10, 13, 21, 100],
            fi = 0;

        anim();

        /// animation loop
        function anim() {

            /// increase or decrease value
            v += dx;

            if (fi > frames.length) fi--;
            else fi = fi + 1;

            /// if at min or max reverse delta
            if (v <= 1 || v > 99) dx = -dx;

            /// pixelate image with current value
            pixelate(frames[Math.floor(fi)]);

            /// loop
            if (Math.floor(fi) <= frames.length + 100) setTimeout(anim, 35)

            //requestAnimationFrame(anim);
            //else pixelate(frames[0]);


        }
    }

    /// event listeneners for slider and button
    //blocks.addEventListener('change', pixelate, false);

    //Is this IE?
    var isIE = $("html").hasClass("no-preserve3d");


    if (!isIE) {
        img.onload = function () { pixelate(100); }
        canvas.addEventListener('mouseover', function () { animate() }, false);
        canvas.addEventListener('mouseout', function () { pixelate(100); setTimeout(function () { pixelate(100); }, 300) }, false);
    }
    else {
        img.onload = function () { pixelate(100);
            canvas.addEventListener('mouseover', function () { animate() }, false);
            canvas.addEventListener('mouseout', function () { pixelate(100); setTimeout(function () { pixelate(100); }, 300) }, false);
        }
    }

    

    ////////////////////////////////////////////////////////////////////////////////////////
    //                                    for transformicons 
    ////////////////////////////////////////////////////////////////////////////////////////

                    var anchor = document.querySelectorAll('button');

                    [].forEach.call(anchor, function (anchor) {
                        var open = false;
                        anchor.onclick = function (event) {
                            event.preventDefault();
                            if (!open) {
                                this.classList.add('close');
                                open = true;
                            }
                            else {
                                this.classList.remove('close');
                                open = false;
                            }
                        }
                    });

    ////////////////////////////////////////////////////////////////////////////////////////
    //                                    end
    ////////////////////////////////////////////////////////////////////////////////////////




           


})











////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//                              Custom modernizr tests
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////
//transform - style:preserve3d
////////////////////////////////////////////////////////////////////////////////////////

Modernizr.addTest("preserve3d", function () {
    var property = "transform-style";
    var value = "preserve-3d";

    var element = document.createElement('link');
    var body = document.getElementsByTagName('HEAD')[0];
    var properties = [];
    var upcaseProp = property.replace(/(^|-)([a-z])/g, function (a, b, c) { return c.toUpperCase(); });
    properties[property] = property;
    properties['Webkit' + upcaseProp] = '-webkit-' + property;
    properties['Moz' + upcaseProp] = '-moz-' + property;
    properties['ms' + upcaseProp] = '-ms-' + property;

    body.insertBefore(element, null);
    for (var i in properties) {
        if (element.style[i] !== undefined) {
            element.style[i] = value;
        }
    }
    //ie7,ie8 doesnt support getComputedStyle
    //so this is the implementation
    if (!window.getComputedStyle) {
        window.getComputedStyle = function (el, pseudo) {
            this.el = el;
            this.getPropertyValue = function (prop) {
                var re = /(\-([a-z]){1})/g;
                if (prop == 'float') prop = 'styleFloat';
                if (re.test(prop)) {
                    prop = prop.replace(re, function () {
                        return arguments[2].toUpperCase();
                    });
                }
                return el.currentStyle[prop] ? el.currentStyle[prop] : null;
            };
            return this;
        };
    }

    var st = window.getComputedStyle(element, null),
        currentValue = st.getPropertyValue("-webkit-" + property) ||
            st.getPropertyValue("-moz-" + property) ||
            st.getPropertyValue("-ms-" + property) ||
            st.getPropertyValue(property);

    if (currentValue !== value) {
        element.parentNode.removeChild(element);
        return false;
    }
    element.parentNode.removeChild(element);
    return true;
});




////////////////////////////////////////////////////////////////////////////////////////
//browser detection
////////////////////////////////////////////////////////////////////////////////////////

function get_browser_info() {
    var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return { name: 'IE ', version: (tem[1] || '') };
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\bOPR\/(\d+)/)
        if (tem != null) { return { name: 'Opera', version: tem[1] }; }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) { M.splice(1, 1, tem[1]); }
    return {
        name: M[0],
        version: M[1]
    };
}


var browser = get_browser_info();
// browser.name = 'Chrome'
// browser.version = '40'

//$("input#f1").val;
//alert(browser.name + " " + browser.version);



////////////////////////////////////////////////////////////////////////////////////////
//UTILS
////////////////////////////////////////////////////////////////////////////////////////


//throtle repetitve functions
function debouncer(func, timeout) {
    var timeoutID, timeout = timeout || 200;
    return function () {
        var scope = this, args = arguments;
        clearTimeout(timeoutID);
        timeoutID = setTimeout(function () {
            func.apply(scope, Array.prototype.slice.call(args));
        }, timeout);
    }
}


//resizeEnd - triggers is widow hasnt changed size in 300ms
$(window).resize(function () {
    if (this.resizeTO) clearTimeout(this.resizeTO);
    this.resizeTO = setTimeout(function () {
        $(this).trigger('resizeEnd');
    }, 800);
});


////////////////////////////////////////////////////////////////////////////////////////
//TRANSFORM CSS PROPERTY GET-SET
////////////////////////////////////////////////////////////////////////////////////////
