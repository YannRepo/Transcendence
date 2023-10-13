docker:
	docker-compose up --build -d
	open http://localhost:5555
	open http://localhost:3333

build:
	docker-compose build

stop:
	docker-compose down

restart: stop docker

fclean:
	docker stop $$(docker ps -qa); docker rm $$(docker ps -qa); docker rmi -f $$(docker images -qa); docker volume rm $$(docker volume ls -q); docker network rm $$(docker network ls -q) 2>/dev/null

logdatabase:
	docker logs -f db

logback:
	docker logs -f node-app 

logfront:
	docker logs -f frontend


.PHONY: docker build restart stop fclean logdatabase logback logfront

# local:
# 	docker-compose --file docker-compose.local.yml up --build -d
# 	npm install --prefix ./backend
# 	cd backend && npx prisma migrate dev --skip-generate && open http://localhost:3333 && (npx prisma studio&) && npm start
