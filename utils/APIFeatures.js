class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const { page, sort, limit, fields, ...queryObj } = this.queryString
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    sort() {
        const { page, sort, limit, fields, ...queryObj } = this.queryString
        if(sort) {
            const sortBy = sort.split(',').join(' ');
            this.query = this.query.sort(sortBy)
        }
        // else {
        //     query = query.sort('-createdAt');
        // }

        return this;
    }

    limitFields() {
        const { page, sort, limit, fields, ...queryObj } = this.queryString
        if(fields) {
            this.query = this.query.select(fields.split(',').join(' '));
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        const { page, sort, limit, fields, ...queryObj } = this.queryString
        const pageNo = page*1 || 1;
        const limitNo = limit*1 || 20;
        const skip = (pageNo - 1) * limitNo;

        this.query = this.query.skip(skip).limit(limitNo);

        return this;
    }
}

module.exports = APIFeatures;