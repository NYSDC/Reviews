require('dotenv').config()
const express = require('express')
const Sequelize = require('sequelize');
const bodyParser = require('body-parser')

const path = process.env.DB_URL;
const sequelize = new Sequelize(path, {
    operatorsAliases: false
});

const Characteristic = sequelize.define('characteristic_reviews', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    characteristic_id: Sequelize.INTEGER,
    review_id: Sequelize.INTEGER,
    value: Sequelize.INTEGER
}, {
    timestamps: false
})


const Photo = sequelize.define('reviews_photos', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    }, review_id: Sequelize.INTEGER,
    url: Sequelize.STRING
}, {
    timestamps: false
});

const Review = sequelize.define('review', {
    review_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: "id"
    },
    product_id: Sequelize.INTEGER,
    rating: Sequelize.INTEGER,
    date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
    },
    summary: Sequelize.STRING,
    body: Sequelize.STRING,
    recommend: Sequelize.BOOLEAN,
    reported: Sequelize.BOOLEAN,
    reviewer_name: Sequelize.STRING,
    reviewer_email: Sequelize.STRING,
    response: Sequelize.STRING,
    helpfulness: Sequelize.INTEGER
}, {
    timestamps: false
});

Review.hasMany(Photo, {
    foreignKey: 'review_id',
    as: 'photos'
});

Photo.belongsTo(Review, {
    foreignKey: 'review_id',
});

Review.hasMany(Characteristic, {
    foreignKey: 'review_id',
    as: 'characteristics'
});

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = 3000

app.get('/reviews/:product_id/list', (req, res) => {
    const count = req.query.count ? parseInt(req.query.count) : 5;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    return Review.findAll({
        include: [
            {
                model: Photo,
                as: 'photos'
            }
            // }, {
            //     model: Characteristic,
            //     as: 'characteristics'
            // }
        ],
        where: { product_id: req.params.product_id },
        limit: count,
        offset: (page - 1) * count,
    }).then(reviews => {
        let response = {
            product: req.query.product_id,
            page,
            count,
            results: []
        };
        reviews.forEach(review => {
            response.results.push(review);
        })
        res.json(response)
    });
})

app.get('/reviews/:product_id/meta', async (req, res) => {
    const productId = parseInt(req.params.product_id);

    const ratings = await Review.findAll({
        attributes: ['rating', [sequelize.fn('count', sequelize.col('rating')), 'cnt']],
        group: ['review.rating'],
        where: { product_id: productId }
    });

    const recommended = await Review.findAll({
        attributes: ['recommend', [sequelize.fn('count', sequelize.col('recommend')), 'cnt']],
        group: ['review.recommend'],
        where: { product_id: productId }
    });

    const [characteristics, metadata] = await sequelize.query(
        `
        select
            cw.characteristic_id,
            c.name,
            count(1) as cnt,
            avg(value) as avg
        from reviews r
        inner join characteristic_reviews cw on r.id = cw.review_id
        inner join characteristics c on c.id = cw.characteristic_id
        where r.product_id=:product_id
        and c.product_id = r.product_id
        group by characteristic_id, name
        order by characteristic_id, name
        `, {
        replacements: { product_id: productId }
    }
    );

    ratingAgg = {}
    ratings.forEach(r => ratingAgg[r.dataValues.rating] = r.dataValues.cnt)

    recommendedAgg = {}
    recommended.forEach(r => recommendedAgg[r.dataValues.recommend ? 1 : 0] = r.dataValues.cnt)

    characteristicAgg = {}
    characteristics.forEach(c => characteristicAgg[c.name] = { id: c.characteristic_id, value: c.avg })

    res.json({
        product_id: productId,
        ratings: ratingAgg,
        recommended: recommendedAgg,
        characteristic: characteristicAgg
    });
});


app.post('/reviews', async (req, res) => {
    const { product_id, rating, summary, body, recommend, name, email, photos, characteristics } = req.body;
    const characteristic_ids = Object.keys(characteristics);
    const review = await Review.create({
        product_id,
        rating,
        summary,
        body,
        recommend,
        reviewer_email: email,
        reviewer_name: name,
    });
    const characteristic_promises = characteristic_ids.map(id => {
        return Characteristic.create({
            review_id: review.review_id,
            characteristic_id: id,
            value: characteristics[id]
        })
    });
    const created_characteristics = await Promise.all(characteristic_promises);
    const photo_promises = photos.map(url => {
        return Photo.create({
            review_id: review.review_id,
            url,
        })
    });
    const created_photos = await Promise.all(photo_promises);
    res.status(201).send('CREATED');

})

app.put('/reviews/:review_id/helpful', async (req, res) => {
    const id = req.params.review_id;
    await Review.increment('helpfulness', { by: 1, where: { review_id: id } });
    res.status(204).send('NO CONTENT');
});

app.put('/reviews/report/:review_id', async (req, res) => {
    const { review_id } = req.params;
    await Review.update({ reported: 'true' }, { where: { id: review_id } });
    res.status(204).send('NO CONTENT');
});


// app.get('reviews/meta', (req, res) => {
//     const params = req.query.product_id;
//     return Review.findOne({
//         include: {
//             model: Photo
//         },
//         where: { id: req.params.id }
//     }).then(review => { res.json(review) });
// })

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})