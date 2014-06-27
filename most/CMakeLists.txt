CMAKE_MINIMUM_REQUIRED(VERSION 2.8)
PROJECT(wrt-plugin-ivi)

SET(CMAKE_INSTALL_PREFIX "/usr")

# -----------------------------------------------------------------------------
# Required platform modules
# -----------------------------------------------------------------------------
INCLUDE(FindPkgConfig)

PKG_CHECK_MODULES(dpl REQUIRED dpl-efl)
PKG_CHECK_MODULES(wrt-plugins-types REQUIRED wrt-plugins-types)
PKG_CHECK_MODULES(wrt-deviceapis-commons-javascript REQUIRED wrt-plugins-commons-javascript)
PKG_CHECK_MODULES(wrt-plugins-tizen-common REQUIRED wrt-plugins-tizen-common)
PKG_CHECK_MODULES(json-glib REQUIRED json-glib-1.0)

INCLUDE_DIRECTORIES(
  ${dpl_INCLUDE_DIRS}
  ${wrt-plugins-types_INCLUDE_DIRS}
  ${wrt-deviceapis-commons-javascript_INCLUDE_DIRS}
  ${wrt-plugins-tizen-common_INCLUDE_DIRS}
  ${json-glib_INCLUDE_DIRS}
)

# -----------------------------------------------------------------------------
# Determine the log option
# -----------------------------------------------------------------------------

OPTION(DPL_LOG "DPL logs status" ON)

IF(DPL_LOG)
    MESSAGE(STATUS "Logging enabled for DPL")
    ADD_DEFINITIONS("-DDPL_LOGS_ENABLED")
ELSE(DPL_LOG)
    MESSAGE(STATUS "Logging disabled for DPL")
ENDIF(DPL_LOG)

# -----------------------------------------------------------------------------
# Determine the time tracing option
# -----------------------------------------------------------------------------

OPTION(ENABLE_TIME_TRACER "TIME TRACING" OFF)

IF(ENABLE_TIME_TRACER)
    MESSAGE(STATUS "Time tracer enabled")
    ADD_DEFINITIONS("-DENABLE_TIME_TRACER")
ELSE(ENABLE_TIME_TRACER)
    MESSAGE(STATUS "Time tracer disabled")
ENDIF(ENABLE_TIME_TRACER)

# -----------------------------------------------------------------------------
# Set build type (Release by default)
# -----------------------------------------------------------------------------
IF("${CMAKE_BUILD_TYPE}" STREQUAL "")
     SET(CMAKE_BUILD_TYPE Release)
ENDIF("${CMAKE_BUILD_TYPE}" STREQUAL "")

MESSAGE("Build type: ${CMAKE_BUILD_TYPE}")

# -----------------------------------------------------------------------------
# CFlags
# -----------------------------------------------------------------------------
SET(CMAKE_C_FLAGS_PROFILING    "-O0 -g -pg")
SET(CMAKE_CXX_FLAGS_PROFILING  "-O0 -std=c++0x -g -pg")
SET(CMAKE_C_FLAGS_DEBUG        "-O0 -g")
SET(CMAKE_CXX_FLAGS_DEBUG      "-O0 -std=c++0x -g")
SET(CMAKE_C_FLAGS_RELEASE      "-O2 -g")
SET(CMAKE_CXX_FLAGS_RELEASE    "-O2 -std=c++0x -g")
ADD_DEFINITIONS("-DCLIENT_IPC_THREAD")
ADD_DEFINITIONS("-DEXPORT_API=")
ADD_DEFINITIONS("-Wall")
ADD_DEFINITIONS("-D_FILE_OFFSET_BITS=64")
#ADD_DEFINITIONS("-Werror")
#ADD_DEFINITIONS("-Wextra")
ADD_DEFINITIONS("-DAPPLICATION_API_BACKWARD_COMPATIBILITY")
ADD_DEFINITIONS("-std=c++11")


# -----------------------------------------------------------------------------
# Schema of plugin's configuration file
# -----------------------------------------------------------------------------
SET(COMMON_CONFIG_DTD ${CMAKE_CURRENT_SOURCE_DIR}/config.dtd)
SET(COMMON_CONFIG_DTD_DST /usr/etc/tizen-apis)
INSTALL(FILES ${COMMON_CONFIG_DTD} DESTINATION ${COMMON_CONFIG_DTD_DST})

# -----------------------------------------------------------------------------
# Global variables
# -----------------------------------------------------------------------------

SET(DESTINATION_LIB_PREFIX lib/wrt-plugins)

SET(DESTINATION_HEADER_PREFIX include/${PROJECT_NAME})

SET(LIBS_WIDGETDB ${wrt-plugins-widgetdb_LIBRARIES})

# -----------------------------------------------------------------------------
# Macros for pkgconfig
# -----------------------------------------------------------------------------
SET(PKGCONFIG_DIR ${CMAKE_SOURCE_DIR}/pkgconfigs)
#SET(PKGCONFIG_DIR ${CMAKE_SOURCE_DIR})

MACRO(configure_and_install_pkg PKG_FILE)
    CONFIGURE_FILE(${PKGCONFIG_DIR}/${PKG_FILE}.in
               ${PKGCONFIG_DIR}/${PKG_FILE} @ONLY)
    INSTALL(FILES ${PKGCONFIG_DIR}/${PKG_FILE} DESTINATION lib/pkgconfig)
ENDMACRO(configure_and_install_pkg)

SET(TARGET_NAME wrt-plugins-tizen-most)
SET(DESTINATION_NAME tizen-most)
SET(TARGET_IMPL_NAME wrt-plugins-tizen-most-impl)

configure_and_install_pkg(wrt-plugins-tizen-most.pc)

SET(CMAKE_INSTALL_RPATH
	${CMAKE_INSTALL_RPATH}
	${CMAKE_INSTALL_PREFIX}/${DESTINATION_LIB_PREFIX}/${tizen_dest}
	${CMAKE_INSTALL_PREFIX}/${DESTINATION_LIB_PREFIX}/${DESTINATION_NAME}
)

SET(SRCS_IMPL
	src/Most.cpp
	src/JSMost.cpp
	src/Optolyzer.cpp
	src/AudioMost.cpp
	src/ControlDesc.cpp
)

ADD_LIBRARY(${TARGET_IMPL_NAME} SHARED ${SRCS_IMPL})

TARGET_LINK_LIBRARIES(${TARGET_IMPL_NAME}
        ${dpl_LDFLAGS}
        ${dpl-event_LDFLAGS}
        ${wrt-deviceapis-commons-javascript_LDFLAGS}
	${wrt-plugins-tizen-common_LDFLAGS}
        ${json-glib_LDFLAGS}
	-L/usr/lib/wrt-plugins/tizen-tizen/
)

SET(SRCS
	src/plugin_initializer.cpp
)

ADD_LIBRARY(${TARGET_NAME} SHARED ${SRCS})

TARGET_LINK_LIBRARIES(${TARGET_NAME}
	${TARGET_IMPL_NAME}
)

INSTALL(TARGETS ${TARGET_NAME} ${TARGET_IMPL_NAME} LIBRARY DESTINATION ${DESTINATION_LIB_PREFIX}/${DESTINATION_NAME})
INSTALL(FILES ${CMAKE_CURRENT_SOURCE_DIR}/src/config.xml DESTINATION ${DESTINATION_LIB_PREFIX}/${DESTINATION_NAME})
INSTALL(
	DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/src/ DESTINATION ${DESTINATION_HEADER_PREFIX}/most
	FILES_MATCHING PATTERN "*.h" PATTERN "CMakeFiles" EXCLUDE
)
