Meteor SQL
==========

# Limitations
* Client side the collection still use mongo syntax for find()
* All tables need to have a unique id 
* Insert, Update and Delete operations on the client don't update the data locally. Instead they run on the server and then the server refreshes the client's data. This could result in slower refresh times, but guarantees that the client always sees data that has been comited to the db. It also means that unlike minmongo, the full range of SQL options are available to the client.

#Setup on local machines

* Standard mysql set up
 * Install mysql
 * create database meteor;
 * grant all on meteor.\* to meteor@'localhost' IDENTIFIED BY 'xxxxx2344958889d'; #the password which I used was 'sayhello'
 * Change the database config params in server/dbconfig.js to match the password you entered above as well as anything else needed


#Errors 
* After following the setups and configuring the dbconfig.js file I get the following errors. Can someone fix it!!!?

----------Mon Mar 03 2014 01:54:28 GMT-0500 (EST) SQL Driver Starting --------
=> Exited with code: 1
=> Your application is crashing. Waiting for file change.

Error: ER_NO_SUCH_TABLE: Table 'meteor.employees' doesn't exist
    at Query.Sequence._packetToError (/home/soumya/.meteor/tools/d699ad29da/lib/node_modules/mysql/lib/protocol/sequences/Sequence.js:30:14)
    at Query.ErrorPacket (/home/soumya/.meteor/tools/d699ad29da/lib/node_modules/mysql/lib/protocol/sequences/Query.js:82:18)
    at Protocol._parsePacket (/home/soumya/.meteor/tools/d699ad29da/lib/node_modules/mysql/lib/protocol/Protocol.js:202:24)
    at Parser.write (/home/soumya/.meteor/tools/d699ad29da/lib/node_modules/mysql/lib/protocol/Parser.js:62:12)
    at Protocol.write (/home/soumya/.meteor/tools/d699ad29da/lib/node_modules/mysql/lib/protocol/Protocol.js:37:16)
    at Socket.Connection.connect (/home/soumya/.meteor/tools/d699ad29da/lib/node_modules/mysql/lib/Connection.js:72:28)
    at Socket.EventEmitter.emit (events.js:96:17)
    at TCP.onread (net.js:397:14)
    --------------------
    at Protocol._enqueue (/home/soumya/.meteor/tools/d699ad29da/lib/node_modules/mysql/lib/protocol/Protocol.js:110:26)
    at PoolConnection.Connection.query (/home/soumya/.meteor/tools/d699ad29da/lib/node_modules/mysql/lib/Connection.js:165:25)
    at new Devwik.SQL.Select (app/server/select.js:14:24)
    at Function.Devwik.SQL.runTests (app/server/tests.js:3:15)
    at app/server/dbinit.js:45:15

