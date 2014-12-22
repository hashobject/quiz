var quizzer;
function initAllData()
{
    $('section#content').height($(window).height()-120);
    var req = opensocial.newDataRequest();
	req.add(req.newFetchPersonRequest("VIEWER"), "viewer_data");
	var idspec = new opensocial.IdSpec({
	  'userId' : 'OWNER',
	  'groupId' : 'FRIENDS'
	});
	req.send(onData);
};
// callback handler for datarequest.send() from above 
function onData(data) 
{
  var viewer_info = document.getElementById('user-info');
  if (data.get("viewer_data").hadError()) 
  {
    google.friendconnect.renderSignInButton({ 'id': 'gfc-button' ,'style': 'text','text':'Войти' });
    document.getElementById('gfc-button').style.display = 'block';
    viewer_info.innerHTML = '';
  }
  else
  {
    document.getElementById('gfc-button').style.display = 'none';
    var viewer = data.get("viewer_data").getData();
    quizzer=new Quizz(viewer.getId(),viewer.getDisplayName());
    quizzer.initialize();
    viewer_info.innerHTML = "<p class='user_itself'>"+viewer.getDisplayName() +"</p>"+
        "<div id='toolbar'><a href='#' onclick='google.friendconnect.requestSettings()' class='toolbar'>Настройки</a>  " +
        "<a href='#' onclick='google.friendconnect.requestInvite()' class='toolbar'>Пригласить</a>  " +
        "<a href='#' onclick='destroyObjects()' class='toolbar'>Выйти</a></div>";
  }
};
function destroyObjects()
{
    google.friendconnect.requestSignOut();
    quizzer.removeUIListeners();
    $('#user_input').die('keypress');
    quizzer.exit();
    quizzer=undefined;
}
Quizz=function(openId,displayName)
{
    this.openId=openId;
    this.displayName=displayName;
    this.socket=undefined;
    this.timeCount=60;
    this.intervalId;
    this.exit=function()
    {
        this.openId=undefined;
        this.displayName=undefined;
        this.socket.disconnect();
        this.socket=undefined;
    };
    this.updateTimer=function()
    {
        this.timeCount=this.timeCount-1;
        if(this.timeCount>=0)
        {
           $('div#timer').html(this.timeCount);
        }   
    };
	this.updateChat=function(userName,userMessage,isQuestion)
	{
        var content = $("#content");
		var html = content.html();
	    var userClassName="user_name";
	    if(userName=='Вы')
	    {
		     userClassName+=" own_profile";
	    }	
	    else if(userName=='робот')
	    {
		     userClassName+=" bot_profile";
	    }
	    html+="<article class='message_node'><div class='"+userClassName+"'>"+userName+":</div>";
	    html+="<div class='message_content'>"+userMessage+"</div>";
		if(userName=='робот'&& isQuestion)
		{
			html+="<div class='feeback_question_btn'>";
		    html+="<span class='positive_feedback' title='Хороший вопрос' question='"+userMessage+"'>+</span>";
		    html+="<span class='negative_feedback' title='Плохой вопрос' question='"+userMessage+"'>&minus;</span></div>";
		}
	    html+="</article>";
	    content.html(html);
	    content.scrollTop(content[0].scrollHeight);
	};
	this.message=function(obj)
	{
	    var self=this;
    	var userName=obj.user;
    	var userMessage=obj.message;
    	var isQuestion=obj.isQuestion;
    	if(isQuestion)
    	{
    	    clearInterval(this.intervalId);
    	    this.timeCount=60;    
    	    $('div#timer').html(this.timeCount);
    	    this.intervalId=setInterval(function()
    	    {
    	        self.timeCount=self.timeCount-1;
    	        if(self.timeCount>=0)
    	        {
    	           $('div#timer').html(self.timeCount);
    	        }   
    	    },1000);
    	}
    	this.updateChat(userName,userMessage,isQuestion);
	};
	this.updatePersonalStatistic=function(statistic)
	{
    	$('#amount_of_points').html(statistic.points);
    	$('#user_total_amount_of_answers > span').html(statistic.answers);
    	$('#user_longest_seria  > span').html(statistic.seria);
	};
	this.getUserName=function()
	{
		return this.displayName;
	};
	this.getUserInput=function()
	{
		return $("#user_input").val();
	};
	this.showOnlineUsers=function(users)
	{
	    var quizz=this;
	    var html="";
	    $.each(users, function(i,user)
	    {
	        if(user.userId!=quizz.openId)
	        {
		    	html+='<div><p class="online_user">';
		    	html+=user.userDisplayName;
		    	html+='</p></div>';
	        }
	    });
	    $('div#results').html(html);
	};
	this.updateStandings=function(standings,context)
	{
        var html="";
		$.each(standings, function(i,player)
		{
			if(player.value.id==context.openId)
			{
				html+='<div class="user_itself">';
			}
			else if(i<3)
			{
				html+='<div class="leader_player">';	
			}
			else
			{
				html+='<div>';
			}
			html+='<p  class="stat_position">';
			html+=i+1;
			html+='.';
			html+='</p>';
			html+='<p  class="stat_username">';
			html+=player.value.name;
			html+='</p>';
			html+='<p class="stat_amount_of_points">';
			html+=player.key;
			html+='</p></div>';				
		});
		$('div#results').html(html);
	};
	this.installUIListeners=function()
	{
		var quizz=this;
		$("span.positive_feedback").live("click",function () 
		{ 
			var question=$(this).attr('question');
			$.post('/good_question?userId='+quizz.openId+'&question='+question);
		});
            
		$("span.negative_feedback").live("click",function () 
    	{ 
			var question=$(this).attr('question');
			$.post('/good_question?userId='+quizz.openId+'&question='+question);
		});
		//get online users
		$("div#online_users").live("click",function () 
		{ 
	        $('#info_panel_header').html('Играют');
	    	$.getJSON('/online_users',function(data)
	    	{
			    quizz.showOnlineUsers(data);
	    	});
	    	$('div#online_users').addClass('selected');
	    	$('div#online_users').removeClass('unselected');
	    	$('div#top_ten_leaders').addClass('unselected');
	    	$('div#top_ten_leaders').removeClass('selected');
	   });
		//get standings
		$("div#top_ten_leaders").live("click",function() 
		{ 
		    $('#info_panel_header').html('Лидеры');
			$.getJSON('/standings',function(data)
			{
			    quizz.updateStandings(data.standings,quizz);
			});
			$('div#top_ten_leaders').addClass('selected');
			$('div#top_ten_leaders').removeClass('unselected');
			$('div#online_users').addClass('unselected');
	    	$('div#online_users').removeClass('selected');
		});
	};
    this.removeUIListeners=function()
    {
        $("span.positive_feedback").die();
        $("span.negative_feedback").die();
        //get online users
        $("div#online_users").die();
        //get standings
        $("div#top_ten_leaders").die();
    };
	this.initialize=function()
	{
		var quizz=this;
		this.socket = new io.Socket(null, {port: 8080});
		this.socket.connect();
		var connectMsg={id:this.openId,displayName:displayName};
		this.socket.send(JSON.stringify(connectMsg));
		this.socket.on('message', function(obj)
		{
		    var msg=JSON.parse(obj);
		    if('answers' in msg)
		    {
		        quizz.updatePersonalStatistic(msg);
		    }
		    else if('position' in msg)
		    {
		        $('#user_total_position  > span').html(msg.position);
		    }
		    else if('standings' in msg)
		    {
		        quizz.updateStandings(msg.standings,quizz);
		    }
		    else
		    {
		        quizz.message(msg);
		    }
		});
		$('#user_input').live('keypress', function (e) 
		{
		   //user pressed enter
		   if (e.keyCode == 13 )
		   {
		       var text = quizz.getUserInput();
		       if(text!='')
		       {
		          text=text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
		          var message=JSON.stringify({message:text});
		          quizz.socket.send(message);
		          quizz.updateChat("Вы",text,false);
		          $("#user_input").val("");
               }
		   }
		});
		$.getJSON('/statistic/'+this.openId,function(data)
		{
		    quizz.updatePersonalStatistic(data);
		});
		//sending request for the standings
		$.getJSON('/standings',function(data)
		{
		    quizz.updateStandings(data.standings,quizz);
		});
		
		//ui listeners
		this.installUIListeners();
	};
};