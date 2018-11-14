# gmapper #

A simple gene mapping web app. 

## How to run the app ##

On a machine with docker installed:

    git clone https://github.com/yonirab/gmapper.git
	cd gmapper
	. ./docker_setup
    docker-compose up

The DB initialisations are currently performed via SQL scripts,
and they take a while to complete, so be patient ;-)

You will know when they are finished when the docker-compose terminal
stops spitting out "INSERT 0 1" logs.

Once complete, run the app by pointing your browser to port 8080 on your docker host
(e.g. on some Windows systems that may be http://192.168.99.100:8080).
 

