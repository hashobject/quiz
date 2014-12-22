var redis = require('redis'),
    store = redis.createClient(),
    sys = require('sys'),
    events = require('events');
function StatModule()
{
    events.EventEmitter.call(this);
}
sys.inherits(StatModule, events.EventEmitter);
exports.StatModule = StatModule;
exports.create=function()
{
    return new StatModule();
}
StatModule.prototype.addQuestion=function()
{
    store.incr('QUESTION_AMOUNT');
    this.emit('newQuestion');
}
StatModule.prototype.countQuestion=function()
{
    return store.get('QUESTION_AMOUNT');
}