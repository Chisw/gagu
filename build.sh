rm -rf bin

mkdir bin

mkdir bin/public

cd gagu-back-end

yarn build

cd ../gagu-front-end

yarn build

cd ..

mv gagu-back-end/dist/* bin

mv gagu-front-end/build/* bin/public

touch bin/gagu

echo "#!/usr/bin/env node \n" >> bin/gagu

cat bin/main.js >> bin/gagu

chmod 777 bin/gagu

echo '\n✨  Build gagu bin successfully. \n'

echo '🔔  Update package version before publish to npm. \n'
