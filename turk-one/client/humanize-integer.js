/**
 * Created by sahand on 11/14/15.
 */
special = ['zeroth','first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelvth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
deca = ['twent', 'thirt', 'fourt', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];

stringifyNumber = function(n) {
	if (n < 20) return special[n];
	if (n%10 === 0) return deca[Math.floor(n/10)-2] + 'ieth';
	return deca[Math.floor(n/10)-2] + 'y-' + special[n%10];
}