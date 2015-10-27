#!/usr/bin/env python
# -*- coding: utf-8 -*-

import datetime
import time
import signal
import sys
import feedparser
import re
import htmlentitydefs
import subprocess
import curses
import logging
from HTMLParser import HTMLParser
from apscheduler.schedulers.blocking import BlockingScheduler

# http://www.leancrew.com/all-this/2013/03/combining-python-and-applescript/

##############################################################################################
# Interface with Applescript
##############################################################################################

def asrun(ascript):
  "Run the given AppleScript and return the standard output and error."

  osa = subprocess.Popen(['osascript', '-'],
                         stdin=subprocess.PIPE,
                         stdout=subprocess.PIPE)
  return osa.communicate(ascript)[0]

def asquote(astr):
  "Return the AppleScript equivalent of the given string."
  
  astr = astr.replace('"', '" & quote & "')
  return '"{}"'.format(astr)

##############################################################################################
# Extract text from HTML
##############################################################################################

class HTMLTextExtractor(HTMLParser):
    def __init__(self):
        HTMLParser.__init__(self)
        self.result = [ ]

    def handle_data(self, d):
        self.result.append(d)

    def handle_charref(self, number):
        codepoint = int(number[1:], 16) if number[0] in (u'x', u'X') else int(number)
        self.result.append(unichr(codepoint))

    def handle_entityref(self, name):
        codepoint = htmlentitydefs.name2codepoint[name]
        self.result.append(unichr(codepoint))

    def get_text(self):
        return u''.join(self.result)

def html_to_text(html):
    s = HTMLTextExtractor()
    s.feed(html)
    return s.get_text()

def get_first(iterable, default=None):
    if iterable:
        for item in iterable:
            return item
    return default

##############################################################################################
# Cleanup
##############################################################################################

def cleanup(signal, frame):
  global clock_job
  global poll_job
  global screen
  print "Exiting"
  clock_job.remove()
  poll_job.remove()
  curses.nocbreak()
  screen.keypad(False)
  curses.echo()
  curses.endwin()
  sys.exit(0)

##############################################################################################
# Utility
##############################################################################################

def send_to_line(string):
  # first sanitise it
  sanitised_string = string.replace('"', '\\"')
  split_string = sanitised_string.splitlines()
  script = """
  activate application "LINE"
  tell application "System Events"
  """
  for s in split_string:
    script += """
    keystroke "%s"
    keystroke return using control down
    """ % s
  script += """
    keystroke return
    delay 0.5
  end tell
  activate application "iTerm"
  """
  asrun(script)

##############################################################################################
# Clock
##############################################################################################

def clock():
  global screen
  global status
  global width
  global height
  global event_pending
  global in_event
  global event_name
  global event_duration
  global update_time
  global pct_done
  global t1
  global t1_diff
  global t2
  global t2_diff
  screen.addstr(0, 0, time.strftime("%d/%m/%Y %H:%M:%S"))
  if not event_pending and not in_event:
    screen.addstr(2, 0, " " * width)
    screen.addstr(2, 0, "status: idle")
    screen.addstr(4, 0, " " * width)
    screen.addstr(5, 0, " " * width)
    screen.addstr(6, 0, " " * width)
  elif event_pending:
    screen.addstr(2, 0, " " * width)
    screen.addstr(2, 0, "status: event pending")
    screen.addstr(4, 0, " " * width)
    screen.addstr(4, 0, "\"%s\"" % event_name)
    screen.addstr(5, 0, " " * width)
    screen.addstr(5, 0, "time period: %s" % event_duration)
    screen.addstr(6, 0, " " * width)
  elif in_event:
    screen.addstr(2, 0, " " * width)
    screen.addstr(2, 0, "status: event active")
    screen.addstr(4, 0, " " * width)
    screen.addstr(4, 0, "\"%s\" (%s complete)" % (event_name, pct_done))
    screen.addstr(5, 0, " " * width)
    screen.addstr(5, 0, "Tier 1: %d (%s)" % (t1, t1_diff))
    screen.addstr(6, 0, " " * width)
    screen.addstr(6, 0, "Tier 2: %d (%s)" % (t2, t2_diff))
  screen.refresh()

##############################################################################################
# Poll
##############################################################################################

def poll():
  global pattern
  global screen
  global width
  global height
  global event_pending
  global in_event
  global event_name
  global event_duration
  global update_time
  global pct_done
  global t1
  global t1_diff
  global t2
  global t2_diff

  screen.addstr(0, width-11, "updating...", curses.A_REVERSE)
  screen.refresh()
  d = feedparser.parse('https://script.google.com/macros/s/AKfycbwLQxnGfWEOq-aJwpbB68bCAHAu8_vChD8KIk-5h3glFMIZn-g/exec?654587648904794112')

  latest_entry = get_first(d.entries)
  desc_stripped = html_to_text(latest_entry["description"])

  string_to_send = ""

  # simplistic parsing
  # also a kinda dorky (and possibly broken) state machine
  # should really rewrite this eventually, but want to get it working first :P
  if u"New Event Announced":
  	if not event_pending:
	    # new event - split it
	    split_string = desc_stripped.splitlines()
	    # name is in item1, time is item2
	    event_name = split_string[1]
	    event_duration = split_string[2]
	    #print "New event detected:"
	    #print "Name: %s" % event_name
	    #print "Time period: %s" % event_time
	    string_to_send = """New Event Announcement!\n\n"%s"\n\n%s""" % (event_name, event_duration)
	    # don't keep yammering on until the event actually starts
	    event_pending = True
	    in_event = False
  elif u"ＦＩＮＡＬ" in desc_stripped and in_event:
    in_event = False
    string_to_send = """Event Has Ended!\n\n"%s" has ended.\n\nFinal numbers:\n\nTier 1: %d (diff: %s)\nTier 2: %d (diff: %s)\n\nAs of: %s\n\n""" % (event_name, t1, t1_diff, t2, t2_diff, update_time)
  else:
  	# if it's not final and not announce, then assume it's a bona fide event update
  	event_pending = False
  	in_event = True
  	results = re.findall(pattern, desc_stripped)
	if results:
	    (event_name, tier1_s, t1_diff, tier2_s, t2_diff, update_time, pct_done) = results[0]
	    t1 = int(tier1_s)
	    t2 = int(tier2_s)
	    string_to_send = """\n"%s" (%s complete)\n\nTier 1: %d (diff: %s)\nTier 2: %d (diff: %s)\n\nAs of: %s\n\n""" % (event_name, pct_done, t1, t1_diff, t2, t2_diff, update_time)
  if string_to_send:
    send_to_line(string_to_send)
  screen.addstr(0, width-11, "           ")
  screen.refresh()

##############################################################################################
# Start of main script
##############################################################################################

clock_job = None
poll_job = None
in_event = False
width = 0
height = 0
screen = curses.initscr()
(height, width) = screen.getmaxyx()
screen.clear()
screen.refresh()
event_pending = False
in_event = False
event_name = ""
event_duration = ""
update_time = ""
pct_done = 0
t1 = 0
t1_diff = ""
t2 = 0
t2_diff = ""
pattern = re.compile("^(.*) Tier 1: (\d+)pts（([+-]\d+)）.*Tier 2: (\d+)pts（([+-]\d+)）.*Time: (.*)（([\d\.%]+)）")

# disable logging
logging.basicConfig()

# setup signal handler
signal.signal(signal.SIGINT, cleanup)

# Start the scheduler
sched = BlockingScheduler()
sched.daemonic = False

# add some jobs
clock_job = sched.add_job(clock, 'interval', seconds=1)
# poll_job = sched.add_job(poll, 'interval', seconds=1)		# use for testing only! REALLY resource expensive
poll_job = sched.add_job(poll, 'interval', minutes=1)		# use for testing only!
# poll_job = sched.add_job(poll, 'cron', minute=40)			# use for production

# start the scheduler
sched.start()

# never exits (quit the script using control-c)