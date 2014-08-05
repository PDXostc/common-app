#These lines remove installed wigits before installing the new ones.
#installing wigits over existing will case problems.
xwalkctl | egrep -e "Home Screen" | awk '{print $1}' | xargs --no-run-if-empty xwalkctl -u
xwalkctl | egrep -e "Boilerplate" | awk '{print $1}' | xargs --no-run-if-empty xwalkctl -u
xwalkctl | egrep -e "Browser" | awk '{print $1}' | xargs --no-run-if-empty xwalkctl -u
xwalkctl | egrep -e "News" | awk '{print $1}' | xargs --no-run-if-empty xwalkctl -u
#These lines install the wigits.
xwalkctl -i /home/app/HomeScreen.wgt
xwalkctl -i /home/app/Browser.wgt
xwalkctl -i /home/app/Boilerplate.wgt
xwalkctl -i /home/app/News.wgt
