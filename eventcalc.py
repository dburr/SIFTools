#!/usr/bin/env python
#
# https://docs.python.org/2/library/curses.html

import time
import datetime
import os
import sys
import getopt
import curses

scr = None
width = None
height = None

def center(string):
    global width
    global height
    string_length = len(string)
    horizontal_space = (width // 2) - (string_length // 2)
    print "%s%s" % ((" " * horizontal_space), string)

def getTerminalSize():
    import os
    env = os.environ
    def ioctl_GWINSZ(fd):
        try:
            import fcntl, termios, struct, os
            cr = struct.unpack('hh', fcntl.ioctl(fd, termios.TIOCGWINSZ,
        '1234'))
        except:
            return
        return cr
    cr = ioctl_GWINSZ(0) or ioctl_GWINSZ(1) or ioctl_GWINSZ(2)
    if not cr:
        try:
            fd = os.open(os.ctermid(), os.O_RDONLY)
            cr = ioctl_GWINSZ(fd)
            os.close(fd)
        except:
            pass
    if not cr:
        cr = (env.get('LINES', 25), env.get('COLUMNS', 80))

        ### Use get(key[, default]) instead of a try/catch
        #try:
        #    cr = (env['LINES'], env['COLUMNS'])
        #except:
        #    cr = (25, 80)
    return int(cr[1]), int(cr[0])

def calc(year, month, day, hour, minute, fullscreen = False):
    global height
    today = datetime.datetime.utcnow()
    today_hour = today.hour
    today_minute = today.minute
    today_seconds = today.second
    delta = datetime.datetime(year, month, day, hour, minute, 0) - today
    s = delta.total_seconds()
    days, days_remainder = divmod(s, 86400)
    days_hours, days_hours_remainder = divmod(days_remainder, 3600)
    days_minutes, days_seconds = divmod(days_hours_remainder, 60)
    hours, remainder = divmod(s, 3600)
    minutes, seconds = divmod(remainder, 60)
    if fullscreen:
        absolutely_unused_variable = os.system("clear") 
        number_of_blank_lines = (height // 2) - (8 // 2) + 1
        for x in range(1, number_of_blank_lines):
            print ""
        center("CURRENT TIME")
        center(today.strftime("%Y-%m-%d %H:%M:%S UTC"))
        print("")
        center("EVENT ENDS")
        center("%04d-%02d-%02d %02d:%02d:%02d UTC" % (year, month, day, hour, minute, 0))
        print("")
        center("TIME REMAINING")
        if s <= 0:
            center("*** EVENT HAS ENDED ***")
        else:
            center("%d:%02d:%02d (%dd%dh%dm)" % (hours, minutes, seconds, days, days_hours, days_minutes))
        skip_lines = number_of_blank_lines
        if today_minute == 35:
            skip_lines = skip_lines - 3
            print ""
            center("Check @sifen_trackbot for a tier update:")
            center("https://twitter.com/sifen_trackbot")
        if hours > 0 and hours < 6:
            skip_lines = skip_lines - 2
            print ""
            center("*** THE RUSH IS ON!!! ***")
        if today_hour == 0 and today_minute == 0:
            skip_lines = skip_lines - 2
            print ""
            if today_seconds % 2 == 0:
                print ""
            else:
                absolutely_unused_variable = os.system("afplay /System/Library/Sounds/Glass.aiff 2>/dev/null &")
                center("*** Be sure and claim your daily Login Gift ***")
        for x in range(1, skip_lines):
            print ""
    else:
        print "  Current time: %s" % today.strftime("%Y-%m-%d %H:%M:%S UTC")
        print "    Event ends: %04d-%02d-%02d %02d:%02d:%02d UTC" % (year, month, day, hour, minute, 0)
        if s <= 0:
            print "Time remaining: *** EVENT HAS ENDED ***"
        else:
            print "Time remaining: %d:%02d:%02d (%dd%dh%dm)" % (hours, minutes, seconds, days, days_hours, days_minutes)
            if hours < 6:
                print "*** THE RUSH IS ON!!! ***"

def usage():
    print "Usage: %s [options]" % os.path.basename(__file__)
    print "where [options] can be one or more of:"
    print "     [-H | --help]       Print this help message"
    print "     [-y | --year]       Event year (optional, defaults to current year)"
    print "     [-M | --month]      Event month (optional, defaults to current month)"
    print "     [-d | --day]        Event day (REQUIRED)"
    print "     [-h | --hour]       Event hour (REQUIRED)"
    print "     [-m | --minute]     Event minute (optional, defaults to 0)"
    print "     [-c | --continuous] Continuously updating display (defaults to off)"
    print "Note: event time should be specified in UTC."

def main(argv):      
    global scr
    global width
    global height                   
    year = datetime.datetime.utcnow().year
    month = datetime.datetime.utcnow().month
    day = None
    hour = None
    minute = 0
    continuous_mode = False
    #scr = curses.initscr()
    (width, height) = getTerminalSize()
    #(width, height) = getmaxyx()
    try:                                
        options, remainder = getopt.getopt(argv, "Hy:M:d:h:m:c", ["help", "year=", "month=", "day=", "hour=", "minute=", "continuous"])
    except getopt.GetoptError:
        usage()
        sys.exit(2)                     
    for opt, arg in options:
        if opt in ('-H', '--help'):
            usage()
            sys.exit(0)
        elif opt in ('-y', '--year'):
            year = int(arg)
        elif opt in ('-M', '--month'):
            month = int(arg)
        elif opt in ('-d', '--day'):
            day = int(arg)
        elif opt in ('-h', '--hour'):
            hour = int(arg)
        elif opt in ('-m', '--minute'):
            minute = int(arg)
        elif opt in ('-c', '--continuous'):
            continuous_mode = True
            
    if day is None:
        print "Error: must specify day"
        usage()
        sys.exit(1)
    elif hour is None:
        print "Error: must specify hour"
        usage()
        sys.exit(1)
    else:
        if continuous_mode:
            while True:
                absolutely_unused_variable = os.system("clear") 
                calc(year, month, day, hour, minute, True)
                time.sleep(1) 
        else:
            calc(year, month, day, hour, minute)

### main script starts here

if __name__ == "__main__":
    main(sys.argv[1:])