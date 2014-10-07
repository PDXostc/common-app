
themes=blue

all: $(themes)
	$(foreach theme,$(themes), make -C $(theme);)

clean:
	$(foreach theme,$(themes), make -C $(theme) clean)

install:
	$(foreach theme,$(themes), make -C $(theme) install)

.PHONE: all clean install
