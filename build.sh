#!/bin/bash

docker build -t megaease/dufs:latest -f Dockerfile.new . --progress=plain
docker push megaease/dufs:latest
