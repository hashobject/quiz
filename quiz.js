var sys=require('sys');

function QuizServer(statModule)
{
    this.statModule;
    this.questionHandler = require('./question.handler').create(statModule);
    this.statisticHandler = require('./statistic.handler');
    this.historyHandler = require('./history.handler');
    this.timeoutId;
}
QuizServer.prototype.sendCurrentQuestion=function(socket)
{
    var self=this;
    this.questionHandler.getCurrent(function(question)
    {
        if(question===undefined)
        {
            self.sendNextQuestion(socket);
        }
        else
        {
            socket.send(botMessage(question.question,false));
        }
    });
}
QuizServer.prototype.sendNextQuestion=function(socket)
{
    var self=this;
    clearTimeout(this.timeoutId);
    this.questionHandler.getNext(function(question)
    {
        sendAll(question.question,socket,true);
        self.timeoutId=setTimeout(function()
        {
            sendAll('Время истекло',socket,false);
            var answer=self.questionHandler.getCurrentAnswer();
            if(answer!='')
            {
                sendAll('Ответ: '+answer,socket);
            }
            self.sendNextQuestion(socket);
            //reseting history
            self.historyHandler.reset();
        }, 60*1000);
    });
}
QuizServer.prototype.handleByBot=function(message,socket,user)
{
    //todo extract escaping to the separate module
    var text=message.message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    var userId=user.userId;
    var userDisplayName=user.userDisplayName;
    var message={message:text,user:userDisplayName};
    //resend message for all
    socket.broadcast(JSON.stringify(message));
    //checking that answer was correct

    if(this.questionHandler.isCorrect(text))
    {
        //just resend current message for all
        this.historyHandler.updateRun(userId);
        var userRun=this.historyHandler.getRun(userId);
        var userPoints=this.historyHandler.getPoints(userId);
        this.statisticHandler.updateStat(userId,userRun,userPoints,socket,userDisplayName);
        //var roundTotalTime=new Date().getTime()-this.questionHandler.getQuestionStartTime();
        socket.broadcast(botMessage(userDisplayName+' ответил правильно и получил ' + userPoints + ' очков'));
        socket.send(botMessage('Вы дали правильный ответ и получили '+ userPoints + ' очков'));
        this.sendNextQuestion(socket);
    }
}
sendAll=function(text,socket,isQuestion)
{
    var message=botMessage(text,isQuestion);
    socket.broadcast(message);
    socket.send(message);
}
botMessage=function(text,isQuestion)
{
   var message;
   if(isQuestion)
   {
       message={message:text,user:'робот',isQuestion:true};
   }
   else
   {
       message={message:text,user:'робот'}
   }
   return JSON.stringify(message);
}
//public factory method
exports.create=function(statModule)
{
    return new QuizServer(statModule);
}