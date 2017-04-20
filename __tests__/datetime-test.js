//'use strict'
//date-coords-test.js
//
// unmock to use the actual implementation of sum

// jest.unmock(vendorRoot+modules_underscore);
// jest.unmock('underscore');
jest.unmock('shared/datetime');

const 
	lib = require.requireActual('shared/datetime'),
	DateTimeInterval = lib.DateTimeInterval,
	LocalDateTime = lib.LocalDateTime;


describe('(1) DateTimeInterval', () => {

	describe('(1.1) constructor should support specified types of arguments...', ()=>{

		it('(1.1.1) should accept object argument {weeks:<number>,days:<number>,hours:<number>,minutes:<number>,seconds:<number>} and keep correct values', ()=>{
			var lDate = new DateTimeInterval({'weeks':1,'days':1,'hours':1,'minutes':1,'seconds':1});
			expect(lDate.valueOf()).toEqual(1*604800000+1*86400000+1*3600000+1*60000+1*1000)
		})

		it('(1.1.2) should accept argument type <integer> in mseconds from 1970-1-1 and keep correct values (zero value corresponds to: )', ()=>{
			var lDate = new DateTimeInterval(0)
				;
			// {"days": 0, "hours": 8, "minutes": 40, "seconds": 0, "weeks": 2449081}
			expect(lDate.valueOf()).toEqual(0)
		})

		it('(1.1.3) should accept argument type <integer> in mseconds from 1970-1-1 and keep correct values', ()=>{
			var oDate1 = new Date(2016,11,1,19,7,0)
				oDate2 = new Date(2016,11,8,19,7,0) // + 7 days
				,numeric = oDate2.getTime() - oDate1.getTime()
				,lDate = new DateTimeInterval(numeric)
				;

			expect(lDate.valueOf()).toEqual( 604800000) // milliseconds in a week
		})

		it('(1.1.4) should align units when seconds>59, minutes, hours>23, days>6', ()=>{
			expect(new DateTimeInterval({'seconds':60}).toPersistentString(true)).toEqual('0w 0d 0:01')
			expect(new DateTimeInterval({'minutes':60}).toPersistentString(true)).toEqual('0w 0d 1:00')
			expect(new DateTimeInterval({'hours':24}).toPersistentString(true)).toEqual('0w 1d ')
			expect(new DateTimeInterval({'days':7}).toPersistentString(true)).toEqual('1w 0d ')
		})

	})


	describe('(1.2) .module()  - "vector length"...', () => {
		it('(1.2.1) should have correct length ("module") defined by arguments... (zero)', () => {
			expect((new DateTimeInterval({weeks:0,days:0,hours:0,minutes:0,seconds:0})).module()).toEqual(0);
		});

		it('(1.2.2) should have correct length ("module") defined by arguments... (seconds conversion)', () => {
			expect((new DateTimeInterval({weeks:0,days:0,hours:0,minutes:0,seconds:1})).module()).toEqual(1000);
		});

		it('(1.2.3) should have correct length ("module") defined by arguments... (minutes conversion)', () => {
			expect((new DateTimeInterval({weeks:0,days:0,hours:0,minutes:1,seconds:0})).module()).toEqual(60000);
		});

		it('(1.2.3) should have correct length ("module") defined by arguments... (hours conversion)', () => {
			expect((new DateTimeInterval({weeks:0,days:0,hours:1,minutes:0,seconds:0})).module()).toEqual(3600000);
		});

		it('(1.2.4) should have correct length ("module") defined by arguments... (days conversion)', () => {
			expect((new DateTimeInterval({weeks:0,days:1,hours:0,minutes:0,seconds:0})).module()).toEqual(86400000);
		});

		it('(1.2.5) should have correct length ("module") defined by arguments... (weeks conversion)', () => {
			expect((new DateTimeInterval({weeks:1,days:0,hours:0,minutes:0,seconds:0})).module()).toEqual(604800000);
		});
	});

	describe('(1.3) .toString()...', () => {
		it('(1.3.1) should return correct string representation (zero)', () => {
			expect((new DateTimeInterval({weeks:0,days:0,hours:0,minutes:0,seconds:0})).toString())
				.toEqual('0');
		});
		it('(1.3.2) should return correct string representation (+1 second)', () => {
			expect((new DateTimeInterval({weeks:0,days:0,hours:0,minutes:0,seconds:1})).toString())
				.toEqual("0:00:01");
		});
		it('(1.3.3) should return correct string representation (+1 minute)', () => {
			expect((new DateTimeInterval({weeks:0,days:0,hours:0,minutes:1,seconds:1})).toString())
				.toEqual("0:01:01");
		});
		it('(1.3.4) should return correct string representation (+1 hour)', () => {
			expect((new DateTimeInterval({weeks:0,days:0,hours:1,minutes:1,seconds:1})).toString())
				.toEqual("1:01:01");
		});
		it('(1.3.5) should return correct string representation (+1 day)', () => {
			expect((new DateTimeInterval({weeks:0,days:1,hours:1,minutes:1,seconds:1})).toString())
				.toEqual("1d 1:01:01");
		});
		it('(1.3.6) should return correct string representation (+1 week)', () => {
			expect((new DateTimeInterval({weeks:1,days:1,hours:1,minutes:1,seconds:1})).toString())
				.toEqual("1w 1d 1:01:01");
		});
	});

	describe('(1.4) .valueOf()', ()=>{
		it('(1.4.1) internal values of a time vector must be equal to values used upon instantiation', () => {
				var lDate = new DateTimeInterval({'weeks': 11, 'days': 1, 'hours':1, 'minutes':1})
					;
			expect(lDate.valueOf()).toEqual(11*604800000+1*86400000+1*3600000+1*60000);
		});
	})

	describe('(1.5) Arithmetic operations', ()=>{
		it('(1.5.1) addition of zero interval - should not change original', () => {
				var interval = new DateTimeInterval({'weeks': 11, 'days': 1, 'hours':1, 'minutes':1})
					,zeroInterval = new DateTimeInterval(0)
					;
			console.log('>>>> interval:',interval)
			console.log('>>>> zeroInterval:',zeroInterval)

			expect(interval.add(zeroInterval)).toEqual(
				{"days": 1, "hours": 1, "minutes": 1, "seconds": 0, "weeks": 11});
		});
		it('(1.5.2) subtraction of zero interval - should not change original', () => {
				var interval = new DateTimeInterval({'weeks': 11, 'days': 1, 'hours':1, 'minutes':1})
					,zeroInterval = new DateTimeInterval(0)
					;
			expect(interval.subtract(zeroInterval)).toEqual(
				{"days": 1, "hours": 1, "minutes": 1, "seconds": 0, "weeks": 11});
		});
		it('(1.5.3) subtraction of same value - must be a "zero"', () => {
				var interval = new DateTimeInterval({'weeks': 11, 'days': 1, 'hours':1, 'minutes':1})
					;
			expect(interval.subtract(interval)).toEqual(
				{"days": 0, "hours": 0, "minutes": 0, "seconds": 0, "weeks": 0});
		});
		it('(1.5.4) new DateTimeInterval(value+X) should be same as new DateTimeInterval(value).add(X)', ()=>{
			expect(new DateTimeInterval(100+200)).toEqual(new DateTimeInterval(100).add(200))
		})
	})

	describe('(2) serialization...', ()=>{
		it('(2.1) JSON.stringify() for DateTimeInterval ', ()=>{
			var
				oDate = new DateTimeInterval({'weeks': 1, 'days': 1, 'hours': 1, 'minutes': 1, 'seconds': 1});
				val = 1*604800000+1*86400000+1*3600000+1*60000+1*1000
				expect(JSON.stringify(oDate))
					.toEqual(val.toString())
		})
	})
})

describe('(2) LocalDateTime', () => {

	// helpers
	const tzOffsetMs = (new Date()).getTimezoneOffset() * 60000;

	function fmtOffsetFixedStr(delimiter) {
		function pad2(argument) {
			if (argument < 10) return '0'+argument
			return argument
		}
		var currentTimeZoneOffsetMinutes =  -(new Date()).getTimezoneOffset(); // minutes, but convert the sign! Date returns negative offset for East and pozitive for West!!!

		buffer = []

		var value = currentTimeZoneOffsetMinutes / 60;
		if (value < 0) {
			buffer.push('-'+pad2(Math.floor(-value)))
			// push minutes:
			buffer.push(pad2(-(currentTimeZoneOffsetMinutes % 60)))
		} else {
			buffer.push('+'+pad2(Math.floor(value)))
			// push minutes:
			buffer.push(pad2(currentTimeZoneOffsetMinutes % 60))
		}
		return buffer.join(delimiter || '')
	}

	describe('(2.1) .toDate()  - spawn a Date object...', () => {

		it('(2.1.1) all specified components of a time vector must be same', () => {
				var lDate = new LocalDateTime({'month': 12, 'date': 8, 'hours':18, 'minutes':10})
					,oDate = lDate.toDate()
					;
			expect(oDate.getMonth()).toEqual(11);
			expect(oDate.getDate()).toEqual(8);
			expect(oDate.getHours()).toEqual(18);
			expect(oDate.getMinutes()).toEqual(10);
		});

		it('(2.1.2) internal values of a time vector must be equal to values used upon instantiation', () => {
				var lDate = new LocalDateTime({'month': 11, 'date': 8, 'hours':18, 'minutes':10})
					;
			expect(lDate.toFixedString()).toEqual('00001108T181000') 
				//{"date": 8, "hours": 18, "minutes": 10, "month": 11, "seconds": 0, "year": 0});
		});

		it('(2.1.3) spawned Date must be equal to the Date object in the same timezone', () => {
				var lDate = new LocalDateTime({'year':2016, 'month': 12, 'date': 8, 'hours':18, 'minutes':10})
					,oDate = new Date(2016, 11, 8, 18, 10, 0) // <--- Date counts "month" from zero!
					;
			expect(oDate.getMonth()).toEqual(lDate.getMonth());
			expect(oDate.getDate()).toEqual(lDate.getDate());
			expect(oDate.getHours()).toEqual(lDate.getHours());
			expect(oDate.getMinutes()).toEqual(lDate.getMinutes());
		});
	});

	describe('(2.2) test transformation with their reverse companions', ()=>{
		it('(2.2.1) getTime/setTime methods must be symmetrical and compatible with same methods in Date class (milliseconds are ignored)!', ()=>{
				var 
					original = new LocalDateTime(new Date(2016,11,12, 0,0,0,0)),
					produced = new LocalDateTime(),
					timeMs,
					date;
				// original.getTime->ms->produced.setTime(ms); produced===original
				timeMs = original.getTime();
				produced.setTime(timeMs);
				expect(produced).toEqual(original)

				// timeMs->date.setTime(); timeMs->localDateTime.setTime(); date===localDateTime
				timeMs = Math.floor(Date.now()/1000)*1000; // some value - "now", but ignore milliseconds
				date = new Date();
				date.setTime(timeMs);
				// clear milliseconds???
				produced = new LocalDateTime();
				produced.setTime(timeMs)
				expect(produced.toDate()).toEqual(date)
		})
		it('(2.2.2) module() should return result (local interval in milliseconds from epoch) compatible with constructor in form LocalDateTime(number)', ()=>{
				var 
					original = new LocalDateTime(new Date(2016,11,12, 0,0,0,0)),
					module = original.module(),
					produced = new LocalDateTime(module);
					
				expect(produced.toDate()).toEqual(original.toDate());
		})
	})

	describe('(2.3) constructor should handle specified types of arguments correctly...', ()=>{

		it('(2.3.1) should accept object argument {year:<number>,month:<number>,date:<number>,hours:<number>,minutes:<number>,seconds:<number>} and keep correct values', ()=>{
			var lDate = new LocalDateTime({'year':2016,'month':11,'date':8,'hours':19,'minutes':4,'seconds':0});
			expect(lDate.toFixedString()).toEqual('20161108T190400') 
				// {"date": 8, "hours": 19, "minutes": 4, "month": 11, "seconds": 0, "year": 2016})
		})

		it('(2.3.2) should accept argument type <integer> in mseconds IN LOCAL TIME from 1970-1-1 and keep correct values', ()=>{
			var oDate = new Date(2016,11,8,19,7,0)
				,numeric = oDate.getTime() - tzOffsetMs
				,lDate = new LocalDateTime(numeric)
				;
			expect(lDate.toFixedString()).toEqual('20161208T190700') 
				//{"date": 8, "hours": 19, "minutes": 7, "month": 11, "seconds": 0, "year": 2016})
		})

		it('(2.3.3) should accept argument with type "Date" and keep correct values from a local time', ()=>{
			var oDate = new Date(2016,11,8,19,7,0)
				,lDate = new LocalDateTime(oDate)
				;
			expect(lDate.toFixedString()).toEqual('20161208T190700')
				//{"date": 8, "hours": 19, "minutes": 7, "month": 11, "seconds": 0, "year": 2016})
		})

		describe('(2.3.4) should decode string argument correctly', ()=>{
			it('(2.3.4.1) short be a "zero" at zero milliseconds', ()=>{
				var result = new LocalDateTime(0);
				expect(result.module()).toEqual(0);
				expect(result.hours).toEqual(0);
				expect(result.minutes).toEqual(0);
				expect(result.seconds).toEqual(0);
			})
			it('(2.3.4.2) short be a "zero" at zero time string "00:00:00"', ()=>{
				var result = new LocalDateTime(0);
				expect(result.module()).toEqual(0);
				expect(result.hours).toEqual(0);
				expect(result.minutes).toEqual(0);
				expect(result.seconds).toEqual(0);
			})
			it('(2.3.4.3) short be a "zero" Date which is a start of epoch', ()=>{
				var result = new LocalDateTime(new Date(1970, 0, 1, 0, 0, 0, 0));
				expect(result.module()).toEqual(0);
				expect(result.hours).toEqual(0);
				expect(result.minutes).toEqual(0);
				expect(result.seconds).toEqual(0);
			})
			it('(2.3.4.4) short "time-only" string in format "H:MM"', ()=>{
				var result = new LocalDateTime('1:02');
				// console.log('expect(result)========>', expect(result))
				// expect(result).toMatchObject({
				// 	hours:1, minutes:1, seconds:0 
				// })
				expect(result.hours).toEqual(1);
				expect(result.minutes).toEqual(2);
				expect(result.seconds).toEqual(0);
			})
			it('(2.3.4.5) short "time-only" string in format "HH:MM:SS", e.g., "01:02:03"', ()=>{
				var result = new LocalDateTime('01:02:03');
				expect(result.toFixedString()).toEqual('00000000T010203')
			})
			it('(2.3.4.6) short "time-only" string in format "HH:MM:SS.NNN", e.g., "01:02:03.000"', ()=>{
				var result = new LocalDateTime('01:02:03.000');

				expect(result.toFixedString()).toEqual('00000000T010203')

				expect(result.hours).toEqual(1);
				expect(result.minutes).toEqual(2);
				expect(result.seconds).toEqual(3);
			})
			// New tests for "fixed" formats:

			it('(2.3.4.9) short fixed "time-only" string in format "HHMMSS", e.g., "010203"', ()=>{
				var result = new LocalDateTime('010203');

				expect(result.toFixedString()).toEqual('00000000T010203')
			})

			// it('(2.3.4.10) short fixed "time-only" string in format "HHMMSS+0000", e.g., "010203+0000"', ()=>{
			// 	var result = new LocalDateTime('010203+0000');

			// 	expect(result.toFixedString()).toEqual(00000000T063203+0530)
			// })

			// it('(2.3.4.11) short fixed "time-only" string in format "HHMMSS+0000", e.g., "010203+0100"', ()=>{
			// 	var result = new LocalDateTime('010203+0100');

			// 	expect(result.toFixedString()).toEqual()
			// })

			// it('(2.3.4.12) short fixed "time-only" string in format "HHMMSS+0000", e.g., "010203-0100"', ()=>{
			// 	var result = new LocalDateTime('010203-0100');

			// 	expect(result.toFixedString()).toEqual()
			// })

		})

		describe('(2.3.5) LocalDateTime.parse should accept specified formats of string', ()=>{
			// use isNaN polyfill
			!(typeof Number.isNaN == 'function') ||
			  (Number.isNaN = function (value) {
			    return value !== null // Number(null) => 0
			      && (value != value // NaN != NaN
			        || +value != value // Number(falsy) => 0 && falsy == 0...
			      )
			});
			var testCases = [
			  {'input':'2016-11-12 01:02:03', 'result':'20161112T010203'},
			  {'input':'2016-11-12 01:02:03.000', 'result':'20161112T010203'},
			  {'input':'2016-11-12 01:02:03'+fmtOffsetFixedStr(':'), 'result':'20161112T010203'+fmtOffsetFixedStr('')}, // <--- NOTE WORKS ONLY in IST time!!!
			  {'input':'2016-11-12 01:02:03.000'+fmtOffsetFixedStr(':'), 'result':'20161112T010203'+fmtOffsetFixedStr('')},
			  {'input':'2016-11-12T01:02:03', 'result':'20161112T010203'},
			  {'input':'2016-11-12T01:02:03'+fmtOffsetFixedStr(':'), 'result':'20161112T010203'+fmtOffsetFixedStr('')},
			  {'input':'1:02', 'result':'00000000T010200'},
			  {'input':'1:02:03', 'result':'00000000T010203'},
			  {'input':'01:02:03', 'result':'00000000T010203'},
			  {'input':'01:02:03.000', 'result':'00000000T010203'},
			  {'input':'01:02:03'+fmtOffsetFixedStr(':'), 'result':'00000000T010203'+fmtOffsetFixedStr('')},
			  {'input':'01:02:03.000'+fmtOffsetFixedStr(':'), 'result':'00000000T010203'+fmtOffsetFixedStr('')},
			  {'input':'2016-11-12', 'result':'20161112T000000'},
			  {'input':'2016-11-12'+fmtOffsetFixedStr(':'), 'result':'20161112T000000'+fmtOffsetFixedStr('')},

			  {'input':'20161112T010203', 'result':'20161112T010203'},
			  {'input':'20161112T010203'+fmtOffsetFixedStr(''), 'result':'20161112T010203'+fmtOffsetFixedStr('')},
			  {'input':'010203', 'result':'00000000T010203'},
			  {'input':'010203'+fmtOffsetFixedStr(''), 'result':'00000000T010203'+fmtOffsetFixedStr('')},
			  {'input':'20161112', 'result':'20161112T000000'},
			  {'input':'20161112'+fmtOffsetFixedStr(''), 'result':'20161112T000000'+fmtOffsetFixedStr('')}
			]

 // * '0:00',
 // * '0:00:00',
 // * '2016-11-12',
 // * '2016-11-2 0:00:00',
 // * '2016-11-12T0:00:00',
 // * '2016-11-12 0:00:00.000+3:00',
 // * '2016-11-12 0:00:00+300'
 			testCases.forEach( (testCase) => {
 				it('(2.3.5.*) accept format "'+testCase.input+'"', ()=>{
 					var date = new LocalDateTime(testCase.input);
 					// expect(date).toEqual({})	
 					expect(date.toFixedString()).toEqual(testCase.result)	
 				})
 			});
// 			it('(2.3.5.1) accept short time "0:00"', ()=>{
// 				expect(Number.isNaN(LocalDateTime.parse('1:02'))).toBeFalsy()
// 			})
// 			it('(2.3.5.2) accept long time "0:00:00"', ()=>{
// 				expect(Number.isNaN(LocalDateTime.parse('1:02:03'))).toBeFalsy()
// 			})
// 			it('(2.3.5.3) accept long time "00:00:00"', ()=>{
// 				expect(Number.isNaN(LocalDateTime.parse('01:02:03'))).toBeFalsy()
// 			})
// 			it('(2.3.5.4) accept long time with TZ "0:00:00+3:00"', ()=>{
// 				expect(Number.isNaN(LocalDateTime.parse('1:02:03+4:00'))).toBeFalsy()
// 			})
// 			it('(2.3.5.5) accept long time with TZ "0:00:00+03:00"', ()=>{
// 				expect(Number.isNaN(LocalDateTime.parse('1:02:03+04:00'))).toBeFalsy()
// 			})
// 			it('(2.3.5.6) accept short date "2016-11-2"', ()=>{
// 				expect(Number.isNaN(LocalDateTime.parse('2016-11-2'))).toBeFalsy()
// 			})
// 			it('(2.3.5.7) accept short date "2016-11-02"', ()=>{
// 				expect(Number.isNaN(LocalDateTime.parse('2016-11-02'))).toBeFalsy()
// 			})
// 			it('(2.3.5.8) accept date-time combnations "2016-11-2 0:00:00"', ()=>{
// 				expect(Number.isNaN(LocalDateTime.parse('2016-11-2 1:02:03'))).toBeFalsy()
// 			})

// 			it('(2.3.5.9) accept date-time combnations "2016-11-12T0:00:00"', ()=>{
// 				expect(Number.isNaN(LocalDateTime.parse('2016-11-2T1:02:03'))).toBeFalsy()
// 			})

// //-- new formats
// 			it('(2.3.5.10) accept date-time combnations "20161112T000000"', ()=>{
// 				expect(Number.isNaN(LocalDateTime.parse('20161112T010203'))).toBeFalsy()
// 			})

// 			it('(2.3.5.11) accept date-time combnations "20161112T000000+0000"', ()=>{
// 				expect(Number.isNaN(LocalDateTime.parse('20161112T010203+4000'))).toBeFalsy()
// 			})
// 			it('(2.3.5.12) accept date combnations "20161112"', ()=>{
// 				expect(Number.isNaN(LocalDateTime.parse('20161112'))).toBeFalsy()
// 			})
// 			it('(2.3.5.13) accept time combnations "125959"', ()=>{
// 				expect(Number.isNaN(LocalDateTime.parse('125959'))).toBeFalsy()
// 			})
// 			it('(2.3.5.14) accept time combnations "125959-4000"', ()=>{
// 				expect(Number.isNaN(LocalDateTime.parse('125959-4000'))).toBeFalsy()
// 			})
// 			it('(2.3.5.15) accept time combnations "125959+4000"', ()=>{
// 				expect(Number.isNaN(LocalDateTime.parse('125959+4000'))).toBeFalsy()
// 			})

// -- end of: new combinations
			it('(2.3.5.20) reject date-time with UTC zone "2016-11-12T0:00:00Z"', ()=>{
				expect(Number.isNaN(LocalDateTime.parse('2016-11-12T1:02:03Z'))).toBeTruthy()
			})

			it('(2.3.5.21) reject invalid delimiters "2016/11/12 0:00:00Z"', ()=>{
				expect(Number.isNaN(LocalDateTime.parse('2016/11/12 1:02:03Z'))).toBeTruthy()
			})

			it('(2.3.5.22) reject locale-dependent forms "Jan 12 2016 0:00:00"', ()=>{
				expect(Number.isNaN(LocalDateTime.parse('Jan 12 2016 1:02:03'))).toBeTruthy()
			})

			it('(2.3.5.23) reject locale-dependent forms "Jan 12 2016 0:00:00"', ()=>{
				expect(Number.isNaN(LocalDateTime.parse('Jan 12 2016 1:02:03'))).toBeTruthy()
			})
		})

		describe('(2.3.6) should accept milliseconds correctly', ()=>{
			it('(2.3.6.1) should accept number of milliseconds passed from the epoch start in a local timezone', ()=>{

			})
			it('(2.3.6.2) should accept number of milliseconds passed from the epoch start in a local timezone', ()=>{

			})
		})

		describe('(2.3.7) should decode timezone correctly', ()=>{

			it('(2.3.7.1) should return the same datetime when current timezone specified', ()=>{
				var dt = new LocalDateTime('20161112T000000' + fmtOffsetFixedStr());
				console.warn('>>>>>> LocalDateTime("20161112T000000") + fmtOffsetFixedStr()', dt.toFixedString())
				expect(dt.toFixedString()).toEqual('20161112T000000' + fmtOffsetFixedStr())
			})

		})

		describe('(2.3.8) should recompute time to the current timezone when absolute timestamp (with original offset) specified', ()=>{

			it('(2.3.8.1) UTC time 12:00 noon', ()=>{
				var dt;
				var _mockOffsetValue = 0*60 + 0;
				var _savedValue = LocalDateTime.adjustCurrentTimeZone(_mockOffsetValue)
				dt = new LocalDateTime('20161112T120000+0000'); // UTC/GMT
				expect(dt.toFixedString()).toEqual('20161112T120000+0000')
				LocalDateTime.adjustCurrentTimeZone(_savedValue)
			})

			it('(2.3.8.2) IST time when UTC 12:00 noon +5h30: 17:30', ()=>{
				var dt;
				var _mockOffsetValue = 5*60 + 30;
				var _savedValue = LocalDateTime.adjustCurrentTimeZone(_mockOffsetValue)
				dt = new LocalDateTime('20161112T120000+0000'); // UTC/GMT
				expect(dt.toFixedString()).toEqual('20161112T173000+0530') // should be 17:30
				LocalDateTime.adjustCurrentTimeZone(_savedValue)
			})

			it('(2.3.8.3) Moscow time when UTC 12:00 noon +3h: 15:00', ()=>{
				var dt;
				_mockOffsetValue = 3*60 + 0;
				var _savedValue = LocalDateTime.adjustCurrentTimeZone(_mockOffsetValue)
				dt = new LocalDateTime('20161112T120000+0000'); // UTC/GMT
				expect(dt.toFixedString()).toEqual('20161112T150000+0300') // should be 15:00
				LocalDateTime.adjustCurrentTimeZone(_savedValue)
			})

			it('(2.3.8.4) Negative offset: LA time when UTC 12:00 noon -08h: 4:00', ()=>{
				var dt;
				_mockOffsetValue = -8*60 + 0;
				var _savedValue = LocalDateTime.adjustCurrentTimeZone(_mockOffsetValue)
				dt = new LocalDateTime('20161112T120000+0000'); // UTC/GMT
				expect(dt.toFixedString()).toEqual('20161112T040000-0800') // should be 15:00
				LocalDateTime.adjustCurrentTimeZone(_savedValue)
			})
		})

		describe('(2.3.9) should display the same local time in any timezone when relative timestamp (without original offset) specified', ()=>{

			it('(2.3.9.1) UTC time 12:00 noon', ()=>{
				var dt;
				var _mockOffsetValue = 0*60 + 0;
				var _savedValue = LocalDateTime.adjustCurrentTimeZone(_mockOffsetValue)
				dt = new LocalDateTime('20161112T120000'); // UTC/GMT
				expect(dt.toFixedString()).toEqual('20161112T120000')
				LocalDateTime.adjustCurrentTimeZone(_savedValue)
			})

			it('(2.3.9.2) IST time when UTC 12:00 noon + 5:30', ()=>{
				var dt;
				var _mockOffsetValue = 5*60 + 30;
				var _savedValue = LocalDateTime.adjustCurrentTimeZone(_mockOffsetValue)
				dt = new LocalDateTime('20161112T120000'); // UTC/GMT
				expect(dt.toFixedString()).toEqual('20161112T120000') // should be 17:30
				LocalDateTime.adjustCurrentTimeZone(_savedValue)
			})

			it('(2.3.9.3) Moscow time when UTC 12:00 noon + 3:00', ()=>{
				var dt;
				_mockOffsetValue = 3*60 + 0;
				var _savedValue = LocalDateTime.adjustCurrentTimeZone(_mockOffsetValue)
				dt = new LocalDateTime('20161112T120000'); // UTC/GMT
				expect(dt.toFixedString()).toEqual('20161112T120000') // should be 15:00
				LocalDateTime.adjustCurrentTimeZone(_savedValue)
			})

			it('(2.3.9.4) Negative offset: LA time when UTC 12:00 noon - 4:00', ()=>{
				var dt;
				_mockOffsetValue = -8*60 + 0;
				var _savedValue = LocalDateTime.adjustCurrentTimeZone(_mockOffsetValue)
				dt = new LocalDateTime('20161112T120000'); // UTC/GMT
				expect(dt.toFixedString()).toEqual('20161112T120000') // should be 15:00
				LocalDateTime.adjustCurrentTimeZone(_savedValue)
			})
		})

	})

	describe('(2.4) arithmetics with date values...', ()=>{
		it('(2.4.1) .subtract() for the same value should return "zero" DateTimeInterval ', ()=>{
			var
				oDate = new Date(2016,11,8,19,7,0)
				,lDate = new LocalDateTime(oDate)
				;
				expect(lDate.subtract(oDate))
					.toEqual({"days": 0, "hours": 0, "minutes": 0, "seconds": 0, "weeks": 0})
		})

		it('(2.4.2) subtract ', ()=>{
			var
				oDate1 = new Date(1970,0,1,0,0,0,0)
				,oDate2 = new Date(2016,11,8,19,7,0)
				,lDate = new LocalDateTime(oDate2)
				;
				expect(lDate.subtract(oDate1)).toEqual( 
					{"days": 0, "hours": 19, "minutes": 7, "seconds": 0, "weeks": 2449})
		})

		it('(2.4.3) new LocalDateTime(value+X) should be same as new LocalDateTime(value).add(X)', ()=>{
			expect(new LocalDateTime(100+200)).toEqual(new LocalDateTime(100).add(200))
		})

		xit('(2.4.4) new LocalDateTime(value-X) should be same as new LocalDateTime(value).subtract (X)', ()=>{
			expect(new LocalDateTime(200-100)).toEqual(new LocalDateTime(200).subtract(100))
		})
	})

	describe('(2.5) serialization...', ()=>{
		it('(2.5.1) JSON.stringify() for LocalDateTime ', ()=>{
			var
				oDate = new Date(2016,11,8,19,7,0)
				,lDate = new LocalDateTime(oDate)
				;
				expect(JSON.stringify(lDate))
					.toEqual("\"20161208T190700\"")
		})
	})

});

describe('(3) "Date" - new methods...', ()=>{
	describe('(3.1) .subtract()...', ()=>{
		it('(3.1.1) should return instance of DateTimeInterval when argument instance of "Date"', ()=>{
			var
				d = new Date();
			expect(d.subtract(d) instanceof DateTimeInterval).toBe(true);
		})
		it('(3.1.2) should return instance of Date when argument instance of "DateTimeInterval"', ()=>{
			var
				d = new Date()
				,interval = new DateTimeInterval(0);
			expect(d.subtract(interval) instanceof Date).toBe(true);
		})
		it('(3.1.3) subtraction of the same value should return "zero"', ()=>{
			var
				d = new Date();
			expect(d.subtract(d).module()).toEqual(0);
		})
		it('(3.1.4) subtraction of Date which is "start of epoch" should be same as interval from "1-Jan-1970 00:00:00"', ()=>{
			var
				d = new Date(2016,11,9,0,0,0,0),
				d0 = new Date(1970, 0, 1, 0, 0, 0, 0);
				// d0 = new Date(Date.UTC(1970, 0, 1, 0, 0, 0, 0));
			expect(new LocalDateTime(d.subtract(d0).module())).toEqual(
				{"date": 9, "hours": 0, "minutes": 0, "month": 12, "seconds": 0, "year": 2016});
			// {"date": 8, "hours": 18, "minutes": 30, "month": 11, "seconds": 0, "year": 2016}
		})
		it('(3.1.5) subtraction of a "zero" DateTimeInterval should not change the original', ()=>{
			var
				d = new Date(2016,11,9,0,0,0,0)
				,interval = new DateTimeInterval(0);
			expect(new LocalDateTime( d.subtract(interval))).toEqual(
				{"date": 9, "hours": 0, "minutes": 0, "month": 12, "seconds": 0, "year": 2016});
		})
	})
})

/*
new Date(Date.parse('2016/12/07'))

var ms = (new Date()).getTime();
var d2 = new Dat<programme start="20161208021500 +0300" stop="20161208030000 +0300"e()
var d0 = new Date(0)
var dLocal0 = new Date(-330*60000);
d2.setTime(ms);
console.log(ms, d2.getTime(), d2, d2.getTimezoneOffset())
console.log(d0, d0.getTimezoneOffset(), d0.getTime(), d0.toUTCString())
console.log(dLocal0, dLocal0.getTime(), dLocal0.toUTCString())

console.log(new Date(-19800000))
var zero = new Date(1970,0,1,0,0,0).getTime()
var dayStart = new Date(Date.UTC(2016, 11, 7,0,0,0))
//var abs = new Date()
var localMs = dayStart.getTime() + zero
console.log(zero, new Date(zero), dayStart, new Date(localMs))

var tags = '20161207143000'.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/)
console.log(tags)
 */