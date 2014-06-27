# variables
SRC += $(wildcard *.cpp)
OBJ += $(SRC:.cpp=.o)
DEPS := $(OBJ:.o=.d)
GCDA := $(OBJ:.o=.gcda)
GCNO := $(OBJ:.o=.gcno)

# include directories
INC += -I. -I$(IVIPOC_HOME)/native/include

ifdef TEST_CODECOVERAGE
	CCFLAGS += -g -Wall $(INC) $(FEATURES) -DTEST_CODECOVERAGE -fprofile-arcs -ftest-coverage
	#CCFLAGS += -include $(CPPUTEST_HOME)/include/CppUTest/MemoryLeakDetectorMallocMacros.h
	CXXFLAGS += -g -Wall $(INC) $(FEATURES) -DTEST_CODECOVERAGE -fprofile-arcs -ftest-coverage
	#CXXFLAGS += -include $(CPPUTEST_HOME)/include/CppUTest/MemoryLeakDetectorNewMacros.h
	LDFLAGS += -lgcov
else
ifdef _DEBUG
	CCFLAGS += -g -Wall $(INC) $(FEATURES)
	CXXFLAGS += -g -Wall $(INC) $(FEATURES)
	# linker flags
else
	CCFLAGS += -Wall -O2 $(INC) $(FEATURES)
	CXXFLAGS += -Wall -O2 $(INC) $(FEATURES)
endif # _DEBUG
endif # TEST_CODECOVERAGE

CCFLAGS += -fPIC
CXXFLAGS += -fPIC
LDFLAGS += -pthread

# rules
ifdef STATIC_LIBRARY

LDFLAGS += -static

ifdef HDR
all: $(STATIC_LIBRARY) copyHeaders
else
all: $(STATIC_LIBRARY)
endif # HDR

$(STATIC_LIBRARY): $(OBJ)
	$(AR) rcs $(STATIC_LIBRARY) $(OBJ)

ifndef _DEBUG
	$(STRIP) --strip-debug $(STATIC_LIBRARY)
endif # _DEBUG

clean:
	rm -f $(STATIC_LIBRARY) $(OBJ) *.o Makefile.bak $(GCNO) $(GCDA) $(DEPS)
	cd $(IVIPOC_HOME)/native/include && rm -f $(HDR)

endif # STATIC_LIBRARY

ifdef APPLICATION

LDFLAGS += -L/usr/lib -lrt -L$(BOOST_HOME)/lib -lboost_thread -lboost_system

$(APPLICATION): $(OBJ)
	$(CXX) -o $(APPLICATION) $(OBJ) $(LDFLAGS)

clean:
	rm -f $(APPLICATION) $(OBJ) *.o Makefile.bak $(GCNO) $(GCDA) $(DEPS)

endif # APPLICATION

-include $(DEPS)

%.o : %.cpp
	$(CXX) $(CXXFLAGS) -c $< -MMD -MF $(patsubst %.o,%.d,$@) -o $@ $(LDFLAGS)
	
copyHeaders: $(HDR)
	cp $? $(IVIPOC_HOME)/native/include
	
.SUFFIXES: .cpp .h .o .d
.PHONY: all clean copyHeaders
