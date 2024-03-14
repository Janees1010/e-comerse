var db = require('../config/conection')
const { default: mongoose, Mongoose } = require('mongoose');
var collection = require('../config/collections')
const bcrypt = require('bcrypt');
const { logger } = require('mongoclient/config');
const { ObjectId } = require('mongodb');
const { log } = require('handlebars/runtime');
const Razorpay=require('razorpay')
var objectId = require('mongodb').ObjectId;

var instance = new Razorpay({
    key_id: 'rzp_test_nW4WGNyGimlCpI',
    key_secret: 'BkuyBFvB3wIMnPAsH9FkpkkS',
  });


module.exports={
    dosignup:(userdata)=>{
        return new Promise(async(resolve,reject)=>{
            userdata.Password = await bcrypt.hash(userdata.Password,10)
            mongoose.connection.collection(collection.USER_COLLECTION).insertOne(userdata).then((data)=>{
                console.log(userdata);
                resolve(userdata)
            })
        })
    

    },
    dologin:(userdata)=>{

        return new Promise (async (resolve,reject)=>{
            let loginstatus = false
            let response={}
            let user = await mongoose.connection.collection(collection.USER_COLLECTION).findOne({Email:userdata.Email })

            if(user){
               bcrypt.compare(userdata.Password, user.Password).then((status)=>{

                    if(status){
                     console.log('login success');
                     response.user=user
                     response.status=true
                     resolve(response)
                    }else{
                        (console.log('login failed'));
                        resolve({status:false})
                    }

                })}else{  
                    console.log('login failed');
                    resolve({status:false})
                }

              
            })},
            addTocart:(proId,userId)=>{
                productObj = {
                    item:new objectId(proId),
                    quantity:1
                }
                return new Promise(async(resolve,reject)=>{
                    let userCart= await mongoose.connection.collection(collection.CART_COLLECTION).findOne({user:new objectId(userId)})
                    if(userCart){
                        let proExist= userCart.products.findIndex(product=> product.item==proId)
                        console.log(proExist);
                         if(proExist!=-1){
                        mongoose.connection.collection(collection.CART_COLLECTION).updateOne({user:new objectId(userId),'products.item':new objectId(proId)},

                            {
                                $inc:{'products.$.quantity':1}
                            }
                            
                            ).then(()=>{
                                resolve()
                            })
                      }else{
                        mongoose.connection.collection(collection.CART_COLLECTION).updateOne({user:new objectId(userId)},
                            {
                               $push:{products:productObj}
                            }
                        ).then((response)=>{
                            resolve()
                        })
                           
                            
                        }
                    
                    }else{
                        let cartObj= {
                            user:new objectId(userId),
                            products:[productObj]

                        }
                        mongoose.connection.collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                            console.log(response);
                          resolve()
                        })}
                    
                    }
                  )},

                getCartproducts:(userId)=>{
                    return new Promise(async(resolve,reject)=>{
                        let cartItems= await mongoose.connection.collection(collection.CART_COLLECTION).aggregate([{
                            $match:{user:new objectId(userId)}
                     },
                     {
                        $unwind:'$products'
                     },
                     {
                        $project:{
                            item:"$products.item",
                            quantity:"$products.quantity"
                        }
                     },
                     {
                        $lookup:{
                            from:collection.PRODUCT_COLLECTION,
                            localField:'item',
                            foreignField:'_id',
                            as:'product'
                        },     
                     },
                     {
                        $project:{
                            item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                        }
                     }

                     
                       
                      ]).toArray()
                      
                    
                      resolve(cartItems)
                    })
                    
                },

                getCartCount:(userId)=>{
                 return new Promise(async(resolve,reject)=>{

                        let count = 0
                        let cart = await mongoose.connection.collection(collection.CART_COLLECTION).findOne({user:new objectId(userId)})

                        if(cart){
                            count=cart.products.length
                            console.log(count);
                        }
                        resolve(count)

                    })
                },

                changeProductQuantity:(details)=>{
                    details.count=parseInt(details.count)
                    details.quantity=parseInt(details.quantity)
                return new Promise((resolve,reject)=>{
                    if(details.count==-1 && details.quantity==1){
                        mongoose.connection.collection(collection.CART_COLLECTION).updateOne({_id:new objectId(details.cart)},
                                {
                                    $pull:{products:{item:new objectId(details.product)}}
                                }
                                ).then((response)=>{
                                    console.log(response);
                                    resolve({removeProduct:true})
                                })
                            }else{
                            mongoose.connection.collection(collection.CART_COLLECTION).updateOne({_id:new objectId(details.cart),'products.item':new objectId(details.product)},
                            {
                                $inc:{'products.$.quantity':details.count}
                            }
                            ).then((response)=>{
                                console.log(response);
                                resolve({status:true})
                            })
                        }
                        

                        })

                },

                deleteCartproduct:(proId,cartId)=>{
                    return new Promise((resolve,reject)=>{
                    mongoose.connection.collection(collection.CART_COLLECTION).updateOne({_id:new ObjectId(cartId)},{
                        $pull:{products:{item:new objectId(proId)}}
                    }).then((response)=>{
                        console.log(response);
                        resolve({status:true})        
                                })
                    })

                    },
                    getTotalamount:(userId)=>{
                        return new Promise(async(resolve,reject)=>{
                            let total= await mongoose.connection.collection(collection.CART_COLLECTION).aggregate([{
                                $match:{user:new objectId(userId)}
                         },
                         {
                            $unwind:'$products'
                         },
                         {
                            $project:{
                                item:"$products.item",
                                quantity:"$products.quantity"
                            }
                         },
                         {
                            $lookup:{
                                from:collection.PRODUCT_COLLECTION,
                                localField:'item',
                                foreignField:'_id',
                                as:'product'
    
    
    
                            },
                           
                         },
                         {
                            $project:{
                                item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                            }
                         },
                         {
                            $group:{
                                _id:null,
                                total:{$sum:{$multiply:['$quantity',{$toInt:'$product.Price'}]}}
                            }
                        }]).toArray()
                          console.log(total[0].total);
                          resolve(total[0].total)
                        })

                    },
                    getCartProductlist:(userId)=>{
                        return new Promise(async(resolve,reject)=>{
                            let cart= await mongoose.connection.collection(collection.CART_COLLECTION).findOne({user:new objectId(userId)})
                            resolve(cart.products)
                        })
                    },
                    placeOrder:(order,productdetails,total)=>{
                        
                       return new Promise((resolve,reject)=>{
                        let status = order.payment==='cod'?'Placed':'Pending'
                        
                        let orderObj={
                               deliveryDetails:{
                                mobile:order.Mobile,
                                address:order.Address,
                                pincode:order.Pincode
                            },
                            userId:new objectId(order.userId),
                            paymentMethod:order.payment,
                            products:productdetails,
                            totalAmount:total,
                            status:status,
                            date:new Date()
                        }
                        mongoose.connection.collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                            mongoose.connection.collection(collection.CART_COLLECTION).deleteOne({user:new objectId(order.userId)})
                            resolve(response.insertedId)
                        })
                       })
                    },
                    viewOrder:(userId)=>{
                        return new Promise(async(resolve,reject)=>{
                            let order = await mongoose.connection.collection(collection.ORDER_COLLECTION).find({userId:new objectId(userId)}).toArray()
                            console.log(order);
                            resolve(order)
                        })
                    },
                    AllOrders:()=>{
                        return new Promise(async(resolve,reject)=>{
                            let order = await mongoose.connection.collection(collection.ORDER_COLLECTION).find()
                             .toArray()

                            
                             resolve(order)
                        })
                    },
                    viewOrderProduct:(orderId)=>{
                        return new Promise(async(resolve,reject)=>{
                            let product=await mongoose.connection.collection(collection.ORDER_COLLECTION).aggregate([{
                                $match:{_id:new objectId(orderId)},
                            },
                            {
                                $unwind:'$products'

                            },
                            {
                                $project:{
                                    item:"$products.item",
                                    quantity:"$products.quantity"
                                }
                            },
                            {
                                $lookup:{
                                    from:collection.PRODUCT_COLLECTION,
                                    localField:'item',
                                    foreignField:'_id',
                                    as:'product'
                                }
                            },
                            {
                                $project:{
                                    item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                                }
                            }
                            ]).toArray()
                            console.log(product);
                            resolve(product)
               
                        
                        }) 
                        
                    },
                    generateRazorpay:(orderId,total)=>{
                        return new Promise((resolve,reject)=>{
                            var options = {
                                amount:total*100,  // amount in the smallest currency unit
                                currency: "INR",
                                receipt:orderId
                              };
                              instance.orders.create(options, function(err, order) {
                                console.log(order);
                                resolve(order)
                              });
                               
                        })

                    },
                    verifyPayment:(details)=>{
                       return new Promise(async(resolve,reject)=>{
                        console.log(details['payment[razorpay_order_id]']);
                        console.log(details['payment[razorpay_payment_id]']);

                        const { createHmac } = require('node:crypto');
                        const secret = 'BkuyBFvB3wIMnPAsH9FkpkkS';
                        const hash = createHmac('sha256', secret)
                       .update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
                       .digest('hex');
                         console.log(hash);
                         console.log(details['payment[razorpay_signature]']);
                        if(hash===details['payment[razorpay_signature]']){
                            resolve()
                        }else{
                            reject()
                        }
                          
                      })
                    },
                    changepaymentStatus:(orderId)=>{
                        return new Promise(async(resolve,reject)=>{
                          await  mongoose.connection.collection(collection.ORDER_COLLECTION).updateOne({_id:new objectId(orderId)},
                            {
                                $set:{
                                    status:'placed'
                                }
                            }).then(()=>{
                                resolve()
                            })
                        })
                    },

                    AllUsers:()=>{

                        return new Promise(async(resolve,reject)=>{

                      let user =  mongoose.connection.collection(collection.USER_COLLECTION).find().toArray()
                            console.log(user);
                            resolve(user)
                            
        
                        })
                    }
                   

                }



            
        
    
                



        


    






       