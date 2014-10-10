This is the initial repo for all projects combined

_common's and HomeScreen added.

Makefiles should work for HomeScreen but spec files need to be updated so an rpm build won't work

This repository contains the POC applications and extensions available
for AGL Application Suite.

To build, use:

	> gbs build -A i586

-- Applications

All applications make use of the "common" repository for artifacts 
common across every POC.

-- Extensions

All extensions are identified with the _ext suffix of their directory
name. 

extension_common is a static library that must be linked into all
extensions.

extension_tools contains the tool to create the XWalk boilerplate code from
the javascript template

