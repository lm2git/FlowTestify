cd ..
rm -Rvf flowtestyfy 
git clone https://github.com/lm2git/flowtestify.git
cd flowtestify 
docker-compose up --build -d 
ls 