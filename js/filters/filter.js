app.filter('isOpen', function() {
	return function(x) {
		if(x === true) {
			return 'Open Now';
		}
		else {
			return 'Closed Now';
		}
	};
});