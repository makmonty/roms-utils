# roms-utils

Scripts to filter and sort the emulator roms to keep the best version of each game.

Use it together with [hascheevos](https://github.com/meleu/hascheevos) to select also those with [RetroAchievements](https://retroachievements.org/).

## Usage:

The idea is having the best version of each game, with priority with those with cheevos. But you can use this tools in other ways.

1. Filter the preferred roms. **WARNING**: This command will delete the non preferred roms, so make a copy of all the roms first
```
node select-preferred-roms.js /path/to/all/roms
```

2. Filter the roms with cheevos
```
hascheevos.sh --copy-roms-to /path/to/roms/with/cheevos /path/to/all/roms
```

3. Put the games without cheevos together with those with cheevos
```
node select-missing-roms.js /path/to/roms/with/cheevos /path/to/all/roms