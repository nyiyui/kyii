FROM node:18-alpine as build-yuui

#RUN addgroup -S kyii-yuui && adduser -S kyii-yuui -G kyii-yuui
#RUN ["mkdir", "/opt/kyii-yuui"]
#RUN ["chown", "kyii-yuui:kyii-yuui", "/opt/kyii-yuui"]

COPY . /opt/kyii-yuui
WORKDIR /opt/kyii-yuui
RUN ["npm", "install"]
RUN ["npm", "run", "build"]

#RUN ["chown", "kyii-yuui:kyii-yuui", "/opt/kyii-yuui-etc/run.sh"]
#RUN ["chmod", "u+x", "/opt/kyii-yuui-etc/run.sh"]
#USER kyii-yuui
#WORKDIR /opt/kyii-yuui
#CMD VITE_API_BASE_URL="http://$HOST:$PORT/senpai" node build

FROM nginx:alpine

COPY --from=build-yuui /opt/kyii-yuui/build /opt/kyii-yuui

COPY ./docker/nginx.conf /etc/nginx/templates/kyii.conf.template
