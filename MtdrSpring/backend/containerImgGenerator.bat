docker stop agilecontainer
docker rm -f agilecontainer
docker rmi agileimage
mvn verify
docker build -f Dockerfile --platform linux/amd64 -t <repo_img>:0.1 .  
docker run --name agilecontainer -p 8080:8080 -d <repo_img>:0.1