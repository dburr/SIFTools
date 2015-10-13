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
    var current_rank = $("#current_rank").val();
    var current_exp = $("#current_exp").val();
    var desired_rank = $("#desired_rank").val();
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

function calculate_gems()
{
    var verbose = $("#gems_verbose").is(':checked');
    var current_gems = $("#current_gems").val();
    if (isNaN(current_gems)) {
        alert("Error: invalid number of current gems. Please check your input and try again.");
        return;
    }
    var mode = $("input[name=gem-mode]:checked").val();
    if (mode === "DATE")  {
        var target_date = $("#gem_desired_date").val();
        if (verbose) {
            $("#gem-result-summary").text("Insert verbose results here");
            $("#gem-result-verbose-area").val("VERBOSITY IS GOOD!");
            $("#gem-result-textarea").show();
        } else {
            $("#gem-result-summary").text("Insert non-verbose results here");
            $("#gem-result-verbose-area").val("VERBOSITY IS BAD!");
            $("#gem-result-textarea").hide();
        }
    } else if (mode === "GEMS")  {
        if (verbose) {
            $("#gem-result-summary").text("Insert verbose results here");
            $("#gem-result-verbose-area").val("VERBOSITY IS GOOD!");
            $("#gem-result-textarea").show();
        } else {
            $("#gem-result-summary").text("Insert non-verbose results here");
            $("#gem-result-verbose-area").val("VERBOSITY IS BAD!");
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






















