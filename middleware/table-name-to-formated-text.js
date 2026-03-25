module.exports = {
    tableNameToFormatedText: async (table) => {
        switch (table) {
            case 'new':
                return 'New'
            case 'user':
                return 'User'
            case 'post_pivot' || 'post':
                return 'Post'
            case 'district':
                return 'District'
            case 'attraction':
                return 'Attraction'
            case 'poi':
                return 'POI'
            case 'blog':
                return 'Blog'
            case 'tour_package':
                return 'Tour Package'
            case 'book_stay':
                return 'Book Stay'
            case 'social_event':
                return 'Social Event'
            case 'local_product':
                return 'Local Product'
            case 'itinerary':
                return 'Itinerary'
            default:
                return 'New'
        }
    }
}