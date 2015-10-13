#!/usr/bin/env python
#
# Card level-up requirements (EXP) calculator
#
# Part of SIFTools <https://github.com/dburr/SIFTools/>
# By Donald Burr <dburr@DonaldBurr.com>
# Copyright (c) 2015 Donald Burr.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

import os
import sys
import getopt

# The EXP tables
# data from: http://www59.atwiki.jp/lovelive-sif/pages/32.html
# these have -1 as the first value because python arrays are 0-based and I am using <level> as the index
# and am too lazy to do <level-1> to account for the 0-based-ness :P
exp_tables = {
        "N": [-1,
            0, 6, 18, 28, 40, 51, 61, 72, 82, 93,
            104, 114, 124, 135, 145, 156, 165, 176, 187, 196,
            207, 217, 226, 238, 247, 257, 268, 277, 288, 297,
            308, 317, 328, 337, 348, 358, 367, 377, 388, 397],
        "R": [-1,
            0, 14, 31, 45, 55, 67, 76, 85, 94, 103,
            110, 119, 125, 134, 140, 148, 155, 161, 168, 174,
            181, 187, 193, 199, 206, 211, 217, 223, 228, 235,
            240, 245, 251, 256, 262, 267, 272, 277, 283, 288,
            292, 298, 303, 308, 313, 317, 323, 327, 332, 337,
            342, 346, 351, 356, 360, 365, 370, 374, 378, 383],
        "SR": [-1,
            0, 54, 98, 127, 150, 169, 187, 203, 218, 232,
            245, 257, 269, 281, 291, 302, 311, 322, 331, 340,
            349, 358, 366, 374, 383, 391, 398, 406, 413, 421,
            428, 435, 442, 449, 456, 462, 469, 475, 482, 488,
            494, 500, 507, 512, 518, 524, 530, 536, 541, 547,
            552, 558, 563, 568, 574, 579, 584, 590, 594, 600,
            605, 609, 615, 619, 625, 629, 634, 639, 643, 648,
            653, 657, 662, 667, 670, 676, 680, 684, 689, 693],
        "UR": [-1,
            0, 201, 294, 345, 382, 411, 438, 460, 481, 499,
            517, 532, 547, 561, 574, 587, 598, 611, 621, 631,
            642, 651, 661, 670, 679, 687, 696, 704, 712, 720,
            727, 734, 742, 749, 755, 763, 769, 775, 782, 788,
            794, 800, 806, 812, 818, 823, 829, 834, 840, 845,
            850, 856, 860, 866, 870, 875, 880, 885, 890, 894,
            899, 903, 908, 912, 917, 921, 925, 930, 933, 938,
            942, 946, 950, 954, 959, 961, 966, 970, 974, 977,
            981, 985, 988, 992, 996, 999, 1003, 1006, 1010, 1013,
            1017, 1020, 1024, 1027, 1030, 1034, 1037, 1040, 1043, 1047]}

rarities = ["N", "R", "SR", "UR"]

# max levels
# note we don't check whether the card is idolized or not
# we assume that the user knows what they're doing
level_caps = {r: 40 + 20*rarities.index(r) for r in rarities}

def check_level_cap(rarity, level):
    return level <= level_caps[rarity]

def check_valid_exp(rarity, level, exp):
    return (rarity in rarities and check_level_cap(rarity, level)
            and exp >= 0 and exp < exp_tables[rarity][level])

def calc_exp_for_level(rarity, starting_level, starting_exp, desired_level):
    # assumes that all values fed into it have been checked already
    required_exp = 0
    # desired_level+1 because python ranges are not inclusive on the RHS :P
    for level in range(starting_level+1, desired_level+1):
        required_exp += exp_tables[rarity][level]
        #print "WE ARE AT LEVEL %d and we need %d exp" % (level, required_exp)
    # subtract what we already have
    required_exp -= starting_exp
    # now tell the user
    print "To get a %s card from level %d (with %d EXP) to %d requires %d EXP." \
            % (rarity, starting_level, starting_exp, desired_level, required_exp)
    # calculate equivalent N cards (round up because we can't feed half of a card)
    number_of_n_cards = (required_exp // 100) + 1
    print "(the equivalent of about %d level-1 N cards fed to it)" % number_of_n_cards

def calc_level_for_exp(rarity, starting_level, starting_exp, level_for_exp):
    current_exp = starting_exp
    level_cap = level_caps[rarity]
    for level in range(starting_level+1, level_cap+1):
        current_exp += exp_tables[rarities][level]
        #print "WE ARE AT LEVEL %d and we need %d exp" % (level, required_exp)
        if current_exp > level_for_exp:
            level -= 1
            break
    if level > starting_level:
        if level == level_cap:
            max_level_string = " (MAX LEVEL!)"
        else:
            max_level_string = ""
        print "If you feed a %s card at level %d (with %d EXP) a total of %d EXP,\nit will end up at level %d.%s" % (rarity, starting_level, starting_exp, level_for_exp, level, max_level_string)
    else:
        print "Feeding %d EXP to a level %d %s card (with %d EXP) is not sufficient to\nlevel it up." % (level_for_exp, starting_level, rarity, starting_exp)

def usage():
    print "Usage: %s [options]" % os.path.basename(__file__)
    print "where [options] can be one or more of:"
    print "[-H | --help]            Print this help message"
    print "[-r | --rarity]          Card's rarity (REQUIRED, must be one of: N, R, SR, UR)"
    print "[-l | --starting-level]  Card's starting level (REQUIRED)"
    print "[-e | --starting-exp]    Card's starting EXP (optional, defaults to 0)"
    print ""
    print "Plus one of the following:"
    print ""
    print "TO CALCULATE AMOUNT OF EXP NEEDED TO GET TO A LEVEL:"
    print "[-L | --desired-level]   Card's desired level"
    print ""
    print "TO CALCULATE WHAT LEVEL A GIVEN AMOUNT OF XP WILL GET YOU TO:"
    print "[-x | --level-for-exp]   Calculate level that card will be at given EXP"

def main(argv):
    rarity = None
    starting_level = None
    desired_level = None
    level_for_exp = None
    starting_exp = 0
    try:                                
        options, remainder = getopt.getopt(argv, "Hr:l:e:L:x:", ["help", "rarity=", "starting-level=", "starting-exp=", "desired-level=", "level-for-exp="])
    except getopt.GetoptError:
        usage()
        sys.exit(2)                     
    for opt, arg in options:
        if opt in ('-H', '--help'):
            usage()
            sys.exit(0)
        elif opt in ('-r', '--rarity'):
            rarity = arg
        elif opt in ('-l', '--starting-level'):
            starting_level = int(arg)
        elif opt in ('-e', '--starting-exp'):
            starting_exp = int(arg)
        elif opt in ('-L', '--desired-level'):
            desired_level = int(arg)
        elif opt in ('-x', '--level-for-exp'):
            level_for_exp = int(arg)

    # first validate rarity
    if rarity is None:
        print "Error: must specify rarity"
        usage()
        sys.exit(1)
    else:
        # canonicalize it to uppercase
        rarity = rarity.upper()
        if rarity != "N" and rarity != "R" and rarity != "SR" and rarity != "UR":
            print "Error: invalid rarity specified (%s)" % rarity
            sys.exit(1)

    # now validate starting level
    if starting_level is None:
        print "Error: must specify starting level"
        usage()
        sys.exit(1)
    elif not check_level_cap(rarity, starting_level):
        print "Error: invalid starting level: %d" % starting_level
        sys.exit(1)

    # now validate starting level
    if desired_level is None and level_for_exp is None:
        print "Error: you must choose one of -L or -x."
        sys.exit(1)

    # determine mode
    if desired_level is not None:
        if not check_level_cap(rarity, desired_level):
            print "Error: invalid desired level: %d" % desired_level
            sys.exit(1)
            
        # now do start+desired levels make sense?
        if desired_level <= starting_level:
            print "Error: desired level must be greater than starting level"
            sys.exit(1)
        
        # finally check to see if exp makes sense (can't be >= the number of exp for the next level)
        if not check_valid_exp(rarity, desired_level, starting_exp):
            print "Error: invalid EXP (%d)" % starting_exp
            sys.exit(1)
            
        # all is well, go for it
        calc_exp_for_level(rarity, starting_level, starting_exp, desired_level)
    elif level_for_exp is not None:
        calc_level_for_exp(rarity, starting_level, starting_exp, level_for_exp)

### main script starts here

if __name__ == "__main__":
    main(sys.argv[1:])
