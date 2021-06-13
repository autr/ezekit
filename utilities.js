const year = date => (new Date( date * 1000 )).getFullYear()

const posts = (items, y) => {
	if (y == 'all') y = null
	let years = []
	const data = items.filter( item => {
		const year_ = year(item.created)
		if (years.indexOf( year_ ) == -1 && year_) years.push( year_ )
		if ( !y ) return true
		return year_ == parseInt( y ) 
	})
	data.sort( (a,b) => b.created - a.created )
	years.sort( (a,b) => a - b )
	years.push( 'all' )
	years.reverse()
	return { years, data }
}


export default { year, posts }