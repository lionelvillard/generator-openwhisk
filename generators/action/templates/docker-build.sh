#!/bin/bash
set -e

docker build -t <%= username %>/<%= image %> .
docker push <%= username %>/<%= image %> 