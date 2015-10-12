# SIF Tools
A set of Pythons script to help players of [Love Live School Idol Festival](http://www.school-fes.klabgames.net)  
By Donald Burr <dburr@DonaldBurr.com>

## What is this?

This is a set of Python scripts to help players who play the mobile rhythm game [Love Live School Idol Festival](http://www.school-fes.klabgames.net).
Love Live School Idol Festival (SIF) is a free-to-play (with in-app purchases) rhythm and card collection game available for iOS and Android
and is based on the [Love Live!](http://www.lovelive-anime.jp/worldwide/) media franchise.

## Why did you write it?

Because I suck at math.

## How do I use it?

You will need the [Python](https://www.python.org) scripting language installed on your machine.

If you are on a Mac or a Linux machine, you almost certainly already have this. To check, run the command `python -V` at a shell prompt. If you get back something like `Python 2.7.10` then you do. If instead you see `command not found` then you will need to install Python. For Linux users, it is probably available in your distribution's package manager; for RedHat based systems (RedHat, CentOS, Fedora) try `sudo yum install python` and for Debian based distros (Debian, Ubuntu, Mint) try `sudo apt-get install python`. Mac users can install Python using [Homebrew](http://brew.sh); once Homebrew is installed, issue the command `brew install python` If you are on a Windows computer, you can download [Python for Windows](https://www.python.org/downloads/windows/) from the Python website.

## The Scripts

### Event Time Calculator

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