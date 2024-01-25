#!/bin/bash

docker build -t megaease/dufs:latest . --progress=plain
docker push megaease/dufs:latest
