#!/usr/bin/env python
#
# Rank-up requirements (EXP) calculator
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
from math import floor

# algorithm from: http://decaf.kouhi.me/lovelive/index.php?title=Gameplay#Ranks
def calc(game_version, starting_rank, starting_exp, desired_rank):
    required_exp = 0
    for rank in range(starting_rank, desired_rank):
        required_exp_for_next_rank = round(34.45 * rank - 551)
        # account for half EXP on JP (only if rank < 100)
        if game_version == "JP" and rank < 100:
            required_exp_for_next_rank = required_exp_for_next_rank // 2
        #print "AT RANK %d NEED %d EXP" % (rank, required_exp_for_next_rank)
        required_exp = required_exp + required_exp_for_next_rank
    # account for exp we already have
    required_exp = required_exp - starting_exp
    print "To get from rank %d (with %d EXP) to rank %d on %s requires %d EXP." % (starting_rank, starting_exp, desired_rank, game_version, required_exp)
    print "Equivalent to playing the following number of songs of difficulty level:"
    # round up because you can't play half of a song (although you can play a song half-assedly :P and I often do :P)
    easy_count = (required_exp // 12) + 1
    normal_count = (required_exp // 26) + 1
    hard_count = (required_exp // 46) + 1
    ex_count = (required_exp // 83) + 1
    print "EASY (%d)  NORMAL (%d)  HARD (%d)  EXPERT (%d)" % (easy_count, normal_count, hard_count, ex_count)
    # calc LP
    LP = 25 + floor(min(desired_rank, 300) / 2) + floor(max(desired_rank - 300, 0) / 3)
    # calc friend slots
    friend_slots = 10 + floor(min(desired_rank, 50) / 5) + floor(max(desired_rank - 50, 0) / 10)
    # print the results
    print "At rank %d you will have %d LP and %d friend slots." % (desired_rank, LP, friend_slots)
     
def usage():
    print "Usage: %s [options]" % os.path.basename(__file__)
    print "where [options] can be one or more of:"
    print "[-H | --help]           Print this help message"
    print "[-g | --game-version]   Game version (one of: EN, JP, default EN)"
    print "[-r | --starting-rank]  Starting rank (REQUIRED, must be >= 34)"
    print "[-e | --starting-exp]   Starting EXP (optional, defaults to 0)"
    print "[-R | --desired-rank]   Desired rank (REQUIRED, must be >= starting-rank)"

def main(argv):
    rarity = None
    game_version = "EN"
    starting_rank = None
    desired_rank = None
    starting_exp = 0
    try:                                
        options, remainder = getopt.getopt(argv, "Hg:r:e:R:", ["help", "game-version=", "starting-rank=", "starting-exp=", "desired-rank="])
    except getopt.GetoptError:
        usage()
        sys.exit(2)                     
    for opt, arg in options:
        if opt in ('-H', '--help'):
            usage()
            sys.exit(0)
        elif opt in ('-g', '--game-version'):
            game_version = arg
        elif opt in ('-r', '--starting-rank'):
            starting_rank = int(arg)
        elif opt in ('-e', '--starting-exp'):
            starting_exp = int(arg)
        elif opt in ('-R', '--desired-rank'):
            desired_rank = int(arg)

    # first validate game version
    # canonicalize it to uppercase
    game_version = game_version.upper()
    if game_version != "EN" and game_version != "JP":
        print "Error: invalid game version (%s)" % game_version
        usage()
        sys.exit(1)

    # now validate levels
    if starting_rank is None:
        print "Error: must specify starting rank"
        usage()
        sys.exit(1)
    elif desired_rank is None:
        print "Error: must specify desired rank"
        usage()
        sys.exit(1)
    elif starting_rank < 34:
        print "Error: starting rank must be greater than or equal to 34"
        usage()
        sys.exit(1)
    elif desired_rank <= starting_rank:
        print "Error: desired rank must be greater than starting rank"
        usage()
        sys.exit(1)

    # now validate starting exp
    if starting_exp < 0:
        print "Error: invalid starting EXP (%d)" % starting_exp
        usage()
        sys.exit(1)
        
    # all is well, go for it
    calc(game_version, starting_rank, starting_exp, desired_rank)

### main script starts here

if __name__ == "__main__":
    main(sys.argv[1:])