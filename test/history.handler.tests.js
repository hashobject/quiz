var historyHandler=require('../history.handler.js');
exports.testGetInitialRun=function(assert)
{
	assert.equal(historyHandler.getRun('Anton'),1);	
	assert.equal(historyHandler.getPoints('Anton'),1);		
}
exports.testUpdateRunAndReset=function(assert)
{
	historyHandler.updateRun('Anton');
	historyHandler.updateRun('Anton');
	historyHandler.updateRun('Anton');
	assert.equal(historyHandler.getRun('Anton'),3);
	assert.equal(historyHandler.getPoints('Anton'),9);
	assert.equal(historyHandler.getRun('unknown'),1);
	historyHandler.reset();				
	assert.equal(historyHandler.getRun('Anton'),1);	
}
