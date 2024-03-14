var express = require('express');
const { log } = require('handlebars/runtime');
var router = express.Router();
var producthelper = require('../helpers/product-helpers.js');
const productHelpers = require('../helpers/product-helpers.js');
const userHelpers = require('../helpers/user-helpers.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelpers.getallproducts().then((products)=>{
    res.render('admin/view-products',{admin:true,products});  
  })
 
});
router.get("/add-product",(req,res)=>{
  res.render("admin/add-products",{admin:true}) 
}) 
router.post('/add-products',(req,res)=>{  

  productHelpers.addproduct(req.body,(id)=>{
    let image = req.files.image
    image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
      if(err){
        console.log(err);
        
      }else{  
        res.redirect('/admin')
        
      }
    }) 
    })
    
  })


router.get('/delete-product/:id',(req,res)=>{
let productid = req.params.id
 productHelpers.deleteproduct(productid).then((response)=>{
  res.redirect('/admin')  
})  

})


router.get('/edit-product/:id',async(req,res)=>{
  let product = await productHelpers.getProductDetails(req.params.id)
  console.log(product);
  res.render('admin/edit-product',{product})
})

router.post('/edit-product/:id',(req,res)=>{
   let id = req.params.id
  productHelpers.updateProduct (req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    if(req.files.image){
      let image = req.files.image
      image.mv('./public/product-images/'+id+'.jpg')

    }
      
  })  

})

router.get('/orders',(req,res)=>{
  console.log(req.session.user);
  userHelpers.AllOrders().then(order=>{
    res.render('admin/all-orders',{admin:true,order,user:req.session.user})
  })
})
router.get('/all-users',(req,res)=>{
  userHelpers.AllUsers().then(user=>{
    res.render('admin/all-users',{admin:true,user})
  })
})

module.exports = router;    
