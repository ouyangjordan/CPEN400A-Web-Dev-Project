#!/bin/bash
GITHUB_USER="dashpritam"
REPO_PREFIX=""

GROUP_NAME=$1
if [ -z "$GROUP_NAME" ] ; then
  echo "You need to provide the group name"
  exit 1
fi

echo "Creating Assignment Repository for $GROUP_NAME"

mkdir repos/$GROUP_NAME
echo "**/node_modules/**" > "repos/$GROUP_NAME/.gitignore"

cd repos/$GROUP_NAME
git init
git add .
git commit -a -m "Initial commit"

git remote add origin "https://github.com/$GITHUB_USER/$REPO_PREFIX$GROUP_NAME.git"
git push -u origin master

echo ""
echo "Assignment Repository for $GROUP_NAME initialized succesfully!"
echo "Go to the repository page on Github at:"
echo "    https://github.com/$GITHUB_USER/$REPO_PREFIX$REPO_NAME/"
echo "and send invitations to the students."
echo ""
