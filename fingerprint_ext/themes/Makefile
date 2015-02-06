
themes=blue green amber

all: $(themes)
	$(foreach theme,$(themes), make -C $(theme);)

clean:
	rm -f *~
	$(foreach theme,$(themes), make -C $(theme) clean;)

install:
	$(foreach theme,$(themes), make -C $(theme) install;)

.PHONE: all clean install
