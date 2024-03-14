
var db = require('../config/conection')
const { default: mongoose } = require('mongoose');
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectId


module.exports={

    addproduct:(product,callback)=>{
        mongoose.connection.collection('product').insertOne(product).then((data)=>{
          callback(data.insertedId)
          
          
        })
    },
    getallproducts:()=>{
      return new Promise (async(resolve,reject)=>{

        let products =await mongoose.connection.collection(collection.PRODUCT_COLLECTION).find().toArray()
        resolve(products)
      })

      
    },
    deleteproduct:(productid)=>{
      return new Promise((resolve,reject)=>{
        mongoose.connection.collection(collection.PRODUCT_COLLECTION).deleteOne({_id:new objectId (productid)}).then((response)=>{
          console.log(response);
          resolve(response)
        })
      })
      
    },
    getProductDetails:(proid)=>{
      return new Promise((resolve,reject)=>{
        mongoose.connection.collection(collection.PRODUCT_COLLECTION).findOne({_id: new objectId(proid)}).then((product)=>{
          resolve(product)
        })
      })

    },
    updateProduct:(proid,productDetails)=>{
      return new Promise((resolve,reject)=>{
     
        mongoose.connection.collection(collection.PRODUCT_COLLECTION).updateOne({_id:new objectId(proid)},
        {
          $set:{
            Name:productDetails.Name,
            Description:productDetails.Description,
            Price:productDetails.Price,
            Category:productDetails.Category


          }
        }).then((response)=>{
        
          resolve()
        })
      })

    }  

  

}