const addToCart =(proId)=>{
    console.log('wishadd');
    fetch("/addToCart", {
        method:"post",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            productid:proId
        })
    })
    .then((res)=>res.json())
    .then(res=>{
        if(res.success){
            console.log('sucs');
            window.location.reload()
        }
        
    })
    .catch((error)=>console.log(error))
}



const removeWishlist =(productId)=>{
    Swal.fire({
  title:'Are you sure you want to remove from wishlist?',
  icon:'warning',
  showCancelButton:true,
  confirmButtonColor:'#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Yes!',      
})
.then((result)=>{
    if(result.isConfirmed){
        fetch("/removeFromWishlist", {
            method:'post',
            headers:{
                'Content-Type':'application/json'
            },
           body:JSON.stringify({
            productId
           })
        })
        .then((res)=>res.json())
        .then((res)=>{
            if(res==="success"){
                window.location.reload()
            }
        })
        .catch((error)=>console.log(error))
    }
})
}

const viewProduct = (id)=>{
    window.location.href = `/singleProduct?id=${id}`
}