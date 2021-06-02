# ------------------------------------------------
# Generic Makefile
#
# Author: David McDanel dave.mcdanel@gmail.com
# Date  : 2020-04-11
#
# Changelog :
#   2020-04-11 - Create new. DLM
# ------------------------------------------------

# project name (generate executable with this name)
GITEAUSER = dave.mcdanel
TARGET = $(notdir  $(shell pwd))
TARGET_DIR = $(shell pwd)
SERVER_NAME = dave@hamshack.kc0bpo.net
SERVER_DIR = /var/www/html/gitea/$(GITEAUSER)/$(TARGET)

BUILDID=$(shell date +%Y%m%d-%H:%M:%S)
COMMIT_COMMENT?='Automatic commit of successful build.'

rm = rm -f

.PHONY: run
run:
	$(shell $(TARGET))

.PHONY: install
install:
	rm /usr/local/bin/$(TARGET)
	cp $(TARGET) /usr/local/bin/

.PHONY: push
push:
	cd $(TARGET_DIR) && \
		git push origin master

.PHONY: pull
pull:
	cd $(TARGET_DIR) && \
		git pull origin master

.PHONY: commit
commit:
	cd $(TARGET_DIR) && \
		pwd && \
		git add -A . && \
		git commit -m "$(COMMIT_COMMENT) Build:$(BUILDID)"

-include $(DEPS)
