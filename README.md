# SIF Tools
A set of Pythons script to help players of [Love Live School Idol Festival](http://www.school-fes.klabgames.net)  
By Donald Burr <dburr@DonaldBurr.com>

## What is this?

This is a set of Python scripts to help players who play the mobile rhythm game [Love Live School Idol Festival](http://www.school-fes.klabgames.net).
Love Live School Idol Festival (SIF) is a free-to-play (with in-app purchases) rhythm and card collection game available for iOS and Android
and is based on the [Love Live!](http://www.lovelive-anime.jp/worldwide/) media franchise.

These scripts are licensed under the [MIT License](LICENSE).

## Why did you write it?

Because I suck at math.

## How do I use it?

You will need the [Python](https://www.python.org) scripting language installed on your machine. If you are on a Mac or a Linux machine, you almost certainly already have this. To check, run the command `python -V` at a shell prompt. If you get back something like `Python 2.7.10` then you do. If instead you see `command not found` then you will need to install Python. For Linux users, it is probably available in your distribution's package manager; for RedHat based systems (RedHat, CentOS, Fedora) try `sudo yum install python` and for Debian based distros (Debian, Ubuntu, Mint) try `sudo apt-get install python`. Mac users can install Python using [Homebrew](http://brew.sh); once Homebrew is installed, issue the command `brew install python` If you are on a Windows computer, you can download [Python for Windows](https://www.python.org/downloads/windows/) from the Python website.

## The Scripts

### Event Time-Remaining Calculator

```
Usage: eventcalc.py [options]
where [options] can be one or more of:
     [-H | --help]       Print this help message
     [-y | --year]       Event year (optional, defaults to current year)
     [-M | --month]      Event month (optional, defaults to current month)
     [-d | --day]        Event day (REQUIRED)
     [-h | --hour]       Event hour (REQUIRED)
     [-m | --minute]     Event minute (optional, defaults to 0)
     [-c | --continuous] Continuously updating display (defaults to off)
Note: event time should be specified in UTC.
```

Example: to calculate the time remaining for an event that ends on October 22 at 8 AM UTC:

```
$ eventcalc.py -M 10 -d 22 -h 8
  Current time: 2015-10-12 11:21:37 UTC
    Event ends: 2015-10-22 08:00:00 UTC
Time remaining: 236:38:22 (9d20h38m)
```

You can add the `-c` flag to create a continuously-updating display. This is quite handy to leave running up in the corner of your screen while an event is in progress.

Note that this script has some commands in it specific to Mac OS X systems and may need to be slightly modified if you're on a different type of system (Windows or Linux.) I have marked those portions of code with comments.

### Card Level-up Calculator

```
Usage: cardlevelcalc.py [options]
where [options] can be one or more of:
[-H | --help]            Print this help message
[-r | --rarity]          Card's rarity (REQUIRED, must be one of: N, R, SR, UR)
[-l | --starting-level]  Card's starting level (REQUIRED)
[-e | --starting-exp]    Card's starting EXP (optional, defaults to 0)

Plus one of the following:

TO CALCULATE AMOUNT OF EXP NEEDED TO GET TO A LEVEL:
[-L | --desired-level]   Card's desired level

TO CALCULATE WHAT LEVEL A GIVEN AMOUNT OF XP WILL GET YOU TO:
[-x | --level-for-exp]   Calculate level that card will be at given EXP
```

Example: Find out how much EXP you need to level up an SR card from level 20 (and 270 EXP) to level 40:

```
$ cardlevelcalc.py -r sr -l 20 -e 270 -L 40
To get a SR card from level 20 (with 270 EXP) to 40 requires 8175 EXP.
(the equivalent of about 82 level-1 N cards fed to it)
```

Example: you have 2100 EXP's worth of cards to feed to your level-38 UR (with 502 EXP.) What level will that get you to?

```
$ cardlevelcalc.py -r ur -l 38 -e 502 -x 2100
If you feed a UR card at level 38 (with 502 EXP) a total of 2100 EXP,
it will end up at level 40.
```

### Rank Up Calculator

```
Usage: rankcalc.py [options]
where [options] can be one or more of:
[-H | --help]           Print this help message
[-g | --game-version]   Game version (one of: EN, JP, default EN)
[-r | --starting-rank]  Starting rank (REQUIRED, must be >= 34)
[-e | --starting-exp]   Starting EXP (optional, defaults to 0)
[-R | --desired-rank]   Desired rank (REQUIRED, must be >= starting-rank)
```

Example: you are at rank 68 with 283 EXP. What will you need to get to rank 80?

```
$ rankcalc.py -g en -r 68 -e 283 -R 80
To get from rank 68 (with 283 EXP) to rank 80 on EN requires 23491 EXP.
Equivalent to playing the following number of songs of difficulty level:
EASY (1958)  NORMAL (904)  HARD (511)  EXPERT (284)
At rank 80 you will have 65 LP and 23 friend slots.
```

## Bugs? Need help? Or want to chat?

I wouldn't be surprised if there are any bugs, and/or if I got some of the calculations wrong. If you have any bug reports (or better yet, bug fixes!) or if you need help using these (or if you just want to say hi and/or chat) please feel free to send them my way. Create a pull request on Github or just drop me an email.

Email: <dburr@DonaldBurr.com>  
Twitter: [@dburr](https://twitter.com/dburr) (my personal Twitter account), [@otakunopodcast](https://twitter.com/otakunopodcast) (where I do most of my SIF-related tweeting)  
Reddit: [/u/otakunopodcast](https://www.reddit.com/user/otakunopodcast/)  
School Idol Tomodachi: [dburr](http://schoolido.lu/user/dburr/)  
SIF: /u/dburr (the "u" should be the Greek "mu", aka the u's symbol; for some reason my editor won't let me type it in).  
EN: 767074992  
JP: 623355455  
Please feel free to send a friend request; if I have space on my friends list I'll be glad to add you. (Especially on JP... I don't know anyone over there... so lonely...)