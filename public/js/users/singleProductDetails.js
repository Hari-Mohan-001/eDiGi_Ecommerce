const addToCart= (id)=>{
    const productid = id
    console.log('enter adrt');
   
    fetch("/addToCart", {
        method:'post',
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({   
            productid
        })
    })
    .then((res)=>res.json())
    .then(data=>{   
        if(data.success){
            console.log('succes');
            window.location.href = "/myCart"   
        }
    })
    .catch((error)=>console.log(error))
}

const addTowishlist = (proId)=>{
   
    fetch("/addToWishlist" , {
     method:"post",
     headers:{
         "Content-Type":"application/json"
     },
     body:JSON.stringify({
         productId:proId
     })
    })
    .then((res)=> res.json())
    .then((data) =>{
     if(data.success){
        
        swal.fire(" Product added to wishlist")
        // window.location.href ='/wishlist' 
     }
     
    })
    .catch((error)=>console.log(error))
}