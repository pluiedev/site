#!/bin/sh

BULMA_VERSION=0.9.4
BULMA_DIR=_bulma

if [ ! -d $BULMA_DIR ]
then
	git clone \
		--depth 1 \
		--filter=blob:none \
		--sparse \
		--branch $BULMA_VERSION \
		https://github.com/jgthms/bulma.git \
		$BULMA_DIR

	cd $BULMA_DIR
	git sparse-checkout set sass
fi