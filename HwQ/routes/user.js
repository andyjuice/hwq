

exports.login = function(req, res){
	//sets the sql statement to retrieve values from the row with the specified username and password;
	var capitalUser = [];
	var sql = 'SELECT id, period, username,is_teacher, period_id_fk FROM student_period, users '+
		'where id = student_id_fk AND username = ? AND password = ? ';
	console.log(sql);
	req.app.get('connection').query(sql, [req.body.username, req.body.password], function(err, rows, fields) {
	      if (err) {
	    	  //connection mess-up handler --> very unlikely as the statement is static and consistent
	    	  res.redirect('/login-failure.html');
	      } else {
	    	  //if password is incorrect then there will be 0 rows returned, hence the rows.length will equal 0
	    	 //console.log(rows);
		     //console.log(fields);
		     if( rows.length === 0 ){
		    	 res.redirect('/login-failure.html');	         
		     }else{
		    	 //if password is correct, the user name is saved into cookie-session for later 
		    	 req.session.user = req.body.username;
		    	 //takes the username and splits it at the period
		    	 var user = req.session.user.split(".");
		    	 //for loop capitalizes the first letter of both the first and last name
		    	 for(var i = 0; i < user.length; i++){
		 			capitalUser.push(user[i].charAt(0).toUpperCase() + user[i].slice(1));
		 		}
		    	 //Special case for admin user
		    	 if( capitalUser.length==1)
		    		 capitalUser.push("");
		    	 
		    	 //creates session variable that is the user's name
		    	 req.session.usernameFL = capitalUser;
		    	 
		    	 //id is saved as a cookie so further editing can be done, id is the first value of the rows dictionary
			     //(id is the safe access point for mysql database)
		    	 req.session.id = rows[0].id;
		    	 req.session.is_teacher  = rows[0].is_teacher;
		    	 req.session.periodid = rows[0].period_id_fk;
		    	 
		    	 //FOR backward compatible with APCS Weebly integration
		    	 req.session.APCS_PERIOD = rows[0].period;
		    	 
		    	 console.log("Login successfully! Store user in session:" 
		    			 + req.session.usernameFL + "(id=" + req.session.id +")" + req.session.APCS_PERIOD) ;
		    	 console.log("[DEBUG]: " + req.session );
		    	 res.redirect('/calendar');
		     }
	      }
	   });
};
exports.logout = function(req, res){
	//clears all cookies
	req.session = null ;

	//redirects page to the login.
	res.redirect('/');
};
exports.reset = function(req,res){
	//sets update statement up, the statement changes the password at certain id.
	var sql = 'UPDATE users SET password=?, change_password=0 WHERE id =?';
	//replaces password at the "cookie-d" id (user who is logged on) with the new password given by change-password.html
	req.app.get('connection').query(sql, [req.body.newpassword, req.session.id], function(err, rows, fields) {
	      if (err) {
	    	  //very unlikely, hopefully this never happens
	    	  res.redirect('/login-failure.html');
	      } else {
	    	  //returns the page back to query
	        	res.redirect('/query');
		    }
	   });
}
