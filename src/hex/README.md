# HexFiend Templates

The MacOS hex editor [HexFiend](https://github.com/HexFiend/HexFiend) was invaluable during the development of this parser. Critically, it allows users to write templates in an extended version of TCL to tell the app about a given file format's internal structures.

The first however-many rounds of iteration on both LJArchive and Semagic support consisted of poking around with HexFiend and tweaking the .tcl templates in realtime until things lined up.
