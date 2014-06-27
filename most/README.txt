This is source code for the MOST WRT plugin and also the generic example
WRT plugin for use with the 'Boilerplate.99' widget. 

To build the MOST plugin into it's RPM package form, ready to install: buildMost.sh

To install the built MOST RPM package: ermo.sh

To build the MOST plugin during development to check for build problems:
cd into most and run:
cmake .
make

The cmake need only be run on a freshly cloned depot, or when source files are added (in which case edit CMakeLists.txt SRCS_IMPL statement).

The most/ut dir contains Google Test based unit tests for the most/src code, and
the Makefile there can also build a stand alone non-Google Test app, ot.

Running ot should fully initialize the Optolyzer and MOST hardware, and result in 
audio if you have an audio input driving the Optolyzer audio input.



