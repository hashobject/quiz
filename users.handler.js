var sessions=[];
var users=[];
exports.addUser=function(sessionId,user)
{
    sessions[sessionId]=user;
    users.push(user);
}
exports.getUser=function(sessionId)
{
    return sessions[sessionId];
}
exports.removeUser=function(sessionId)
{
    //bad practice. Look here http://ejohn.org/blog/javascript-array-remove/
    var user=sessions[sessionId];
    var idx = users.indexOf(user); // Find the index
    if(idx!=-1) users.splice(idx, 1); // Remove it if really found!
    delete sessions[sessionId];
}
exports.getOnlineUsers=function()
{
    return users;
}