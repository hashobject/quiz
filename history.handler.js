var user='',
    run=1;
exports.updateRun=function(userName)
{
    if(user==userName)
    {
        run=run+1;
    }
    else
    {
        user=userName;
        run=1;
    }
}    
exports.getRun=function(userName)
{
    if(user!=userName)
    {
        return 1;
    }
    return run;
} 
exports.getPoints=function(userName)
{
    return exports.getRun(userName)*exports.getRun(userName); 
}
exports.reset=function()
{
    user='';
    run=1;    
}
