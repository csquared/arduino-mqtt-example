
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Arduino MQTT-Socket.io Example' });
};
