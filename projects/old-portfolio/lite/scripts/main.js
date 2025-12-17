





$(document).ready(function () {

    //TRANSFORMICON
    var anchor = document.querySelectorAll('.transformicon');

    [].forEach.call(anchor, function (anchor) {
        var open = false;
        anchor.onclick = function (event) {
            //event.preventDefault();
            if (!open) {
                //this.classList.add('close');
                $(this).addClass('close');

                open = true;
            }
            else {
                //this.classList.remove('close');
                $(this).removeClass('close');
                open = false;
            }
        }
    });
    //END OF TRANSFORMICON







    $(".main-scroll-container").perfectScrollbar({
        scrollYMarginOffset: 2,
        includePadding: true

    });


    $("#show-resx").on('change', function () {

        if ($(this).prop("checked") == true) {


            if ($(document).width() >= 768) {
                        tooltip_position = "left";
                        tooltip_trigger = "hover";
            }
            else {
                        tooltip_position = "bottom-left";
                        tooltip_trigger = "click";
            }



                    $('.tooltip').tooltipster({
                        trigger: tooltip_trigger,
                        position: tooltip_position,
                        delay: '0',
                        maxWidth: '400',
                        contentAsHTML: true
                    });

        }
        else {
            $('.tooltipstered').tooltipster('destroy');

        }


    }) //end of $("#show-resx")





    




    





    //HIDE ANNOTATIONS CHECKBOX
    //localStorage.clear();

    if (localStorage.hideAnno === undefined) {
        localStorage.hideAnno = "-1";
        //alert(localStorage.hideAnno);
    }

    else {
        if (localStorage.hideAnno == "-1") {
            $(".anno").removeClass("smooth-hide");
            $("#hide-annotation").prop('checked', false);
            //alert("b1");
        }
        if (localStorage.getItem("hideAnno") == "1") {


            $(".anno").addClass("hidden").addClass("smooth-hide");
            window.setTimeout(function () { $(".anno").removeClass("hidden"); }, 500);

            $("#hide-annotation").prop('checked', true);
            //alert("b2");

        }

    }

    $("#hide-annotation").click(function () {
        $(".anno").toggleClass("smooth-hide");
        localStorage.hideAnno = -parseInt(localStorage.hideAnno);

    })

    //END OF:  HIDE ANNOTATIONS CHECKBOX



    //SELECT BACKGROUND
    $("input[type='radio'][name='select-background']").on('change', function () {
        $("body div.bk").fadeOut();
        $("#HEADER div.hd").fadeOut();

        switch ($(this).val()) {

            case 'bk1':
                $('body div.bk.bk1').fadeIn();
                $("#HEADER div.hd.bk1").fadeIn();
                $("input[name='select-skin'][value='skin1']").click();
                break;

            case 'bk2':
                $('body div.bk.bk2').fadeIn();
                $("#HEADER div.hd.bk2").fadeIn();
                break;

            case 'bk3':
                $('body div.bk.bk3').fadeIn();
                $("#HEADER div.hd.bk3").fadeIn();
                break;

            case 'bk4':
                $('body div.bk.bk4').fadeIn();
                $("#HEADER div.hd.bk4").fadeIn();
                $("input[name='select-skin'][value='skin2']").click();
                break;
        }
    })
    //END OF:  SELECT BACKGROUND


    //SELECT SKIN
    $("input[type='radio'][name='select-skin']").on('change', function () {
        aux = $(this).val();  //alert(aux);
        $("div[data-skin]").fadeOut(150);

        setTimeout(function () {$("div[data-skin]").attr("data-skin", aux);}, 150);
            
        $("div[data-skin]").filter(function () { return $(this).css("display") != "none" }).fadeIn(150);

        
    })
    //END OF:  SELECT SKIN












    //SELECT PAGE
    $("input[type='radio'][name='select-page']").on('change', function () {
        $("body .main-scroll-container-shadow").fadeOut(300).delay(200);

        switch ($(this).val()) {

            case 'unreg':
                $("body .main-scroll-container-shadow#UNREG_PAGE").fadeIn(300);
                break;

            case 'registered':
                $("body .main-scroll-container-shadow#REG_PAGE").fadeIn(300);
                break;
        }
    })
  





    $("#show-validations").click(function () {
        $(".main-scroll-container-shadow").toggleClass("validated");
    })


    //READONLY FIELDS
    $("#disable-details").click(function () {

        $(".canbe-readonly").each(function () {
            
            

            if ($(this).prop("disabled") == false) {
                $(this).val($(this).attr("data-val")).prop("disabled", true);
                $(".billing-address, .personal-details").addClass("section-readonly");
            }
            else {
                $(this).val("").prop("disabled", false);
                $(".billing-address, .personal-details").removeClass("section-readonly");
            }
        });
    })




                
                   

    $(".tab-group-payment-method label[data-tab]", "#UNREG_PAGE").click(function () {
        $(".tab-group-payment-method .tab-content", "#UNREG_PAGE").hide();
        $(".tab-group-payment-method " + $(this).attr("data-tab"), "#UNREG_PAGE").show();

    });

    
    $('#tab-content1 select#select-card', "#UNREG_PAGE").click(function () {

            if ($(this).find(":selected").text() == "Add new card") {

                $("#tab-content1 .tab-content-in",   "#UNREG_PAGE").hide();
                $("#tab-content1 #tab-content-in-2", "#UNREG_PAGE").show();
            }
            else {

                $("#tab-content1 .tab-content-in",   "#UNREG_PAGE").hide();
                $("#tab-content1 #tab-content-in-1", "#UNREG_PAGE").show();

            }

    });





    $(".tab-group-payment-method label[data-tab]", "#REG_PAGE").click(function () {
        $(".tab-group-payment-method .tab-content", "#REG_PAGE").hide();
        $(".tab-group-payment-method " + $(this).attr("data-tab"), "#REG_PAGE").show();


    });

    $('#tab-content1 select#select-card', "#REG_PAGE").click(function () {

        if ($(this).find(":selected").text() == "Add new card") {

            $("#tab-content1 .tab-content-in",   "#REG_PAGE").hide();
            $("#tab-content1 #tab-content-in-2", "#REG_PAGE").show();
        }
        else {

            $("#tab-content1 .tab-content-in",   "#REG_PAGE").hide();
            $("#tab-content1 #tab-content-in-1", "#REG_PAGE").show();

        }

    });


   


    $("#submit").click(function () {
        //alert(1);
        window.top.location.href = "http://10.3.56.107:915/Playground/mi-pay/iframe/result.html";


    })




});




