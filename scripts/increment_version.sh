#!/bin/bash
set -e
PROPERTIES_FILE="android/version.properties"
if [ ! -f "$PROPERTIES_FILE" ]; then
    echo "Error: $PROPERTIES_FILE not found."
    exit 1
fi
VERSION_CODE=$(grep 'VERSION_CODE' $PROPERTIES_FILE | cut -d'=' -f2)
if [ -z "$VERSION_CODE" ]; then
    echo "Error: VERSION_CODE not found in $PROPERTIES_FILE."
    exit 1
fi
NEW_VERSION_CODE=$((VERSION_CODE + 1))
sed -i "s/VERSION_CODE=$VERSION_CODE/VERSION_CODE=$NEW_VERSION_CODE/" $PROPERTIES_FILE
echo "Incremented version code to $NEW_VERSION_CODE"
git config --global user.name 'github-actions[bot]'
git config --global user.email 'github-actions[bot]@users.noreply.github.com'
git add $PROPERTIES_FILE
# Check if there are changes to commit
if git diff --staged --quiet; then
  echo "No changes to commit."
else
  git commit -m "chore: increment version to $NEW_VERSION_CODE [skip ci]"
  git push
fi
