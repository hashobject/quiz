var express=require('express'),
    sys=require('sys'),
    io=require('socket.io'),
    statisticHandler=require('./statistic.handler'),
    statModule=require('./qlobal.statistic').create(),
    quizBot=require('./quiz').create(statModule),
    adminHandler=require('./admin.handler'),
    usersHandler=require('./users.handler'),
    app=express.createServer();
app.configure(function()
{
    //logger for the express
    app.use(express.logger());
    //setting folder to the views
    app.set('views', __dirname + '/views');
    //setting public folder
    app.use(express.staticProvider(__dirname + '/public'));
    //using router for REST-like requests
    app.use(app.router);
    //for decoding params
    app.use(express.bodyDecoder());
});

app.get('/', function(req, res)
{
    res.render('index.jade',
    {
        locals:{
        	pageTitle:'Викторина',
        	appDescription:'Лучшая онлайн викторина для умных людей',
        	appKeywords:'викторина, онлайн, лучшие вопросы, бесплатно,игры умных людей, онлайн игра, развлечения'
    	},
    	layout: false
    });
});

//get online users
app.get('/online_users',function(req,res)
{
    res.send(usersHandler.getOnlineUsers());
});
//sending top 10 standings to user after his request
app.get('/standings',function(req,res)
{
    statisticHandler.getStandings(function(standings)
    {
        res.send(standings);
    });
});

//marking bad question
app.post('/bad_question',function(req,res)
{
    adminHandler.markQuestionAsBad(req.query.question,req.query.userId);
});
//marking good question
app.post('/good_question',function(req,res)
{
    adminHandler.markQuestionAsGood(req.query.question,req.query.userId);
});
//get statistic for the user
app.get('/statistic/:id',function(req,res)
{
    statisticHandler.getStat(req.params.id,function(statistic)
    {
        res.send(statistic);
    });
});

app.listen(8080);
var socket=io.listen(app);
socket.on('connection', function(client)
{
    //send to the user current question
    quizBot.sendCurrentQuestion(client);
    //handle user's message
	client.on('message', function(message)
	{
	    var msg = JSON.parse(message);
	    if('id' in msg)
	    {
	        usersHandler.addUser(client.sessionId,{userId:msg.id,userDisplayName:msg.displayName});
	        client.broadcast(JSON.stringify({message:msg.displayName + ' вошел(-а) в игру',user:'робот'}));
	    }
	    else
	    {
	        quizBot.handleByBot(msg,client,usersHandler.getUser(client.sessionId));
		}
	});
	//send message to everybody that user disconnected
	client.on('disconnect', function()
	{
	    //clearing session data
        client.broadcast(JSON.stringify({message:usersHandler.getUser(client.sessionId).userDisplayName + ' вышел(-а) из игры',user:'робот'}));
	    usersHandler.removeUser(client.sessionId);
	});
	statModule.on('newQuestion',function()
	{
	    sys.log('EVENTS');
	});
});
sys.log('Server started on port 8080');