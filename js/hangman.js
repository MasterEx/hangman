/*
 * Copyright (c) 2012 Periklis Ntanasis - pntanasis@gmail.com
 * MIT LICENSE, see License in the root directory 
 */
$(function() {
	
	/* Configuration */
	var wordsFilename = 'prejunior.txt'; // default word list
	var wordFiles = 'files.txt'; // file needed for multiple word lists
	var hangmans = 'hangmans';
	var rollingHangmans = 1; // set 0 for not rolling
	var hangman = 'simple';
	var hangmanList = 'hangmans.txt';
	var currentHangman = 1;
	var maxHangman = 7;
	var approval = ['good work','nice','well done','perfect','excellent','you are the best'];
	var reproval = ['so close!','try again','you can do better','nice try','you better study harder'];
	var appid = 0;
	var repid = 0;
	var wins = 0;
	var loses = 0;
	/* ************* */
	var word;
	var hidden;
	
	$('<img/>')[0].src = hangmans+'/'+hangman+'/'+(1+currentHangman)+'.gif';
	
	function replaceAt(word, pos, letter) {
		return word.substr(0, pos) + letter + word.substr(pos+1/*letter.length*/);
	}
	
	function wordToFind(word) {
		hidden = word[0]+' ';
		for(var i=1;i<word.length-1;i++)
			if(word[i]!=' '&&word[i]!='-') {
				hidden += '_ ';
			} else {
				hidden += word[i]+' ';
			}
		hidden += word[word.length-1];
		return hidden;
	}
	
	function wrongLetter(letter) {
		var letters = $('.letter');
		for(var i=0;i<letters.length;i++)
			if(letters[i].innerHTML.toLowerCase()==letter)
				$(letters[i]).css('color','red');
		if(currentHangman < maxHangman) {
			$('#hangman').css('background-image','url('+hangmans+'/'+hangman+'/'+(++currentHangman)+'.gif)');
			if(currentHangman < maxHangman)
				$('<img/>')[0].src = hangmans+'/'+hangman+'/'+(currentHangman+1)+'.gif';
		}
		$('#message').css('color','red');
		if(currentHangman == maxHangman) {
			$('#message').html('GAME OVER');
			$('#gtranslate').html('<a href="http://translate.google.gr/#en/el/'+word+'" target="_blank">word&#39;s translation</a>');
			$('#loses').html(++loses);
			for(var i=hidden.length-1;i>1;i--) {
				if(hidden[i]=='_')
					hidden = replaceAt(hidden,i,'<font color="red">'+word[i/2]+'</font>');
			}
			$('#word').html(hidden);
		}
		else if(repid < reproval.length)
			$('#message').html(reproval[repid++]);
		else
			$('#message').html(reproval[repid=0]);
	}
	
	function rightLetter(letter) {
		var letters = $('.letter');
		for(var i=0;i<letters.length;i++)
			if(letters[i].innerHTML.toLowerCase()==letter)
				$(letters[i]).css('color','green');
		$('#message').css('color','green');
		if(!/_/g.test(hidden)) {
			$('#message').html('YOU WON!');
			$('#gtranslate').html('<a href="http://translate.google.gr/#en/el/'+word+'" target="_blank">word&#39;s definition</a>');
			$('#wins').html(++wins);
		}
		else if(appid < approval.length)
			$('#message').html(approval[appid++]);
		else
			$('#message').html(approval[appid=0]);
	}
	
	function containsWord(letter) {
		var letters = $('.letter');
		for(var i=0;i<letters.length;i++)
			if(letters[i].innerHTML.toLowerCase()==letter)
				if($(letters[i]).css('color') != 'rgb(0, 0, 0)')
					exit;
		var contains = false;
		for(var i=1;i<word.length-1;i++) {
			if(word[i]==letter) {
				contains = true;
				hidden=replaceAt(hidden,2*i,letter);
			}
		}
		if(contains)
			rightLetter(letter);
		else
			wrongLetter(letter);
		$('#word').html(hidden);
	}

	$.get('words/'+wordsFilename, function(data) {
		var lines = data.split("\n");
		// -3 because of the blanc line in the end
		var randomWord = Math.floor(Math.random()*(lines.length-1))+2;
		word = lines[randomWord];
		$('#word').html(wordToFind(word));		

		// if you create a big vocabulary except the default preload it here like that	
		$.ajax({
			url: "words/ispellwordlist.txt"
		});
	});
	
	var itemClicked = $('.letter').click(function() {
		if(currentHangman < maxHangman && /_/g.test(hidden)) {
			var letter = $(this).html().toLowerCase();			
			containsWord(letter);
		}
	});
	
	$(document).keypress(function(e){
		if(currentHangman < maxHangman && /_/g.test(hidden)) {
			var letter = String.fromCharCode(e.charCode).toLowerCase();
			if(letter>='a' && letter<='z')	
				containsWord(letter);
		}
	});

	$('#new-game').click(function(){
		if(rollingHangmans == 1)
			$.get(hangmans+'/'+hangmanList, function(data) {
				var lines = data.split("\n");
				var randomHangman = Math.floor(Math.random()*(lines.length-1));
				hangman = lines[randomHangman];
				$('<img/>')[0].src = hangmans+'/'+hangman+'/2.gif';
			});
		$.get('words/'+wordsFilename, function(data) {
			var lines = data.split("\n");
			var randomWord = Math.floor(Math.random()*(lines.length-1))+2;
			word = lines[randomWord];
			$('#word').html(wordToFind(word));	
		});
		$('#hangman').css('background-image','url('+hangmans+'/1.gif)');
		$('#message').html('');
		$('#gtranslate').html('');
		var letters = $('.letter');
		for(var i=0;i<letters.length;i++)
			$(letters[i]).css('color','black');
		currentHangman = 1;
		appid = 0;
		repid = 0;
	});
	
	if(typeof(wordFiles)!="undefined" && wordFiles!='') {
		$.get('words/'+wordFiles, function(data) {
			var lines = data.split("\n");
			for(var i=0;i<lines.length&&lines[i]!='';i++) {
				var tokens = lines[i].split('$');
				var filename = tokens[0];
				var fullTitle = tokens[1];
				if(filename == wordsFilename)
					$('#wlist').append('<ul><input id="wl'+i+'" type="radio" name="wlist" value="'+filename+'" checked ="checked"><label for="wl'+i+'">'+fullTitle+'</label></ul>');
				else
					$('#wlist').append('<ul><input id="wl'+i+'" type="radio" name="wlist" value="'+filename+'"><label for="wl'+i+'">'+fullTitle+'</label></ul>');
			}
			$('input:radio').click( function() {
				wordsFilename=$(this).val();
			});
		});
	} else {
		$('#wlist').hide();
	}
	
	$.ajax({
        url: "hangmans/hangmans.txt"
    });    
	
	/* social plugins */
	$('.facebook').fbjlike({
		layout:'box_count'
	});
	$('.google').gplusone({
		size:'tall'
	});
	$('.twitter').twitterbutton({
		user:'TwitterUserName',
		layout:'vertical'
	});

});
