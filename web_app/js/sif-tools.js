// LDM main script of doom
// Donald Burr, VCT Labs

// Message pane: http://stackoverflow.com/questions/5267569/display-messages-with-jquery-ui

// up arrow = &#8593; &#x2191;
// down arrow = &#8595; &#x2193;
// bar = &#8213; &#x2015;

// Set to 0 to disable debugging, 1+ to enable debugging (higher = more verbose)
var DEBUG_LEVEL = 1;

// debug logging
function LOG(level, msg)
{
	if (DEBUG_LEVEL > 0 && DEBUG_LEVEL >= level)  {
		console.log(msg);
	}
}

// Main function, runs automatically at document-ready (i.e. when the page is finished loading)
$(document).ready(function(){
	// set up UI (buttons, etc.)
	setup_ui_elements();
	// set up button handlers
	setup_button_handlers();
	// set up slider handlers
});

// Set up UI elements (tabs, buttons, etc.)
function setup_ui_elements()
{
	LOG(1, "setup_ui_elements()");
	// set title
	// document.title = "LDM Demo @ " + window.location.hostname;
	// $( "#header" ).html("<h1>LDM Demo @ " + window.location.hostname + "</h1>");

	// set up tabs
	$( "#tabs" ).tabs({
		active: 0,
		create: function(event, ui) {
			var theTab = ui.tab.index();
			LOG(1, "INIT tab created " + theTab);
			set_up_tab(theTab);
		},
		activate: function(event, ui) {
			var theTab = ui.newTab.index();
			LOG(1, "INIT tab selected " + theTab);
			set_up_tab(theTab);
		}
	});

    // set up datepicker
    $( "#gem_desired_date" ).datepicker();
    
	// set up buttons
	["calculate-rank", "reset-rank", "calculate-gems", "reset-gems"].forEach(function(entry) {
		var selector = "#button-" + entry;
		console.log("setting up " + selector);
		$(selector).button();
	});
    
    // hide result divs
    ["rank-calc-result-area", "gem-calc-result-area"].forEach(function(entry) {
        var selector = "#" + entry;
        console.log("setting up " + selector);
        $(selector).hide();
    });
    
    // set up gem buttons
    $("input[name=gem-mode]").change(handle_gem_mode_select);
    
    // hide non-selected option divs
    ["gem-desired-gems-area"].forEach(function(entry) {
        var selector = "#" + entry;
        console.log("setting up " + selector);
        $(selector).hide();
    });
}

function setup_button_handlers()
{
    $("#button-calculate-rank").click(function(evt) {
        calculate_rank();
    });
    $("#button-reset-rank").click(function(evt) {
        reset_rank();
    });
    $("#button-calculate-gems").click(function(evt) {
        calculate_gems();
    });
    $("#button-reset-gems").click(function(evt) {
        reset_gems();
    });
}

// tab functions

function set_up_tab(tab)
{
	switch(tab) {
        case 0: rank_calc_tab_selected(); break;
        case 1: love_gem_calc_tab_selected(); break;
        case 2: card_level_calc_tab_selected(); break;
        case 3: event_end_calc_tab_selected(); break;
    }
}

function rank_calc_tab_selected()
{
    LOG(1, "rank_calc_tab_selected");
    // make sure scan field has focus
    // var doh = document.getElementById("barcode-scan-area");
    // doh.focus();
}

function love_gem_calc_tab_selected()
{
	LOG(1, "love_gem_calc_tab_selected");
}

function card_level_calc_tab_selected()
{
	LOG(1, "card_level_calc_tab_selected");
}

function event_end_calc_tab_selected()
{
	LOG(1, "event_end_calc_tab_selected");
}

function calculate_rank()
{
    // validate data
    var current_rank = parseInt($("#current_rank").val());
    var current_exp = parseInt($("#current_exp").val());
    var desired_rank = parseInt($("#desired_rank").val());
    var game_version = parseInt($("#game_version").val());
    if (isNaN(current_rank) || isNaN(current_exp) || isNaN(desired_rank)) {
        window.alert("Error: you have entered an invalid (non-numeric) value. Please check your input and try again.");
    } else if (current_rank < 0 || current_exp < 0 || desired_rank < 0) {
        window.alert("Error: you have entered a negative value. Please check your input and try again.");
    } else if (current_rank < 34 || desired_rank < 34) {
        window.alert("Error: this calculator does not work for ranks less than 34.");
    } else if (desired_rank <= current_rank) {
        window.alert("Error: desired rank must be greater than current rank.");
    } else {
        var required_exp = 0
        for (rank = current_rank ; rank < desired_rank ; rank++) {
            var required_exp_for_next_rank = Math.round(34.45 * rank - 551)
            // account for half EXP on JP (only if rank < 100)
            if (game_version === "JP" && rank < 100) {
                required_exp_for_next_rank /= 2;
            }
            required_exp = required_exp + required_exp_for_next_rank
        }
        // account for exp we already have
        required_exp -= current_exp
        // convert to integer
        required_exp = Math.round(required_exp);
        // now calc the # of songs needed
        // round up because you can't play half of a song (although you can play a song half-assedly :P and I often do :P)
        var easy_count = Math.round(required_exp / 12);
        var normal_count = Math.round(required_exp / 26);
        var hard_count = Math.round(required_exp / 46);
        var expert_count = Math.round(required_exp / 83);
        // calc LP and FP
        var LP = 25 + Math.floor(Math.min(desired_rank, 300) / 2) + Math.floor(Math.max(desired_rank - 300, 0) / 3)
        // calc friend slots
        var friend_slots = 10 + Math.floor(Math.min(desired_rank, 50) / 5) + Math.floor(Math.max(desired_rank - 50, 0) / 10)

        // display the results
        $("#rank-result-exp").text(required_exp);
        $("#rank-result-songs-easy").text(easy_count);
        $("#rank-result-songs-normal").text(normal_count);
        $("#rank-result-songs-hard").text(hard_count);
        $("#rank-result-songs-expert").text(expert_count);
        // rank-results-lp">-</span> LP and <span id="rank-results-fp
        $("#rank-results-lp").text(LP);
        $("#rank-results-fp").text(friend_slots);
        $("#rank-calc-result-area").show();
    }
}

function reset_rank()
{
    $("#rank-calc-result-area").hide();
    $("#current_rank").val("");
    $("#current_exp").val("");
    $("#desired_rank").val("");
    $("#rank-result-exp").text("-");
    $("#rank-result-songs-easy").text("-");
    $("#rank-result-songs-normal").text("-");
    $("#rank-result-songs-hard").text("-");
    $("#rank-result-songs-expert").text("-");
    $("#rank-results-lp").text("-");
    $("#rank-results-fp").text("-");
}

function handle_gem_mode_select()
{
    var mode = $(this).val();
    if (mode === "DATE") {
        $("#gem-date-area").show();
        $("#gem-desired-gems-area").hide();
    } else if (mode === "GEMS") {
        $("#gem-date-area").hide();
        $("#gem-desired-gems-area").show();
    }
}

function is_muse_members_birthday(moment)
{
    var the_month = month(moment);
    var the_day = day(moment);

    var is_bday = false;
    var bday_name = "";
    if (the_month == 1 && the_day == 17) {
        is_bday = true;
        bday_name = "Hanayo";
    } else if (the_month == 3 && the_day == 15) {
        is_bday = true;
        bday_name = "Umi";
    } else if (the_month == 4 && the_day == 19) {
        is_bday = true;
        bday_name = "Maki";
    } else if (the_month == 6 && the_day == 9) {
        is_bday = true;
        bday_name = "Nozomi";
    } else if (the_month == 7 && the_day == 22) {
        is_bday = true;
        bday_name = "Nico";
    } else if (the_month == 8 && the_day == 3) {
        is_bday = true;
        bday_name = "Honoka";
    } else if (the_month == 9 && the_day == 12) {
        is_bday = true;
        bday_name = "Kotori";
    } else if (the_month == 10 && the_day == 21) {
        is_bday = true;
        bday_name = "Eli";
    } else if (the_month == 11 && the_day == 1) {
        is_bday = true;
        bday_name = "Rin";
    }
    return [is_bday, bday_name];
}

function is_gem_day(moment)
{
    var the_day = day(moment);
    // according the login bonus chart, gems are given out on days numbered 1,6,11,16,21,26,30
    if (the_day == 1 || the_day == 6 || the_day == 11 || the_day == 16 || the_day == 21 || the_day == 26 || the_day == 30) {
        return true;
    }
    return false;
}

// moment.js starts months/days/years at 0... weird...
function month(moment)
{
    return moment.month() + 1;
}

// moment.js uses date() not day()
function day(moment)
{
    return moment.date();
}

function year(moment)
{
    return moment.year();
}

function is_same_day(m1, m2)
{
    if (month(m1) == month(m2) && day(m1) == day(m2) && year(m1) == year(m2)) {
        return true;
    }
    return false;
}

function calculate_gems()
{
    var verbose = $("#gems_verbose").is(':checked');
    var current_gems = parseInt($("#current_gems").val());
    if (isNaN(current_gems)) {
        alert("Error: invalid number of current gems. Please check your input and try again.");
        return;
    }
    var mode = $("input[name=gem-mode]:checked").val();
    if (mode === "DATE")  {
        var target_date = $("#gem_desired_date").val();
        var target_date_object = moment(new Date(target_date));

        var now = moment(new Date());
        if (target_date_object.isBefore(now) || is_same_day(now, target_date_object)) {
            window.alert("Error: the date must be in the future.");
            return;
        }
        
        // ready to rock
        var resultsString = sprintf("Today is %02d/%02d/%04d and you currently have %d love gems.<br />(Assuming you collected any gems you got today and already counted those.)", month(now), day(now), year(now), current_gems);
        var verboseText = "";
        var gems = current_gems
        now = now.add(1, 'days')
        while (now.isBefore(target_date_object) || is_same_day(now, target_date_object)) {
            // is it a login bonus?
            if (is_gem_day(now)) {
                gems += 1;
            }
            
            // is it a birthday?
            var birthday_tuple = is_muse_members_birthday(now);
            var is_bday = birthday_tuple[0];
            var name = birthday_tuple[1];
            if (is_bday) {
                gems += 5;
            }
            
            // record verbose output if desired
            if (verbose) {
                if (is_gem_day(now) && is_bday) {
                    verboseText += sprintf("%02d/%02d/%04d: free gem as login bonus AND it's %s's birthday! You get 6 gems, which brings you to %d gems.\n", month(now), day(now), year(now), name, gems);
                }
                
                if (is_bday && !is_gem_day(now)) {
                    verboseText += sprintf("%02d/%02d/%04d: it's %s's birthday! You get 5 gems, which brings you to %d gems.\n", month(now), day(now), year(now), name, gems);
                }
                
                if (is_gem_day(now) && !is_bday) {
                    verboseText = verboseText + sprintf("%02d/%02d/%04d: free gem as login bonus, which brings you to %d gems.\n", month(now), day(now), year(now), gems);
                }
            }

            now = now.add(1, 'days')
        }

        resultsString = resultsString + sprintf("<br />You will have %d love gems on %02d/%02d/%04d. Good things come to those who wait!", gems, month(target_date_object), day(target_date_object), year(target_date_object));
        $("#gem-result-summary").html(resultsString);
        if (verbose) {
            $("#gem-result-verbose-area").val(verboseText);
            $("#gem-result-textarea").show();
        } else {
            $("#gem-result-verbose-area").val(verboseText);
            $("#gem-result-textarea").hide();
        }
    } else if (mode === "GEMS")  {
        var target_gems = parseInt($("#gem_desired_gems").val());
        if (isNaN(target_gems)) {
            window.alert("Error: you have entered an invalid (non-numeric) value. Please check your input and try again.");
            return;
        }

        var now = moment(new Date());
        var resultsString = sprintf("Today is %02d/%02d/%04d and you currently have %d love gems.<br />(Assuming you collected any gems you got today and already counted those.)", month(now), day(now), year(now), current_gems);
        var verboseText = "";
        
        var gems = current_gems
        
        while (gems < target_gems) {
            now = now.add(1, 'days')
            
            // is it a login bonus?
            if (is_gem_day(now)) {
                gems += 1;
            }
            
            // is it a birthday?
            var birthday_tuple = is_muse_members_birthday(now);
            var is_bday = birthday_tuple[0];
            var name = birthday_tuple[1];
            if (is_bday) {
                gems += 5;
            }
            
            // record verbose output if desired
            if (verbose) {
                if (is_gem_day(now) && is_bday) {
                    verboseText += sprintf("%02d/%02d/%04d: free gem as login bonus AND it's %s's birthday! You get 6 gems, which brings you to %d gems.\n", month(now), day(now), year(now), name, gems);
                }
                
                if (is_bday && !is_gem_day(now)) {
                    verboseText += sprintf("%02d/%02d/%04d: it's %s's birthday! You get 5 gems, which brings you to %d gems.\n", month(now), day(now), year(now), name, gems);
                }
                
                if (is_gem_day(now) && !is_bday) {
                    verboseText = verboseText + sprintf("%02d/%02d/%04d: free gem as login bonus, which brings you to %d gems.\n", month(now), day(now), year(now), gems);
                }
            }
        }

        resultsString = resultsString + sprintf("<br />You will have %d love gems on %02d/%02d/%04d. Good things come to those who wait!", gems, month(now), day(now), year(now));
        
        $("#gem-result-summary").html(resultsString);
        if (verbose) {
            $("#gem-result-verbose-area").val(verboseText);
            $("#gem-result-textarea").show();
        } else {
            $("#gem-result-verbose-area").val(verboseText);
            $("#gem-result-textarea").hide();
        }
    }
    
    $("#gem-calc-result-area").show();
}

function reset_gems()
{
    $("#gem-calc-result-area").hide();
    $("#gem-result-summary").text("-");
    $("#gem-desired-gems-area").hide();
    $("#gem-date-area").hide();
    $("#current_gems").val(0);
    var $radios = $('input:radio[name=gem-mode]');
    $radios.filter('[value=DATE]').prop('checked', true);
    $("#gem_desired_date").val("");
    $("#gem_desired_gems").val("");
    $('#gems_verbose').prop('checked', false);
    $("#gem-date-area").show();
}






















