const express = require("express");
const {sequelize, Transaction, User} = require("../models");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { required } = require("joi");
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
        const allTransactions = await Transaction.findAll();
        return res.json(allTransactions);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska",body:err});
    }
});

route.get("/:id", async (req, res) => {
    try{
        const transactionById = await Transaction.findByPk(req.params.id);
        return res.json(transactionById);
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", body:err});
    }
});

route.post("/addTransaction/", async(req,res) => {
    try{
        const shema = Joi.object().keys({
            expire_date: Joi.required(),
            cvv: Joi.number().greater(99).less(1000).required(),
            card_number: Joi.string().pattern(new RegExp("^(?:5[1-5][0-9]{14})$")).required(),
            owner_name: Joi.string().min(3).required(),
            order_payment_id: Joi.number().required(),
            status: Joi.string().required(),
            transaction_user_id: Joi.number().required()
        });

        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });

        if(user.role_id == 1 || user.role_id == 2){
            const {error, succ} = shema.validate(req.body);
            
            if(error){
                res.status(400).json({msg:"Molim te proveri formu, validacija nije prosla" + error.details[0].message});
                return;
            }

            const newTransaction = await Transaction.create(req.body);
            return res.json(newTransaction);     
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        res.status(500).json({error:"Greska", body:err});
    }
});

route.put("/editTransaction/:id", async(req, res) => {
    try{
        const shema = Joi.object().keys({
            id: Joi.number().required(),
            expire_date: Joi.required(),
            cvv: Joi.number().min(100).max(999).required(),
            card_number: Joi.string().pattern(new RegExp("^(?:5[1-5][0-9]{14})$")).required(),
            owner_name: Joi.string().min(3).required(),
            order_payment_id: Joi.number().required(),
            status: Joi.string().required(),
            transaction_user_id: Joi.number().required()
        });

        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });

        if(user.role_id == 1 || user.role_id == 2){
            const {error, succ} = shema.validate(req.body);

            if(error){
                res.status(400).json({error:"Molim te proveri formu, validacija nije prosla" + error.details[0].message, body: error.details[0].message});
                return;
            }

            const transactionToEdit = await Transaction.findByPk(req.params.id);
            transactionToEdit.expire_date = req.body.expire_date;
            transactionToEdit.cvv = req.body.cvv;
            transactionToEdit.card_number = req.body.card_number;
            transactionToEdit.owner_name = req.body.owner_name;
            transactionToEdit.status = req.body.status;
            transactionToEdit.transaction_user_id = req.body.transaction_user_id;

            await transactionToEdit.save();

            return res.json(transactionToEdit);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska", body:err});
    }
});

route.delete("/deleteTransaction/:id", async(req,res) => {
    try{
        const user = await User.findOne({
            where : {
                id : req.user.userId
            }
        });

        if(user.role_id == 1 || user.role_id == 2){
            const transactionToDelete = await Transaction.findByPk(req.params.id);
            await transactionToDelete.destroy();

            return res.json(transactionToDelete);
        }else{
            res.status(401).json({error:"Can't fulfill this request"});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({error:"Greska",body:err});
    }
});
