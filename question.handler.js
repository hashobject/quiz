var
    sys=require('sys'),
    couchdb=require('couchdb'),
    client=couchdb.createClient(80, 'podviaznikov.cloudant.com'),
    db=client.db('quizzer');
    
function QuestionHandler(statModule)
{
    this.statModule=statModule;
    this.currentQuestion;
    this.questionTime; 
}
QuestionHandler.prototype.getCurrent=function(callback)
{
    callback(this.currentQuestion);
}
QuestionHandler.prototype.getNext=function(callback)
{
    var self=this;
    db.getDoc(getRandom(134000), function(er, doc)
    {
        if (er) 
        {
            sys.log(JSON.stringify(er));
        }
        else
        {
            self.currentQuestion = doc;
            self.questionTime=new Date().getTime();
            self.statModule.addQuestion();
            callback(self.currentQuestion);
        }
    }); 
}
QuestionHandler.prototype.getCurrentAnswer=function()
{
    if(this.currentQuestion===undefined)
    {
        return '';
    }
    else
    {
        return this.currentQuestion.answer;
    }       
}
QuestionHandler.prototype.isCorrect=function(answer)
{
    if(this.currentQuestion===undefined)
    {
        return false;
    } 
    else
    {
        return this.currentQuestion.answer.toUpperCase() === answer.toUpperCase();
    }
}
QuestionHandler.prototype.getQuestionStartTime=function()
{
    return this.questionTime;
}
getRandom=function(max)
{
    return Math.floor(Math.random()*max);
}
exports.create=function(statModule)
{
    return new QuestionHandler(statModule);
}