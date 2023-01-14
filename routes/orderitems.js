const express = require("express");
const {sequelize, OrderItem, User} = require("../models");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
require('dotenv').config();

function authToken(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if(token == null) return res.status(401).json({msg: err});

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.status(403).json({msg:err});

        req.user = user;

        next();
    });
}

const route = express.Router();

route.use(authToken);
route.use(express.json());
route.use(express.urlencoded({extended:true}));

module.exports = route;

route.get("/", async (req, res) => {
    try{
        const orderItems = await OrderItem.findAll();
        return res.json(orderItems);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", body:err});
    }
});

route.get("/:id", async (req, res) => {
    try{
        const orderItems = await OrderItem.findByPk(req.params.id);
        return res.json(orderItems);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", body:err});
    }
});

const {Op} = require("sequelize");
route.get("/findOrderItem/:q", async (req, res) => {
    try{
        const orderMatches = await OrderItem.findAll({
            where : {
                order_id : {
                    [Op.eq] : req.params.q
                }
            }
        });

        return res.json(orderMatches);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", body:err});
    }   
});

route.post("/addOrderItem/", async (req, res) => {
    try{
        const shema = Joi.object().keys({
            quantity: Joi.number().required(),
            order_product_id: Joi.number().required(),
            order_id: Joi.number().required()
        });

        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });

        if(user.role_id == 1 || user.role_id == 2){
            const {error, succ} = shema.validate(req.body);

            if(error){
                res.status(400).json({msg:"Greska prilikom popunjavanja forme " + error.details[0].message});
                return;
            }

            const newOrderItem = await OrderItem.create(req.body);
            return res.json(newOrderItem);     
        }else{
            res.status(401).json({error:"Can't fulfill this request"})
        }
    }catch(err){
        console.log(err);
         res.status(500).json({error:"Greska", body:err});
    }
});

route.put("/editOrderItem/:id", async (req, res) => {
    try{
        const shema = Joi.object().keys({
            id: Joi.number().required(),
            quantity: Joi.number().required(),
            order_product_id: Joi.number().required(),
            order_id: Joi.number().required()
        });

        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });

        console.log(user.role_id)

        if(user.role_id == 1 || user.role_id == 2){
            const {error, succ} = shema.validate(req.body);

            if(error){
                res.status(400).json({msg:"Greska prilikom popunjavanja forme " + error.details[0].message});
                return;
            }

            const orderItemToEdit = await OrderItem.findByPk(req.params.id);
            orderItemToEdit.quantity = req.body.quantity;
            orderItemToEdit.order_product_id = req.body.order_product_id;
            orderItemToEdit.order_id = req.body.order_id;
            
            await orderItemToEdit.save();

            return res.json(orderItemToEdit);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", body:err});
    }
});

route.delete("/deleteOrderItem/:id", async(req, res) => {
    try{
        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });

        if(user.role_id == 1 || user.role_id == 2){
            const orderItemToDelete = await OrderItem.findByPk(req.params.id);
            await orderItemToDelete.destroy();

            return res.json(orderItemToDelete);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", body:err});
    }
});