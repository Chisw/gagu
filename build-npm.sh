cd gagu-back-end

echo '\n  🔨  Building gagu-back-end..\n'

npm run build

cd ../gagu-front-end

echo '\n  🔨  Building gagu-front-end..\n'

npm run build

cd ..

rm -rf bin

mkdir bin bin/web

mv gagu-back-end/dist/* bin

mv gagu-front-end/dist/* bin/web

touch bin/gagu

echo "#!/usr/bin/env node \n" >> bin/gagu

cat bin/main.js >> bin/gagu

chmod 777 bin/gagu

rm bin/main.js

echo '\n  ✨  Build GAGU npm package successfully.'
