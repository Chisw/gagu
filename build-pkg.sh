if [[ ! $1 || ! $2 ]]; then
  echo "
  Please input version number and architecture name.

  like:

    npm run build:pkg 1.0.0 arm

  or:

    yarn build:pkg 1.0.1 x64

"
  exit
fi

echo "\n  🔨  Building binary package..\n"

sleep 1

pkg . --out-path=pkg

cd pkg

mv gagu-linux "gagu@$1.linux.$2.sh"
mv gagu-macos "gagu@$1.macos.$2.sh"
mv gagu-win.exe "gagu@$1.win.$2.exe"

chmod 777 "gagu@$1.linux.$2.sh"
chmod 777 "gagu@$1.macos.$2.sh"

echo "\n  🗜  Zipping..\n"

sleep 1

zip "gagu@$1.linux.$2.sh.zip" "gagu@$1.linux.$2.sh"
zip "gagu@$1.macos.$2.sh.zip" "gagu@$1.macos.$2.sh"
zip "gagu@$1.win.$2.exe.zip" "gagu@$1.win.$2.exe"

echo "\n  🧹  Clearing..\n"

sleep 1

rm "gagu@$1.linux.$2.sh"
rm "gagu@$1.macos.$2.sh"
rm "gagu@$1.win.$2.exe"

echo "  Build GAGU binary package successfully \n"
