#!/bin/bash
cmake_clean() {
    echo ""
    echo "********** cleaning $1 **********"
    builddir=$1/build
    cd $builddir > /dev/null 2>&1
    if [ $? -eq 0 ];
    then
        make clean
        rm -rf ./*
    fi
    return
}

clean_all(){
    echo ""
    echo "********** clean all **********"
    make clean
    for component in $components
    do
        cd $topdir
        cmake_clean $component
    done
    echo ""
    echo "********** cleaning DONE **********"
    cd $topdir
    return 0
}

cmake_build(){
    echo ""
    echo "********** building $1 **********"
    builddir=$1/build
    mkdir -p $builddir
    cd $builddir
    cmake ..
    retval=$?
    if [ $retval -ne 0 ];
    then 
        return $retval
    fi
    make
    retval=$?
    return $retval
}

build_all(){
    echo ""
    echo "********** build all **********"
    make all
    retval=$?
    if [ $retval -ne 0 ];
    then
        return $retval
    fi
    for component in $components
    do
        cd $topdir
        cmake_build $component
        retval=$?
        if [ $retval -ne 0 ];
        then 
            return $retval
        fi
    done
    cd $topdir
    return $retval
}

topdir=`pwd`

if [ -z "$IVIPOC_HOME" ]; then
    echo "Setting IVIPOC_HOME to: "
    dirname=$(dirname $(readlink -f $0))
    cd $dirname/..
    export IVIPOC_HOME=`pwd`
    echo "$IVIPOC_HOME"
    cd $topdir
fi

mkdir -p ${IVIPOC_HOME}/native/include
mkdir -p ${IVIPOC_HOME}/native/lib

#export _DEBUG=1
#export TEST_CODECOVERAGE=1
export STRIP=strip

components="
    automotive-message-broker/plugins/ivipocbase 
    automotive-message-broker/plugins/cansimplugin 
    automotive-message-broker/plugins/cangenplugin"
retval=
case $1 in
clean)
    clean_all
    retval=$?
;;
*)
    clean_all
    build_all
    retval=$?
esac

cd $topdir
exit $retval
