############
This is source code for the for the Crosswalk version of the MOST plugin.

To build the MOST plugin into it's RPM package, ready to install: 
sudo gbs build --include-all --spec agl_plugin_suite.spec -A i586

To install the built MOST RPM package:  rpm -ivh agl_plugin_suite-0.0.1-1.i586.rpm

The most/ut dir contains Google Test based unit tests for the most/src code, and
the Makefile there can also build a stand alone non-Google Test app, ot.

Running ot should fully initialize the Optolyzer and MOST hardware, and result in 
audio if you have an audio input driving the Optolyzer audio input.

On an NDIS, using the COM1 port will map to /dev/ttyS0 which the MOST plugin uses by default.
If you need to use a different tty device, create the file /etc/most/conf and in it put a line:
MOST_SERIAL <dev path>

For example:
MOST_SERIAL  /dev/ttyUSB0



