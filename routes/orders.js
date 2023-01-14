const express = require("express");
const {sequelize, Order, User} = require("../models");
const jwt = require('jsonwebtoken');
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
        const orders = await Order.findAll();
        return res.json(orders);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska",data:err});
    }
});

route.get("/:id", async (req, res) => {
    try{
        const orderById = await Order.findByPk(req.params.id);
        return res.json(orderById);
    } catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});

const {Op} = require("sequelize");
route.get("/findOrder/:userid", async (req, res) => {
    try{
        const orderMatch = await Order.findAll({
            where : {
                user_order_id : {
                    [Op.eq] : user_order_id
                }
            }
        });

        return res.json(orderMatch);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", data:err});
    }
});

route.post("/addOrder/", async (req, res) => {
    try{
        const shema = Joi.object().keys({
            total: Joi.number().required(),
            shipping: Joi.number().required(),
            grand_total: Joi.number().required(),
            user_order_id: Joi.number().required(),
            status: Joi.string().valid('isporuceno', 'nije isporuceno')
        });

        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });

        if(user.role_id == 1 || user.role_id == 2){
            const {error, succ} = shema.validate(req.body);
            
            if(error){
                res.status(400).json({msg: "Greska prilikom popunjavanja forme " + error.details[0].message});
                return;
            }

            const newOrder = await Order.create(req.body);

            return res.json(newOrder);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }

    }catch(err){
        console.log(err);
        return res.status(500).json({error:"Greska", data:err});
    }
});

route.put("/editOrder/:id", async (req, res) => {
    try{
        const shema = Joi.object().keys({
            id: Joi.number().required(),
            total: Joi.number().required(),
            shipping: Joi.number().required(),
            grand_total: Joi.number().required(),
            user_order_id: Joi.number().required(),
            status: Joi.string().valid('isporuceno', 'nije isporuceno')
        });
        
        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });

        if(user.role_id == 1 || user.role_id == 2){
            const {error, succ} = shema.validate(req.body);

            if(error){
                res.status(400).json({msg: "Greska prilikom popunjavanja forme " + error.details[0].message});
                return;
            }

            const orderToEdit = await Order.findByPk(req.params.id);
            orderToEdit.total = req.body.total;
            orderToEdit.shipping = req.body.shipping;
            orderToEdit.grand_total = req.body.grand_total;
            orderToEdit.user_order_id = req.body.user_order_id;
            orderToEdit.status = req.body.status;

            await orderToEdit.save();

            return res.json(orderToEdit);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }

    }catch(err){
        console.log(err);
        return res.status(500).json({error:"Greska", data:err});
    }
});

route.delete("/deleteOrder/:id", async (req, res) => {
    try{
        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });

        if(user.role_id == 1 || user.role_id == 2){
            const orderToDelete = await Order.findByPk(req.params.id);
            await orderToDelete.destroy();

            return res.json(orderToDelete);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        return res.status(500).json({error:"Greska", data:err});
    }
});