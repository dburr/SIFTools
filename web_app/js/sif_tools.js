// SIFTools <https://github.com/dburr/SIFTools/>
// By Donald Burr <dburr@DonaldBurr.com>
// Copyright (c) 2015 Donald Burr.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// <a class="twitter-timeline" data-dnt="true" href="https://twitter.com/sifen_trackbot" data-widget-id="654587648904794112">Tweets by @sifen_trackbot</a> <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>

// Set to 0 to disable debugging, 1+ to enable debugging (higher = more verbose)
var DEBUG_LEVEL = 0;

// EXP tables
var exp_table_n = [-1, 0, 6, 18, 28, 40, 51, 61, 72, 82, 93, 104, 114, 124, 135, 145, 156, 165, 176, 187, 196, 207, 217, 226, 238, 247, 257, 268, 277, 288, 297, 308, 317, 328, 337, 348, 358, 367, 377, 388, 397];
var exp_table_r = [-1, 0, 14, 31, 45, 55, 67, 76, 85, 94, 103, 110, 119, 125, 134, 140, 148, 155, 161, 168, 174, 181, 187, 193, 199, 206, 211, 217, 223, 228, 235, 240, 245, 251, 256, 262, 267, 272, 277, 283, 288, 292, 298, 303, 308, 313, 317, 323, 327, 332, 337, 342, 346, 351, 356, 360, 365, 370, 374, 378, 383];
var exp_table_sr = [-1, 0, 54, 98, 127, 150, 169, 187, 203, 218, 232, 245, 257, 269, 281, 291, 302, 311, 322, 331, 340, 349, 358, 366, 374, 383, 391, 398, 406, 413, 421, 428, 435, 442, 449, 456, 462, 469, 475, 482, 488, 494, 500, 507, 512, 518, 524, 530, 536, 541, 547, 552, 558, 563, 568, 574, 579, 584, 590, 594, 600, 605, 609, 615, 619, 625, 629, 634, 639, 643, 648, 653, 657, 662, 667, 670, 676, 680, 684, 689, 693];
var exp_table_ur = [-1, 0, 201, 294, 345, 382, 411, 438, 460, 481, 499, 517, 532, 547, 561, 574, 587, 598, 611, 621, 631, 642, 651, 661, 670, 679, 687, 696, 704, 712, 720, 727, 734, 742, 749, 755, 763, 769, 775, 782, 788, 794, 800, 806, 812, 818, 823, 829, 834, 840, 845, 850, 856, 860, 866, 870, 875, 880, 885, 890, 894, 899, 903, 908, 912, 917, 921, 925, 930, 933, 938, 942, 946, 950, 954, 959, 961, 966, 970, 974, 977, 981, 985, 988, 992, 996, 999, 1003, 1006, 1010, 1013, 1017, 1020, 1024, 1027, 1030, 1034, 1037, 1040, 1043, 1047];

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
    window.timerInterval = 0;
});

// Set up UI elements (tabs, buttons, etc.)
function setup_ui_elements()
{
	LOG(1, "setup_ui_elements()");

	$( "#tabs" ).tabs({
		active: 0,
		create: function(event, ui) {
			var theTab = ui.tab.index();
			LOG(3, "INIT tab created " + theTab);
			set_up_tab(theTab);
		},
		activate: function(event, ui) {
			var theTab = ui.newTab.index();
			LOG(3, "INIT tab selected " + theTab);
			set_up_tab(theTab);
		}
	});

    // set up date/time pickers
    $( "#gem_desired_date" ).datepicker();
    $( "#event_end_date" ).datepicker();
    $( "#event_end_time" ).timepicker();
    
	// set up buttons
	["calculate-rank", "reset-rank", "calculate-gems", "reset-gems", "calculate-card", "reset-card", "start-stop-timer", "clear-timer"].forEach(function(entry) {
		var selector = "#button-" + entry;
		LOG(1, "setting up " + selector);
		$(selector).button();
	});
    
    // hide result divs
    ["rank-calc-result-area", "gem-calc-result-area", "card-calc-result-area"].forEach(function(entry) {
        var selector = "#" + entry;
        LOG(1, "setting up " + selector);
        $(selector).hide();
    });
    
    // set up radio button listeners
    $("input[name=gem-mode]").change(handle_gem_mode_select);
    $("input[name=card-mode]").change(handle_card_mode_select);
    
    // hide non-selected option divs
    ["gem-desired-gems-area", "card-exp-area"].forEach(function(entry) {
        var selector = "#" + entry;
        LOG(1, "setting up " + selector);
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
    $("#button-calculate-card").click(function(evt) {
        calculate_card();
    });
    $("#button-reset-card").click(function(evt) {
        reset_card();
    });
    $("#button-start-stop-timer").click(function(evt) {
        start_stop_timer();
    });
    $("#button-clear-timer").click(function(evt) {
        clear_timer();
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
    var game_version = $("#game_version").val();
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

function handle_card_mode_select()
{
    var mode = $(this).val();
    if (mode === "LEVEL") {
        $("#card-level-area").show();
        $("#card-exp-area").hide();
    } else if (mode === "EXP") {
        $("#card-level-area").hide();
        $("#card-exp-area").show();
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

function hour(moment)
{
    return moment.hour();
}

function minute(moment)
{
    return moment.minute();
}

function second(moment)
{
    return moment.second();
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

function get_level_cap(rarity)
{
    if (rarity === "N") {
        return 40;
    } else if (rarity === "R") {
        return 60;
    } else if (rarity === "SR") {
        return 80;
    } else if (rarity === "UR") {
        return 100;
    }
    // bogus return value, should never reach here
    return -1;
}

function is_valid_level(rarity, level)
{
    var return_value = false;
    if (level >= 1) {
        return_value = (level <= get_level_cap(rarity));
    }
    return return_value;
}

function is_valid_exp(rarity, level, exp)
{
    var return_value = false;
    if (rarity === "N" && is_valid_level(rarity, level)) {
        return_value = (exp >= 0 && exp < exp_table_n[level+1]);
    } else if (rarity === "R" && is_valid_level(rarity, level)) {
        return_value = (exp >= 0 && exp < exp_table_r[level+1]);
    } else if (rarity === "SR" && is_valid_level(rarity, level+1)) {
        return_value = (exp >= 0 && exp < exp_table_sr[level+1]);
    } else if (rarity === "UR" && is_valid_level(rarity, level)) {
        return_value = (exp >= 0 && exp < exp_table_ur[level+1]);
    }
    return return_value
}

function calculate_card()
{
    var current_level = parseInt($("#card_current_level").val());
    var current_exp = parseInt($("#card_current_exp").val());
    var rarity = $("#card_rarity").val();
    
    if (isNaN(current_level) || !is_valid_level(rarity, current_level)) {
        alert("Error: invalid level. Please check your input and try again.");
        return;
    }
    if (isNaN(current_exp) || !is_valid_exp(rarity, current_level, current_exp)) {
        alert("Error: invalid EXP. Please check your input and try again.");
        return;
    }

    var mode = $("input[name=card-mode]:checked").val();
    if (mode === "LEVEL")  {
        var target_level = parseInt($("#card_desired_level").val());
        if (isNaN(target_level) || !is_valid_level(rarity, target_level)) {
            window.alert("Error: the desired level is invalid.");
            return;
        }
                
        // ready to rock
        var required_exp = 0;
        var resultsString = "";
        for (level = current_level+1; level <= target_level; level++) {
            if (rarity === "N") {
                required_exp += exp_table_n[level];
            } else if (rarity === "R") {
                required_exp += exp_table_r[level];
            } else if (rarity === "SR") {
                required_exp += exp_table_sr[level];
            } else if (rarity === "UR") {
                required_exp += exp_table_ur[level];
            }
        }
        
        // subtract what we have
        required_exp -= current_exp;
        
        var resultString = sprintf("To get a %s card from level %d (with %d EXP) to %d requires %d EXP.<br />", rarity, current_level, current_exp, target_level, required_exp);
        
        // calculate equiv N cards
        var number_of_n_cards = Math.round(required_exp / 100) + 1;
        resultString += sprintf("(the equivalent of about %d level-1 N cards fed to it)", number_of_n_cards);
        
        // output the result
        $("#card-result-summary").html(resultString);
    } else if (mode === "EXP")  {
        var exp_to_feed = parseInt($("#card_feed_exp").val());
        if (isNaN(exp_to_feed)) {
            window.alert("Error: you have entered an invalid (non-numeric) value. Please check your input and try again.");
            return;
        }
        
        // ready to rock
        var resultsString = "FOO";

        // XXX do some calculating
        var exp_tally = current_exp;
        var level = 0;
        for (level = current_level+1; level <= get_level_cap(rarity); level++) {
            if (rarity === "N") {
                exp_tally += exp_table_n[level];
            } else if (rarity === "R") {
                exp_tally += exp_table_r[level];
            } else if (rarity === "SR") {
                exp_tally += exp_table_sr[level];
            } else if (rarity === "UR") {
                exp_tally += exp_table_ur[level];
            }
            if (exp_tally > exp_to_feed) {
                break;
            }
        }

        level--;
        var resultString = sprintf("If you feed a %s card at level %d (with %d EXP) a total of %d EXP,<br />it will end up at level %d.%s", rarity, current_level, current_exp, exp_to_feed, level, (level == get_level_cap(rarity) ? " (MAX LEVEL!)" : ""));
        
        // output the result
        $("#card-result-summary").html(resultString);
    }
    
    $("#card-calc-result-area").show();
}

function reset_card()
{
    $("#card-calc-result-area").hide();
    $("#card-result-summary").text("-");
    $("#card-level-area").hide();
    $("#card-exp-area").hide();
    $("#card_current_level").val(0);
    $("#card_current_exp").val(0);
    var $radios = $('input:radio[name=card-mode]');
    $radios.filter('[value=LEVEL]').prop('checked', true);
    $("#card_desired_level").val("");
    $("#card_feed_exp").val("");
    $("#card-level-area").show();
}

function start_stop_timer()
{
    if (window.timerInterval != 0) {
        // stop it
        clearInterval(window.timerInterval);
        window.timerInterval = 0;
        $("#button-start-stop-timer span").text("Start Timer");
    } else {
        // 2013-02-08 09:30         # An hour and minute time part
        var dateString = $("#event_end_date").val() + " " + $("#event_end_time").val() + "Z";
        window.the_end = moment(dateString, "MM/DD/YYYY HH:mmZ");
        window.timerInterval = setInterval(run_timer, 1000);
        $("#button-start-stop-timer span").text("Stop Timer");
        // run the first update ourselves, so that it doesn't stay blank until the timer kicks in
        window.immediately_refresh_tier_cutoffs = true;
        run_timer();
    }
}

function run_timer()
{
    var now = moment(new Date());
    var end = window.the_end;
    var string = "<h1><b>CURRENT TIME</b></h1><h2>" + now.utc().format("MM/DD/YYYY HH:mm:ss") + " UTC</h2><h1>EVENT ENDS:</h1><h2>" + end.utc().format("MM/DD/YYYY HH:mm:ss") + " UTC</h2>";
    if (now.isBefore(end))  {
        var ms = end.diff(now.utc());
        var t = moment.duration(ms).asMilliseconds();
        var seconds = Math.floor( (t/1000) % 60 );
        var minutes = Math.floor( (t/1000/60) % 60 );
        var hours = Math.floor( (t/(1000*60*60)) % 24 );
        var days = Math.floor( t/(1000*60*60*24) );
        var total_hours = (days * 24) + hours;
        
        var time_till = "<h2>";
        
        if (total_hours >= 24) {
            time_till += sprintf("%d hours<br />", total_hours);
        }
        time_till += "(";
        if (days >= 1) {
            time_till += sprintf("%d day%s ", days, (days > 1 ? "s" : ""));
        }
        if (hours >= 1) {
            time_till += sprintf("%d hour%s ", hours, (hours > 1 ? "s" : ""));
        }
        time_till += sprintf("%d minute%s %d second%s)</h2>", minutes, (minutes > 1? "s" : ""), seconds, (seconds > 1 ? "s" : ""));
        // d.asDays() + " days " + d.asHours() + moment.utc(ms).format(":mm:ss");

        // var time_till = moment.utc(end.diff(now)).format("HH:mm:ss");//.format("HH:mm:ss");
        string += "<h1>TIME REMAINING:</h1><h2>" + time_till + "</H2>";
    } else {
        string += "<h1>EVENT IS OVER</h1>";
    }
    $("#timer_output_area").html(string);
    
    // dumb ass way to fetch and display @sifen_trackbot tier cutoff tweets hourly
    // using this twitter fetcher: http://jasonmayes.com/projects/twitterApi/#sthash.budgYosd.dpbs
    var config5 = {
      "id": '654587648904794112',
      "domId": '',
      "maxTweets": 1,
      "enableLinks": false,
      "showUser": true,
      "showTime": true,
      "dateFunction": '',
      "showRetweet": false,
      "customCallback": handleTweets,
      "showInteraction": false
    };

    function handleTweets(tweets) {
        if (tweets.length > 0) {
            var tweet = tweets[0];
            // parse it
            console.log("GOT TWEET: " + tweet);
            // this is kinda crappy
            var splitTweet = tweet.split("\n");
            // this is VERY LAZY
            // we always assume Tier1 is on line 11, Tier2 is line 12 and Date is 13
            var tier1 = splitTweet[11];
            var tier2 = splitTweet[12];
            var updateTime = splitTweet[13];
            $("#tier_info_output_area").html("<h2>Latest Tier Cutoffs as of " + updateTime + ":<br />" + tier1 + "<br />" + tier2 + "</h2>");
        }
    }

    // @sifen_trackbot updates come out at 36 minutes past the hour, fetch them at 37 minutes to allow for some slop
    if (minute(now) == 37 || window.immediately_refresh_tier_cutoffs)  {
        $("#tier_info_output_area").html("<h2>Updating tier cutoff data, please wait...</h2>");
        twitterFetcher.fetch(config5);
        window.immediately_refresh_tier_cutoffs = false;
    }
}

function clear_timer()
{
    $("#timer_output_area").html("<h1>Timer Not Running</h1>");
}















