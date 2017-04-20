//To-do: rename: DateTimeInterval->TimeDuration; create new class Interval (like in ISO8601, which is has start, ...), RepeatingInterval (has repetitions, N repetitions)
//To-do: DatetImeInterval: implement method toFixeedString / ISO <->
//datetime.js
(function(root, factory) {
	if (typeof define === "function" && define.amd) { // AMD mode
		define([], factory);
	} else if (typeof exports === "object") { // CommonJS mode
		module.exports = factory();
	} else {
		root['datetime'] = factory(root); // Plain JS
		root['DateTimeInterval'] = root.datetime.DateTimeInterval;
		root['LocalDateTime'] = root.datetime.LocalDateTime;
	}
}(this, function(scope) {

	scope = scope || {};

	// use isNaN polyfill
	!(typeof Number.isNaN == 'function') ||
	  (Number.isNaN = function (value) {
	    return value !== null // Number(null) => 0
	      && (value != value // NaN != NaN
	        || +value != value // Number(falsy) => 0 && falsy == 0...
	      )
	});


	function checkAttributesAllowed(obj, attrNames) {
		for (var name in obj) {
			if (obj.hasOwnProperty(name)) {
				if (attrNames.indexOf(name) < 0) {
					console.error('>>>>> Unknown attribute for "datetime" object: ', name, obj)
					throw new Error('Unknown attribute for "datetime" object: '+name+', object type: '+(typeof obj));
				}
			}
		}
	}

  var _2digits = function (value) {
    return (value < 10) ? '0' + value : value.toString()
  }

	var _secondsToVector = function (seconds) {
		var
			_sign = (seconds < 0) ? -1 : 1,
			absValue = _sign * seconds,
			remainderInDays = absValue % 604800,
			remainderInHours = remainderInDays % 86400,
			remainderInMinutes = remainderInDays % 3600;
		return {
			'weeks': _sign * Math.floor(absValue / 604800)
			,'days': _sign * Math.floor(remainderInDays / 86400)
			,'hours': _sign * Math.floor(remainderInHours / 3600)
			,'minutes': _sign * Math.floor(remainderInMinutes / 60)
			,'seconds': _sign * Math.floor(remainderInMinutes % 60)
		}
	}

	var _millisecondsToVector = function (milliseconds) {
		var
			_sign = (milliseconds < 0) ? -1 : 1,
			seconds = _sign * Math.floor(_sign * milliseconds / 1000),
			ms = milliseconds % 1000,
			buffer = _secondsToVector(seconds);
		buffer['milliseconds'] = ms;
		return buffer;
	}

	var _durationVectorToMilliseconds = function (data) {
		return (data.weeks ? data.weeks * 604800000 : 0) +
			(data.days ? data.days * 86400000 : 0) +
			(data.hours ? data.hours * 3600000 : 0) +
			(data.minutes ? data.minutes * 60000 : 0) +
			(data.seconds ? data.seconds *1000 : 0) +
			(data.milliseconds ? data.milliseconds : 0)
	}

	var _durationVectorToSeconds = function (data) {
		return (data.weeks ? data.weeks * 604800 : 0) +
			(data.days ? data.days * 86400 : 0) +
			(data.hours ? data.hours * 3600 : 0) +
			(data.minutes ? data.minutes * 60 : 0) +
			(data.seconds ? data.seconds : 0) +
			(data.milliseconds ? Math.floor(data.milliseconds / 1000) : 0)
	}

	/*////////////////////////////////////////////////////////
	//
	// DateTimeInterval
	//
	*/////////////////////////////////////////////////////////

	var _setRangeVector = function (scope, data) {
		// Make normalization for units (e.g., hours<=23, etc.)
		// if (data.days > 7 || data.hours > 23 || data.minutes > 59 || data.seconds > 59)
		var vector = (data.days > 6 || data.hours > 23 || data.minutes > 59 || data.seconds > 59)
			? _secondsToVector(_durationVectorToSeconds(data))
			: data;

		scope.weeks = vector.weeks || 0;
		scope.days = vector.days || 0;
		scope.hours = vector.hours || 0;
		scope.minutes = vector.minutes || 0;
		scope.seconds = vector.seconds || 0;
	}

var mask = /^(?:((?:(\d{1,2}w\s*)*)(?:(\d{1,2}d)*))*)[\sT]*(?:(\d{1,2}\:\d{2}(\:\d{2})*)*)$/gi;
var msplit = /(\d{1,2})/gi;
// var timeMask = /(\d{1,2}):(\d{1,2})(?:\:(\d{1,2}))*/gi

  var timeMask = /(\d{1,2}):(\d{1,2})(?:(\:\d{1,2}(?:(\.\d{1,3})*))*)/gi

var weeksMask = /^(\d{1,2})w/gi
var daysMask = /(\d{1,2})d/gi

// To-do: recognize negative values?
DateTimeInterval.parse = function (s) {
	var w, d, h, m, sec, time;
	//console.log('s', s)
	if (s.match(mask)) {
		w = s.match(weeksMask);
		w = (w) ? parseInt(w[0].replace('w','')) : 0;
		d = s.match(daysMask);
		d = (d) ? parseInt(d[0].replace('d', '')) : 0;
		time = s.match(timeMask) || [''];
    //console.log('time is:', time);
		time = time[0].split(':');
		time.reverse();
		h = time.pop();
    //console.log('h', h)
		h = (h) ? parseInt(h) : 0;
		m = time.pop();
    m = (m) ? parseInt(m) : 0;
		sec = time.pop();
		sec = (sec) ? parseInt(sec) : 0;
		return w * 604800 + d * 86400  + h * 3600  + m * 60 + sec
	}
	return NaN;
}

DateTimeInterval.vectorToMilliseconds = _durationVectorToMilliseconds;
DateTimeInterval.vectorToSeconds = _durationVectorToSeconds;

	/**
	 * Date/Time interval.
	 * Keeps interval in units which are not depends on leap years, number of days/week per month, etc.
	 * @constructor DateTimeInterval
	 * @param {object|number|string|undefined} data Allow to specify range by nuber of milliseconds or by object with attributes: weeks, days, hours, minutes, seconds (all attributes are optional). Accepts string representation in format "NNw NNd NN:NN(:NN)". Constructor without argument create a "zero" interval.
	 */
	function DateTimeInterval(data) {

		if (data === void 0 || data === null) {
			data = _secondsToVector(0);
		} else if (typeof data === 'number') {
			data = _secondsToVector(parseInt(data) / 1000)
		} else if (typeof data === 'string') {
			data = _secondsToVector( DateTimeInterval.parse(data) )
			//console.log('DateTimeInterval from string: ', data)
		}
		if (typeof data === 'object') {
			// if (!(data instanceof DateTimeInterval)) checkAttributesAllowed(data, ['weeks','days','hours','minutes','seconds','milliseconds'])
			_setRangeVector(this, data)
		} else {
			throw new TypeError('Invalid type of argument in DateTimeInterval: '+typeof data)
		}
	}

	DateTimeInterval.prototype.getTime = function () {
		return this.module()
	}

	DateTimeInterval.prototype.setTime = function (ms) {
		_setRangeVector(this, _secondsToVector(ms / 1000))
	}

	/**
	 * Method for serialization (used by JSON.stringify)
	 * @return {[type]} [description]
	 */
	DateTimeInterval.prototype.valueOf = function () {
		return this.module()
	}

	DateTimeInterval.prototype.toJSON = function () {
		return this.module()
	}

	/**
	 * Length (duration) of interval in milliseconds (scalar value).
	 * Allows to use object on the "right-side" arythmetic operations (+,-, <,>,=, ...).
	 * See more about .valueOf: http://raghuvirkasturi.com/2015/04/14/guest-post-object-prototype-valueof-coercion-and-comparison-hackery-in-javascript/
	 * @return {number} Duration in milliseconds. Can be negative.
	 */
	DateTimeInterval.prototype.module = function () {
		// length in milliseconds
		return _durationVectorToMilliseconds(this)
		// (
		// 	this.weeks * 604800
		// 	+ this.days * 86400
		// 	+ this.hours * 3600
		// 	+ this.minutes * 60
		// 	+ this.seconds) * 1000;
	}


	/**
	 * Output string which guarantees the backward parsing to the same value (for <input> elements)
	 * @param  {boolean} forceAll Require to render all units including the zero/absent values
	 * @return {[type]}          [description]
	 */
	DateTimeInterval.prototype.toPersistentString  = function(forceAll) {

		function abs(value) {
			return (value < 0) ? -value : value;
		}

		var buffer = [];
		var timeBuffer = [];

		if (forceAll || this.weeks) buffer.push(this.weeks + 'w ')
		if (forceAll || this.days) buffer.push(abs(this.days) + 'd ')
		if (this.hours || this.minutes || this.seconds) {
			buffer.push((abs(this.hours) || 0) + ':')
			buffer.push(_2digits(abs(this.minutes) || 0))
			if (this.seconds) buffer.push(':'+_2digits(abs(this.seconds)))
		}
		return (buffer.length) ? buffer.join('') : '0'
	}
	/**
	 * Human-readable format in "persistent" units (weeks, days, hours, minutes, seconds)
	 * @return {string} Duration
	 */
	DateTimeInterval.prototype.toString = function (forceAll) {
		return this.toPersistentString(false);
	}

	DateTimeInterval.prototype.toDelimitedString = function (forceAll) {
		return this.toPersistentString(forceAll)
	}

	/**
	 * Addition for 2 intervals
	 * @param {number|DateTimeRange} interval Second operand
	 * @param {integer (+1|-1)} _sign    Sign for operation (+1: addition, -1: subtraction). Optional (default is +1).
	 * @return {DateTimeInterval} New instance of DateTimeInterval
	 */
	DateTimeInterval.prototype.add = function (addend, _sign) {
		_sign = _sign || +1;
		if (typeof addend === 'number') {
			return new DateTimeInterval(this.module() + _sign * addend)
		} else if (addend instanceof DateTimeInterval) {
			return new DateTimeInterval(this.module() + _sign * addend.module())
		} else if (addend instanceof LocalDateTime) {
			return addend.add(this)
		} else {
			throw new TypeError('DateTimeInterval.add: Invalid argument type: '+typeof addend)
		}
	}

	/**
	 * Subtraction for 2 intervals
	 * @param {number|DateTimeRange} interval Second operand
	 * @return {DateTimeInterval} New instance of DateTimeInterval
	 */
	DateTimeInterval.prototype.subtract = function (interval) {
		return this.add(interval, -1)
	}


	// Questions: construnctor(milliseconds), specified Weekday as Day???; getTime methods for partials???
	// * partials to Date - use 1970 or today?
	//
	//



	/*////////////////////////////////////////////////////////
	//
	// LocalDateTime
	//
	*/////////////////////////////////////////////////////////


  var timeMask = /(\d{1,2}):(\d{1,2})(?:(\:\d{1,2}(?:(\.\d{1,3})*))*)/gi;

  // /**
  //  * Decodes time-only strings like "00:00", "00:00:00", "00:00:00.000"
  //  * (Date.parse usually fails on such strings)
  //  * @param  {string} s See above
  //  * @return {number}   Milliseconds
  //  */
  // var convertTimeOnlyStrToMilliseconds = function (s) {
  //   var h, m, sec, time;
  //   time = s.match(timeMask);
  //   // console.log('time is:', time);
  //   if (time && time[0]) {
  //     time = time[0].split(':');
  //     time.reverse();
  //     h = time.pop();
  //     h = (h) ? parseInt(h) : 0;
  //     // console.log('h', h)
  //     m = time.pop();
  //     m = (m) ? parseInt(m) : 0;
  //     // console.log('m', m)
  //     sec = time.pop();
  //     sec = (sec) ? parseFloat(sec) : 0;
  //     // console.log('sec', sec)
  //     return h * 3600000 + m * 60000 + sec * 1000
  //   }
  //   return NaN;
  // }

  var dateToLiteral = function (date) {
		var vector = {};
		if (date instanceof Date || date instanceof LocalDateTime) {
			vector.year = date.getFullYear();
			vector.month = date.getMonth() + 1;
			vector.date = date.getDate();
			vector.hours = date.getHours();
			vector.minutes = date.getMinutes();
			vector.seconds = date.getSeconds();
			vector.milliseconds = date.getMilliseconds();
			// In case when instance can be LoccalDateTime and can contain .originOffset when datetime is absolute.
			if (date.originOffset !== void 0) vector.originOffset = date.originOffset
			return vector;
		} else {
			throw new TypeError('LocalDateTime.dateToLiteral() error: argument is not instance of Date or LocalDateTime!');
		}
  }


// Mask allows timestamp representation:
/**
 * Mask allows timestamp representation compatible with ISO 8601
 * (YYYY-MM-D(D))( /T)((0):00:00(.000)(+/-)(0)0(:)00)
 * '2016-11-2 0:00:00',
 * '0:00:00',
 * '2016-11-12',
 * '2016-11-12T0:00:00',
 * '2016-11-12 0:00:00.000+3:00',
 * '2016-11-12 0:00:00+03:00'
 * '20161206T014500+0300'
 * String cannot be in UTC timmezone format (with "Z" suffix)
 * @type {RegExp}
 */

var RE_DATE_DELIMITED = '[12][0-9]{3}-[01][1-9]-[0-3]?[0-9]';
var RE_DATE_DELIMITED_GROUPS = '([12][0-9]{3})-([01][1-9])-([0-3]?[0-9])';

var RE_DATE_FIXED = '[12][0-9]{3}[01][1-9][0-3][0-9]';
var RE_DATE_FIXED_GROUPS = '([12][0-9]{3})([01][1-9])([0-3][0-9])';

var RE_TIME_DELIMITED = '(?:2[0-3]|[01]?[0-9]):[0-5][0-9](?::[0-5][0-9](?:[.,][0-9]+)?)?';
var RE_TIME_DELIMITED_GROUPS = '(2[0-3]|[01]?[0-9]):([0-5][0-9])(?::([0-5][0-9](?:[.,][0-9]+)?))?';

var RE_TIME_FIXED = '(?:2[0-3]|[01][0-9])(?:[0-5][0-9])(?:[0-5][0-9])'
var RE_TIME_FIXED_GROUPS = '(2[0-3]|[01][0-9])([0-5][0-9])([0-5][0-9])'

var RE_TZ_DELIMITED = '[+-](?:2[0-3]|[01][0-9]):[0-5][0-9]'
var RE_TZ_DELIMITED_GROUPS = '([+-](?:2[0-3]|[01][0-9])):([0-5][0-9])'

var RE_TZ_FIXED = '[+-](?:2[0-3]|[01][0-9])[0-5][0-9]'
var RE_TZ_FIXED_GROUPS = '([+-](?:2[0-3]|[01][0-9]))([0-5][0-9])'

var masks = {
	'split': { /* Complete (full-match) masks */
		// !!! do not use "g" flag because "string.match" will return only the entire string, not groups!
		'date-fixedlen': new RegExp('^(' + RE_DATE_FIXED + ')(' + RE_TZ_FIXED + ')?$', ''), /* 20161201 */
		'date-delimited': new RegExp('^(' + RE_DATE_DELIMITED + ')[\s]?(' + RE_TZ_DELIMITED + ')?$', ''), /*2016-12-1 or 2016-12-01*/

		'time-fixedlen': new RegExp('^(' + RE_TIME_FIXED + ')(' + RE_TZ_FIXED + ')?$', ''), /* hhmmss(+-0000)*/
		'time-delimited': new RegExp('^(' + RE_TIME_DELIMITED + ')(' + RE_TZ_DELIMITED + ')?$', ''), /* (0)0:00:00(.000)(+-(0)0:00))*/

		'date-time-fixedlen': new RegExp(
      '^(?:(' + RE_DATE_FIXED + ')[ T](' + RE_TIME_FIXED + ')|'+
      '(' + RE_DATE_FIXED + ')|'+
      '(' + RE_TIME_FIXED + '))'+

      '(' + RE_TZ_FIXED +')?$', ''),

		'date-time-delimited': new RegExp(
      '^(?:(' + RE_DATE_DELIMITED + ')[ T](' + RE_TIME_DELIMITED + ')|'+
      '(' + RE_DATE_DELIMITED + ')|'+
      '(' + RE_TIME_DELIMITED + '))'+
      '(' + RE_TZ_DELIMITED + ')?$', '')


	},
	'parse': { /* Complete (full-match) masks */
		// !!! do not use "g" flag because "string.match" will return only the entire string, not groups!
    'date-fixedlen': new RegExp('^' + RE_DATE_FIXED_GROUPS + '$', ''), /* 20161201 */
    'date-delimited': new RegExp('^' + RE_DATE_DELIMITED_GROUPS + '$', ''), /*2016-12-1 or 2016-12-01*/

    'time-fixedlen': new RegExp('^' + RE_TIME_FIXED_GROUPS + '$', ''), /* hhmmss(+-0000)*/
    'time-delimited': new RegExp('^' + RE_TIME_DELIMITED_GROUPS + '$', ''), /* (0)0:00:00(.000)(+-(0)0:00))*/

    'tz-info-fixedlen': new RegExp('^' + RE_TZ_FIXED_GROUPS + '$', ''),
    'tz-info-delimited': new RegExp('^' + RE_TZ_DELIMITED_GROUPS + '$', '')

	}
}

  var
   	currentTimeZoneOffsetMinutes = -1 * (new Date()).getTimezoneOffset(), // Note: invert sign!
   	// More about TZ offsets and signs: https://upload.wikimedia.org/wikipedia/commons/e/e8/Standard_World_Time_Zones.png
  	currentTimeZoneOffsetMs = currentTimeZoneOffsetMinutes * 60000;

LocalDateTime.adjustCurrentTimeZone = function (offsetMinutes) {
	var oldValue = currentTimeZoneOffsetMinutes;
	currentTimeZoneOffsetMinutes = offsetMinutes;
	currentTimeZoneOffsetMs = currentTimeZoneOffsetMinutes * 60000;
	return oldValue;
}

LocalDateTime.extractDateTime = function (str) {
	// var items = masks.test['date-time-'+formatName].exec(str), hours, minutes, seconds;
	var parsed = null;
	var dateAttrs = null, timeMs = null, isAbsolute = false, originOffset, bufferDate, result;

	var decodeDate = function (str, formatName) {
		var items = str.match(masks.parse['date-'+formatName]), year, month, date;
		return (items) ? {
			year: parseInt(items[1]),
			month: parseInt(items[2]),
			date: parseInt(items[3])
		} : null
	}

	var decodeTime = function (str, formatName) {
		var items = str.match(masks.parse['time-'+formatName]), hours, minutes, seconds, nanoseconds;
		//console.warn('decodeTime:', formatName, '"'+str+'"', items, masks.split['time-'+formatName])
		if  (items) {
			hours = parseInt(items[1]);
			minutes = parseInt(items[2]);
			seconds = parseFloat(items[3] || 0);
			return hours * 3600000 + minutes * 60000 + seconds * 1000
		}
		return null
	}

	var decodeTZOffset = function (str, formatName) {
		var items = str.match(masks.parse['tz-info-' + formatName]), hours, minutes;
		if (items) {
			hours = parseInt(items[1]);
			minutes = parseInt(items[2]);

			//console.log('--- decodeTZOffset: received: ', items, 'decoded: ', hours, minutes, hours * 60 + minutes)

			return hours * 60 + minutes;
		}
		return null
	}

	function searchDateAndTime(str) {
		// sequentially try patterns to detect format

		var parts=str.match(masks.split['date-time-fixedlen']);
		if (parts) {
			// parts - items [1,.., N] from matches array
			// [<date-part from date+time form>, <time-part from date+time form>, <date from date-only form>, <time from time-only form>, <timezone offset part> ]
			//console.log('Recognized as: ', 'date-time-fixedlen', '<---', str)
			return {
				'date': parts[1] || parts[3] || null, // item 1 contains the date part in date-time and item 3 contains date part for short form where date-only part specified
				'time': parts[2] || parts[4] || null,	// item 2 contains the time part in date-time and item 4 contains time part for short form where time-only part specified
				'offset': parts[5] || null,
				'format': 'fixedlen'
			}
		}
		parts=str.match(masks.split['date-time-delimited'])
		if (parts) {
			// parts - items [1,.., N] from matches array
			// [<date-part from date+time form>, <time-part from date+time form>, <date from date-only form>, <time from time-only form>, <timezone offset part> ]
			//console.log('Recognized as: ', 'date-time-delimited', '<---', str)
			return {
				'date': parts[1] || parts[3] || null, // item 1 contains the date part in date-time and item 3 contains date part for short form where date-only part specified
				'time': parts[2] || parts[4] || null,	// item 2 contains the time part in date-time and item 4 contains time part for short form where time-only part specified
				'offset': parts[5] || null,
				'format': 'delimited'
			}
		}

		//console.log('CANNOT recognize: ', '<---', str)
		// None of above, string has unknown format
		return NaN
	}

	parsed = searchDateAndTime(str);
	//console.log('Recognized as: ', parsed, '<---', str)
	if (!parsed) return NaN;
	if (parsed.date)
		dateAttrs = decodeDate(parsed.date, parsed.format)
	if (parsed.time)
		timeMs = decodeTime(parsed.time, parsed.format)
	if (parsed.offset) {
		originOffset = decodeTZOffset(parsed.offset, parsed.format);
		//console.warn('TZ: decodeTZOffset: ', parsed.offset, originOffset)
		isAbsolute = originOffset !== null;
	}

	// Process TZ
	if (timeMs === null) {
		// No time info in str, timestamp defines only the date portion, which is always set of Relative moments! (apply "-")
		timeMs = 0; // Set local time to 0:00
	}
	// time zone present
	if (isAbsolute) {
		// timezone is specified, so timestamp defines single unique Absolute moment (Case 2, apply "+")
		// timeMs += currentTimeZoneOffsetMs - originOffset * 60000 ; // <-- re-compute to UTC time	then to the current local time
	}
	// otherwise time is local, and time info defines set of Relative moments in a local time (Case 1, apply "-")


		// Note that Date object normalizes milliseconds when it greater than 999 and re-comptes, hours, minutes, ...

	result = (dateAttrs) ?
			dateToLiteral(new Date(dateAttrs.year, dateAttrs.month -1, dateAttrs.date, 0, 0, 0, (timeMs === null) ? 0 : timeMs))
			:
			_millisecondsToVector((timeMs === null) ? 0 : timeMs) /* time-only data*/
			// (new Date(0 + timeMs - currentTimeZoneOffsetMs)); /* time-only data*/

	if (originOffset !== null)
		result['originOffset'] = originOffset;

	return result;
}


  /**
   * Extends Date.parse to work with additional formats of strings.
   * Intended to work ONLY to create argument for constructor of native Date object.
   * Returns milliseconds in UTC
   * @param  {string} str String with date (as accepts Date.parse method),
   * can work also with short time representations like "00:00", "00:00:00", "00:00:00.000"
   * @return {number}     Milliseconds from start of epoch (1-1-1970) in UTC time (for consistency with Date.parse)
   */
	LocalDateTime.parse = function (str) {
		// var result = LocalDateTime.extractDateTime(str)

		var parsed = LocalDateTime.extractDateTime(str);
		if (parsed) {
			return (new LocalDateTime(parsed)).getTime()
		} else { // parsed is NaN, null, ...
			return NaN
		}

		//[2017-01-18]
		// throw new Error("Check line 473 - no dateObj in new implementation");
		// // reurn NaN
		// return (result) ? (result.dateObj.getTime() + currentTimeZoneOffsetMs) : NaN;
	}

	/**
	 * Return object with with the current local date-time.
	 * Do not confuse it with Date.now() which returns string.
	 * @return {LocalDateTime} Object with current date-time
	 */
	LocalDateTime.now = function () {
		return new LocalDateTime(new Date())
	}

	function LocalDateTime(data) {
		var args = {}, parsed;
		data = (data === void 0 || data === null || data === 0) ? {} : data;

		switch (typeof data) {
			case 'object':
				// Both the literal and the Date instance:
				if (data instanceof Date || data instanceof LocalDateTime) {
					this.fromDate(data)
				}	else {
					this.fromLiteral(data)
				}
				break
			case 'string':
				// Formatted string, probably with timezone offset ("Absolute" timestamp):
				parsed = LocalDateTime.extractDateTime(data);
				if (parsed) {
					this.fromLiteral(parsed)
				} else { // parsed is NaN, null, ...
					this.fromDate(new Date(NaN))
				}
				break
			case 'number':
				// milliseconds from epoch, always defines set of moments (not Absolute)
				this.fromDate( new Date(data - currentTimeZoneOffsetMs) )// <-- "Data" uses UTC time of milliseconds in constructor
				break
			default:

		}

		// if (typeof data === 'object') { // Both the literal and the Date instance
		// 	args = data;
		// } else if (typeof data === 'string') {
		// 	parsed = LocalDateTime.extractDateTime(data);
		// 	data = parsed.dateObj;
		// 	args.isAbsolute = parsed.isAbsolute;
		// 	// data = new Date(LocalDateTime.parse(data)) // <-- "Data" uses UTC time of milliseconds
		// } else if (typeof data === 'number') {
		// 	data = new Date(data + currentTimeZoneOffsetMs) // <-- "Data" uses UTC time of milliseconds in constructor
		// }

		// if (data instanceof Date) { // <-- js Date means "complete date" always
		// 	args.year = data.getFullYear();
		// 	args.month = data.getMonth();
		// 	args.date = data.getDate();
		// 	args.hours = data.getHours();
		// 	args.minutes = data.getMinutes();
		// 	args.seconds = data.getSeconds();
		// }

		// this.fromLiteral(args);

	}

	/*
	"Class" methods
	 */
	LocalDateTime.sum = function (date1, date2) {
		// if (date instanceof Date) date = date.toLocalDateTime();
		// var value = date.getTime();
		// if (this.year )
		throw new Error('not implemented')
	}

	LocalDateTime.difference = function(date1, date2) {
		// body... Cannot be negative !!!
		throw new Error('not implemented')
	};

	/*
	Instance methods
	 */

	LocalDateTime.prototype.applyOriginOffset = function (originTZOffsMinutes) {
		// Threat the datetime of current instance as defined in some timezone (see argument ^).
		// How will it look in the current one??? Recompute.
		// Move to UTC:
		var buffer;
		// originTZOffsMinutes = -originTZOffsMinutes;
		this.originOffset = currentTimeZoneOffsetMinutes;
		if (originTZOffsMinutes !== currentTimeZoneOffsetMinutes) {
			//console.warn('*** applyOriginOffset: tz difference: ', originTZOffsMinutes, currentTimeZoneOffsetMinutes);
			buffer = this.getTime() - originTZOffsMinutes * 60000;
			// Move from UTC to the current TZ:
			this.setTime(buffer + currentTimeZoneOffsetMs)
		} else {
			//console.warn('*** applyOriginOffset: tz SAME: ', originTZOffsMinutes, currentTimeZoneOffsetMinutes);
		}
	}

	LocalDateTime.prototype.getTime = function () {
		return this.toDate().getTime()
	}
	LocalDateTime.prototype.setTime = function (msUTC) {
		var bufferDate = new Date();
		bufferDate.setTime(msUTC);
		this.fromDate(bufferDate) // TEST IT!
		// throw new Error('LocalDateTime does not have .setTime method!')
	}

	/*
	"Date"-compatibility methods
	 */

	LocalDateTime.prototype.getFullYear = function () { return this.year }
	LocalDateTime.prototype.getMonth = function () { return this.month -1 }
	LocalDateTime.prototype.getDate = function () { return this.date }
	LocalDateTime.prototype.getHours = function () { return this.hours }
	LocalDateTime.prototype.getMinutes = function () { return this.minutes }
	LocalDateTime.prototype.getSeconds = function () { return this.seconds }

	LocalDateTime.prototype.setFullYear = function (value) {
		if (value === void 0) delete this.year ; else  this.year = value }
	LocalDateTime.prototype.setMonth = function (value) {
		if (value === void 0) delete this.month ; else  this.month = value +1 }
	LocalDateTime.prototype.setDate = function (value) {
		if (value === void 0) delete this.date ; else  this.date = value }
	LocalDateTime.prototype.setHours = function (value) {
		if (value === void 0) delete this.hours ; else  this.hours = value }
	LocalDateTime.prototype.setMinutes = function (value) {
		if (value === void 0) delete this.minutes ; else  this.minutes = value }
	LocalDateTime.prototype.setSeconds = function (value) {
		if (value === void 0) delete this.seconds ; else  this.seconds = value }

	LocalDateTime.prototype.valueOf = function() {
		// return JSON.parse(JSON.stringify(this))
		// return this.toFixedString()
		return this.module()
	}

	/**
	 * Triad/Vector with 3 items: date(ms), time(ms), offset(ms)
	 * Date and time always in a local TZ, while offset points to the offset of current timezone
	 * @return {array} Vector
	 */
	LocalDateTime.prototype.toTriad = function () {
		return [
			(new LocalDateTime({'year': this.year, 'month': this.month, 'date': this.date}).module()),
			(new LocalDateTime({'hours': this.hours, 'minutes': this.minutes, 'seconds': this.seconds, 'milliseconds': this.milliseconds}).module()),
			(this.originOffset) ? this.originOffset : null
		]
	}

	LocalDateTime.prototype.toJSON = function () {
		return this.toFixedString()
	}

	LocalDateTime.prototype.toString = function () {
		// var buffer = this.valueOf();
		// 	pairs = []
		// 	for (var key in buffer) {
		// 		pairs.push([key,':',buffer].join(''))
		// 	}
		function skipVoid(value) {
			return (value === void 0) ? '' : value;
		}

		var h = this.hours, minutes = this.minutes, seconds = this.seconds, result = [];

		var time = (h || minutes) ? [_2digits(h), _2digits(minutes)] : '';
		if (time && this.seconds) time.push(_2digits(this.seconds));
		if (time) time = time.join(':')

		// var month = (this.month === void 0 || this.month === 0) ? '' : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][this.month -1];
		var month = skipVoid(this.month);
		var date = skipVoid(this.date);
		var year = skipVoid(this.year);
		if (this.year) result.push(this.year);
		if (month) result.push(_2digits(month));
		if (this.date) result.push(this.date);
		result = result.join('-')
		// if (time) result.push(time)
		return (time) ? result + ' ' + time : result;
	}

	LocalDateTime.prototype.toFixedString = function() {
		// return JSON.parse(JSON.stringify(this))
		var buffer, sign, value;
		function pad4(argument) {
			if (argument < 10) return '000'+argument
			if (argument < 100) return '00'+argument
			if (argument < 1000) return '0'+argument
			return argument
		}
		function pad2(argument) {
			if (argument < 10) return '0'+argument
			return argument
		}
		buffer = [pad4(this.year || 0), pad2(this.month || 0), pad2(this.date || 0), 'T', pad2(this.hours), pad2(this.minutes), pad2(this.seconds)]
		if (this.originOffset !== void 0) {
			value = currentTimeZoneOffsetMinutes / 60;
			if (value < 0) {
				buffer.push('-'+pad2(Math.floor(-value)))
				// push minutes:
				buffer.push(pad2(-(currentTimeZoneOffsetMinutes % 60)))
			} else {
				buffer.push('+'+pad2(Math.floor(value)))
				// push minutes:
				buffer.push(pad2(currentTimeZoneOffsetMinutes % 60))
			}
		}
		return buffer.join('')
	}

	/**
	 * Return date in fixed representation: "YYYY-MM-D".
	 * The result is reverse-compatible with LocalDateTime.parse().
	 * @return {string} Date in a local timezone
	 */
	LocalDateTime.prototype.toDelimitedDateString = function () {
		return [this.year, _2digits(this.month), this.date].join('-')
	}

	/**
	 * Return time in fixed representation: "0:00:00".
	 * The result is reverse-compatible with LocalDateTime.parse().
	 * @return {string} Time in a local timezone
	 */
	LocalDateTime.prototype.toDelimitedTimeString = function (omitSeconds) {
		return (omitSeconds) ?
			[this.hours, _2digits(this.minutes)].join(':')
			:
			[this.hours, _2digits(this.minutes), _2digits(this.seconds)].join(':')
	}

	/**
	 * Return date-time in fixed representation: "YYYY-MM-D 0:00:00".
	 * The result is reverse-compatible with LocalDateTime.parse().
	 * @return {string} Date/Time in a local timezone
	 */
	LocalDateTime.prototype.toDelimitedString = function (omitSeconds) {
		return [
			[this.year, _2digits(this.month), this.date].join('-'),
			(omitSeconds) ?
				[this.hours, _2digits(this.minutes)].join(':')
				:
				[this.hours, _2digits(this.minutes), _2digits(this.seconds)].join(':')
		].join(' ')
	}

	LocalDateTime.prototype.fromLiteral = function (args) {
		var notEmpty = false;

		// To-do: make normalization (h<23, m<59, ...)

		if (args.year == 1970) {
			args.year = 0;
			if (args.month == 0  && args.date == 1) {
					args.date = 0;
			}
		}

		this.year = args.year || 0; // Always FullYear
		this.month = args.month || 0; // starts from 0
		this.date = args.date || 0;
		this.hours = args.hours || 0;
		this.minutes = args.minutes || 0;
		this.seconds = args.seconds || 0;
		if (args.originOffset !== void 0)
			this.applyOriginOffset(args.originOffset)
	}

	LocalDateTime.prototype.toDate = function () {
		return new Date(
			this.year || 1970,
			this.month ? this.month -1 : 0,
			this.date || 1,
			this.hours || 0,
			this.minutes || 0,
			this.seconds || 0);
	}

	LocalDateTime.prototype.fromDate = function (date) {
		var vector = {};
		if (date instanceof LocalDateTime) {
			this.fromLiteral(date); // <--- copy properties
		} else if (date instanceof Date) {
			vector = dateToLiteral(date);
			this.fromLiteral(vector);
		} else {
			// console.error('LocalDateTime.fromDate error: argument is not instance of Date!', date);
			throw new TypeError('LocalDateTime.fromDate error: argument is not instance of Date!');
		}
	}

	LocalDateTime.prototype.isPartial = function () {
		//  [0, 86400000, 604800000, 2592000000, 31536000000]
		return this.toDate().getTime() < 31536000000
	}

	LocalDateTime.prototype.timeModule = function () {
		return (this.hours || 0) * 3600000 + (this.minutes || 0) * 60000 + (this.seconds || 0) * 1000;
	}

	LocalDateTime.prototype.dateModule = function () {
		return this.module() - this.timeModule();
	}

	// var _localTimeOffset = new Date(1970,0,1,0,0,0,0).getTime();

	LocalDateTime.prototype.module = function () {
		return this.toDate().getTime() + currentTimeZoneOffsetMs;
	}

	// To-do: test "subtract" for type "number"
	LocalDateTime.prototype.subtract = function (subtrahend) {
		if (subtrahend instanceof DateTimeInterval || typeof subtrahend === 'number') {
			return new LocalDateTime(this.module() - +subtrahend)
		} else if (subtrahend instanceof Date || subtrahend instanceof LocalDateTime) {
			return new DateTimeInterval(this.getTime() - subtrahend.getTime())
		} else {
			throw new Error('Invalid operand type for .subtract: '+typeof subtrahend)
		}
	}

	LocalDateTime.prototype.add = function (dateRange) {
		if (dateRange instanceof DateTimeInterval || typeof dateRange === 'number') {
			return new LocalDateTime(this.module() + +dateRange)
		} else {
			throw new Error('Invalid operand type for .add: '+typeof dateRange)
		}
	}

	// Add proxy methods for Date object
	Date.prototype.toLocalDateTime = function () {
		return new LocalDateTime(this)
	}

	Date.prototype.subtract = function (subtrahend) {
		if (subtrahend instanceof Date || subtrahend instanceof LocalDateTime) {
			return new DateTimeInterval(this.getTime() - subtrahend.getTime())
		}
		if (subtrahend instanceof DateTimeInterval) {
			return new Date(this.getTime() - subtrahend.getTime())
		}
		throw new TypeError('Date.subtract: Invalid operand type: '+typeof subtrahend)
	}

	Date.prototype.add = function (dateRange) {
		if (subtrahend instanceof DateTimeInterval) {
			return new Date(this.getTime() + subtrahend.getTime())
		}
		throw new TypeError('Date.subtract: Invalid operand type: '+typeof subtrahend)
	}


	// in AMD/CommonJS  modes - return exported without creation of globals;
	// for plain-js script - scope equals to "window", so extend it with new objects

	// scope['LocalDateTime'] = LocalDateTime;
	// scope['DateTimeInterval'] = DateTimeInterval;

	// window['LocalDateTime'] = LocalDateTime;
	// window['DateTimeInterval'] = DateTimeInterval;

	return {
		'LocalDateTime': LocalDateTime,
		'DateTimeInterval': DateTimeInterval
	};

}))
