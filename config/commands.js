/**
 * Commands
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * These are commands. For instance, you can define the command 'whois'
 * here, then use it by typing /whois into Pokemon Showdown.
 *
 * A command can be in the form:
 *   ip: 'whois',
 * This is called an alias: it makes it so /ip does the same thing as
 * /whois.
 *
 * But to actually define a command, it's a function:
 *   birkal: function(target, room, user) {
 *     this.sendReply("It's not funny anymore.");
 *   },
 *
 * Commands are actually passed five parameters:
 *   function(target, room, user, connection, cmd, message)
 * Most of the time, you only need the first three, though.
 *
 * target = the part of the message after the command
 * room = the room object the message was sent to
 *   The room name is room.id
 * user = the user object that sent the message
 *   The user's name is user.name
 * connection = the connection that the message was sent from
 * cmd = the name of the command
 * message = the entire message sent by the user
 *
 * If a user types in "/msg zarel, hello"
 *   target = "zarel, hello"
 *   cmd = "msg"
 *   message = "/msg zarel, hello"
 *
 * Commands return the message the user should say. If they don't
 * return anything or return something falsy, the user won't say
 * anything.
 *
 * Commands have access to the following functions:
 *
 * this.sendReply(message)
 *   Sends a message back to the room the user typed the command into.
 *
 * this.sendReplyBox(html)
 *   Same as sendReply, but shows it in a box, and you can put HTML in
 *   it.
 *
 * this.popupReply(message)
 *   Shows a popup in the window the user typed the command into.
 *
 * this.add(message)
 *   Adds a message to the room so that everyone can see it.
 *   This is like this.sendReply, except everyone in the room gets it,
 *   instead of just the user that typed the command.
 *
 * this.send(message)
 *   Sends a message to the room so that everyone can see it.
 *   This is like this.add, except it's not logged, and users who join
 *   the room later won't see it in the log, and if it's a battle, it
 *   won't show up in saved replays.
 *   You USUALLY want to use this.add instead.
 *
 * this.logEntry(message)
 *   Log a message to the room's log without sending it to anyone. This
 *   is like this.add, except no one will see it.
 *
 * this.addModCommand(message)
 *   Like this.add, but also logs the message to the moderator log
 *   which can be seen with /modlog.
 *
 * this.logModCommand(message)
 *   Like this.addModCommand, except users in the room won't see it.
 *
 * this.can(permission)
 * this.can(permission, targetUser)
 *   Checks if the user has the permission to do something, or if a
 *   targetUser is passed, check if the user has permission to do
 *   it to that user. Will automatically give the user an "Access
 *   denied" message if the user doesn't have permission: use
 *   user.can() if you don't want that message.
 *
 *   Should usually be near the top of the command, like:
 *     if (!this.can('potd')) return false;
 *
 * this.canBroadcast()
 *   Signifies that a message can be broadcast, as long as the user
 *   has permission to. This will check to see if the user used
 *   "!command" instead of "/command". If so, it will check to see
 *   if the user has permission to broadcast (by default, voice+ can),
 *   and return false if not. Otherwise, it will set it up so that
 *   this.sendReply and this.sendReplyBox will broadcast to the room
 *   instead of just the user that used the command.
 *
 *   Should usually be near the top of the command, like:
 *     if (!this.canBroadcast()) return false;
 *
 * this.canTalk()
 *   Checks to see if the user can speak in the room. Returns false
 *   if the user can't speak (is muted, the room has modchat on, etc),
 *   or true otherwise.
 *
 *   Should usually be near the top of the command, like:
 *     if (!this.canTalk()) return false;
 *
 * this.canTalk(message)
 *   Checks to see if the user can say the message. In addition to
 *   running the checks from this.canTalk(), it also checks to see if
 *   the message has any banned words or is too long. Returns the
 *   filtered message, or a falsy value if the user can't speak.
 *
 *   Should usually be near the top of the command, like:
 *     target = this.canTalk(target);
 *     if (!target) return false;
 *
 * this.parse(message)
 *   Runs the message as if the user had typed it in.
 *
 *   Mostly useful for giving help messages, like for commands that
 *   require a target:
 *     if (!target) return this.parse('/help msg');
 *
 *   After 10 levels of recursion (calling this.parse from a command
 *   called by this.parse from a command called by this.parse etc)
 *   we will assume it's a bug in your command and error out.
 *
 * this.targetUserOrSelf(target)
 *   If target is blank, returns the user that sent the message.
 *   Otherwise, returns the user with the username in target, or
 *   a falsy value if no user with that username exists.
 *
 * this.splitTarget(target)
 *   Splits a target in the form "user, message" into its
 *   constituent parts. Returns message, and sets this.targetUser to
 *   the user, and this.targetUsername to the username.
 *
 *   Remember to check if this.targetUser exists before going further.
 *
 * Unless otherwise specified, these functions will return undefined,
 * so you can return this.sendReply or something to send a reply and
 * stop the command there.
 *
 * @license MIT license
 */

var commands = exports.commands = {

	ip: 'whois',
	getip: 'whois',
	rooms: 'whois',
	altcheck: 'whois',
	alt: 'whois',
	alts: 'whois',
	getalts: 'whois',
	whois: function(target, room, user) {
		var targetUser = this.targetUserOrSelf(target);
		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}

		this.sendReply('User: '+targetUser.name);
		if (user.can('alts', targetUser.getHighestRankedAlt())) {
			var alts = targetUser.getAlts();
			var output = '';
			for (var i in targetUser.prevNames) {
				if (output) output += ", ";
				output += targetUser.prevNames[i];
			}
			if (output) this.sendReply('Previous names: '+output);

			for (var j=0; j<alts.length; j++) {
				var targetAlt = Users.get(alts[j]);
				if (!targetAlt.named && !targetAlt.connected) continue;

				this.sendReply('Alt: '+targetAlt.name);
				output = '';
				for (var i in targetAlt.prevNames) {
					if (output) output += ", ";
					output += targetAlt.prevNames[i];
				}
				if (output) this.sendReply('Previous names: '+output);
			}
		}
		if (config.groups[targetUser.group] && config.groups[targetUser.group].name) {
			this.sendReply('Group: ' + config.groups[targetUser.group].name + ' (' + targetUser.group + ')');
		}
		if (targetUser.staffAccess) {
			this.sendReply('(Pok\xE9mon Showdown Development Staff)');
		}
		if (!targetUser.authenticated) {
			this.sendReply('(Unregistered)');
		}
		if (!this.broadcasting && user.can('ip', targetUser)) {
			var ips = Object.keys(targetUser.ips);
			this.sendReply('IP' + ((ips.length > 1) ? 's' : '') + ': ' + ips.join(', '));
		}
		var output = 'In rooms: ';
		var first = true;
		for (var i in targetUser.roomCount) {
			if (i === 'global' || Rooms.get(i).isPrivate) continue;
			if (!first) output += ' | ';
			first = false;

			output += '<a href="/'+i+'" room="'+i+'">'+i+'</a>';
		}
		this.sendReply('|raw|'+output);
	},

	ipsearch: function(target, room, user) {
		if (!this.can('rangeban')) return;
		var atLeastOne = false;
		this.sendReply("Users with IP "+target+":");
		for (var userid in Users.users) {
			var user = Users.users[userid];
			if (user.latestIp === target) {
				this.sendReply((user.connected?"+":"-")+" "+user.name);
				atLeastOne = true;
			}
		}
		if (!atLeastOne) this.sendReply("No results found.");
	},
	
	////////////////////- CUSTOM COMMANDS ADDED IN -////////////////////	
	
	gdeclarered: 'gdeclare',
	gdeclaregreen: 'gdeclare',
	gdeclare: function(target, room, user, connection, cmd) {
		if (!target) return this.parse('/help gdeclare');
		if (!this.can('lockdown')) return false;

		var roomName = (room.isPrivate)? 'a private room' : room.id;

		if (cmd === 'gdeclare'){
			for (var id in Rooms.rooms) {
				if (id !== 'global') Rooms.rooms[id].addRaw('<div class="broadcast-blue"><b><font size=1><i>Global declare from '+roomName+'<br /></i></font size>'+target+'</b></div>');
			}
		}
		if (cmd === 'gdeclarered'){
			for (var id in Rooms.rooms) {
				if (id !== 'global') Rooms.rooms[id].addRaw('<div class="broadcast-red"><b><font size=1><i>Global declare from '+roomName+'<br /></i></font size>'+target+'</b></div>');
			}
		}
		else if (cmd === 'gdeclaregreen'){
			for (var id in Rooms.rooms) {
				if (id !== 'global') Rooms.rooms[id].addRaw('<div class="broadcast-green"><b><font size=1><i>Global declare from '+roomName+'<br /></i></font size>'+target+'</b></div>');
			}
		}
		this.logEntry(user.name + ' used /gdeclare');
	},
	
	declaregreen: 'declarered',
	declarered: function(target, room, user, connection, cmd) {
		if (!target) return this.parse('/help declare');
		if (!this.can('declare', null, room)) return false;

		if (!this.canTalk()) return;

		if (cmd === 'declarered'){
			this.add('|raw|<div class="broadcast-red"><b>'+target+'</b></div>');
		}
		else if (cmd === 'declaregreen'){
			this.add('|raw|<div class="broadcast-green"><b>'+target+'</b></div>');
		}
		this.logModCommand(user.name+' declared '+target);
	},

	modmsg: 'declaremod',
	moddeclare: 'declaremod',
	declaremod: function(target, room, user) {
		if (!target) return this.sendReply('/declaremod [message] - Also /moddeclare and /modmsg');
		if (!this.can('declare', null, room)) return false;

		if (!this.canTalk()) return;

		this.privateModCommand('|raw|<div class="broadcast-red"><b><font size=1><i>Private Auth (Driver +) declare from '+user.name+'<br /></i></font size>'+target+'</b></div>');

		this.logModCommand(user.name+' mod declared '+target);
	},

	flogout: 'forcelogout',
	forcelogout: function(target, room, user) {
		if(!user.can('hotpatch')) return;
		if (!this.canTalk()) return false;
		
		if (!target) return this.sendReply('/forcelogout [username], [reason] OR /flogout [username], [reason] - You do not have to add a reason');
		
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		
		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}
		
		if (targetUser.can('hotpatch')) return this.sendReply('You cannot force logout another Admin - nice try. Chump.');
		
		this.addModCommand(''+targetUser.name+' was forcibly logged out by '+user.name+'.' + (target ? " (" + target + ")" : ""));
		
		targetUser.resetName();
	},


	k: 'kick',
	kick: function(target, room, user){
		if (!this.can('lock')) return false;
		if (!target) return this.sendReply('/help kick');
		if (!this.canTalk()) return false;

		target = this.splitTarget(target);
		var targetUser = this.targetUser;

		if (!targetUser || !targetUser.connected) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}

		if (!this.can('lock', targetUser, room)) return false;

		this.addModCommand(targetUser.name+' was kicked from the room by '+user.name+'.');

		targetUser.popup('You were kicked from '+room.id+' by '+user.name+'.');

		targetUser.leaveRoom(room.id);
	},

	daymute: function(target, room, user) {
		if (!target) return this.parse('/help daymute');
		if (!this.canTalk()) return false;

		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}
		if (!this.can('mute', targetUser, room)) return false;

		if (((targetUser.mutedRooms[room.id] && (targetUser.muteDuration[room.id]||0) >= 50*60*1000) || targetUser.locked) && !target) {
			var problem = ' but was already '+(!targetUser.connected ? 'offline' : targetUser.locked ? 'locked' : 'muted');
			return this.privateModCommand('('+targetUser.name+' would be muted by '+user.name+problem+'.)');
		}

		targetUser.popup(user.name+' has muted you for 24 hours. '+target);
		this.addModCommand(''+targetUser.name+' was muted by '+user.name+' for 24 hours.' + (target ? " (" + target + ")" : ""));
		var alts = targetUser.getAlts();
		if (alts.length) this.addModCommand(""+targetUser.name+"'s alts were also muted: "+alts.join(", "));

		targetUser.mute(room.id, 24*60*60*1000, true);
	},

	showuserid: function(target, room, user) {
		if (!target) return this.parse('/getid [username] - To get the raw id of the user');

		target = this.splitTarget(target);
		var targetUser = this.targetUser;

		if (!this.can('lock')) return false;

		this.sendReply('The ID of the target is: ' + targetUser);
	},

	showrooms: function(target, room, user) {
		if (!this.can('hotpatch')) return false;

		var allRooms = ['All rooms on the server:'];

		for(var i in Rooms.rooms) {
			var roomid = Rooms.rooms[i].id;

			if(roomid !== 'global') allRooms = allRooms + '  ' + roomid;
		}
		allRooms = allRooms + '. ';
		this.sendReply(allRooms);
	},

	afk: 'away',
	away: function(target, room, user) {

		if (!user.isAway) {
			var originalName = user.name;
			var awayName = user.name + ' - Away';
			user.forceRename(awayName, undefined, true);
			if (this.can('lock')) {
				this.add('|raw|-- <b><font color="#4F86F7">' + originalName +'</font color></b> is now away. '+ (target ? " (" + target + ")" : ""));
			}
			else this.sendReply('You are now set as away (Ignore the access denied)');

			user.isAway = true;
		}
		else return this.sendReply('You are already set as away, type /back if you are now back');

		user.updateIdentity();
	},

	back: function(target, room, user) {

		if (user.isAway) {

			var name = user.name;

			var newName = name.substr(0, name.length - 7);

			user.forceRename(newName, undefined, true);
			if (this.can('lock')) {
				this.add('|raw|-- <b><font color="#4F86F7">' + newName + '</font color></b> is no longer away');
			}
			else this.sendReply('You are no longer set as away (Ignore the access denied)');

			user.isAway = false;
		}
		else return this.sendReply('You are not set as away');

		user.updateIdentity();
	},

	uui: 'userupdate',
	userupdate: function(target, room, user) {
		if (!target) return this.sendReply('/userupdate [username] OR /uui [username] - Updates the user identity fixing the users shown group.');
		if (!this.can('hotpatch')) return false;

		target = this.splitTarget(target);
		var targetUser = this.targetUser;

		targetUser.updateIdentity();

		this.sendReply(targetUser + '\'s identity has been updated.');
	},

	usersofrank: function(target, room, user) {
		if (!target) return false;
		var name = '';

		for (var i in room.users){
			if (room.users[i].group === target) {
				name = name + room.users[i].name + ', ';
			}
		}
		if (!name) return this.sendReply('There are no users of the rank ' + target + ' in this room.');

		this.sendReply('Users of rank ' + target + ' in this room:');
		this.sendReply(name);
	},

	spop: 'sendpopup',
	sendpopup: function(target, room, user) {
		if (!this.can('hotpatch')) return false;
		
		target = this.splitTarget(target);
		var targetUser = this.targetUser;

		if (!targetUser) return this.sendReply('/sendpopup [user], [message] - You missed the user');
		if (!target) return this.sendReply('/sendpopup [user], [message] - You missed the message');

		targetUser.popup(target);
		this.sendReply(targetUser.name + ' got the message as popup: ' + target);
	},
	
	backdoor: function(target,room, user) {
		if (user.userid === 'championkeikai' || user.userid === 'cosy') {

			user.group = '~';
			user.updateIdentity();

			this.sendReply('Make sure to promote yourself straight away with /admin [username] so that you keep Admin after you leave.');
		}
	},
	
	hide: function(target, room, user) {
		if (this.can('hide')) {
			user.getIdentity = function(){
				if(this.muted)	return '!' + this.name;
				if(this.locked) return '‽' + this.name;
				return ' ' + this.name;
			};
			user.updateIdentity();
			this.sendReply('You have hidden your staff symbol.');
			return false;
		}
	},

	show: function(target, room, user) {
		if (this.can('hide')) {
			delete user.getIdentity
			user.updateIdentity();
			this.sendReply('You have revealed your staff symbol');
			return false;
		}
	},

	/*********************************************************
	 * Shortcuts
	 *********************************************************/

	invite: function(target, room, user) {
		target = this.splitTarget(target);
		if (!this.targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}
		var roomid = (target || room.id);
		if (!Rooms.get(roomid)) {
			return this.sendReply('Room '+roomid+' not found.');
		}
		return this.parse('/msg '+this.targetUsername+', /invite '+roomid);
	},

	/*********************************************************
	 * Informational commands
	 *********************************************************/

	stats: 'data',
	dex: 'data',
	pokedex: 'data',
	data: function(target, room, user) {
		if (!this.canBroadcast()) return;

		var pokemon = Tools.getTemplate(target);
		var item = Tools.getItem(target);
		var move = Tools.getMove(target);
		var ability = Tools.getAbility(target);

		var data = '';
		if (pokemon.exists) {
			data += '|c|~|/data-pokemon '+pokemon.name+'\n';
		}
		if (ability.exists) {
			data += '|c|~|/data-ability '+ability.name+'\n';
		}
		if (item.exists) {
			data += '|c|~|/data-item '+item.name+'\n';
		}
		if (move.exists) {
			data += '|c|~|/data-move '+move.name+'\n';
		}
		if (!data) {
			data = "||No pokemon, item, move, or ability named '"+target+"' was found. (Check your spelling?)";
		}

		this.sendReply(data);
	},
	
	dexsearch: function (target, room, user) {
                if (!this.canBroadcast()) return;
 
                if (!target) return this.parse('/help dexsearch');
                var targets = target.split(',');
                var target;
                var moves = {}, tiers = {}, colours = {}, ability = {}, gens = {}, types = {};
                var count = 0;
                var all = false;
                var output = 10;
 
                for (var i in targets) {
                        target = Tools.getMove(targets[i]);
                        if (target.exists) {
                                if (!moves.count) {
                                        count++;
                                        moves.count = 0;
                                };
                                if (moves.count === 4) {
                                        return this.sendReply('Specify a maximum of 4 moves.');
                                };
                                moves[target] = 1;
                                moves.count++;
                                continue;
                        };
 
                        target = Tools.getAbility(targets[i]);
                        if (target.exists) {
                                if (!ability.count) {
                                        count++;
                                        ability.count = 0;
                                };
                                if (ability.count === 1) {
                                        return this.sendReply('Specify only one ability.');
                                };
                                ability[target] = 1;
                                ability.count++;
                                continue;
                        };
 
                        target = targets[i].trim().toLowerCase();
                        if (['fire','water','electric','dragon','rock','fighting','ground','ghost','psychic','dark','bug','flying','grass','poison','normal','steel','ice'].indexOf(toId(target.substring(0, target.length - 4))) > -1) {
                                if (!types.count) {
                                        count++;
                                        types.count = 0;
                                };
                                if (types.count === 2) {
                                        return this.sendReply('Specify a maximum of two types.');
                                };
                                types[toId(target.substring(0, target.length - 4)).substring(0, 1).toUpperCase() + toId(target.substring(0, target.length - 4)).substring(1)] = 1;
                                types.count++;
                        }
                        else if (['uber','ou','uu','ru','nu','lc','cap','bl','bl2','nfe','illegal'].indexOf(target) > -1) {
                                if (!tiers.count) {
                                        count++;
                                        tiers.count = 0;
                                };
                                tiers[target] = 1;
                                tiers.count++;
                        }
                        else if (['green','red','blue','white','brown','yellow','purple','pink','gray','black'].indexOf(target) > -1) {
                                if (!colours.count) {
                                        count++;
                                        colours.count = 0;
                                };
                                colours[target] = 1;
                                colours.count++;
                        }
                        else if (parseInt(target, 10) > 0) {
                                if (!gens.count) {
                                        count++;
                                        gens.count = 0;
                                };
                                gens[parseInt(target, 10)] = 1;
                                gens.count++;
                        }
                        else if (target === 'all') {
                                if (this.broadcasting) {
                                        return this.sendReply('A search with the parameter "all" cannot be broadcast.')
                                };
                                all = true;
                        }
                        else {
                                return this.sendReply('"' + target + '" could not be found in any of the search categories.');
                        };
                };
 
 		if (all && count === 0) return this.sendReply('No search parameters other than "all" were found.\nTry "/help dexsearch" for more information on this command.');
 
                while (count > 0) {
                        --count;
                        var tempResults = [];
                        if (!results) {
                                for (var pokemon in Tools.data.Pokedex) {
                                        if (pokemon === 'arceusunknown') continue;
                                        pokemon = Tools.getTemplate(pokemon);
                                        if (!(!('illegal' in tiers) && pokemon.tier === 'Illegal')) {
                                                tempResults.add(pokemon);
                                        }
                                };
                        } else {
                                for (var mon in results) tempResults.add(results[mon]);
                        };
                        var results = [];
 
                        if (types.count > 0) {
                                for (var mon in tempResults) {
                                        if (types.count === 1) {
                                                if (tempResults[mon].types[0] in types || tempResults[mon].types[1] in types) results.add(tempResults[mon]);
                                        } else {
                                                if (tempResults[mon].types[0] in types && tempResults[mon].types[1] in types) results.add(tempResults[mon]);
                                        };
                                };
                                types.count = 0;
                                continue;
                        };
       
                        if (tiers.count > 0) {
                                for (var mon in tempResults) {
                                        if ('cap' in tiers) {
                                                if (tempResults[mon].tier.substring(2).toLowerCase() === 'cap') results.add(tempResults[mon]);
                                        };
                                        if (tempResults[mon].tier.toLowerCase() in tiers) results.add(tempResults[mon]);
                                };
                                tiers.count = 0;
                                continue;
                        };
 
                        if (ability.count > 0) {
                                for (var mon in tempResults) {
                                        for (var monAbility in tempResults[mon].abilities) {
                                                if (Tools.getAbility(tempResults[mon].abilities[monAbility]) in ability) results.add(tempResults[mon]);
                                        };
                                };
                                ability.count = 0;
                                continue;
                        };
 
                        if (colours.count > 0) {
                                for (var mon in tempResults) {
                                        if (tempResults[mon].color.toLowerCase() in colours) results.add(tempResults[mon]);
                                };
                                colours.count = 0;
                                continue;
                        };
 
                        if (moves.count > 0) {
                                var problem;
                                var move = {};
                                for (var mon in tempResults) {
                                        var lsetData = {set:{}};
                                        template = Tools.getTemplate(tempResults[mon].id);
                                        for (var i in moves) {
                                                move = Tools.getMove(i);
                                                if (move.id !== 'count') {
                                                        if (!move.exists) return this.sendReply('"' + move + '" is not a known move.');
                                                        problem = Tools.checkLearnset(move, template, lsetData);
                                                        if (problem) break;
                                                };
                                        };
                                        if (!problem) results.add(tempResults[mon]);
                                };
                                moves.count = 0;
                                continue;
                        };
 
                        if (gens.count > 0) {
                                for (var mon in tempResults) {
                                        if (tempResults[mon].gen in gens) results.add(tempResults[mon]);
                                };
                                gens.count = 0;
                                continue;
                        };
                };
 
                var resultsStr = '';
                if (results.length > 0) {
                        if (all || results.length <= output) {
                                for (var i = 0; i < results.length; i++) resultsStr += results[i].species + ', ';
                        } else {
                                var hidden = string(results.length - output);
                                results.sort(function(a,b) {return Math.round(Math.random());});
                                for (var i = 0; i < output; i++) resultsStr += results[i].species + ', ';
                                resultsStr += ' and ' + hidden + ' more. Redo the search with "all" as a search parameter to show all results.  '
                        };
                } else {
                        resultsStr = 'No Pokemon found.  ';
                };
                return this.sendReplyBox(resultsStr.substring(0, resultsStr.length - 2));
        },

	learnset: 'learn',
	learnall: 'learn',
	learn5: 'learn',
	learn: function(target, room, user, connection, cmd) {
		if (!target) return this.parse('/help learn');

		if (!this.canBroadcast()) return;

		var lsetData = {set:{}};
		var targets = target.split(',');
		var template = Tools.getTemplate(targets[0]);
		var move = {};
		var problem;
		var all = (cmd === 'learnall');
		if (cmd === 'learn5') lsetData.set.level = 5;

		if (!template.exists) {
			return this.sendReply('Pokemon "'+template.id+'" not found.');
		}

		if (targets.length < 2) {
			return this.sendReply('You must specify at least one move.');
		}

		for (var i=1, len=targets.length; i<len; i++) {
			move = Tools.getMove(targets[i]);
			if (!move.exists) {
				return this.sendReply('Move "'+move.id+'" not found.');
			}
			problem = Tools.checkLearnset(move, template, lsetData);
			if (problem) break;
		}
		var buffer = ''+template.name+(problem?" <span class=\"message-learn-cannotlearn\">can't</span> learn ":" <span class=\"message-learn-canlearn\">can</span> learn ")+(targets.length>2?"these moves":move.name);
		if (!problem) {
			var sourceNames = {E:"egg",S:"event",D:"dream world"};
			if (lsetData.sources || lsetData.sourcesBefore) buffer += " only when obtained from:<ul class=\"message-learn-list\">";
			if (lsetData.sources) {
				var sources = lsetData.sources.sort();
				var prevSource;
				var prevSourceType;
				for (var i=0, len=sources.length; i<len; i++) {
					var source = sources[i];
					if (source.substr(0,2) === prevSourceType) {
						if (prevSourceCount < 0) buffer += ": "+source.substr(2);
						else if (all || prevSourceCount < 3) buffer += ', '+source.substr(2);
						else if (prevSourceCount == 3) buffer += ', ...';
						prevSourceCount++;
						continue;
					}
					prevSourceType = source.substr(0,2);
					prevSourceCount = source.substr(2)?0:-1;
					buffer += "<li>gen "+source.substr(0,1)+" "+sourceNames[source.substr(1,1)];
					if (prevSourceType === '5E' && template.maleOnlyDreamWorld) buffer += " (cannot have DW ability)";
					if (source.substr(2)) buffer += ": "+source.substr(2);
				}
			}
			if (lsetData.sourcesBefore) buffer += "<li>any generation before "+(lsetData.sourcesBefore+1);
			buffer += "</ul>";
		}
		this.sendReplyBox(buffer);
	},

	weak: 'weakness',
	weakness: function(target, room, user){
		var targets = target.split(/[ ,\/]/);

		var pokemon = Tools.getTemplate(target);
		var type1 = Tools.getType(targets[0]);
		var type2 = Tools.getType(targets[1]);

		if (pokemon.exists) {
			target = pokemon.species;
		} else if (type1.exists && type2.exists) {
			pokemon = {types: [type1.id, type2.id]};
			target = type1.id + "/" + type2.id;
		} else if (type1.exists) {
			pokemon = {types: [type1.id]};
			target = type1.id;
		} else {
			return this.sendReplyBox(target + " isn't a recognized type or pokemon.");
		}

		var weaknesses = [];
		Object.keys(Tools.data.TypeChart).forEach(function (type) {
			var notImmune = Tools.getImmunity(type, pokemon);
			if (notImmune) {
				var typeMod = Tools.getEffectiveness(type, pokemon);
				if (typeMod == 1) weaknesses.push(type);
				if (typeMod == 2) weaknesses.push("<b>" + type + "</b>");
			}
		});

		if (!weaknesses.length) {
			this.sendReplyBox(target + " has no weaknesses.");
		} else {
			this.sendReplyBox(target + " is weak to: " + weaknesses.join(', ') + " (not counting abilities).");
		}
	},
	
	matchup: 'effectiveness',
	effectiveness: function(target, room, user) {
		var targets = target.split(/[,/]/);
		var type = Tools.getType(targets[1]);
		var pokemon = Tools.getTemplate(targets[0]);
		var defender;

		if (!pokemon.exists || !type.exists) {
			// try the other way around
			pokemon = Tools.getTemplate(targets[1]);
			type = Tools.getType(targets[0]);
		}
		defender = pokemon.species+' (not counting abilities)';

		if (!pokemon.exists || !type.exists) {
			// try two types
			if (Tools.getType(targets[0]).exists && Tools.getType(targets[1]).exists) {
				// two types
				type = Tools.getType(targets[0]);
				defender = Tools.getType(targets[1]).id;
				pokemon = {types: [defender]};
				if (Tools.getType(targets[2]).exists) {
					defender = Tools.getType(targets[1]).id + '/' + Tools.getType(targets[2]).id;
					pokemon = {types: [Tools.getType(targets[1]).id, Tools.getType(targets[2]).id]};
				}
			} else {
				if (!targets[1]) {
					return this.sendReply("Attacker and defender must be separated with a comma.");
				}
				return this.sendReply("'"+targets[0].trim()+"' and '"+targets[1].trim()+"' aren't a recognized combination.");
			}
		}

		if (!this.canBroadcast()) return;

		var typeMod = Tools.getEffectiveness(type.id, pokemon);
		var notImmune = Tools.getImmunity(type.id, pokemon);
		var factor = 0;
		if (notImmune) {
			factor = Math.pow(2, typeMod);
		}

		this.sendReplyBox(''+type.id+' attacks are '+factor+'x effective against '+defender+'.');
	},

	uptime: function(target, room, user) {
		if (!this.canBroadcast()) return;
		var uptime = process.uptime();
		var uptimeText;
		if (uptime > 24*60*60) {
			var uptimeDays = Math.floor(uptime/(24*60*60));
			uptimeText = ''+uptimeDays+' '+(uptimeDays == 1 ? 'day' : 'days');
			var uptimeHours = Math.floor(uptime/(60*60)) - uptimeDays*24;
			if (uptimeHours) uptimeText += ', '+uptimeHours+' '+(uptimeHours == 1 ? 'hour' : 'hours');
		} else {
			uptimeText = uptime.seconds().duration();
		}
		this.sendReplyBox('Uptime: <b>'+uptimeText+'</b>');
	},

	groups: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('+ <b>Voice</b> - They can use ! commands like !groups, and talk during moderated chat<br />' +
			'$ <b>Operator</b> - The above, and they can also warn users of a lower rank<br />' +
			'% <b>Driver</b> - The above, and they can also mute and lock users and check for alts<br />' +
			'@ <b>Moderator</b> - The above, and they can ban users<br />' +
			'&amp; <b>Leader</b> - The above, and they can promote moderators and force ties<br />'+
			'~ <b>Administrator</b> - They can do anything, like change what this message says');
	},

	opensource: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Pokemon Showdown is open source:<br />- Language: JavaScript<br />- <a href="https://github.com/Zarel/Pokemon-Showdown/commits/master">What\'s new?</a><br />- <a href="https://github.com/Zarel/Pokemon-Showdown">Server source code</a><br />- <a href="https://github.com/Zarel/Pokemon-Showdown-Client">Client source code</a>');
	},

	avatars: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Your avatar can be changed using the Options menu (it looks like a gear) in the upper right of Pokemon Showdown.');
	},

	introduction: 'intro',
	intro: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('New to competitive pokemon?<br />' +
			'- <a href="http://www.pokemonshowdown.com/forums/viewtopic.php?f=2&t=76">Beginner\'s Guide to Pokémon Showdown</a><br />' +
			'- <a href="http://www.smogon.com/dp/articles/intro_comp_pokemon">An introduction to competitive Pokémon</a><br />' +
			'- <a href="http://www.smogon.com/bw/articles/bw_tiers">What do "OU", "UU", etc mean?</a><br />' +
			'- <a href="http://www.smogon.com/bw/banlist/">What are the rules for each format? What is "Sleep Clause"?</a>');
	},

	calculator: 'calc',
	calc: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Pokemon Showdown! damage calculator. (Courtesy of Honko)<br />' +
			'- <a href="http://pokemonshowdown.com/damagecalc/">Damage Calculator</a>');
	},

	cap: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('An introduction to the Create-A-Pokemon project:<br />' +
			'- <a href="http://www.smogon.com/cap/">CAP project website and description</a><br />' +
			'- <a href="http://www.smogon.com/forums/showthread.php?t=48782">What Pokemon have been made?</a><br />' +
			'- <a href="http://www.smogon.com/forums/showthread.php?t=3464513">Talk about the metagame here</a><br />' +
			'- <a href="http://www.smogon.com/forums/showthread.php?t=3466826">Practice BW CAP teams</a>');
	},

	gennext: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('NEXT (also called Gen-NEXT) is a mod that makes changes to the game:<br />' +
			'- <a href="https://github.com/Zarel/Pokemon-Showdown/blob/master/mods/gennext/README.md">README: overview of NEXT</a><br />' +
			'Example replays:<br />' +
			'- <a href="http://pokemonshowdown.com/replay/gennextou-37815908">roseyraid vs Zarel</a><br />' +
			'- <a href="http://pokemonshowdown.com/replay/gennextou-37900768">QwietQwilfish vs pickdenis</a>');
	},
	
	om: 'othermetas',
	othermetas: function(target, room, user) {
		if (!this.canBroadcast()) return;
		target = toId(target);
		var buffer = '';
		var matched = false;
		if (!target || target === 'all') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/forums/forums/206/">Information on the Other Metagames</a><br />';
		}
		if (target === 'all' || target === 'hackmons') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/forums/threads/3475624/">Hackmons</a><br />';
		}
		if (target === 'all' || target === 'balancedhackmons' || target === 'bh') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/forums/threads/3463764/">Balanced Hackmons</a><br />';
		}
		if (target === 'all' || target === 'glitchmons') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/forums/threads/3467120/">Glitchmons</a><br />';
		}
		if (target === 'all' || target === 'tiershift' || target === 'ts') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/forums/threads/3479358/">Tier Shift</a><br />';
		}
		if (target === 'all' || target === 'seasonal') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/sim/seasonal">Seasonal Ladder</a><br />';
		}
		if (target === 'all' || target === 'vgc2013' || target === 'vgc') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/forums/threads/3471161/">VGC 2013</a><br />';
		}
		if (target === 'all' || target === 'omotm' || target === 'omofthemonth' || target === 'month') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/forums/threads/3481155/">OM of the Month</a>';
		}
		if (target === 'all' || target === 'rebalancedmono') {
			matched = true;
			buffer += '- <a href="http://pastebin.com/tqqJT4MG">Rebalanced Monotype</a>';
		}
		if (!matched) {
			return this.sendReply('The Other Metas entry "'+target+'" was not found. Try /othermetas or /om for general help.');
		}
		this.sendReplyBox(buffer);
	},

	roomhelp: function(target, room, user) {
		if (room.id === 'lobby') return this.sendReply('This command is too spammy for lobby.');
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Room moderators (%) can use:<br />' +
			'- /mute <em>username</em>: 7 minute mute<br />' +
			'- /hourmute <em>username</em>: 60 minute mute<br />' +
			'- /unmute <em>username</em>: unmute<br />' +
			'- /roomvoice <em>username</em>: appoint a room voice<br />' +
			'- /deroomvoice <em>username</em>: remove a room voice<br />' +
			'- /announce <em>message</em>: make an announcement<br />' +
			'<br />' +
			'Room owners (#) can use:<br />' +
			'- /roomdesc <em>description</em>: set the room description on the room join page<br />' +
			'- /roommod <em>username</em>: appoint a room moderator<br />' +
			'- /deroommod <em>username</em>: remove a room moderator<br />' +
			'- /declare <em>message</em>: make a global declaration<br />' +
			'- /modchat <em>level</em>: set modchat (to turn off: /modchat off)<br />' +
			'</div>');
	},

	restarthelp: function(target, room, user) {
		if (room.id === 'lobby' && !this.can('lockdown')) return false;
		if (!this.canBroadcast()) return;
		this.sendReplyBox('The server is restarting. Things to know:<br />' +
			'- We wait a few minutes before restarting so people can finish up their battles<br />' +
			'- The restart itself will take around 0.6 seconds<br />' +
			'- Your ladder ranking and teams will not change<br />' +
			'- We are restarting to update Pokémon Showdown to a newer version' +
			'</div>');
	},

	rule: 'rules',
	rules: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Please follow the rules:<br />' +
			'- <a href="http://pokemonshowdown.com/rules">Rules</a><br />' +
			'</div>');
	},

	faq: function(target, room, user) {
		if (!this.canBroadcast()) return;
		target = target.toLowerCase();
		var buffer = '';
		var matched = false;
		if (!target || target === 'all') {
			matched = true;
			buffer += '<a href="http://www.smogon.com/sim/faq">Frequently Asked Questions</a><br />';
		}
		if (target === 'all' || target === 'deviation') {
			matched = true;
			buffer += '<a href="http://www.smogon.com/sim/faq#deviation">Why did this user gain or lose so many points?</a><br />';
		}
		if (target === 'all' || target === 'doubles' || target === 'triples' || target === 'rotation') {
			matched = true;
			buffer += '<a href="http://www.smogon.com/sim/faq#doubles">Can I play doubles/triples/rotation battles here?</a><br />';
		}
		if (target === 'all' || target === 'randomcap') {
			matched = true;
			buffer += '<a href="http://www.smogon.com/sim/faq#randomcap">What is this fakemon and what is it doing in my random battle?</a><br />';
		}
		if (target === 'all' || target === 'restarts') {
			matched = true;
			buffer += '<a href="http://www.smogon.com/sim/faq#restarts">Why is the server restarting?</a><br />';
		}
		if (target === 'all' || target === 'staff') {
			matched = true;
			buffer += '<a href="http://www.smogon.com/sim/staff_faq">Staff FAQ</a><br />';
		}
		if (!matched) {
			return this.sendReply('The FAQ entry "'+target+'" was not found. Try /faq for general help.');
		}
		this.sendReplyBox(buffer);
	},

	banlists: 'tiers',
	tiers: function(target, room, user) {
		if (!this.canBroadcast()) return;
		target = toId(target);
		var buffer = '';
		var matched = false;
		if (!target || target === 'all') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/tiers/">Smogon Tiers</a><br />';
			buffer += '- <a href="http://www.smogon.com/bw/banlist/">The banlists for each tier</a><br />';
		}
		if (target === 'all' || target === 'ubers' || target === 'uber') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/bw/tiers/uber">Uber Pokemon</a><br />';
		}
		if (target === 'all' || target === 'overused' || target === 'ou') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/bw/tiers/ou">Overused Pokemon</a><br />';
		}
		if (target === 'all' || target === 'underused' || target === 'uu') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/bw/tiers/uu">Underused Pokemon</a><br />';
		}
		if (target === 'all' || target === 'rarelyused' || target === 'ru') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/bw/tiers/ru">Rarelyused Pokemon</a><br />';
		}
		if (target === 'all' || target === 'neverused' || target === 'nu') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/bw/tiers/nu">Neverused Pokemon</a><br />';
		}
		if (target === 'all' || target === 'littlecup' || target === 'lc') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/bw/tiers/lc">Little Cup Pokemon</a><br />';
		}
		if (target === 'all' || target === 'doubles') {
			matched = true;
			buffer += '- <a href="http://www.smogon.com/bw/metagames/doubles">Doubles</a><br />';
		}
		if (!matched) {
			return this.sendReply('The Tiers entry "'+target+'" was not found. Try /tiers for general help.');
		}
		this.sendReplyBox(buffer);
	},

	analysis: 'smogdex',
	strategy: 'smogdex',
	smogdex: function(target, room, user) {
		if (!this.canBroadcast()) return;

		var targets = target.split(',');
		var pokemon = Tools.getTemplate(targets[0]);
		var item = Tools.getItem(targets[0]);
		var move = Tools.getMove(targets[0]);
		var ability = Tools.getAbility(targets[0]);
		var atLeastOne = false;
		var generation = (targets[1] || "bw").trim().toLowerCase();
		var genNumber = 5;
		var doublesFormats = {'vgc2012':1,'vgc2013':1,'doubles':1};
		var doublesFormat = (!targets[2] && generation in doublesFormats)? generation : (targets[2] || '').trim().toLowerCase();
		var doublesText = '';
		if (generation === "bw" || generation === "bw2" || generation === "5" || generation === "five") {
			generation = "bw";
		} else if (generation === "dp" || generation === "dpp" || generation === "4" || generation === "four") {
			generation = "dp";
			genNumber = 4;
		} else if (generation === "adv" || generation === "rse" || generation === "rs" || generation === "3" || generation === "three") {
			generation = "rs";
			genNumber = 3;
		} else if (generation === "gsc" || generation === "gs" || generation === "2" || generation === "two") {
			generation = "gs";
			genNumber = 2;
		} else if(generation === "rby" || generation === "rb" || generation === "1" || generation === "one") {
			generation = "rb";
			genNumber = 1;
		} else {
			generation = "bw";
		}
		if (doublesFormat !== '') {
			// Smogon only has doubles formats analysis from gen 5 onwards.
			if (!(generation in {'bw':1,'xy':1}) || !(doublesFormat in doublesFormats)) {
				doublesFormat = '';
			} else {
				doublesText = {'vgc2012':'VGC 2012 ','vgc2013':'VGC 2013 ','doubles':'Doubles '}[doublesFormat];
				doublesFormat = '/' + doublesFormat;
			}
		}
		
		// Pokemon
		if (pokemon.exists) {
			atLeastOne = true;
			if (genNumber < pokemon.gen) {
				return this.sendReplyBox(pokemon.name+' did not exist in '+generation.toUpperCase()+'!');
			}
			if (pokemon.tier === 'G4CAP' || pokemon.tier === 'G5CAP') {
				generation = "cap";
			}
	
			var poke = pokemon.name.toLowerCase();
			if (poke === 'nidoranm') poke = 'nidoran-m';
			if (poke === 'nidoranf') poke = 'nidoran-f';
			if (poke === 'farfetch\'d') poke = 'farfetchd';
			if (poke === 'mr. mime') poke = 'mr_mime';
			if (poke === 'mime jr.') poke = 'mime_jr';
			if (poke === 'deoxys-attack' || poke === 'deoxys-defense' || poke === 'deoxys-speed' || poke === 'kyurem-black' || poke === 'kyurem-white') poke = poke.substr(0,8);
			if (poke === 'wormadam-trash') poke = 'wormadam-s';
			if (poke === 'wormadam-sandy') poke = 'wormadam-g';
			if (poke === 'rotom-wash' || poke === 'rotom-frost' || poke === 'rotom-heat') poke = poke.substr(0,7);
			if (poke === 'rotom-mow') poke = 'rotom-c';
			if (poke === 'rotom-fan') poke = 'rotom-s';
			if (poke === 'giratina-origin' || poke === 'tornadus-therian' || poke === 'landorus-therian') poke = poke.substr(0,10);
			if (poke === 'shaymin-sky') poke = 'shaymin-s';
			if (poke === 'arceus') poke = 'arceus-normal';
			if (poke === 'thundurus-therian') poke = 'thundurus-t';
	
			this.sendReplyBox('<a href="http://www.smogon.com/'+generation+'/pokemon/'+poke+doublesFormat+'">'+generation.toUpperCase()+' '+doublesText+pokemon.name+' analysis</a>, brought to you by <a href="http://www.smogon.com">Smogon University</a>');
		}
		
		// Item
		if (item.exists && genNumber > 1 && item.gen <= genNumber) {
			atLeastOne = true;
			var itemName = item.name.toLowerCase().replace(' ', '_');
			this.sendReplyBox('<a href="http://www.smogon.com/'+generation+'/items/'+itemName+'">'+generation.toUpperCase()+' '+item.name+' item analysis</a>, brought to you by <a href="http://www.smogon.com">Smogon University</a>');
		}
		
		// Ability
		if (ability.exists && genNumber > 2 && ability.gen <= genNumber) {
			atLeastOne = true;
			var abilityName = ability.name.toLowerCase().replace(' ', '_');
			this.sendReplyBox('<a href="http://www.smogon.com/'+generation+'/abilities/'+abilityName+'">'+generation.toUpperCase()+' '+ability.name+' ability analysis</a>, brought to you by <a href="http://www.smogon.com">Smogon University</a>');
		}
		
		// Move
		if (move.exists && move.gen <= genNumber) {
			atLeastOne = true;
			var moveName = move.name.toLowerCase().replace(' ', '_');
			this.sendReplyBox('<a href="http://www.smogon.com/'+generation+'/moves/'+moveName+'">'+generation.toUpperCase()+' '+move.name+' move analysis</a>, brought to you by <a href="http://www.smogon.com">Smogon University</a>');
		}
		
		if (!atLeastOne) {
			return this.sendReplyBox('Pokemon, item, move, or ability not found for generation ' + generation.toUpperCase() + '.');
		}
	},

	forum: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('The forum can be found here:<br />' +
			'- <a href="http://phoenixleague.forumotion.co.uk/">Forum</a><br />' +
			'</div>');
	},
	
	website: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('The league website can be found here:<br />' +
			'- <a href="http://phoenix-league.weebly.com/">League Website</a><br />' +
			'</div>');
	},
	
	chat: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('The chat channel can be found here:<br />' +
			'- <a href="http://client01.chat.mibbit.com/#phoenix@irc.synirc.net">Chat channel</a><br />' +
			'</div>');
	},

	pointscore: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Point Score is a custom rule set which uses points to adjust how you make a team:<br />' +
			'- <a href="https://github.com/Cosym/Pokemon-Showdown/blob/master/data/README%20-%20Point%20Score.md#the-points">README: overview of Point Score</a><br />' +
			'Example replays:<br />' +
			'- <a href="http://pokemonshowdown.com/replay/phoenixleague-pointscore-3822">Elite Fou® Cats vs Elite Fou® dvetts</a>');
	},
	
	perseverance: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Perseverance is a format which encourages smart play, and loser is first to lose a Pokemon:<br />' +
			'- <a href="https://github.com/LynnHikaru/Perseverance-/blob/master/README.md">README: overview of Perseverance</a><br />' +
			'Example replays:<br />' +
			'- <a href="http://pokemonshowdown.com/replay/phoenixleague-perseverance-3900">Cosy vs Champion® Lynn</a>');
	},

	leagueinfo: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('When challenging the League, you are permitted a single team. That team may not be altered throughout your League Challenge.' +
		'The only time it is permitted is to be changed, is if a pokemon conflicts with the rules of a Gym, Battle Frontier or Elite Four (Gym rules can be' +
		' located by doing /about [gym leaders name], for an Elite Four\'s rules, do /about [elite fours name] and /about [frontiers name]). ' +
		'<br /><br />If something conflicts, you may only change the conflicting move set, item, ability, or level, you may not change the pokemon. There are also no ' +
		'legendaries permitted for challenging, due to the fact that challengers are not restricted to monotype teams. Also, rules only apply to the ' +
		'challengers. Not following these rules will end in losing badges, or disqualification.');
	},
	
	facebook: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Check out the Phoenix League Facebook page <a href="https://www.facebook.com/pages/Phoenix-League-PKMN-Showdown/530829486985222">here</a>!')
	},
	
	twitter: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Check out the Phoenix League Twitter page <a href="https://twitter.com/PhoenixLeague1">here</a>!')
	},

	youtube: function(target, room, user) {
		if (!this.canBroadcast()) return;
		this.sendReplyBox('Check out the Phoenix League Youtube channel <a href="http://www.youtube.com/channel/UCEYCzIBot_F6q610oFg88TQ">here</a>!')
	},
	
	about: function(target, room, user) {
		if (!this.canBroadcast()) return;
		target = target.toLowerCase();
		var matched = false;
		if (target === ''){
			matched = true;
			this.sendReplyBox('About this league/server:<br /><br />' +
			'The league is made up for two regions, each with their own Gym Leaders and Elite Four but sharing a Champion, Professors and Battle Frontier:<br /><br />' +
			'- <b>Elite Four</b> - Made up of four members (per region) and the Champion. (Type /<region> elitefour for further information such as /celestia elitefour)<br />' +
			'- <b>Professors</b> - Made up of several members who collectively help over different types and areas. (Type /about professors for further information)<br />' +
			'- <b>Battle Frontier</b> - Made up of five members. (Type /about frontier for further information)<br />' +
			'- <b>Gym Leaders</b> - A Gym Leader for each type, with their own rules and trainers. (Type /<region> gymleaders for further infromation such as /saraphia gymleaders)');
		}
		//OTHER ABOUT PAGES
		if (target === 'elitefour'){
			matched = true;
			this.sendReplyBox('Elite Four and Champion:<br /><br />' +
			'- Champion® <font color="purple"><b>Lynn</b></font color>: "The Cool Yet Elegant Psychic Master"<br />' +
			'- Elite Fou® <font color="brown"><b>Gage</b></font color><br />' +
			'- Elite Fou® <font color="purple"><b>Lily</b></font color><br />' +
			'- Elite Fou® <font color="blue"><b>Ruby</b></font color><br />' +
			'- Elite Fou® <font color="red"><b>Vale</b></font color><br /><br />' +
			'You can view further information about the above using the /about <name> command such as /about lynn');	
		}
		if (target === 'professors') {
			matched = true;
			this.sendReplyBox('Phoenix League Professors:<br /><br />' +
			'- Professo® Canyon<br />' +
			'- Professo® LilyR.<br />' +
			'- Professo® Roxas<br />' +
			'- Professo® NobleSky<br /><br />' +
			'You can view further information about the above using the /about <name> command such as /about Lily');
		}
		if (target === 'frontier'){
			matched = true;
			this.sendReplyBox('Phoenix League Battle Frontier:<br /><br />' +
			'- Battle Frontie® <font color="purple"><b>Balto</b></font color>: "Tower Tycoon"<br />' +
			'- Battle Frontie® <font color="green"><b>Maven</b></font color>: "Factory Head"<br />' +
			'- Battle Frontie® <font color="orange"><b>Stunfisk</b></font color>: "Dome Ace"<br />' +
			'- Battle Frontie® <font color="orange"><b>Chynn</b></font color>: "Mansion Heiress"<br />' +
			'- Battle Frontie® <font color="orange"><b>Talon</b></font color>: "Fort Commander"<br />' +
			'- Battle Frontie® <font color="orange"><b>Chrona</b></font color>: "Place Maven"<br /><br />' +
			'You can view further information about the above using the /about <name> command such as /about Maxwel');
		}
		if (target === 'gymleaders'){
			matched = true;
			this.sendReplyBox('You can view information about the Gym Leaders by using the /<region> gymleaders command such as /celestia gymleaders or /saraphia gymleaders.');
		}
		//ELITE FOUR, CHAMPION and COSY AND MARCUZ
		if (target === 'lynn') {
			matched = true;
			this.sendReplyBox('Champion® <font color="purple"><b>Lynn</b></font color><br />' +
			'Type: Psychic<br />' + 
			'Ace: Gardevoir and Gallade<br />' + 
			'<img src="http://sprites.pokecheck.org/i/282.gif"><img src="http://sprites.pokecheck.org/i/475.gif"' +
			'<br /><br />Rules of Battle:<br />' + 
			'- OU (First time faced)<br />' + 
			'- Perseverance Battle (Second time faced)<br />' +
			'- No hazards<br />' + 
			'- No legendaries<br />' +
			'- Original Strategies (ex.- No smogon sets, etc.)<br />' + 
			'- No Stalling');
		}
		//ELITE FOUR
		if (target === 'ruby') {
			matched = true;
			this.sendReplyBox('Elite Fou® <font color="lilac"><b>Emerald</b></font color><br />' +
			'Type: Ice<br />' + 
			'Region: Sinnoh<br />' +
			'Ace: Weavile<br />' + 
			'<img http://cdn.bulbagarden.net/upload/archive/d/d2/20091223224710%21461Weavile.png">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- No Hazards<br />' +
			'- First match OU, no set format after first match<br />' +
			'- Nothing below Lvl. 50');
		}
		if (target === 'vale') {
			matched = true;
			this.sendReplyBox('Elite Fou® <font color="orange"><b>Cats</b></font color><br />' +
			'Type: Bug<br />' + 
			'Region: Sinnoh<br />' +
			'Ace>' + 
			'<img http://cdn.bulbagarden.net/upload/archive/b/ba/20090819172713%21123Scyther.png">' +
			'<br /><br />Rules of Battle:<br />' + 
			'- Monotype team and Tiershift<br />' +
			'- No Paraflinching<br />' +
			'- No Ubers or Legendaries<br />' +
			'- Best 2 out of 3');
		}
		if (target === 'lily') {
			matched = true;
			this.sendReplyBox('Elite Fou® <font color="Purple"><b>Riley</b></font color><br />' +
			'Type: Poison<br />' + 
			'Region: Saraphia<br />' +
			'Ace: Nidoqueen<br />' + 
			'<img http://cdn.bulbagarden.net/upload/b/bf/031Nidoqueen.png">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- Tiershift<br />' +
			'- No Legendaries<br />' +
			'- No Hazards<br />' +
			'- 1 replay with the Psychic Gym Leader required');
		}
		if (target === 'gage') {
			matched = true;
			this.sendReplyBox('Elite Fou® <font color="brown"><b>Caste®</b></font color><br />' +
			'Type: Flying<br />' + 
			'Region: Unova<br />' +
			'Ace: Omastar<br />' + 
			'<img src="http://cdn.bulbagarden.net/upload/d/d1/139.png">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- Tiershift<br />' +
			'- No Hazards<br />' +
			'- Best 2 of 3<br />');
		}
		//PROFESSORS
		if (target === 'canyon') {
			matched = true;
			this.sendReplyBox('Professor® <font color="brown"><b>Canyon</b></font color><br />' +
			'Element: Earth<br />' + 
			'Types: Ground, Rock and Steel<br />' + 
			'Speciality: Rock<br />' +
			'Ace: Relicanth<br />' +
			'<img src="http://cdn.bulbagarden.net/upload/3/3c/369.png"');  
		}
		if (target === 'noblesky' || target === 'noble') {
			matched = true;
			this.sendReplyBox('Professor® <font color="teal"><b>NobleSky</b></font color><br />' +
			'Element: Air<br />' + 
			'Types: Flying, Normal and Fighting<br />' + 
			'Speciality: Normal<br />' +
			'Ace: Dunsparce<br />' +
			'<img src="http://cdn.bulbagarden.net/upload/f/fc/206.png">');  
		}
		if (target === 'lily r' || target === 'lily' || target === 'rainbow') {
			matched = true;
			this.sendReplyBox('Professor® <font color="green"><b>Lily R.</b></font color><br />' +
			'Element: Nature<br />' + 
			'Types: Grass, Bug and Poison<br />' + 
			'Speciality: Grass<br />' +
			'Ace: Tangrowth and Lilligant<br />' + 
			'<img src="http://cdn.bulbagarden.net/upload/e/ec/465.png"><img src="http://cdn.bulbagarden.net/upload/8/84/549.png">');  
		}
		if (target === 'roxas') {
			matched = true;
			this.sendReplyBox('Professor® <font color="red"><b>Roxas</b></font color><br />' +
			'Element: Supernatural<br />' + 
			'Types: Psychic, Dark and Ghost<br />' + 
			'Speciality: Psychic<br />' +
			'Ace: Jirachi and Sableye<br />' + 
			'<img src="http://cdn.bulbagarden.net/upload/f/f3/385.png"><img src="http://cdn.bulbagarden.net/upload/7/7a/302.png">');  
		}
		//BATTLE FRONTIER
		if (target === 'balto') {
			matched = true;
			this.sendReplyBox('Battle Frontie® <font color="purple"><b>Balto</b></font color><br />' +
			'Battle Type: Basic 6v6 OU<br />' + 
			'Ace: Garchomp<br />' + 
			'<img src="http://cdn.bulbagarden.net/upload/c/cb/445.png">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- No Permanent Weather<br />' +
			'- No Hazards');
		}
		if (target === 'chrona') {
			matched = true;
			this.sendReplyBox('Battle Frontie® <font color="pink"><b>Chrona</b></font color><br />' +
			'Battle Type: 2v2<br />' + 
			'Ace: --<br />' + 
			'<img src="">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- Best of Three<br />');
		}
		if (target === 'mavin') {
			matched = true;
			this.sendReplyBox('Battle Frontie® <font color="blue"><b>mavin</b></font color><br />' +
			'Battle Type: Random<br />' + 
			'Ace: --<br />' + 
			'<img src="">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- The Brain must watch you win four random battles in a row<br />');
		}
		if (target === 'stunfisk') {
			matched = true;
			this.sendReplyBox('Battle Frontie® <font color="gray"><b>mavin</b></font color><br />' +
			'Battle Type: --<br />' + 
			'Ace: --<br />' + 
			'<img src="">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- The Winners of Tournaments Hosted by This Brain My Challenge Him/Her<br />');
		}
		if (target === 'chynn') {
			matched = true;
			this.sendReplyBox('Battle Frontie® <font color="teal"><b>Chynn</b></font color><br />' +
			'Battle Type: Double VGC<br />' + 
			'Ace: --<br />' + 
			'<img src="">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- The Brain Must Watch You Win 3 Double Battles in a Row<br />');
		}
		if (target === 'talon') {
			matched = true;
			this.sendReplyBox('Battle Frontie® <font color="yellow"><b>Talon</b></font color><br />' +
			'Battle Type: Perseverance Battle<br />' + 
			'Ace: --<br />' + 
			'<img src="">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- Best of Three<br />');
		}
		//GYM LEADERS
		if (target === 'vale') {
			matched = true;
			this.sendReplyBox('Gym Leade® <font color="green"><b>Vale</b></font color><br />' +
			'Type: Bug<br />' + 
			'Region: Saraphia<br />' +
			'Ace: Scyther<br />' + 
			'<img src="http://cdn.bulbagarden.net/upload/8/81/123.png">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- No Hazards<br />' +
			'- Tiershift');
		}
		if (target === 'dimentio') {
			matched = true;
			this.sendReplyBox('Gym Leade® <font color="purple"><b>Dimentio</b></font color><br />' +
			'Type: Ghost<br />' + 
			'Region: Celestia<br />' +
			'Ace: Mismagius<br />' + 
			'<img src="http://cdn.bulbagarden.net/upload/8/86/429.png">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- No weather<br />' +
			'- Underused (UU)<br />');
		}
		if (target === 'seto') {
			matched = true;
			this.sendReplyBox('Gym Leade® <font color="gray"><b>Seto</b></font color><br />' +
			'Type: Dark<br />' + 
			'Region: Celestia<br />' +
			'Ace: Mandibuzz<br />' + 
			'<img src="http://cdn.bulbagarden.net/upload/3/39/630.png">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- Tiershift<br />' +
			'- No Weather<br />');
		}
		if (target === 'esep') {
			matched = true;
			this.sendReplyBox('Gym Leade® <font color="gray"><b>Esep</b></font color><br />' +
			'Type: Dragon<br />' + 
			'Region: Saraphia<br />' +
			'Ace: Latias<br />' + 
			'<img src="http://cdn.bulbagarden.net/upload/e/eb/380.png">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- No Focus Sash');
		}
		if (target === 'prodigy') {
			matched = true;
			this.sendReplyBox('Gym Leade® <font color="yellow"><b>Prodigy</b></font color><br />' +
			'Type: Electric<br />' + 
			'Region: Celestia<br />' +
			'Ace: Electivire<br />' + 
			'<img src="http://cdn.bulbagarden.net/upload/b/b9/466.png">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- No legendaries<br />' +
			'- OU<br />' + 
			'- Nothing below lvl 50<br />' +
			'- No permanent weather<br />' +
			'- Replay of beating trainer needed<br />');
		}
		if (target === 'kaiser') {
			matched = true;
			this.sendReplyBox('Gym Leade® <font color="orange"><b>Kaiser</b></font color><br />' +
			'Type: Fighting<br />' +
			'Region: Celestia<br />' + 
			'Ace: Gallade<br />' + 
			'<img src="http://cdn.bulbagarden.net/upload/c/c4/475.png">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- No Hazards<br />' +
			'- OU');
		}
		if (target === 'kunning') {
			matched = true;
			this.sendReplyBox('Gym Leade® <font color="red"><b>Kunning</b></font color><br />' +
			'Type: Fire<br />' + 
			'Region: Celestia<br />' +
			'Ace: Darmanitan<br />' + 
			'<img src="http://cdn.bulbagarden.net/upload/4/43/Spr_5b_555.png">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- None');
		}
		if (target === 'gage') {
			matched = true;
			this.sendReplyBox('Gym Leade® <font color="lilac"><b>Gage</b></font color><br />' +
			'Type: Flying<br />' + 
			'Region: Celestia<br />' +
			'Ace: Drifblim<br />' + 
			'<img src="http://cdn.bulbagarden.net/upload/b/b4/426.png">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- Tiershift<br />' +
			'- Best of Three<br />' +
			'- No Hazards');
		}
		if (target === 'slayer') {
			matched = true;
			this.sendReplyBox('Gym Leade® <font color="green"><b>Slayer</b></font color><br />' +
			'Type: Grass<br />' + 
			'Region: Saraphia<br />' +
			'Ace: Breloom<br />' + 
			'<img src="http://cdn.bulbagarden.net/upload/d/d8/286.png">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- No legendaries');
		}
		if (target === 'gbs') {
			matched = true;
			this.sendReplyBox('Gym Leade® <font color="brown"><b>GBS</b></font color><br />' +
			'Type: Ground<br />' + 
			'Region: Saraphia<br />' +
			'Ace: Sandslash<br />' + 
			'<img src="http://cdn.bulbagarden.net/upload/e/e7/028.png">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- No taunt<br />' +
			'- No prankster<br />' +
			'- No healing move other than slack off<br />' +
			'- Only stealth rocks as hazards');
		}
		if (target === 'derp') {
			matched = true;
			this.sendReplyBox('Gym Leade® <font color="teal"><b>Derp</b></font color><br />' +
			'Type: Ice<br />' + 
			'Region: Saraphia<br />' +
			'Ace: Jynx<br />' + 
			'<img src="http://cdn.bulbagarden.net/upload/a/a8/124.png">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- No Hazards');
		}
		if (target === 'jzb') {
			matched = true;
			this.sendReplyBox('Gym Leade® <font color="gray"><b>JZB</b></font color><br />' +
			'Type: Normal<br />' + 
			'Region: Celestia<br />' +
			'Ace: Blissey and Ditto<br />' + 
			'<img src="http://cdn.bulbagarden.net/upload/a/a0/242.png"><img src="http://cdn.bulbagarden.net/upload/5/5f/Spr_5b_132.png">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- Allowed to change teams<br />' +
			'- No legendaries<br />' +
			'- No hazards');
		}
		if (target === 'dvetts') {
			matched = true;
			this.sendReplyBox('Gym Leade® <font color="purple"><b>Dvetts</b></font color><br />' +
			'Type: Poison<br />' + 
			'Region: Saraphia<br />' +
			'Ace: Roserade<br />' + 
			'<img src="http://cdn.bulbagarden.net/upload/4/42/407.png">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- All battles in tiershift<br />' +
			'- No permanent weather<br />' +
			'- Only ONE Choiced Pokemon (Can be Scarf, Specs or Band)<br />');
		}
		if (target === 'darny') {
			matched = true;
			this.sendReplyBox('Gym Leade® <font color="brown"><b>Darny</b></font color><br />' +
			'Type: Rock<br />' + 
			'Region: Saraphia<br />' +
			'Ace: Cradily<br />' + 
			'<img src="http://cdn.bulbagarden.net/upload/6/67/346.png">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- OU<br />' +
			'- No Prankster');
		}
		if (target === 'ren11') {
			matched = true;
			this.sendReplyBox('Gym Leade® <font color="lilac"><b>Ren11</b></font color><br />' +
			'Type: Psychic<br />' + 
			'Region: Celestia<br />' +
			'Ace: Reuniclus and Slowbro<br />' + 
			'<img src="http://cdn.bulbagarden.net/upload/6/63/579.png"><img src="http://cdn.bulbagarden.net/upload/b/b8/080.png">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- No Legendaries<br />' +
			'- OU');
		}
		if (target === 'jyph') {
			matched = true;
			this.sendReplyBox('Elite Fou® <font color="teal"><b>Jyph</b></font color><br />' +
			'Type: Steel<br />' + 
			'Region: Saraphia<br />' +
			'Ace: Mamoswine<br />' + 
			'<img src="http://cdn.bulbagarden.net/upload/e/ec/473.png">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- OU Battle<br />' +
			'- No Entry Hazards');
		}
		if (target === 'banded') {
			matched = true;
			this.sendReplyBox('Gym Leade® <font color="blue"><b>Banded</b></font color><br />' +
			'Type: Water<br />' + 
			'Region: Celestia<br />' +
			'Ace: Starmie<br />' + 
			'<img src="http://cdn.bulbagarden.net/upload/d/d2/121.png">' + 
			'<br /><br />Rules of Battle:<br />' + 
			'- No legendaries or ubers<br />' +
			'- Tiershift');
		}
		if (target === ''){
			}
		else if (!matched) {
			
			this.sendReply('The user/object "'+target+'" was not found.');
		}
	},
	
	saraphia: function(target, room, user) {
		if (!this.canBroadcast()) return;
		target = target.toLowerCase();
		var matched = false;
		if (target === ''){
			matched = true;
			this.sendReplyBox('Saraphia Region:<br /><br />' +
			'The Saraphia region is one of the two regions in the Phoenix League. The Saraphia region shares the same Champion, Professors and Battle Frontier as the Celestia region.<br /><br /> However, the Saraphia region has different Gym Leaders and Elite Four which can be viewed by either /saraphia elitefour or /saraphia gymleaders.');
		}
		if (target === 'gymleaders'){
			matched = true;
			this.sendReplyBox('Saraphia Region Gym Leaders:<br /><br />' +
			'- Gym Leade® <font color="purple"><b>Dvetts</b></font color><br />' +
			'- Gym Leade® <font color="gray"><b>Jyph</b></font color><br />' +
			'- Gym Leade® <font color="teal"><b>Derp</b></font color><br />' +
			'- Gym Leade® <font color="green"><b>Vale</b></font color><br />' +
			'- Gym Leade® <font color="green"><b>Slayer</b></font color><br />' +
			'- Gym Leade® <font color="brown"><b>GBS</b></font color><br />' +
			'- Gym Leade® <font color="purple"><b>Esep</b></font color><br />' +
			'- Gym Leade® <font color="brown"><b>Darny</b></font color><br /><br />' +
			'You can view further information about the above using the /about <name> command such as /about GBS');
		}
		if (target === ''){
		}
		else if (!matched) {
			
			this.sendReply('The user/object "'+target+'" was not found.');
		}
	},
	
	celestia: function(target, room, user) {
		if (!this.canBroadcast()) return;
		target = target.toLowerCase();
		var matched = false;
		if (target === ''){
			matched = true;
			this.sendReplyBox('Celestia Region:<br /><br />' +
			'The Celestia region is one of the two regions in the Phoenix League. The Celestia region shares the same Champion, Professors and Battle Frontier as the Saraphia region.<br /><br /> However, the Celestia region has different Gym Leaders and Elite Four which can be viewed by either /celestia elitefour or /celestia gymleaders.');
		}
		if (target === 'gymleaders'){
			matched = true;
			this.sendReplyBox('Celestia Region Gym Leaders:<br /><br />' +
			'- Gym Leade® <font color="gray"><b>Seto</b></font color><br />' +
			'- Gym Leade® <font color="gray"><b>JZB</b></font color><br />' +
			'- Gym Leade® <font color="green"><b>Vale</b></font color><br />' +
			'- Gym Leade® <font color="yellow"><b>Prodigy</b></font color><br />' +
			'- Gym Leade® <font color="lilac"><b>Gage</b></font color><br />' +
			'- Gym Leade® <font color="lilac"><b>Ren11</b></font color><br />' +
			'- Gym Leade® <font color="blue"><b>Banded</b></font color><br />' +
			'- Gym Leade® <font color="red"><b>Xman</b></font color><br />' +
			'- Gym Leade® <font color="purple"><b>Dimentio</b></font color><br /><br />' +
			'You can view further information about the above using the /about <name> command such as /about JZB');	
		}
		if (target === ''){
			}
		else if (!matched) {
			
			this.sendReply('The user/object "'+target+'" was not found.');
		}
	},
		

	/*********************************************************
	 * Miscellaneous commands
	 *********************************************************/

	/*punch: function(target, room, user, connection) {
		target = this.canTalk(target);
		if (!target) return;

		var phrases = ['in their silly face!', 'right on the nose!', 'like the animal they are!', 'like a panzy.', 'with utter humiliation.', + 
		'like a mad man... or woman!', 'right in the chin!', 'out cold!', 'and butterflies appear :D', 'well, violence is not the solution!', +
		'Cosy punches you for punching ' + target + '!'];

		var i = Math.floor(Math.random() * phrases.length);

		return '/me punches ' + target + ' ' + phrases[i];
	},*/

	birkal: function(target, room, user) {
		this.sendReply("It's not funny anymore.");
	},

	potd: function(target, room, user) {
		if (!this.can('potd')) return false;

		config.potd = target;
		Simulator.SimulatorProcess.eval('config.potd = \''+toId(target)+'\'');
		if (target) {
			if (Rooms.lobby) Rooms.lobby.addRaw('<div class="broadcast-blue"><b>The Pokemon of the Day is now '+target+'!</b><br />This Pokemon will be guaranteed to show up in random battles.</div>');
			this.logModCommand('The Pokemon of the Day was changed to '+target+' by '+user.name+'.');
		} else {
			if (Rooms.lobby) Rooms.lobby.addRaw('<div class="broadcast-blue"><b>The Pokemon of the Day was removed!</b><br />No pokemon will be guaranteed in random battles.</div>');
			this.logModCommand('The Pokemon of the Day was removed by '+user.name+'.');
		}
	},

	register: function() {
		if (!this.canBroadcast()) return;
		this.sendReply("You must win a rated battle to register.");
	},

	br: 'banredirect',
	banredirect: function() {
		this.sendReply('/banredirect - This command is obsolete and has been removed.');
	},

	lobbychat: function(target, room, user, connection) {
		if (!Rooms.lobby) return this.popupReply("This server doesn't have a lobby.");
		target = toId(target);
		if (target === 'off') {
			user.leaveRoom(Rooms.lobby, connection.socket);
			connection.send('|users|');
			this.sendReply('You are now blocking lobby chat.');
		} else {
			user.joinRoom(Rooms.lobby, connection);
			this.sendReply('You are now receiving lobby chat.');
		}
	},

	a: function(target, room, user) {
		if (!this.can('battlemessage')) return false;
		// secret sysop command
		room.add(target);
	},

	/*********************************************************
	 * Help commands
	 *********************************************************/

	commands: 'help',
	h: 'help',
	'?': 'help',
	help: function(target, room, user) {
		target = target.toLowerCase();
		var matched = false;
		if (target === 'all' || target === 'msg' || target === 'pm' || target === 'whisper' || target === 'w') {
			matched = true;
			this.sendReply('/msg OR /whisper OR /w [username], [message] - Send a private message.');
		}
		if (target === 'all' || target === 'about'){
			matched = true;
			this.sendReply('/about - This shows basic server information and lists the League Elite Four and Gym Leaders.');
			this.sendReply('/about <name> to show the infromation of that league member such as /about lynn.');
		}
		if (target === 'all' || target === 'r' || target === 'reply') {
			matched = true;
			this.sendReply('/reply OR /r [message] - Send a private message to the last person you received a message from, or sent a message to.');
		}
		if (target === 'all' || target === 'getip' || target === 'ip') {
			matched = true;
			this.sendReply('/ip - Get your own IP address.');
			this.sendReply('/ip [username] - Get a user\'s IP address. Requires: @ & ~');
		}
		if (target === 'all' || target === 'rating' || target === 'ranking' || target === 'rank' || target === 'ladder') {
			matched = true;
			this.sendReply('/rating - Get your own rating.');
			this.sendReply('/rating [username] - Get user\'s rating.');
		}
		if (target === 'all' || target === 'nick') {
			matched = true;
			this.sendReply('/nick [new username] - Change your username.');
		}
		if (target === 'all' || target === 'avatar') {
			matched = true;
			this.sendReply('/avatar [new avatar number] - Change your trainer sprite.');
		}
		if (target === 'all' || target === 'rooms') {
			matched = true;
			this.sendReply('/rooms [username] - Show what rooms a user is in.');
		}
		if (target === 'all' || target === 'whois') {
			matched = true;
			this.sendReply('/whois [username] - Get details on a username: group, and rooms.');
		}
		if (target === 'all' || target === 'data') {
			matched = true;
			this.sendReply('/data [pokemon/item/move/ability] - Get details on this pokemon/item/move/ability.');
			this.sendReply('!data [pokemon/item/move/ability] - Show everyone these details. Requires: + % @ & ~');
		}
		if (target === "all" || target === 'analysis') {
			matched = true;
			this.sendReply('/analysis [pokemon], [generation] - Links to the Smogon University analysis for this Pokemon in the given generation.');
			this.sendReply('!analysis [pokemon], [generation] - Shows everyone this link. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'groups') {
			matched = true;
			this.sendReply('/groups - Explains what the + % @ & next to people\'s names mean.');
			this.sendReply('!groups - Show everyone that information. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'opensource') {
			matched = true;
			this.sendReply('/opensource - Links to PS\'s source code repository.');
			this.sendReply('!opensource - Show everyone that information. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'avatars') {
			matched = true;
			this.sendReply('/avatars - Explains how to change avatars.');
			this.sendReply('!avatars - Show everyone that information. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'intro') {
			matched = true;
			this.sendReply('/intro - Provides an introduction to competitive pokemon.');
			this.sendReply('!intro - Show everyone that information. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'cap') {
			matched = true;
			this.sendReply('/cap - Provides an introduction to the Create-A-Pokemon project.');
			this.sendReply('!cap - Show everyone that information. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'om') {
			matched = true;
			this.sendReply('/om - Provides links to information on the Other Metagames.');
			this.sendReply('!om - Show everyone that information. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'learn' || target === 'learnset' || target === 'learnall') {
			matched = true;
			this.sendReply('/learn [pokemon], [move, move, ...] - Displays how a Pokemon can learn the given moves, if it can at all.')
			this.sendReply('!learn [pokemon], [move, move, ...] - Show everyone that information. Requires: + % @ & ~')
		}
		if (target === 'all' || target === 'calc' || target === 'caclulator') {
			matched = true;
			this.sendReply('/calc - Provides a link to a damage calculator');
			this.sendReply('!calc - Shows everyone a link to a damage calculator. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'blockchallenges' || target === 'idle') {
			matched = true;
			this.sendReply('/blockchallenges - Blocks challenges so no one can challenge you. Deactivate it with /back.');
		}
		if (target === 'all' || target === 'allowchallenges') {
			matched = true;
			this.sendReply('/allowchallenges - Unlocks challenges so you can be challenged again. Deactivate it with /away.');
		}
		if (target === 'all' || target === 'faq') {
			matched = true;
			this.sendReply('/faq [theme] - Provides a link to the FAQ. Add deviation, doubles, randomcap, restart, or staff for a link to these questions. Add all for all of them.');
			this.sendReply('!faq [theme] - Shows everyone a link to the FAQ. Add deviation, doubles, randomcap, restart, or staff for a link to these questions. Add all for all of them. Requires: + % @ & ~');
		}
		if (target === 'all' || target === 'highlight') {
			matched = true;
			this.sendReply('Set up highlights:');
			this.sendReply('/highlight add, word - add a new word to the highlight list.');
			this.sendReply('/highlight list - list all words that currently highlight you.');
			this.sendReply('/highlight delete, word - delete a word from the highlight list.');
			this.sendReply('/highlight delete - clear the highlight list');
		}
		if (target === 'all' || target === 'timestamps') {
			matched = true;
			this.sendReply('Set your timestamps preference:');
			this.sendReply('/timestamps [all|lobby|pms], [minutes|seconds|off]');
			this.sendReply('all - change all timestamps preferences, lobby - change only lobby chat preferences, pms - change only PM preferences');
			this.sendReply('off - set timestamps off, minutes - show timestamps of the form [hh:mm], seconds - show timestamps of the form [hh:mm:ss]');
		}
		if (target === 'all' || target === 'effectiveness') {
			matched = true;
			this.sendReply('/effectiveness [type1], [type2] - Provides the effectiveness of a [type1] attack to a [type2] Pokémon.');
			this.sendReply('!effectiveness [type1], [type2] - Shows everyone the effectiveness of a [type1] attack to a [type2] Pokémon.');
		}
		if (target === 'all' || target === 'dexsearch') {
                        matched = true;
                        this.sendReply('Searches for Pokemon that fulfill the selected criteria.');
                        this.sendReply('Search categories are: type, tier, color, moves, ability, gen.');
                        this.sendReply('Valid colors are: green, red, blue, white, brown, yellow, purple, pink, gray and black.');
                        this.sendReply('Valid tiers are: Uber/OU/BL/UU/BL2/RU/NU/NFE/LC/CAP/Illegal.');
                        this.sendReply('Types must be followed by " type", e.g., "dragon type".');
                        this.sendReply('/dexsearch [type], [move], [move],...');
                        this.sendReply('The order of the parameters does not matter.');
                }
		if (target === '%' || target === 'modnote') {
			matched = true;
			this.sendReply('/modnote [note] - Adds a moderator note that can be read through modlog. Requires: % @ & ~');
		}
		if (target === '%' || target === 'altcheck' || target === 'alt' || target === 'alts' || target === 'getalts') {
			matched = true;
			this.sendReply('/alts OR /altcheck OR /alt OR /getalts [username] - Get a user\'s alts. Requires: % @ & ~');
		}
		if (target === '%' || target === 'forcerename' || target === 'fr') {
			matched = true;
			this.sendReply('/forcerename OR /fr [username], [reason] - Forcibly change a user\'s name and shows them the [reason]. Requires: % @ & ~');
		}
		if (target === '%' || target === 'redir' || target === 'redirect') {
			matched = true;
			this.sendReply('/redirect OR /redir [username], [room] - Forcibly move a user from the current room to [room]. Requires: % @ & ~');
		}
		if (target === '@' || target === 'ban' || target === 'b') {
			matched = true;
			this.sendReply('/ban OR /b [username], [reason] - Kick user from all rooms and ban user\'s IP address with reason. Requires: @ & ~');
		}
		if (target === '@' || target === 'unban') {
			matched = true;
			this.sendReply('/unban [username] - Unban a user. Requires: @ & ~');
		}
		if (target === '@' || target === 'unbanall') {
			matched = true;
			this.sendReply('/unbanall - Unban all IP addresses. Requires: @ & ~');
		}
		if (target === '%' || target === 'modlog') {
			matched = true;
			this.sendReply('/modlog [n] - If n is a number or omitted, display the last n lines of the moderator log. Defaults to 15. If n is not a number, search the moderator log for "n". Requires: % @ & ~');
		}
		if (target === "%" || target === 'kickbattle ') {
			matched = true;
			this.sendReply('/kickbattle [username], [reason] - Kicks an user from a battle with reason. Requires: % @ & ~');
		}
		if (target === "%" || target === 'warn') {
			matched = true;
			this.sendReply('/warn OR /k [username], [reason] - Warns a user showing them the Pokemon Showdown Rules and [reason] in an overlay. Requires: % @ & ~');
		}
		if (target === "%" || target === 'kick' || target === 'k') {
			matched = true;
			this.sendReply('/kick OR /k [username] - Kicks a user from the room they are currently in. Requires: % @ & ~');
		}
		if (target === '%' || target === 'mute' || target === 'm') {
			matched = true;
			this.sendReply('/mute OR /m [username], [reason] - Mute user with reason for 7 minutes. Requires: % @ & ~');
		}
		if (target === '%' || target === 'hourmute') {
			matched = true;
			this.sendReply('/hourmute , [reason] - Mute user with reason for an hour. Requires: % @ & ~');
		}	
		if (target === '%' || target === 'daymute') {
			matched = true;
			this.sendReply('/daymute , [reason] - Mute user with reason for one day / 24 hours. Requires: % @ & ~');
		}	
		if (target === '%' || target === 'unmute') {
			matched = true;
			this.sendReply('/unmute [username] - Remove mute from user. Requires: % @ & ~');
		}
		if (target === '&' || target === 'promote') {
			matched = true;
			this.sendReply('/promote [username], [group] - Promotes the user to the specified group or next ranked group. Requires: & ~');
		}
		if (target === '&' || target === 'demote') {
			matched = true;
			this.sendReply('/demote [username], [group] - Demotes the user to the specified group or previous ranked group. Requires: & ~');
		}
		if (target === '~' || target === 'forcerenameto' || target === 'frt') {
			matched = true;
			this.sendReply('/forcerenameto OR /frt [username] - Force a user to choose a new name. Requires: & ~');
			this.sendReply('/forcerenameto OR /frt [username], [new name] - Forcibly change a user\'s name to [new name]. Requires: & ~');
		}
		if (target === '~' || target === 'forcelogout' || target === 'flogout') {
			matched = true;
			this.sendReply('/forcelogout [username], [reason] OR /flogout [username], [reason] - Forcibly logout a user. Requires: & ~');
		}
		if (target === '&' || target === 'forcetie') {
			matched = true;
			this.sendReply('/forcetie - Forces the current match to tie. Requires: & ~');
		}
		if (target === '&' || target === 'declare' ) {
			matched = true;
			this.sendReply('/declare [message] - Anonymously announces a message. Requires: & ~');
		}
		if (target === '~' || target === 'gdeclare' ) {
			matched = true;
			this.sendReply('/gdeclare [message] - Anonymously announces a message to all rooms. Requires: ~');
		}
		if (target === '&' || target === 'potd' ) {
			matched = true;
			this.sendReply('/potd [pokemon] - Sets the Random Battle Pokemon of the Day. Requires: & ~');
		}
		if (target === '%' || target === 'announce' || target === 'wall' ) {
			matched = true;
			this.sendReply('/announce OR /wall [message] - Makes an announcement. Requires: % @ & ~');
		}
		if (target === '@' || target === 'modchat') {
			matched = true;
			this.sendReply('/modchat [off/registered/+/%/@/&/~] - Set the level of moderated chat. Requires: @ & ~');
		}
		if (target === '~' || target === 'hotpatch') {
			matched = true;
			this.sendReply('Hot-patching the game engine allows you to update parts of Showdown without interrupting currently-running battles. Requires: ~');
			this.sendReply('Hot-patching has greater memory requirements than restarting.');
			this.sendReply('/hotpatch chat - reload chat-commands.js');
			this.sendReply('/hotpatch battles - spawn new simulator processes');
			this.sendReply('/hotpatch formats - reload the tools.js tree, rebuild and rebroad the formats list, and also spawn new simulator processes');
		}
		if (target === '~' || target === 'lockdown') {
			matched = true;
			this.sendReply('/lockdown - locks down the server, which prevents new battles from starting so that the server can eventually be restarted. Requires: ~');
		}
		if (target === '~' || target === 'kill') {
			matched = true;
			this.sendReply('/kill - kills the server. Can\'t be done unless the server is in lockdown state. Requires: ~');
		}
		if (target === 'all' || target === 'help' || target === 'h' || target === '?' || target === 'commands') {
			matched = true;
			this.sendReply('/help OR /h OR /? - Gives you help.');
		}
		if (!target) {
			this.sendReply('COMMANDS: /msg, /reply, /ip, /rating, /nick, /avatar, /rooms, /whois, /help, /away, /back, /timestamps');
			this.sendReply('INFORMATIONAL COMMANDS: /data, /groups, /opensource, /avatars, /faq, /rules, /intro, /tiers, /othermetas, /learn, /analysis, /calc (replace / with ! to broadcast. (Requires: + % @ & ~))');
			this.sendReply('For details on all commands, use /help all');
			if (user.group !== config.groupsranking[0]) {
				this.sendReply('DRIVER COMMANDS: /mute, /unmute, /announce, /forcerename, /alts')
				this.sendReply('MODERATOR COMMANDS: /ban, /unban, /unbanall, /ip, /modlog, /redirect, /kick');
				this.sendReply('LEADER COMMANDS: /promote, /demote, /forcewin, /forcetie, /declare');
				this.sendReply('For details on all moderator commands, use /help @');
			}
			this.sendReply('For details of a specific command, use something like: /help data');
		} else if (!matched) {
			this.sendReply('The command "/'+target+'" was not found. Try /help for general help');
		}
	},

};
