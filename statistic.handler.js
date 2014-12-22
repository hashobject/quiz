var
    sys=require('sys'),
    couchdb = require('couchdb'),
    client = couchdb.createClient(80, 'podviaznikov.cloudant.com'),
    db = client.db('quizzer-stat'),
    savedStandings='',
    savedPosition=0;
exports.getStat=function(userId,callback)
{
    db.getDoc(userId, function(er, doc)
    {
        if(er)
        {
            //do nothing
        }
        else
        {
            sys.log(sys.inspect(doc));
            callback(doc);
        }
    });
}
exports.updateStat=function(userId,run,points,socket,userDisplayName)
{
    db.getDoc(userId, function(er, doc)
    {
        if (er)
        {
            var stat={answers:1,points:1,seria:1,loginDate:new Date(),userDisplayName:userDisplayName};
            db.saveDoc(userId,stat, function(er, ok)
            {
                if (er)
                {
                    sys.log(JSON.stringify(er));
                    throw new Error(JSON.stringify(er));
                }
                sys.puts('Saved '+sys.inspect(stat)+' to the couch');
                socket.send(JSON.stringify(stat));
                exports.getStandings(function(standings)
                {
                    socket.broadcast(standings);
                    socket.send(standings);
                });
                exports.getPosition(userId,function(position)
                {
                    socket.send(position);
                });
            });
        }
        else
        {
            var seria=doc.seria>run?doc.seria:run;
            var stat={answers:doc.answers+1,_rev:doc._rev,points:doc.points+points,seria:seria,userDisplayName:userDisplayName};
            db.saveDoc(userId,stat, function(er, ok)
            {
                if (er)
                {
                    sys.log(JSON.stringify(er));
                    throw new Error(JSON.stringify(er));
                }
                sys.puts('Saved '+sys.inspect(stat)+' to the couch');
            });
            socket.send(JSON.stringify(stat));
            exports.getStandings(function(standings)
            {
                socket.broadcast(standings);
                socket.send(standings);
            });
            exports.getPosition(userId,function(position)
            {
                socket.send(position);
            });
        }
    });
}
exports.getStandings=function(callback)
{
    db.view('statistic','standings',{descending:true,limit:10}, function(er, doc)
    {
        if (er)
        {
            sys.log(JSON.stringify(er));
            throw new Error(JSON.stringify(er));
        }
        var standings = JSON.stringify({standings:doc.rows});
        if(standings!=savedStandings)
        {
            savedStandings=standings;
        }
        callback(standings);
    });
}
exports.getPosition=function(userId,callback)
{
    db.view('statistic','positions',{key:userId}, function(er, doc)
    {
        if (er)
        {
            sys.log(JSON.stringify(er));
            throw new Error(JSON.stringify(er));
        }
        var position = JSON.stringify({position:doc.rows[0].value});
        sys.log(userId+' has position '+position);
        if(position!=savedPosition)
        {
            savedPosition=position;
            callback(position);
        }
    });
}