const express = require('express'),
    { Sequelize, Op, Model, DataTypes, QueryTypes, where } = require("sequelize"),
    router = express.Router();


const Cars = require('../../../models/car');
const News_Event = require("../../../models/news_events");
const Price = require('../../../models/price');
const Prices = require("../../../models/price");
const CarImages = require("../../../models/car-images");
const CarServices = require("../../../models/car-services");
const Lowest_Prices = require('../../../models/lowest_prices');

router.get('/cars', async (req, res) => {
    try {       
        const Carsdata = await Cars.findAll({
            attributes: ['id','title','description','vehicle_type','model_year','registration_no','passengers','luggage','image_url','banner_image_url'],
            where: {
                status: 1,
                isDeleted: 0                
            }, include: [
                {
                    model: CarImages,
                    as: 'car_images',
                    attributes: ['id', 'image'], 
                    required: false,
                    where: { isDeleted: 0 },
                },{
                    model: Prices,
                    as: 'car_price',
                    attributes: ['id', "km_price", "hourly_price"], 
                    required: false,
                    where: { isDeleted: 0 },
                },{
                    model: CarServices,
                    as: 'car_services',
                    attributes: ['id','interior','seat','player','wifi','charger','desk'], 
                    required: false,
                    where: { isDeleted: 0 },
                    limit:1
                }
            ],
            order: [
                [{ model: Prices, as: 'car_price' }, 'km_price', 'ASC'],
            [{ model: Prices, as: 'car_price' }, 'hourly_price', 'ASC']
        ]
        })


        const lowestprice = await Lowest_Prices.findAll({
            attributes: ["price_km", "price_hourly" ],
        });

        if(Carsdata && Carsdata.length > 0) {
            return res.send({
                success: true,
                message: 'Records found.',
                data: Carsdata,
                lowestPrices: lowestprice,
            })
        }
        return res.send({
            success: false,
            message: 'Oops! something went wrong. Record was not found.'
        })
    } catch (error) {
        return res.send({
            success: false,
            message: 'Oops! something went wrong. ' + error
        })
    }
});


router.get('/news-event', async (req, res) => {
    try {       
        const NewsEventData = await News_Event.findAll({
            attributes: ['id','title','image','type','description'],
            where: {
                status: 1,
                isDeleted: 0                
            }
        })        
        if(NewsEventData && NewsEventData.length > 0) {
            return res.send({
                success: true,
                message: 'Records found.',
                data: NewsEventData
            })
        }
        return res.send({
            success: false,
            message: 'Oops! something went wrong. Record was not found.'
        })
    } catch (error) {
        return res.send({
            success: false,
            message: 'Oops! something went wrong. ' + error
        })
    }
});

router.get('/prices', async (req,res)=>{
    try {
        const priceData = await Price.findAll({
            attributes: ["id", "km_price", "hourly_price", "car_id"],
            where: {
                isDeleted: 0
            }
        });

        const lowestprice = await Lowest_Prices.findAll({
            attributes: ["price_km", "price_hourly" ],
        });

        if (priceData && priceData.length > 0) {
            return res.send({
                success: true,
                message: 'Records found.',
                data: {
                    prices: priceData,
                    lowestPrices: lowestprice
                }
            });
        }

        return res.send({
            success: false,
            message: 'Oops! something went wrong. Record was not found.',
            data: {
                prices: [],
                lowestPrices: lowestprice
            }
        });

    } catch (error) {
        return res.send({
            success: false,
            message: 'Oops! something went wrong. ' + error
        })
    }
})








module.exports = router;