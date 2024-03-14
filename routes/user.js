var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userhelpers = require('../helpers/user-helpers');
const userHelpers = require('../helpers/user-helpers');
const { response } = require('../app');
const { logger } = require('mongoclient/config');
const verifyLogin = (req,res,next)=>{
  if(req.session.userloggedIn){
    next()  
  }else{
    res.redirect('/login')
  }
}     


/* GET home page. */
router.get('/', async function(req, res, next) {
  let user = req.session.user
  console.log(user);
  let cartCount = null
  if(req.session.user){
     cartCount = await userhelpers.getCartCount(req.session.user._id)
   }
   productHelpers.getallproducts().then((products)=>{
    res.render('user/viewproducts',{products,user,cartCount});
  })
 
});
router.get('/login',(req,res)=>{
  if(req.session.user){
    res.redirect('/')
  }else{
    res.render('user/login',{loginerr:req.session.userlogginerr})
    req.session.userlogginerr=false
  }
})
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/signup',(req,res)=>{
  userhelpers.dosignup(req.body).then((response)=>{
    console.log(response);
    req.session.user=response
    req.session.userloggedIn=true
    console.log(req.session.user);
       res.redirect('/')
    })
  })

router.post('/login',async(req,res)=>{

  userHelpers.dologin(req.body).then((response)=>{
    if(response.status){
      req.session.user=response.user
      req.session.userloggedIn=true
      res.redirect('/')
    }else{
      req.session.userlogginerr='invalid username or password'
      res.redirect('/login')
    }
  })
  
  })
  router.get('/logout',(req,res)=>{
    req.session.user=null
    req.session.userloggedIn=false
    res.redirect('/login')
  })
  router.get('/cart',verifyLogin,async(req,res)=>{
    let products = await userHelpers.getCartproducts(req.session.user._id)
    console.log(products);

    let cartCount = await userhelpers.getCartCount(req.session.user._id)
    let total=await userHelpers.getTotalamount(req.session.user._id)

    if(req.session.user){
       cartCount = await userhelpers.getCartCount(req.session.user._id)
     }
      res.render('user/cart',{products,user:req.session.user,cartCount,total})
     
    
  })

  router.get('/add-toCart/:id',async(req,res)=>{

   await userHelpers.addTocart(req.params.id,req.session.user._id).then(()=>{
    
      res.json({status:true})
    
  })

})

router.post('/change-product-quantity',async(req,res,next)=>{

 
    await userHelpers.changeProductQuantity(req.body).then((response)=>{   
      res.json(response)
      
  }) 
})

router.get('/delete-cartpro/:proid,:cartid',async(req,res)=>{
  await userHelpers.deleteCartproduct(req.params.proid,req.params.cartid).then((response)=>{
  })
  cartCount = await userhelpers.getCartCount(req.session.user._id)
  if(cartCount<1){
     res.redirect('/')
  }else{
    res.redirect('/cart')
  }
  
})

router.get('/place-order',async(req,res)=>{
  let total=await userHelpers.getTotalamount(req.session.user._id)
  res.render('user/orders',{total,user:req.session.user})
})
router.post('/place-order',async(req,res)=>{
  let products =await userHelpers.getCartProductlist(req.body.userId)
  let totalPrice = await userhelpers.getTotalamount(req.session.user._id)
  await userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
      console.log(req.body);
    if(req.body['payment']==='cod'){
        res.json({codSuccess:true})
    }else{
      userhelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
         res.json(response)
      })
    }
    
  })
  
})
router.get('/order-success',(req,res)=>{
  res.render('user/order-success',{user:req.session.user})
})
router.get('/view-order',async(req,res)=>{
 let order= await userHelpers.viewOrder(req.session.user._id)
  res.render('user/view-order',{user:req.session.user,order})
}) 
router.get('/view-order-product/:id',async(req,res)=>{
  let product = await userHelpers.viewOrderProduct(req.params.id)
  res.render('user/view-order-product',{user:req.session.user,product})

})  
router.post('/verify-Payment',async(req,res)=>{
          console.log(req.body['order[receipt]']);
          console.log(req.body)
      userHelpers.verifyPayment(req.body).then(()=>{
      userHelpers.changepaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log('Payment success');
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err);
    console.log('payment failed')
    res.json({status:false})
  })
})

  



  


module.exports = router;
