#!/usr/bin/env python
#
# Love Gem (aka loveca) calculator
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
import calendar
import datetime
from datetime import timedelta

def muse_birthday_member(month, day):
    bdays = {
        (1,17): "Hanayo",
        (3,15): "Umi",
        (4,19): "Maki",
        (6,9):  "Nozomi",
        (7,22): "Nico",
        (8,3):  "Honoka",
        (9,12): "Kotori",
        (10,21):"Eli",
        (11,1): "Rin" }
    if (month, day) in bdays:
        return bdays[month,day]
    else:
        return None

def is_gem_day(day):
    # according the login bonus chart, gems are given out on days numbered 1,6,11,16,21,26,30
    return day in (1, 6, 11, 16, 21, 26, 30)

def calc_gems(gems, target_date, desired_gems, verbose=False):
    now = datetime.datetime.now()
    print "Today is %02d/%02d/%04d and you currently have %d love gems." % (now.month, now.day, now.year, gems)
    print "(Assuming you collected any gems you got today and already counted those.)"
    while ((desired_gems is None or gems < desired_gems)
            and (target_date is None or now < target_date)):
        now += timedelta(days=1)
        if is_gem_day(now.day):
            gems += 1
        bday = muse_birthday_member(now.month, now.day)
        if bday is not None:
            gems += 5
        if verbose:
            if is_gem_day(now.day) and bday is not None:
                print "%02d/%02d/%04d: free gem as login bonus AND it's %s's birthday! You get 6 gems, which brings you to %d gems." % (now.month, now.day, now.year, bday, gems)
            elif is_gem_day(now.day):
                print "%02d/%02d/%04d: free gem as login bonus, which brings you to %d gems." % (now.month, now.day, now.year, gems)
            elif bday is not None:
                print "%02d/%02d/%04d: it's %s's birthday! You get 5 gems, which brings you to %d gems." % (now.month, now.day, now.year, bday, gems)
    print "You will have %d love gems on %02d/%02d/%04d. Good things come to those who wait!" % (gems, now.month, now.day, now.year)

def usage():
    print "Usage: %s [options]" % os.path.basename(__file__)
    print "where [options] can be one or more of:"
    print "[-H | --help]          Print this help message"
    print "[-g | --current-gems]  Current number of love gems (optional, default=0)"
    print "[-v | --verbose]       Verbosely print out when gems are collected"
    print ""
    print "Plus one of the following:"
    print ""
    print "TO CALCULATE NUMBER OF LOVE GEMS YOU'LL HAVE ON A GIVEN DATE:"
    print "[-d | --date]          Date to calculate gem count for (MM/DD/YYYY)"
    print ""
    print "TO CALCULATE HOW LONG UNTIL YOU WILL GET A CERTAIN NUMBER OF GEMS:"
    print "[-G | --desired-gems]  Calculate date when you will have that number of gems"

def main(argv):
    current_gems = 0
    target_date = None
    desired_gems = None
    verbose = False
    try:                                
        options, remainder = getopt.getopt(argv, "Hg:d:G:v", ["help", "current-gems=", "date=", "desired-gems=", "verbose"])
    except getopt.GetoptError:
        usage()
        sys.exit(2)                     
    for opt, arg in options:
        if opt in ('-H', '--help'):
            usage()
            sys.exit(0)
        elif opt in ('-g', '--current-gems'):
            current_gems = int(arg)
        elif opt in ('-d', '--date'):
            target_date = arg
        elif opt in ('-G', '--desired-gems'):
            desired_gems = int(arg)
        elif opt in ('-v', '--verbose'):
            verbose = True

    if target_date is None and desired_gems is None:
        print "Error: must specify either -d or -G."
        usage()
        sys.exit(2)

    # now do something
    if target_date is not None:
        # validate it
        try:
            target_date = datetime.datetime.strptime(target_date, '%m/%d/%Y')
        except ValueError:
            raise ValueError("Incorrect date format, should be MM/DD/YYYY")

    if desired_gems is not None and desired_gems <= current_gems:
        print "Error: desired gems must be greater than current gems"
        sys.exit(0)

    calc_gems(current_gems, target_date, desired_gems, verbose)

### main script starts here

if __name__ == "__main__":
    main(sys.argv[1:])
