cd gagu-back-end

echo '\n🔨  Building gagu-back-end..\n'

yarn build

cd ../gagu-front-end

echo '\n🔨  Building gagu-front-end..\n'

yarn build

cd ..

rm -rf bin

mkdir bin bin/public

mv gagu-back-end/dist/* bin

mv gagu-front-end/build/* bin/public

touch bin/gagu

echo "#!/usr/bin/env node \n" >> bin/gagu

cat bin/main.js >> bin/gagu

chmod 777 bin/gagu

rm bin/main.js

rm bin/public/static/js/*.LICENSE.txt

echo '\n✨  Build GAGU bin successfully.'
