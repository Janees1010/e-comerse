

function addTocart(Id){
    
    $.ajax({
      url:'/add-toCart/'+Id,
      method:'get',
      success:(response)=>{
         if(response.status){

            let count = $('#cart-count').html()
            count=parseInt(count)+1
            $('#cart-count').html(count)
            window.location.href='user/cart'
            
         
        }
      }

    })

 }

 <script src="https://code.jquery.com/jquery-3.7.1.js" integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4=" crossorigin="anonymous"></script>,
 <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-ajaxy/1.6.1/scripts/jquery.ajaxy.min.js"
 ></script>



 
 