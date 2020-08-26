# Data Directory
This directory is the default directory used by the simulation to store data. It may be moved elsewhere on the host system, but `config.js` must be updated accordingly.

Regular backups of this directory are reccomended.

The following subdirectories are required and should be populated:

| Subdirectory | Description |
|-|-|
| `data/default-assets/` | The asset set template. |
| `data/default-simulation/` | The simulation template. |

The following subdirectories will be created by the server if they do not already exist.

| Subdirectory | Description |
|-|-|
| `data/user/` | User assets and files. |
| `data/simulations/` | Live hosted simulations.  |
