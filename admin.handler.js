var
    sys=require('sys'),
    couchdb = require('couchdb'),
    client = couchdb.createClient(80, 'podviaznikov.cloudant.com'),
    db = client.db('quizzer-questions-feedback');
exports.markQuestionAsBad=function(question,userId)
{
    db.saveDoc({question:question,userId:userId,bad:true,date:new Date()}, function(er, ok)
    {
        if (er)
        {
            sys.log(er);
        }
    });
}
exports.markQuestionAsGood=function(question,userId)
{
    db.saveDoc({question:question,userId:userId,bad:false,date:new Date()}, function(er, ok)
    {
        if (er)
        {
            sys.log(er);
        }
    });
}