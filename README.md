# roms-utils

Scripts to filter and sort the emulator roms to keep the best version of each game.

Use it together with [hascheevos](https://github.com/meleu/hascheevos) to select also those with [RetroAchievements](https://retroachievements.org/).

## Usage

The idea is having the best version of each game, with priority with those with cheevos.

Filter the preferred roms. **WARNING**: This command will delete the non preferred roms, so make a copy of all the roms first
```
node select-preferred-roms.js /path/to/all/roms <options>
```

## Options

* **deleteNonPreferred**: _boolean_. If set, it will delete the files which are not the preferred version of each rom.
* **copyPreferredToPath**: _string_. Path to copy the preferred files.
* **recursive**: _boolean_. If directories are found, go into them too.
* **dryRun**: _boolean_. Do not perform any change. Used to check the output before doing anything.
* **verbose**: _boolean_. Show additional output.

## TODO

* Script to normalize file names.
