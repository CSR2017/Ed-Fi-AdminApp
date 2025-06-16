#!/bin/bash

# Enable error handling
set -e

echo "Generating icons..."

ICONS_FOLDER=packages/common-ui/src/lib/Icons
GENERATED_FOLDER=$ICONS_FOLDER/generated

echo "Removing existing generated icons..."
rm $GENERATED_FOLDER/*

echo "Creating new generated icons..."
node $ICONS_FOLDER/generateIcons/generateIcons.mjs

echo "Formatting generated icons..."
npx eslint $GENERATED_FOLDER --fix
npx prettier $GENERATED_FOLDER --write

echo
echo "Icons generated and formatted successfully."
