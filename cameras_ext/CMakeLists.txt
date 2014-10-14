CMAKE_MINIMUM_REQUIRED(VERSION 2.8)
PROJECT(tizen_cameras)

# -----------------------------------------------------------------------------
# Required platform modules
# -----------------------------------------------------------------------------
INCLUDE(FindPkgConfig)

PKG_CHECK_MODULES(glib REQUIRED glib-2.0)
PKG_CHECK_MODULES(gio REQUIRED gio-2.0)

INCLUDE_DIRECTORIES(
  ${gio_INCLUDE_DIRS}
  ${glib_INCLUDE_DIRS}
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
# Determine the feature configuration for optional API
# -----------------------------------------------------------------------------

IF(ENABLE_OPTIONAL_BT)
    MESSAGE(STATUS "Bluetooth API Enabled")
    ADD_DEFINITIONS( -DFEATURE_OPTIONAL_BT )
ENDIF(ENABLE_OPTIONAL_BT)

IF(ENABLE_OPTIONAL_CALL_HISTORY)
    MESSAGE(STATUS "Callhistory API Enabled")
    ADD_DEFINITIONS( -DFEATURE_OPTIONAL_CALL_HISTORY )
ENDIF(ENABLE_OPTIONAL_CALL_HISTORY)

IF(ENABLE_OPTIONAL_NBS)
    MESSAGE(STATUS "Network Bearer Selection API Enabled")
    ADD_DEFINITIONS( -DFEATURE_OPTIONAL_NBS )
ENDIF(ENABLE_OPTIONAL_NBS)

IF(ENABLE_OPTIONAL_NFC)
    MESSAGE(STATUS "NFC API Enabled")
    ADD_DEFINITIONS( -DFEATURE_OPTIONAL_NFC )
ENDIF(ENABLE_OPTIONAL_NFC)

IF(ENABLE_OPTIONAL_PUSH)
    MESSAGE(STATUS "Push API Enabled")
    ADD_DEFINITIONS( -DFEATURE_OPTIONAL_PUSH )
ENDIF(ENABLE_OPTIONAL_PUSH)

IF(ENABLE_OPTIONAL_SE)
    MESSAGE(STATUS "Secure Element API Enabled")
    ADD_DEFINITIONS( -DFEATURE_OPTIONAL_SE )
ENDIF(ENABLE_OPTIONAL_SE)

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

# -----------------------------------------------------------------------------
# Global variables
# -----------------------------------------------------------------------------

SET(DESTINATION_LIB_PREFIX lib/tizen-extensions-crosswalk)

SET(DESTINATION_HEADER_PREFIX include/${PROJECT_NAME})

SET(TOP ${CMAKE_SOURCE_DIR}/src)

SET(INCLUDE_COMMON ${TOP}/../..)

SET(LIBS_COMMON
    ${gio_LDFLAGS}
    ${glib_LDFLAGS}
)

# -----------------------------------------------------------------------------
# Macros for pkgconfig
# -----------------------------------------------------------------------------
SET(PKGCONFIG_DIR ${CMAKE_SOURCE_DIR}/pkgconfigs)

MACRO(configure_and_install_pkg PKG_FILE)
    CONFIGURE_FILE(${PKGCONFIG_DIR}/${PKG_FILE}.in
               ${PKGCONFIG_DIR}/${PKG_FILE} @ONLY)
    INSTALL(FILES ${PKGCONFIG_DIR}/${PKG_FILE} DESTINATION lib/pkgconfig)
ENDMACRO(configure_and_install_pkg)

# -----------------------------------------------------------------------------
# Functions used for plugins
# -----------------------------------------------------------------------------

FUNCTION(set_target NAME)
  STRING(TOLOWER ${NAME} LOWER_NAME)
  SET(${LOWER_NAME}_target ${LOWER_NAME} PARENT_SCOPE)
  SET(${LOWER_NAME}_config ${LOWER_NAME}-config PARENT_SCOPE)
  configure_and_install_pkg(${LOWER_NAME}.pc)
ENDFUNCTION()


FUNCTION(add_subdir NAME)
  MESSAGE(STATUS "Building: ${CMAKE_CURRENT_SOURCE_DIR}/${NAME}")
  ADD_SUBDIRECTORY(${NAME})
ENDFUNCTION()


FUNCTION(add_plugin)
  FOREACH(VALUE ${ARGN})
    set_target(${VALUE})
    add_subdir(src)
  ENDFOREACH(VALUE)
ENDFUNCTION()

add_plugin(${PROJECT_NAME})
