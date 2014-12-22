var usersHandler=require('../users.handler.js'),
    sys=require('sys');	

exports.testAndAndGetUser=function(assert)
{
	usersHandler.addUser('id1','Anton');
	assert.equal(usersHandler.getUser('id1'),'Anton');
	sys.log(sys.inspect(usersHandler.getOnlineUsers()));
	assert.equal(usersHandler.getOnlineUsers().length,1);
}
exports.testRemoveUser=function(assert)
{
	assert.equal(usersHandler.getUser('id1'),'Anton');	
	usersHandler.removeUser('id1');
	assert.equal(usersHandler.getUser('id1'),undefined);
	assert.equal(usersHandler.getOnlineUsers().length,0);	
}

